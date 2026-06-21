"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  MarkerType,
  ConnectionLineType,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Search, Crosshair, Loader2, Crown, AlertTriangle } from "lucide-react";
import { PersonNode } from "./person-node";
import { PersonPanel } from "./person-panel";

const nodeTypes = { person: PersonNode };

// Algorithme de layout généalogique : générations par BFS de filiation,
// couples placés côte à côte, sous-arbres sans chevauchement, parent centré
// sur le bloc « couple + enfants ». Gère plusieurs racines et conjoints sans parents.
function layoutNodes(rawNodes: any[], rawEdges: any[]): { nodes: Node[]; edges: Edge[] } {
  const NODE_W = 176;
  const NODE_H = 132;
  // Sémantique des espaces : un COUPLE est serré (cartes proches, trait pointillé
  // latéral) ; la FRATRIE est plus aérée (reliée par la filiation, traits continus).
  const H_GAP  = 64;   // espace entre fiches d'une fratrie (large, anti-chevauchement)
  const SPOUSE_GAP = 22; // espace entre conjoints (resserré : ils sont "ensemble")
  const V_GAP  = 130;  // espace vertical entre générations
  const SLOT   = NODE_W + H_GAP;

  const ids = new Set(rawNodes.map((n) => n.id));

  // Maps de filiation (uniquement entre nœuds présents)
  const childMap  = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();
  // Conjoint principal (1 par personne pour le layout)
  const spouseOf  = new Map<string, string>();

  rawEdges.forEach((e) => {
    if (!ids.has(e.sourceId) || !ids.has(e.targetId)) return;
    if (e.type === "PARENT_CHILD") {
      if (!childMap.has(e.sourceId)) childMap.set(e.sourceId, []);
      if (!parentMap.has(e.targetId)) parentMap.set(e.targetId, []);
      childMap.get(e.sourceId)!.push(e.targetId);
      parentMap.get(e.targetId)!.push(e.sourceId);
    } else if (e.type === "SPOUSE") {
      if (!spouseOf.has(e.sourceId)) spouseOf.set(e.sourceId, e.targetId);
      if (!spouseOf.has(e.targetId)) spouseOf.set(e.targetId, e.sourceId);
    }
  });

  const hasParent = (id: string) => (parentMap.get(id)?.length ?? 0) > 0;

  // ── Générations : BFS depuis les vraies racines (sans parent ET dont le
  // conjoint n'a pas de parent non plus), en propageant aux conjoints. ────────
  const genMap = new Map<string, number>();
  const setGen = (id: string, g: number) => {
    if (genMap.has(id)) return;
    genMap.set(id, g);
    const sp = spouseOf.get(id);
    if (sp && !genMap.has(sp)) genMap.set(sp, g); // le conjoint partage la génération
  };

  // racines = nœuds sans parent dont aucun conjoint n'a de parent
  const roots = rawNodes
    .map((n) => n.id)
    .filter((id) => !hasParent(id) && !(spouseOf.get(id) && hasParent(spouseOf.get(id)!)));

  const queue: { id: string; gen: number }[] = roots.map((id) => ({ id, gen: 0 }));
  while (queue.length) {
    const { id, gen } = queue.shift()!;
    if (genMap.has(id)) continue;
    setGen(id, gen);
    for (const cid of childMap.get(id) || []) queue.push({ id: cid, gen: gen + 1 });
    const sp = spouseOf.get(id);
    if (sp) for (const cid of childMap.get(sp) || []) queue.push({ id: cid, gen: gen + 1 });
  }
  // fallback : tout nœud non atteint (cas exotiques)
  rawNodes.forEach((n) => { if (!genMap.has(n.id)) genMap.set(n.id, 0); });

  // ── On parcourt l'arbre par « unité familiale » = une personne + son conjoint.
  // L'unité est représentée par le membre qui porte la filiation (a des enfants
  // ou descend d'un parent placé). Pour éviter de placer 2× un couple, on marque
  // les conjoints « secondaires » (rattachés par mariage à un membre déjà placé).
  const placedAsSpouse = new Set<string>();
  const positions = new Map<string, { x: number; y: number }>();

  // largeur d'un sous-arbre en nombre de « slots » (fiches)
  const widthCache = new Map<string, number>();
  function unitWidth(id: string): number {
    if (widthCache.has(id)) return widthCache.get(id)!;
    const sp = spouseOf.get(id);
    const selfSlots = sp ? 2 : 1; // couple = 2 fiches
    const kids = childMap.get(id) || [];
    let w: number;
    if (!kids.length) {
      w = selfSlots;
    } else {
      const kidsW = kids.reduce((s, k) => s + unitWidth(k), 0);
      w = Math.max(selfSlots, kidsW);
    }
    widthCache.set(id, w);
    return w;
  }

  // place une unité (personne + conjoint) à partir de xStart (en px), renvoie [x du centre du couple]
  function placeUnit(id: string, xStart: number): number {
    const gen = genMap.get(id) ?? 0;
    const y = gen * (NODE_H + V_GAP);
    const sp = spouseOf.get(id);
    const kids = childMap.get(id) || [];

    const myWidthPx = unitWidth(id) * SLOT;

    // placer d'abord les enfants pour centrer le couple dessus
    let childCenter: number | null = null;
    if (kids.length) {
      let cursor = xStart;
      const centers: number[] = [];
      for (const k of kids) {
        const c = placeUnit(k, cursor);
        centers.push(c);
        cursor += unitWidth(k) * SLOT;
      }
      childCenter = (centers[0] + centers[centers.length - 1]) / 2;
    }

    // position du couple : centré sur ses enfants si possible, sinon sur sa propre largeur
    const coupleW = sp ? NODE_W * 2 + SPOUSE_GAP : NODE_W;
    let coupleCenter = childCenter ?? xStart + myWidthPx / 2;
    // garde le couple dans sa bande
    const leftX = coupleCenter - coupleW / 2;

    positions.set(id, { x: leftX, y });
    if (sp) {
      positions.set(sp, { x: leftX + NODE_W + SPOUSE_GAP, y });
      placedAsSpouse.add(sp);
    }
    return coupleCenter;
  }

  // unités racines = racines qui ne sont pas le conjoint secondaire d'une autre racine
  let xCursor = 0;
  const rootUnits = roots.filter((id) => {
    const sp = spouseOf.get(id);
    // si le conjoint est aussi racine, on ne garde qu'un seul des deux (celui qui a des enfants, sinon le 1er)
    if (sp && roots.includes(sp)) {
      const idHasKids = (childMap.get(id)?.length ?? 0) > 0;
      const spHasKids = (childMap.get(sp)?.length ?? 0) > 0;
      if (spHasKids && !idHasKids) return false;
      if (!idHasKids && !spHasKids) return id < sp; // ordre stable
    }
    return true;
  });

  for (const rootId of rootUnits) {
    if (positions.has(rootId)) continue;
    placeUnit(rootId, xCursor);
    xCursor += Math.max(unitWidth(rootId), spouseOf.get(rootId) ? 2 : 1) * SLOT + SLOT;
  }

  // tout nœud restant non placé (déconnecté) → rangée du bas
  let orphanX = 0;
  const maxGen = Math.max(0, ...Array.from(genMap.values()));
  rawNodes.forEach((n) => {
    if (!positions.has(n.id)) {
      positions.set(n.id, { x: orphanX, y: (maxGen + 1) * (NODE_H + V_GAP) });
      orphanX += SLOT;
    }
  });

  const nodes: Node[] = rawNodes.map((n) => ({
    id: n.id,
    type: "person",
    position: positions.get(n.id) || { x: 0, y: 0 },
    data: n,
  }));

  // pour orienter le trait conjoint : la source à gauche pointe son port droit
  // vers le port gauche de la personne à droite (trait horizontal simple).
  const xOf = (id: string) => positions.get(id)?.x ?? 0;

  const edges: Edge[] = rawEdges.map((e) => {
    const isSpouse = e.type === "SPOUSE";
    // Pour un couple, déterminer qui est à gauche / à droite
    const srcLeft = xOf(e.sourceId) <= xOf(e.targetId);
    return {
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    // Conjoint : trait DROIT horizontal entre les ports latéraux (gauche/droite).
    // Filiation / custom : connecteurs orthogonaux qui suivent la grille.
    type: isSpouse ? "straight" : "smoothstep",
    sourceHandle: isSpouse ? (srcLeft ? "right" : "left") : undefined,
    targetHandle: isSpouse ? (srcLeft ? "left" : "right") : undefined,
    animated: false,
    // Couleurs DA « Archive » : filiation = encre estompée, conjoint = sceau, custom = patine pointillée
    style: {
      stroke:
        e.type === "SPOUSE" ? "#7A2E2E" :
        e.type === "CUSTOM" ? "#A8842C" :
        "#B9AE96",
      strokeWidth: e.type === "PARENT_CHILD" ? 1.75 : 1.5,
      strokeDasharray:
        e.type === "SPOUSE" ? "5 4" :
        e.type === "CUSTOM" ? "2 4" :
        undefined,
      opacity: e.type === "CUSTOM" ? 0.6 : 1,
    },
    markerEnd: e.type === "PARENT_CHILD"
      ? { type: MarkerType.ArrowClosed, color: "#8A8378", width: 10, height: 10 }
      : undefined,
    label: e.type === "CUSTOM" ? e.label : undefined,
    labelStyle:     { fill: "#A8842C", fontSize: 9, fontWeight: 600, fontFamily: "var(--font-mono)" },
    labelBgStyle:   { fill: "#F2E9CF", fillOpacity: 0.95 },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 4,
    };
  });

  return { nodes, edges };
}

