import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const createSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]).optional(),
  birthDate: z.string().optional().nullable(),
  deathDate: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  deathPlace: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isAlive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Cette liste renvoie des données brutes (lieux, profession, description) ET les
  // e-mails des comptes liés, sans passer par lib/visibility. Elle est donc
  // RÉSERVÉE AUX ADMINS : un membre lambda utilise /api/tree, /api/search et
  // /api/persons/[id] (qui, eux, sanitisent via les flags showXxx). Sans cette
  // garde, n'importe quel membre connecté pouvait paginer toute la base + emails.
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const query = searchParams.get("q")?.trim() || "";
  const skip = (page - 1) * limit;

  const where = query
    ? {
        OR: [
          { firstName: { contains: query, mode: "insensitive" as const } },
          { lastName: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [persons, total] = await prisma.$transaction([
    prisma.person.findMany({
      skip,
      take: limit,
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.person.count({ where }),
  ]);

  return NextResponse.json({ persons, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS", details: parsed.error.flatten() }, { status: 400 });
    }

    // Valide les dates : format ISO correct + naissance antérieure au décès
    const toDate = (v: string | null | undefined) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? false : d;
    };
    const birthDate = toDate(parsed.data.birthDate);
    const deathDate = toDate(parsed.data.deathDate);
    if (birthDate === false || deathDate === false) {
      return NextResponse.json({ error: "INVALID_DATE" }, { status: 400 });
    }
    if (birthDate && deathDate && birthDate > deathDate) {
      return NextResponse.json({ error: "BIRTH_AFTER_DEATH" }, { status: 400 });
    }

    const person = await prisma.person.create({
      data: { ...parsed.data, birthDate, deathDate },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "PERSON_CREATED",
      entity: "persons",
      entityId: person.id,
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    console.error("Create person error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
