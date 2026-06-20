/**
 * Spotlight individuel : PATCH (maj) et DELETE (admin uniquement).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  subtitle: z.string().max(160).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  url: z.string().url().max(500).optional().nullable().or(z.literal("")),
  imageUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  personId: z.string().optional().nullable(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "UNAUTHORIZED", status: 401 as const, session: null };
  if (session.user.role !== "ADMIN") return { error: "FORBIDDEN", status: 403 as const, session: null };
  return { error: null, status: 200 as const, session };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
  }

  const data: any = { ...parsed.data };
  if (data.url === "") data.url = null;
  if (data.imageUrl === "") data.imageUrl = null;

  try {
    const spotlight = await prisma.spotlight.update({ where: { id: params.id }, data });
    return NextResponse.json(spotlight);
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  try {
    await prisma.spotlight.delete({ where: { id: params.id } });
    await createAuditLog({
      userId: guard.session!.user.id,
      action: "PERSON_DELETED",
      entity: "spotlights",
      entityId: params.id,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
}
