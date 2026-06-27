/**
 * Encarts « À l'honneur » (Spotlight).
 *  GET  : liste publique des encarts actifs (triés par order).
 *  POST : création (admin uniquement).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  url: z.string().url().max(500).optional().nullable().or(z.literal("")),
  imageUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  personId: z.string().optional().nullable(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  // Les admins voient tout (pour gérer) ; le public ne voit que les actifs.
  const spotlights = await prisma.spotlight.findMany({
    where: isAdmin ? undefined : { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ spotlights });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
  }

  const { url, imageUrl, ...rest } = parsed.data;
  const spotlight = await prisma.spotlight.create({
    data: {
      ...rest,
      url: url || null,
      imageUrl: imageUrl || null,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "ADMIN_ACTION", // action générique d'admin (ne pas fausser l'audit avec PERSON_CREATED)
    entity: "spotlights",
    entityId: spotlight.id,
  });

  return NextResponse.json(spotlight, { status: 201 });
}
