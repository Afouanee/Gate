"use client";

/**
 * « Arbre vivant » — fond décoratif animé du hero.
 *
 * Un arbre généalogique stylisé en SVG qui se TRACE tout seul au chargement :
 * les branches se dessinent (stroke-dashoffset), puis les nœuds éclosent.
 * Teinte encre/sceau très discrète (filigrane). Respecte prefers-reduced-motion.
 *
 * Purement décoratif (aria-hidden). Déterministe (pas de Math.random).
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Arbre symétrique sur 4 niveaux, coordonnées en viewBox 1000x620.
// Chaque nœud : [x, y]. Les arêtes relient parent → enfants.
const NODES: [number, number][] = [
  [500, 70],                                   // 0 racine
  [300, 220], [700, 220],                      // 1,2
  [180, 380], [380, 380], [620, 380], [820, 380], // 3,4,5,6
  [110, 540], [250, 540], [430, 540], [560, 540], [690, 540], [890, 540], // 7..12
];
const EDGES: [number, number][] = [
  [0, 1], [0, 2],
  [1, 3], [1, 4], [2, 5], [2, 6],
  [3, 7], [3, 8], [4, 9], [5, 10], [6, 11], [6, 12],
];

export function LivingTree({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid meet"
      className={cn("pointer-events-none select-none", className)}
    >
      {/* Arêtes : se tracent une à une */}
      <g stroke="currentColor" strokeWidth={1.25} fill="none" opacity={0.5}>
        {EDGES.map(([a, b], i) => {
          const [x1, y1] = NODES[a];
          const [x2, y2] = NODES[b];
          // connecteur orthogonal (style registre)
          const midY = (y1 + y2) / 2;
          const d = `M${x1},${y1} V${midY} H${x2} V${y2}`;
          return (
            <path
              key={i}
              d={d}
              strokeDasharray="1"
              pathLength={1}
              style={
                reduced
                  ? undefined
                  : {
                      strokeDashoffset: 1,
                      animation: `lt-draw 1.1s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.07}s forwards`,
                    }
              }
            />
          );
        })}
      </g>

      {/* Nœuds : éclosent après le tracé */}
      <g>
        {NODES.map(([x, y], i) => {
          const isRoot = i === 0;
          const delay = 0.5 + i * 0.06;
          return (
            <g
              key={i}
              style={
                reduced
                  ? undefined
                  : { opacity: 0, transformOrigin: `${x}px ${y}px`, animation: `lt-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s forwards` }
              }
            >
              <circle cx={x} cy={y} r={isRoot ? 13 : 8} fill="currentColor" opacity={isRoot ? 0.9 : 0.32} />
              {isRoot && <circle cx={x} cy={y} r={5} fill="#E8A33D" />}
            </g>
          );
        })}
      </g>

      <style>{`
        @keyframes lt-draw { to { stroke-dashoffset: 0; } }
        @keyframes lt-pop { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) {
          [aria-hidden] path { stroke-dashoffset: 0 !important; }
        }
      `}</style>
    </svg>
  );
}
