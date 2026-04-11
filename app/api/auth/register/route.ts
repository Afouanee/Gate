/**
 * API Route: POST /api/auth/register
 *
 * Inscription d'un nouvel utilisateur avec email/password
 *
 * Processus:
 * 1. Valide email, password, name
 * 2. Vérifie que l'email n'est pas jetable (disposable)
 * 3. Vérifie que l'email n'existe pas déjà
 * 4. Hash le password avec bcrypt
 * 5. Crée utilisateur (emailVerified = null)
 * 6. Génère code 6 chiffres
 * 7. Envoie code par email (Resend)
 * 8. Utilisateur doit vérifier le code => emailVerified
 *
 * @request POST /api/auth/register
 * @body {name: string, email: string, password: string}
 * @response {success: true, email: string}
 * @errors 400 INVALID_FIELDS, DISPOSABLE_EMAIL | 409 EMAIL_EXISTS | 500 INTERNAL_ERROR
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";
import { isDisposableEmail } from "@/lib/disposable-email";
import { z } from "zod";

/**
 * Schéma de validation Zod
 * Sécurrise les inputs avant traitement
 */
const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),  // Min 8 caractères
});

/**
 * Génère un code 6 chiffres aléatoire
 * Ex: "123456"
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    // Valide les données
    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_FIELDS", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Vérifie que l'email n'est pas jetable (gmail temp, etc.)
    if (isDisposableEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "DISPOSABLE_EMAIL" },
        { status: 400 }
      );
    }

    // Vérifie que l'email n'existe pas déjà
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    // Hash le password avec bcrypt (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crée l'utilisateur (emailVerified reste null jusqu'à vérification)
    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Génère et envoie le code de vérification
    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Supprime les anciens codes pour cet email (une seul code actif)
    await prisma.emailVerificationCode.deleteMany({
      where: { email: normalizedEmail },
    });

    // Crée le nouveau code
    await prisma.emailVerificationCode.create({
      data: {
        email: normalizedEmail,
        code,
        expires,
      },
    });

    // Envoie le code par email
    await sendVerificationCode({ to: normalizedEmail, code });

    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
