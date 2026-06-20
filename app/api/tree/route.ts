import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserPremium, canSeeField } from "@/lib/visibility";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const isPremium = isUserPremium(session.user.role);

  // Pour les FREE, limiter à 10 profils
  const limit = isPremium ? 2000 : 10;

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

  // Sanitiser selon le rôle (visibilité unifiée : Premium OU flag public)
  const sanitizedPersons = persons.map((p) => ({
    ...p,
    birthDate: canSeeField(isPremium, p.showBirthDate) ? p.birthDate : null,
    deathDate: canSeeField(isPremium, p.showDeathDate) ? p.deathDate : null,
    photoUrl: canSeeField(isPremium, p.showPhoto) ? p.photoUrl : null,
    blurred: !isPremium,
  }));

  // Filtrer les relations pour ne garder que celles entre personnes visibles
  const personIds = new Set(sanitizedPersons.map((p) => p.id));
  const filteredRelations = relations.filter(
    (r) => personIds.has(r.sourceId) && personIds.has(r.targetId)
  );

  return NextResponse.json({
    nodes: sanitizedPersons,
    edges: filteredRelations,
    isPremium,
    limited: !isPremium,
  });
}
