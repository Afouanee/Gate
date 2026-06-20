import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserPremium, canSeeField } from "@/lib/visibility";
import { ensureQuotaPeriod, FREE_SEARCH_LIMIT } from "@/lib/quota";

/** Parse une année (string) en entier valide entre 0 et 9999, sinon null. */
function parseYear(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 9999) return null;
  return n;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const gender = searchParams.get("gender");
  const yearFrom = searchParams.get("yearFrom");
  const yearTo = searchParams.get("yearTo");

  if (!query.trim()) {
    return NextResponse.json({ results: [], total: 0, searchCount: 0 });
  }

  // Reset mensuel lazy AVANT toute lecture du compteur (rend le quota « / mois » vrai).
  await ensureQuotaPeriod(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { searchCount: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const isPremium = isUserPremium(user.role);

  // Vérifier + incrémenter le compteur de façon ATOMIQUE pour les FREE.
  // updateMany avec une condition sur searchCount évite la race condition
  // (deux requêtes parallèles ne peuvent pas dépasser la limite).
  let nextSearchCount = user.searchCount;
  if (!isPremium) {
    const updated = await prisma.user.updateMany({
      where: { id: session.user.id, searchCount: { lt: FREE_SEARCH_LIMIT } },
      data: { searchCount: { increment: 1 } },
    });
    if (updated.count === 0) {
      return NextResponse.json(
        { error: "SEARCH_LIMIT_REACHED", searchCount: user.searchCount },
        { status: 403 }
      );
    }
    nextSearchCount = user.searchCount + 1;
  }

  // Construire la query
  const where: any = {
    OR: [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { birthPlace: { contains: query, mode: "insensitive" } },
      { deathPlace: { contains: query, mode: "insensitive" } },
    ],
  };

  if (gender) {
    where.gender = gender;
  }

  const yFrom = parseYear(yearFrom);
  const yTo = parseYear(yearTo);
  if (yFrom !== null || yTo !== null) {
    where.birthDate = {};
    if (yFrom !== null) where.birthDate.gte = new Date(Date.UTC(yFrom, 0, 1));
    if (yTo !== null) where.birthDate.lte = new Date(Date.UTC(yTo, 11, 31));
  }

  const [results, total] = await prisma.$transaction([
    prisma.person.findMany({
      where,
      take: isPremium ? 50 : 10,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        birthDate: true,
        deathDate: true,
        birthPlace: true,
        isAlive: true,
        photoUrl: true,
        showPhoto: true,
        showBirthDate: true,
        showDeathDate: true,
      },
    }),
    prisma.person.count({ where }),
  ]);

  // M4 — une recherche à 0 résultat ne doit PAS consommer un crédit (FREE).
  // On rembourse le crédit réservé plus haut (decrement conditionnel, anti-négatif).
  if (!isPremium && total === 0) {
    await prisma.user.updateMany({
      where: { id: session.user.id, searchCount: { gt: 0 } },
      data: { searchCount: { decrement: 1 } },
    });
    nextSearchCount = Math.max(0, nextSearchCount - 1);
  }

  // Flouter les résultats pour les FREE (visibilité unifiée : Premium OU flag public)
  const sanitizedResults = results.map((person) => ({
    ...person,
    firstName: person.firstName,
    lastName: isPremium
      ? person.lastName
      : `${person.lastName[0] || ""}${"*".repeat(Math.max(0, person.lastName.length - 1))}`,
    birthDate: canSeeField(isPremium, person.showBirthDate) ? person.birthDate : null,
    deathDate: canSeeField(isPremium, person.showDeathDate) ? person.deathDate : null,
    birthPlace: isPremium ? person.birthPlace : null,
    photoUrl: canSeeField(isPremium, person.showPhoto) ? person.photoUrl : null,
    blurred: !isPremium,
  }));

  return NextResponse.json({
    results: sanitizedResults,
    total,
    searchCount: isPremium ? null : nextSearchCount,
    isPremium,
  });
}
