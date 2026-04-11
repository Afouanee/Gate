import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, { ok: boolean; latency?: number; error?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true, latency: Date.now() - dbStart };
  } catch (err) {
    checks.database = { ok: false, error: String(err) };
  }

  // Tables check
  try {
    const [users, persons, relations] = await Promise.all([
      prisma.user.count(),
      prisma.person.count(),
      prisma.relation.count(),
    ]);
    checks.tables = { ok: true };
    checks.counts = { ok: true, latency: users + persons + relations } as any;
    (checks as any).data = { users, persons, relations };
  } catch (err) {
    checks.tables = { ok: false, error: String(err) };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
