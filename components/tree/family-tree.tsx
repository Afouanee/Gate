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

// Algorithme de layout Reingold-Tilford simplifié :
// chaque nœud est centré sur ses enfants, les sous-arbres ne se chevauchent pas.
function layoutNodes(rawNodes: any[], rawEdges: any[]): { nodes: Node[]; edges: Edge[] } {
  const NODE_W = 180;
  const NODE_H = 110;
  const H_GAP  = 60;   // espace horizontal entre nœuds
  const V_GAP  = 120;  // espace vertical entre générations

  // Construire les maps parent ↔ enfant (filiation uniquement)
  const childMap  = new Map<string, string[]>();
  const parentMap = new Map<string, string[]>();
  rawEdges.forEach((e) => {
    if (e.type !== "PARENT_CHILD") return;
    if (!childMap.has(e.sourceId))  childMap.set(e.sourceId, []);
    if (!parentMap.has(e.targetId)) parentMap.set(e.targetId, []);
    childMap.get(e.sourceId)!.push(e.targetId);
    parentMap.get(e.targetId)!.push(e.sourceId);
  });

  // Générations via BFS depuis les racines
  const genMap = new Map<string, number>();
  const roots  = rawNodes.map((n) => n.id).filter((id) => !parentMap.has(id) || parentMap.get(id)!.length === 0);
  const bfsQ   = roots.map((id) => ({ id, gen: 0 }));
  while (bfsQ.length > 0) {
    const { id, gen } = bfsQ.shift()!;
    if (genMap.has(id)) continue;
    genMap.set(id, gen);
    (childMap.get(id) || []).forEach((cid) => bfsQ.push({ id: cid, gen: gen + 1 }));
  }
  rawNodes.forEach((n) => { if (!genMap.has(n.id)) genMap.set(n.id, 0); });

  // Calculer la "largeur" de chaque sous-arbre (nombre de feuilles)
  const subtreeWidth = new Map<string, number>();
  const allIds = rawNodes.map((n) => n.id);

  function calcWidth(id: string): number {
    if (subtreeWidth.has(id)) return subtreeWidth.get(id)!;
    const children = childMap.get(id) || [];
    if (children.length === 0) {
      subtreeWidth.set(id, 1);
      return 1;
    }
    const w = children.reduce((sum, cid) => sum + calcWidth(cid), 0);
    subtreeWidth.set(id, w);
    return w;
  }
  allIds.forEach(calcWidth);

  // Positionner en x en parcourant l'arbre, et en y selon la génération
  const positions = new Map<string, { x: number; y: number }>();

  function placeNode(id: string, xOffset: number): void {
    if (positions.has(id)) return;
    const gen      = genMap.get(id) ?? 0;
    const children = childMap.get(id) || [];
    const y        = gen * (NODE_H + V_GAP);

    if (children.length === 0) {
      positions.set(id, { x: xOffset, y });
      return;
    }

    // Placer les enfants à la suite
    let cursor = xOffset;
    children.forEach((cid) => {
      placeNode(cid, cursor);
      cursor += (subtreeWidth.get(cid) || 1) * (NODE_W + H_GAP);
    });

    // Centrer le parent sur ses enfants
    const firstChildX = positions.get(children[0])!.x;
    const lastChildX  = positions.get(children[children.length - 1])!.x;
    positions.set(id, { x: (firstChildX + lastChildX) / 2, y });
  }

  // Calculer le décalage de départ pour chaque racine
  let xCursor = 0;
  roots.forEach((rootId) => {
    placeNode(rootId, xCursor);
    xCursor += (subtreeWidth.get(rootId) || 1) * (NODE_W + H_GAP);
  });

  // Nœuds sans position (orphelins ou conjoints non rattachés) → empiler à droite
  rawNodes.forEach((n) => {
    if (!positions.has(n.id)) {
      const gen = genMap.get(n.id) ?? 0;
      positions.set(n.id, { x: xCursor, y: gen * (NODE_H + V_GAP) });
      xCursor += NODE_W + H_GAP;
    }
  });

  const nodes: Node[] = rawNodes.map((n) => ({
    id: n.id,
    type: "person",
    position: positions.get(n.id) || { x: 0, y: 0 },
    data: n,
  }));

  const edges: Edge[] = rawEdges.map((e) => ({
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    type: e.type === "PARENT_CHILD" ? "smoothstep" : "straight",
    animated: false,
    style: {
      stroke:
        e.type === "SPOUSE"  ? "#a78bfa" :
        e.type === "CUSTOM"  ? "#c084fc" :
        "#94a3b8",
      strokeWidth:
        e.type === "PARENT_CHILD" ? 2 : 1.5,
      strokeDasharray: e.type === "SPOUSE" ? "6 4" : undefined,
    },
    markerEnd: e.type === "PARENT_CHILD"
      ? { type: MarkerType.ArrowClosed, color: "#94a3b8", width: 10, height: 10 }
      : undefined,
    label: e.type === "CUSTOM" ? e.label : undefined,
    labelStyle:     { fill: "#9333ea", fontSize: 9, fontWeight: 700 },
    labelBgStyle:   { fill: "#faf5ff", fillOpacity: 0.95 },
    labelBgPadding: [4, 2] as [number, number],
    labelBgBorderRadius: 4,
  }));

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
      <div className="flex items-center justify-center h-full bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
          <p className="text-sm text-zinc-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-8 w-8 text-zinc-300" />
          <p className="text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
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
        <Background variant={BackgroundVariant.Dots} gap={32} size={1.2} color="#d1d5db" style={{ backgroundColor: "#f8f9fa" }} />
        <Controls
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.gender === "MALE") return "#bfdbfe";
            if (node.data?.gender === "FEMALE") return "#fbcfe8";
            return "#e5e7eb";
          }}
          maskColor="rgba(255,255,255,0.6)"
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
          }}
        />

        <Panel position="top-left">
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl shadow-sm p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                className="pl-8 pr-3 h-8 w-52 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-colors"
              />
            </div>
            <button
              onClick={jumpToSearchResult}
              disabled={!searchMatches.length}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors disabled:opacity-40"
            >
              <Search className="h-3.5 w-3.5" />
              Trouver
            </button>
            <button
              onClick={handleCenter}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
            >
              <Crosshair className="h-3.5 w-3.5" />
              {focusPersonId ? "Recentrer" : t("center")}
            </button>
          </div>
        </Panel>

        {isLimited && (
          <Panel position="top-center">
            <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-4 py-2 shadow-sm">
              <Crown className="h-4 w-4 text-zinc-500" />
              <span className="text-xs text-zinc-500">
                Affichage limite a 10 profils.{" "}
                <a href="/pricing" className="font-semibold text-zinc-900 hover:underline">Passer a Premium</a>
              </span>
            </div>
          </Panel>
        )}

        <Panel position="bottom-left">
          <div className="bg-white border border-zinc-200 rounded-xl p-3 text-xs space-y-1.5 shadow-sm">
            <p className="font-bold text-zinc-400 uppercase tracking-wider mb-2 text-[10px]">Legende</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-zinc-900" />
              <span className="text-zinc-500">Parent → Enfant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 border-t-2 border-dashed border-indigo-400" />
              <span className="text-zinc-500">Conjoint(e)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-purple-600" />
              <span className="text-zinc-500">Relation custom</span>
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
