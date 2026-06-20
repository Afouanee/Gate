/**
 * Illustrations SVG « maison » pour la page Pondichéry.
 * Pas de photos externes (site d'archive) : motifs dessinés, teinte encre/sceau,
 * cohérents avec la DA. Tous décoratifs (aria-hidden), hériteront de currentColor.
 */
import { cn } from "@/lib/utils";

/** Kolam : motif géométrique tracé d'un seul trait autour de points. */
export function Kolam({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={cn("", className)}>
      {/* points */}
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => (
          <circle key={`${r}-${c}`} cx={30 + c * 30} cy={30 + r * 30} r="1.6" fill="currentColor" opacity="0.5" />
        ))
      )}
      {/* boucles autour des points (un seul trait stylisé) */}
      <path
        d="M60 18c14 0 24 10 24 24M84 60c0 14-10 24-24 24M60 102c-14 0-24-10-24-24M36 60c0-14 10-24 24-24"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"
      />
      <path
        d="M60 30c0 12-12 18-12 30s12 18 12 30M30 60c12 0 18 12 30 12s18-12 30-12"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.45"
      />
      <circle cx="60" cy="60" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Carte stylisée : côte de Coromandel, Pondichéry → traversée → France. */
export function CoromandelMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" fill="none" aria-hidden className={cn("", className)}>
      {/* trait de côte (Inde du sud) */}
      <path
        d="M20 30 C30 60 26 90 40 120 C52 145 60 160 56 172"
        stroke="currentColor" strokeWidth="1.5" opacity="0.6"
      />
      {/* point Pondichéry */}
      <circle cx="44" cy="120" r="3.5" fill="#7A2E2E" />
      <text x="52" y="124" fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.7">Pondichéry</text>
      {/* traversée (pointillé courbe vers la France) */}
      <path
        d="M48 118 C140 70 220 60 296 40"
        stroke="#7A2E2E" strokeWidth="1.25" strokeDasharray="4 5" opacity="0.8"
      />
      {/* point France */}
      <circle cx="296" cy="40" r="3.5" fill="currentColor" />
      <text x="246" y="32" fontFamily="var(--font-mono)" fontSize="9" fill="currentColor" opacity="0.7">France</text>
      {/* vaguelettes mer */}
      {[150, 162, 174].map((y) => (
        <path key={y} d={`M120 ${y} q10 -5 20 0 t20 0 t20 0 t20 0`} stroke="currentColor" strokeWidth="1" opacity="0.2" />
      ))}
    </svg>
  );
}

/** Façade « ville blanche » : arches coloniales stylisées. */
export function WhiteTown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 100" fill="none" aria-hidden className={cn("", className)}>
      <line x1="8" y1="92" x2="232" y2="92" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {[16, 76, 136, 196].map((x) => (
        <g key={x} stroke="currentColor" strokeWidth="1.25" opacity="0.7">
          <rect x={x} y="34" width="44" height="58" rx="1" />
          {/* arche */}
          <path d={`M${x + 8} 58 a14 14 0 0 1 28 0`} />
          {/* persiennes */}
          <line x1={x + 14} y1="40" x2={x + 30} y2="40" opacity="0.5" />
          <line x1={x + 14} y1="46" x2={x + 30} y2="46" opacity="0.5" />
        </g>
      ))}
      {/* sol / pavés */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={i} x1={20 + i * 28} y1="92" x2={14 + i * 28} y2="98" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      ))}
    </svg>
  );
}

/** Boussole / rose des vents minimaliste (pour la section repères). */
export function Compass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden className={cn("", className)}>
      <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="1.25" opacity="0.5" />
      <path d="M40 12 L46 40 L40 68 L34 40 Z" fill="currentColor" opacity="0.18" />
      <path d="M12 40 L40 34 L68 40 L40 46 Z" fill="currentColor" opacity="0.1" />
      <path d="M40 12 L46 40 L40 40 Z" fill="#7A2E2E" />
      <circle cx="40" cy="40" r="2.5" fill="currentColor" />
    </svg>
  );
}
