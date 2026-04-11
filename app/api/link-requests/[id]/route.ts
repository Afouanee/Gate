import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(
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

  try {
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
    }

    const linkRequest = await prisma.linkRequest.findUnique({
      where: { id: params.id },
    });

    if (!linkRequest) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    if (parsed.data.action === "APPROVED") {
      // Vérifier si le profil est encore disponible
      const person = await prisma.person.findUnique({
        where: { id: linkRequest.personId },
        select: { userId: true },
      });

      if (person?.userId && person.userId !== linkRequest.userId) {
        return NextResponse.json({ error: "PERSON_ALREADY_LINKED" }, { status: 409 });
      }

      await prisma.$transaction([
        prisma.linkRequest.update({
          where: { id: params.id },
          data: { status: "APPROVED" },
        }),
        prisma.person.update({
          where: { id: linkRequest.personId },
          data: { userId: linkRequest.userId },
        }),
        // Rejeter les autres demandes en attente pour cet user
        prisma.linkRequest.updateMany({
          where: {
            userId: linkRequest.userId,
            id: { not: params.id },
            status: "PENDING",
          },
          data: { status: "REJECTED" },
        }),
      ]);

      await createAuditLog({
        userId: session.user.id,
        action: "LINK_REQUEST_APPROVED",
        entity: "link_requests",
        entityId: params.id,
      });
    } else {
      await prisma.linkRequest.update({
        where: { id: params.id },
        data: { status: "REJECTED" },
      });

      await createAuditLog({
        userId: session.user.id,
        action: "LINK_REQUEST_REJECTED",
        entity: "link_requests",
        entityId: params.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Link request action error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
