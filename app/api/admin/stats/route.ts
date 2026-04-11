import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const [
    totalUsers,
    premiumUsers,
    totalPersons,
    totalRelations,
    pendingRequests,
    pendingReports,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PREMIUM" } }),
    prisma.person.count(),
    prisma.relation.count(),
    prisma.linkRequest.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { resolved: false } }),
  ]);

  return NextResponse.json({
    totalUsers,
    premiumUsers,
    freeUsers: totalUsers - premiumUsers,
    totalPersons,
    totalRelations,
    pendingRequests,
    pendingReports,
  });
}
