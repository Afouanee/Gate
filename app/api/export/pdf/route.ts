import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const FREE_EXPORT_LIMIT = 1;
const MAX_NODES = 1000;

const schema = z.object({
  personId: z.string(),
  type: z.enum(["ASCENDANCE", "DESCENDANCE", "MIXTE", "CUSTOM"]),
  depth: z.number().min(1).max(10),
  includeSpouses: z.boolean().optional().default(false),
  includeCustom: z.boolean().optional().default(false),
  showPhotos: z.boolean().optional().default(false),
  showDates: z.boolean().optional().default(false),
  showDescriptions: z.boolean().optional().default(false),
});

// BFS pour construire le graphe
async function buildGraph(
  rootId: string,
  type: string,
  depth: number,
  includeSpouses: boolean,
  includeCustom: boolean
) {
  const visited = new Set<string>();
  const nodes: any[] = [];
  const edges: any[] = [];

  const queue: Array<{ id: string; level: number }> = [{ id: rootId, level: 0 }];

  while (queue.length > 0 && nodes.length < MAX_NODES) {
    const { id, level } = queue.shift()!;

    if (visited.has(id) || level > depth) continue;
    visited.add(id);

    const person = await prisma.person.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        birthDate: true,
        deathDate: true,
        isAlive: true,
        photoUrl: true,
        showPhoto: true,
        showBirthDate: true,
        showDeathDate: true,
        description: true,
      },
    });

    if (!person) continue;
    nodes.push({ ...person, level });

    if (level >= depth) continue;

    // Chercher les relations selon le type
    const relations = await prisma.relation.findMany({
      where: {
        OR: [
          { sourceId: id },
          { targetId: id },
        ],
      },
    });

    for (const rel of relations) {
      if (rel.type === "CUSTOM" && !includeCustom) continue;
      if (rel.type === "SPOUSE" && !includeSpouses) continue;

      let nextId: string | null = null;

      if (type === "ASCENDANCE") {
        // Remonter vers les parents
        if (rel.type === "PARENT_CHILD" && rel.targetId === id) {
          nextId = rel.sourceId;
        }
      } else if (type === "DESCENDANCE") {
        // Descendre vers les enfants
        if (rel.type === "PARENT_CHILD" && rel.sourceId === id) {
          nextId = rel.targetId;
        }
      } else {
        // MIXTE ou CUSTOM : toutes les directions
        nextId = rel.sourceId === id ? rel.targetId : rel.sourceId;
      }

      if (nextId && !visited.has(nextId)) {
        queue.push({ id: nextId, level: level + 1 });
        if (!edges.find((e) => e.id === rel.id)) {
          edges.push(rel);
        }
      }

      // Conjoints
      if (rel.type === "SPOUSE" && includeSpouses) {
        const spouseId = rel.sourceId === id ? rel.targetId : rel.sourceId;
        if (!visited.has(spouseId)) {
          queue.push({ id: spouseId, level });
          if (!edges.find((e) => e.id === rel.id)) {
            edges.push(rel);
          }
        }
      }
    }
  }

  return { nodes, edges };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const isPremium = session.user.role === "PREMIUM" || session.user.role === "ADMIN";

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_FIELDS" }, { status: 400 });
    }

    // Vérifier la limite d'export pour les FREE
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { exportCount: true },
    });

    if (!isPremium && (user?.exportCount || 0) >= FREE_EXPORT_LIMIT) {
      return NextResponse.json(
        { error: "EXPORT_LIMIT_REACHED", exportCount: user?.exportCount },
        { status: 403 }
      );
    }

    const person = await prisma.person.findUnique({
      where: { id: parsed.data.personId },
    });

    if (!person) {
      return NextResponse.json({ error: "PERSON_NOT_FOUND" }, { status: 404 });
    }

    // Construire le graphe
    const graph = await buildGraph(
      parsed.data.personId,
      parsed.data.type,
      parsed.data.depth,
      parsed.data.includeSpouses,
      parsed.data.includeCustom
    );

    // Sanitiser selon RGPD
    const sanitizedNodes = graph.nodes.map((n) => ({
      ...n,
      birthDate: parsed.data.showDates && n.showBirthDate ? n.birthDate : null,
      deathDate: parsed.data.showDates && n.showDeathDate ? n.deathDate : null,
      photoUrl: parsed.data.showPhotos && n.showPhoto ? n.photoUrl : null,
      description: parsed.data.showDescriptions ? n.description : null,
    }));

    // Incrémenter le compteur d'export pour les FREE
    if (!isPremium) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { exportCount: { increment: 1 } },
      });
    }

    await createAuditLog({
      userId: session.user.id,
      action: "EXPORT_CREATED",
      entity: "persons",
      entityId: parsed.data.personId,
      details: { type: parsed.data.type, depth: parsed.data.depth, nodeCount: sanitizedNodes.length },
    });

    return NextResponse.json({
      success: true,
      data: {
        rootPerson: {
          id: person.id,
          firstName: person.firstName,
          lastName: person.lastName,
        },
        type: parsed.data.type,
        depth: parsed.data.depth,
        nodes: sanitizedNodes,
        edges: graph.edges,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Export PDF error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
