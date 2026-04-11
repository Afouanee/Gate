/**
 * API Route: POST /api/auth/verify
 *
 * Vérification du code 6 chiffres après inscription
 *
 * Processus:
 * 1. Valide email et code
 * 2. Cherche le code dans BD (unused + non expiré)
 * 3. Si valide: marque code comme "used" (une seul utilisation)
 * 4. Marque l'email de l'utilisateur comme vérifié
 * 5. Utilisateur peut maintenant se connecter
 *
 * @request POST /api/auth/verify
 * @body {email: string, code: string}
 * @response {success: true}
 * @errors 400 INVALID_FIELDS, CODE_INVALID_OR_EXPIRED | 500 INTERNAL_ERROR
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * Schéma de validation Zod
 * Code exact 6 chiffres
 */
const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
    }

    const { email, code } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    /**
     * Cherche le code de vérification
     * Conditions:
     * - Email correspond
     * - Code correspond
     * - Code non encore utilisé (used: false)
     * - Code pas expiré (expires > maintenant)
     */
    const verificationCode = await prisma.emailVerificationCode.findFirst({
      where: {
        email: normalizedEmail,
        code,
        used: false,
        expires: { gt: new Date() },
      },
    });

    // Code invalide ou expiré
    if (!verificationCode) {
      return NextResponse.json(
        { error: "CODE_INVALID_OR_EXPIRED" },
        { status: 400 }
      );
    }

    // Marque le code comme utilisé (empêche réutilisation)
    await prisma.emailVerificationCode.update({
      where: { id: verificationCode.id },
      data: { used: true },
    });

    // Marque l'email de l'utilisateur comme vérifié
    // Maintenant il peut se connecter avec credentials provider
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
