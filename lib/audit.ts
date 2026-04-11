import { prisma } from "./prisma";
import { AuditAction } from "@prisma/client";

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  details,
  ip,
  userAgent,
}: {
  userId?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
