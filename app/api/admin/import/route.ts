import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import Papa from "papaparse";

interface PersonRow {
  firstName: string;
  lastName: string;
  gender?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  description?: string;
  isAlive?: string;
  // Relations
  parentId?: string;
  spouseId?: string;
}

function normalizeGender(g?: string) {
  if (!g) return "UNKNOWN";
  const upper = g.toUpperCase();
  if (["M", "MALE", "HOMME", "H"].includes(upper)) return "MALE";
  if (["F", "FEMALE", "FEMME"].includes(upper)) return "FEMALE";
  if (["OTHER", "AUTRE"].includes(upper)) return "OTHER";
  return "UNKNOWN";
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
    }

    const text = await file.text();
    const { data, errors } = Papa.parse<PersonRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: "PARSE_ERROR", details: errors }, { status: 400 });
    }

    const importJob = await prisma.importJob.create({
      data: {
        fileName: file.name,
        status: "processing",
        totalRows: data.length,
      },
    });

    const idMap = new Map<string, string>(); // external ref → DB id
    const parseErrors: string[] = [];

    // Passe 1 : Créer les personnes
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Idempotence : rechercher par firstName + lastName + birthDate
        const existing = await prisma.person.findFirst({
          where: {
            firstName: row.firstName?.trim(),
            lastName: row.lastName?.trim(),
            ...(row.birthDate ? { birthDate: new Date(row.birthDate) } : {}),
          },
        });

        let person;
        if (existing) {
          person = existing;
        } else {
          person = await prisma.person.create({
            data: {
              firstName: row.firstName?.trim() || "Inconnu",
              lastName: row.lastName?.trim() || "Inconnu",
              gender: normalizeGender(row.gender) as any,
              birthDate: row.birthDate ? new Date(row.birthDate) : null,
              deathDate: row.deathDate ? new Date(row.deathDate) : null,
              birthPlace: row.birthPlace?.trim() || null,
              deathPlace: row.deathPlace?.trim() || null,
              description: row.description?.trim() || null,
              isAlive: row.isAlive === "true" || row.isAlive === "1" || !row.deathDate,
            },
          });
        }

        // Stocker le mapping index → DB id
        idMap.set(String(i), person.id);

        await prisma.importJob.update({
          where: { id: importJob.id },
          data: { processed: { increment: 1 } },
        });
      } catch (err) {
        parseErrors.push(`Ligne ${i + 1}: ${err}`);
      }
    }

    // Passe 2 : Créer les relations
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const personId = idMap.get(String(i));
      if (!personId) continue;

      try {
        if (row.parentId) {
          const parentDbId = idMap.get(row.parentId);
          if (parentDbId) {
            await prisma.relation.upsert({
              where: {
                sourceId_targetId_type: {
                  sourceId: parentDbId,
                  targetId: personId,
                  type: "PARENT_CHILD",
                },
              },
              create: {
                sourceId: parentDbId,
                targetId: personId,
                type: "PARENT_CHILD",
              },
              update: {},
            });
          }
        }

        if (row.spouseId) {
          const spouseDbId = idMap.get(row.spouseId);
          if (spouseDbId && spouseDbId !== personId) {
            await prisma.relation.upsert({
              where: {
                sourceId_targetId_type: {
                  sourceId: personId,
                  targetId: spouseDbId,
                  type: "SPOUSE",
                },
              },
              create: {
                sourceId: personId,
                targetId: spouseDbId,
                type: "SPOUSE",
              },
              update: {},
            });
          }
        }
      } catch (err) {
        parseErrors.push(`Relations ligne ${i + 1}: ${err}`);
      }
    }

    await prisma.importJob.update({
      where: { id: importJob.id },
      data: {
        status: parseErrors.length > 0 ? "done_with_errors" : "done",
        errors: parseErrors.length > 0 ? parseErrors : Prisma.JsonNull,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "IMPORT_DONE",
      entity: "import_jobs",
      entityId: importJob.id,
      details: { fileName: file.name, totalRows: data.length, errors: parseErrors.length },
    });

    return NextResponse.json({
      success: true,
      importJobId: importJob.id,
      total: data.length,
      errors: parseErrors,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
