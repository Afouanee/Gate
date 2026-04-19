import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FREE_SEARCH_LIMIT = 5;

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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { searchCount: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const isPremium = user.role === "PREMIUM" || user.role === "ADMIN";

  // Vérifier la limite pour les FREE
  if (!isPremium && user.searchCount >= FREE_SEARCH_LIMIT) {
    return NextResponse.json(
      { error: "SEARCH_LIMIT_REACHED", searchCount: user.searchCount },
      { status: 403 }
    );
  }

  // Incrémenter le compteur pour les FREE
  if (!isPremium) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { searchCount: { increment: 1 } },
    });
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

  if (yearFrom || yearTo) {
    where.birthDate = {};
    if (yearFrom) {
      where.birthDate.gte = new Date(`${yearFrom}-01-01`);
    }
    if (yearTo) {
      where.birthDate.lte = new Date(`${yearTo}-12-31`);
    }
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

  // Flouter les résultats pour les FREE
  const sanitizedResults = results.map((person) => ({
    ...person,
    firstName: person.firstName,
    lastName: isPremium ? person.lastName : `${person.lastName[0]}${"*".repeat(person.lastName.length - 1)}`,
    birthDate: isPremium && person.showBirthDate ? person.birthDate : null,
    deathDate: isPremium && person.showDeathDate ? person.deathDate : null,
    birthPlace: isPremium ? person.birthPlace : null,
    photoUrl: isPremium && person.showPhoto ? person.photoUrl : null,
    blurred: !isPremium,
  }));

  return NextResponse.json({
    results: sanitizedResults,
    total,
    searchCount: isPremium ? null : (user.searchCount + 1),
    isPremium,
  });
}
