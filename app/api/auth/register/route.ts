import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";
import { isDisposableEmail } from "@/lib/disposable-email";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "INVALID_FIELDS", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Vérifier email jetable
    if (isDisposableEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "DISPOSABLE_EMAIL" },
        { status: 400 }
      );
    }

    // Vérifier si email déjà utilisé
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur (non vérifié)
    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    // Générer et envoyer le code de vérification
    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Supprimer les anciens codes
    await prisma.emailVerificationCode.deleteMany({
      where: { email: normalizedEmail },
    });

    await prisma.emailVerificationCode.create({
      data: {
        email: normalizedEmail,
        code,
        expires,
      },
    });

    await sendVerificationCode({ to: normalizedEmail, code });

    return NextResponse.json({ success: true, email: normalizedEmail });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
