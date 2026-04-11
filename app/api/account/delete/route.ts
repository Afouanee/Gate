import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Anonymiser les données (RGPD)
  await prisma.$transaction([
    // Anonymiser l'user
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: "Utilisateur supprimé",
        email: `deleted_${session.user.id}@gate.deleted`,
        password: null,
        image: null,
      },
    }),
    // Détacher le profil
    prisma.person.updateMany({
      where: { userId: session.user.id },
      data: { userId: null },
    }),
    // Supprimer sessions et comptes
    prisma.session.deleteMany({ where: { userId: session.user.id } }),
    prisma.account.deleteMany({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({ success: true });
}
