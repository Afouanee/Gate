import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.emailVerificationCode.deleteMany({
      where: { email: normalizedEmail },
    });

    await prisma.emailVerificationCode.create({
      data: { email: normalizedEmail, code, expires },
    });

    await sendVerificationCode({ to: normalizedEmail, code });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
