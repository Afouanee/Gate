import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(["PARENT_CHILD", "SPOUSE", "CUSTOM"]),
  label: z.string().optional(),
  marriageDate: z.string().optional().nullable(),
  divorceDate: z.string().optional().nullable(),
});

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
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
    }

    if (parsed.data.sourceId === parsed.data.targetId) {
      return NextResponse.json({ error: "SELF_RELATION" }, { status: 400 });
    }

    const relation = await prisma.relation.create({
      data: {
        ...parsed.data,
        marriageDate: parsed.data.marriageDate ? new Date(parsed.data.marriageDate) : null,
        divorceDate: parsed.data.divorceDate ? new Date(parsed.data.divorceDate) : null,
      },
    });

    return NextResponse.json(relation, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "RELATION_EXISTS" }, { status: 409 });
    }
    console.error("Create relation error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  }

  await prisma.relation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