function FamilyTreeInner({ focusPersonId }: { focusPersonId?: string | null }) {
  const t = useTranslations("tree");
  const { data: session } = useSession();
  const { fitView, setCenter, getNodes } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isLimited, setIsLimited] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/tree");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!active) return;
        setIsLimited(data.limited);
        const { nodes: ln, edges: le } = layoutNodes(data.nodes, data.edges);
        setNodes(ln);
        setEdges(le);
      } catch {
        if (active) setError("Impossible de charger l'arbre");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [setEdges, setNodes]);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          highlighted: q
            ? n.data.firstName?.toLowerCase().includes(q) || n.data.lastName?.toLowerCase().includes(q)
            : n.id === focusPersonId,
        },
      }))
    );
  }, [focusPersonId, searchQuery, setNodes]);

  const centerOnNode = useCallback((nodeId: string) => {
    const node = getNodes().find((currentNode) => currentNode.id === nodeId);
    if (node) {
      setCenter(node.position.x + 80, node.position.y + 40, { zoom: 1.2, duration: 800 });
    }
  }, [getNodes, setCenter]);

  useEffect(() => {
    if (!loading && nodes.length > 0) {
      if (focusPersonId) {
        centerOnNode(focusPersonId);
      } else {
        fitView({ duration: 800, padding: 0.25 });
      }
    }
  }, [centerOnNode, fitView, focusPersonId, loading, nodes.length]);

  const handleCenter = useCallback(() => {
    if (focusPersonId) {
      centerOnNode(focusPersonId);
      return;
    }

    const node = getNodes().find((currentNode) => currentNode.data.userId === session?.user?.id);
    if (node) setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 800 });
    else fitView({ duration: 800 });
  }, [centerOnNode, fitView, focusPersonId, getNodes, session, setCenter]);

  const searchMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return nodes.filter((node) =>
      node.data?.firstName?.toLowerCase().includes(q) || node.data?.lastName?.toLowerCase().includes(q)
    );
  }, [nodes, searchQuery]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedPersonId(node.id);
  }, []);

  const jumpToSearchResult = useCallback(() => {
    if (searchMatches[0]) {
      centerOnNode(searchMatches[0].id);
      setSelectedPersonId(searchMatches[0].id);
    }
  }, [centerOnNode, searchMatches]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-paper-warm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-ink-faint" />
          <p className="meta-label">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-paper-warm">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-ink-faint" strokeWidth={1.5} />
          <p className="text-sm text-ink-soft">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tree-canvas relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.05}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={32} size={1.1} color="#D8CFBD" style={{ backgroundColor: "#F4EFE4" }} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.gender === "MALE") return "#3F5B72";
            if (node.data?.gender === "FEMALE") return "#8A4A52";
            if (node.data?.gender === "OTHER") return "#5E5070";
            return "#B9AE96";
          }}
          nodeStrokeWidth={0}
          maskColor="rgba(244,239,228,0.6)"
        />

        <Panel position="top-left">
          <div className="flex items-center gap-2 rounded-[var(--radius)] border border-ink-line bg-paper/95 p-2 shadow-paper-md backdrop-blur-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" strokeWidth={1.75} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                aria-label={t("search")}
                className="h-9 w-52 rounded-full border border-ink-line bg-card pl-8 pr-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/30"
              />
            </div>
            <button
              onClick={jumpToSearchResult}
              disabled={!searchMatches.length}
              className="flex h-9 items-center gap-1.5 rounded-full border border-ink-line px-3 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
              Trouver
            </button>
            <button
              onClick={handleCenter}
              className="flex h-9 items-center gap-1.5 rounded-full border border-ink-line px-3 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Crosshair className="h-3.5 w-3.5" strokeWidth={1.75} />
              {focusPersonId ? "Recentrer" : t("center")}
            </button>
          </div>
        </Panel>

        {isLimited && (
          <Panel position="top-center">
            <div className="flex items-center gap-2 rounded-full border border-seal/30 bg-seal-tint px-4 py-2 shadow-paper">
              <Crown className="h-4 w-4 text-seal" strokeWidth={1.75} />
              <span className="text-xs text-ink-soft">
                Affichage limité à 10 profils.{" "}
                <a href="/pricing" className="link-underline font-medium text-seal">
                  Passer à Premium
                </a>
              </span>
            </div>
          </Panel>
        )}

        <Panel position="bottom-left">
          <div className="space-y-1.5 rounded-[var(--radius)] border border-ink-line bg-paper/95 p-3 text-xs shadow-paper backdrop-blur-sm">
            <p className="mb-2 meta-label">Légende</p>
            <div className="flex items-center gap-2">
              <div className="h-px w-6" style={{ background: "#8A8378" }} />
              <span className="text-ink-soft">Parent → Enfant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 border-t border-dashed" style={{ borderColor: "#7A2E2E" }} />
              <span className="text-ink-soft">Conjoint(e)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-px w-6" style={{ background: "#A8842C" }} />
              <span className="text-ink-soft">Relation personnalisée</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {selectedPersonId && (
        <PersonPanel personId={selectedPersonId} onClose={() => setSelectedPersonId(null)} />
      )}
    </div>
  );
}

export function FamilyTree({ focusPersonId }: { focusPersonId?: string | null }) {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner focusPersonId={focusPersonId} />
    </ReactFlowProvider>
  );
}
