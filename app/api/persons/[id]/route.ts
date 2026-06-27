import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { canSeeAll, canSeeField, canSeePersonalData } from "@/lib/visibility";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]).optional(),
  birthDate: z.string().optional().nullable(),
  deathDate: z.string().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  deathPlace: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  currentCity: z.string().optional().nullable(),
  nickname: z.string().optional().nullable(),
  isAlive: z.boolean().optional(),
  showBirthDate: z.boolean().optional(),
  showDeathDate: z.boolean().optional(),
  showMarriage: z.boolean().optional(),
  showPhoto: z.boolean().optional(),
  showPersonalData: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const person = await prisma.person.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true } },
      relationsAsSource: {
        include: {
          target: { select: { id: true, firstName: true, lastName: true, gender: true, photoUrl: true, showPhoto: true } },
        },
      },
      relationsAsTarget: {
        include: {
          source: { select: { id: true, firstName: true, lastName: true, gender: true, photoUrl: true, showPhoto: true } },
        },
      },
      reports: { where: { resolved: false }, select: { id: true } },
    },
  });

  if (!person) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Visibilité (règle unifiée : ADMIN voit tout, sinon le flag public décide).
  // Le rôle PREMIUM/« Bienfaiteur » ne donne AUCUN accès privilégié aux données.
  const seeAll = canSeeAll(session.user.role);
  const seePersonal = canSeePersonalData(seeAll, person);

  const sanitized = {
    ...person,
    birthDate: canSeeField(seeAll, person.showBirthDate) ? person.birthDate : null,
    deathDate: canSeeField(seeAll, person.showDeathDate) ? person.deathDate : null,
    photoUrl: canSeeField(seeAll, person.showPhoto) ? person.photoUrl : null,
    birthPlace: seePersonal ? person.birthPlace : null,
    deathPlace: seePersonal ? person.deathPlace : null,
    description: seePersonal ? person.description : null,
    profession: seePersonal ? person.profession : null,
    currentCity: seePersonal ? person.currentCity : null,
    nickname: person.nickname,
  };

  return NextResponse.json(sanitized);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
    }

    const existingPerson = await prisma.person.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true },
    });

    if (!existingPerson) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = existingPerson.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const allowedData = isAdmin
      ? parsed.data
      : {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          gender: parsed.data.gender,
          birthDate: parsed.data.birthDate,
          deathDate: parsed.data.deathDate,
          birthPlace: parsed.data.birthPlace,
          deathPlace: parsed.data.deathPlace,
          photoUrl: parsed.data.photoUrl,
          description: parsed.data.description,
          profession: parsed.data.profession,
          currentCity: parsed.data.currentCity,
          nickname: parsed.data.nickname,
          isAlive: parsed.data.isAlive,
        };

    // Parse + valide les dates (format ISO + cohérence naissance < décès)
    const parseDate = (v: string | null | undefined) => {
      if (v === null) return null;
      if (!v) return undefined;
      const d = new Date(v);
      if (isNaN(d.getTime())) throw new Error("INVALID_DATE");
      return d;
    };

    let birthDate: Date | null | undefined;
    let deathDate: Date | null | undefined;
    try {
      birthDate = parseDate(allowedData.birthDate);
      deathDate = parseDate(allowedData.deathDate);
    } catch {
      return NextResponse.json({ error: "INVALID_DATE" }, { status: 400 });
    }

    if (birthDate && deathDate && birthDate > deathDate) {
      return NextResponse.json({ error: "BIRTH_AFTER_DEATH" }, { status: 400 });
    }

    const person = await prisma.person.update({
      where: { id: params.id },
      data: { ...allowedData, birthDate, deathDate },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "PERSON_UPDATED",
      entity: "persons",
      entityId: person.id,
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error("Update person error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  await prisma.person.delete({ where: { id: params.id } });

  await createAuditLog({
    userId: session.user.id,
    action: "PERSON_DELETED",
    entity: "persons",
    entityId: params.id,
  });

  return NextResponse.json({ success: true });
}
