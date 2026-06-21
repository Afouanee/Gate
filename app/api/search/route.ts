import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  // Projet communautaire : recherche illimitée et résultats complets pour tous
  // les membres connectés (plus de mur premium). La confidentialité par champ
  // reste pilotée par les flags showXxx posés par l'admin.

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
      take: 50,
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

  // Résultats complets pour tous ; confidentialité par champ selon flags admin.
  const sanitizedResults = results.map((person) => ({
    ...person,
    birthDate: person.showBirthDate ? person.birthDate : null,
    deathDate: person.showDeathDate ? person.deathDate : null,
    birthPlace: person.birthPlace,
    photoUrl: person.showPhoto ? person.photoUrl : null,
    blurred: false,
  }));

  return NextResponse.json({
    results: sanitizedResults,
    total,
    searchCount: null,
    isPremium: true,
  });
}
