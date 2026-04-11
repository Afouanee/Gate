import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReportNotification } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  personId: z.string(),
  type: z.enum(["ERROR", "ADDITION"]),
  errorType: z.string().max(120).optional().nullable(),
  message: z.string().min(10).max(2000),
  reporterEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    const person = await prisma.person.findUnique({
      where: { id: parsed.data.personId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!person) {
      return NextResponse.json({ error: "PERSON_NOT_FOUND" }, { status: 404 });
    }

    const report = await prisma.report.create({
      data: {
        personId: parsed.data.personId,
        type: parsed.data.type,
        errorType: parsed.data.type === "ERROR" ? (parsed.data.errorType?.trim() || null) : null,
        message: parsed.data.message,
        reporterEmail: parsed.data.reporterEmail || session?.user?.email || null,
      },
    });

    await sendReportNotification({
      personId: person.id,
      personName: `${person.firstName} ${person.lastName}`,
      type: parsed.data.type,
      errorType: parsed.data.type === "ERROR" ? parsed.data.errorType : null,
      reporterEmail: parsed.data.reporterEmail || session?.user?.email || "Anonyme",
      message: parsed.data.message,
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const reports = await prisma.report.findMany({
    include: {
      person: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}
