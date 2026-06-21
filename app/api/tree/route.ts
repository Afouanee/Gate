import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Projet communautaire : l'arbre complet est accessible à tous les membres
  // connectés (pas de mur premium). La confidentialité par champ reste pilotée
  // par les flags showXxx posés par l'admin (cf. lib/visibility).
  const limit = 3000;

  const [persons, relations] = await prisma.$transaction([
    prisma.person.findMany({
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        birthDate: true,
        deathDate: true,
        isAlive: true,
        photoUrl: true,
        showPhoto: true,
        showBirthDate: true,
        showDeathDate: true,
        userId: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.relation.findMany({
      select: {
        id: true,
        sourceId: true,
        targetId: true,
        type: true,
        label: true,
        marriageDate: true,
      },
    }),
  ]);

  // Confidentialité par champ pilotée par les flags admin (showXxx), pour tous.
  const sanitizedPersons = persons.map((p) => ({
    ...p,
    birthDate: p.showBirthDate ? p.birthDate : null,
    deathDate: p.showDeathDate ? p.deathDate : null,
    photoUrl: p.showPhoto ? p.photoUrl : null,
    blurred: false,
  }));

  // Filtrer les relations pour ne garder que celles entre personnes visibles
  const personIds = new Set(sanitizedPersons.map((p) => p.id));
  const filteredRelations = relations.filter(
    (r) => personIds.has(r.sourceId) && personIds.has(r.targetId)
  );

  return NextResponse.json({
    nodes: sanitizedPersons,
    edges: filteredRelations,
    isPremium: true,
    limited: false,
  });
}
