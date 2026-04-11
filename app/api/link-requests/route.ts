import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const createSchema = z.object({
  personId: z.string(),
  message: z.string().min(10).max(1000),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const requests = await prisma.linkRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        person: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  }

  const requests = await prisma.linkRequest.findMany({
    where: { userId: session.user.id },
    include: {
      person: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
    }

    // Vérifier si l'user est déjà rattaché
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { person: true },
    });

    if (user?.person) {
      return NextResponse.json({ error: "ALREADY_LINKED" }, { status: 409 });
    }

    // Vérifier si une demande est déjà en cours
    const existing = await prisma.linkRequest.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (existing) {
      return NextResponse.json({ error: "REQUEST_PENDING" }, { status: 409 });
    }

    // Vérifier si le profil est déjà pris
    const person = await prisma.person.findUnique({
      where: { id: parsed.data.personId },
      select: { userId: true },
    });

    if (person?.userId) {
      return NextResponse.json({ error: "PERSON_ALREADY_LINKED" }, { status: 409 });
    }

    const request = await prisma.linkRequest.create({
      data: {
        userId: session.user.id,
        personId: parsed.data.personId,
        message: parsed.data.message,
      },
      include: {
        person: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "LINK_REQUEST_CREATED",
      entity: "link_requests",
      entityId: request.id,
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Link request error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
