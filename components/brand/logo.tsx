import { cn } from "@/lib/utils";

/**
 * Gate — Identité de marque
 *
 * Monogramme : un « G » d'archive enfermé dans un linteau / cadre de porte.
 * Lecture double : la porte (Gate) et l'arche d'un registre. Le point « sceau »
 * bordeaux signe la marque (accent unique de la DA).
 *
 * SVG inline héritant de `currentColor` → s'adapte à tout contexte (clair/sombre).
 */

interface MarkProps {
  className?: string;
  size?: number;
  /** Affiche le point « sceau » bordeaux (accent). Défaut: true */
  seal?: boolean;
}

/** Monogramme seul (favicon, app icon, marque compacte) */
export function GateMark({ className, size = 32, seal = true }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {/* Cadre / linteau de porte */}
      <path
        d="M8 33V14c0-4.42 3.58-8 8-8h8c4.42 0 8 3.58 8 8v19"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
      {/* Seuil */}
      <path d="M5.5 33h29" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
      {/* Le « G » : arc ouvert + barre interne */}
      <path
        d="M26.5 16.2C25 14 22.7 12.6 20 12.6c-4.2 0-7.6 3.4-7.6 7.6s3.4 7.6 7.6 7.6c2 0 3.9-.78 5.3-2.06"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
      <path
        d="M20.4 20.6h6.4v5.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      {/* Sceau */}
      {seal && <circle cx="20" cy="32.8" r="2" fill="#E8A33D" />}
    </svg>
  );
}

interface LogoProps {
  className?: string;
  /** Taille du monogramme en px. Défaut: 28 */
  size?: number;
  /** Cacher le mot « Gate » (monogramme seul). Défaut: false */
  markOnly?: boolean;
  seal?: boolean;
}

/** Logotype complet : monogramme + mot « Gate » en serif */
export function Logo({ className, size = 28, markOnly = false, seal = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <GateMark size={size} seal={seal} />
      {!markOnly && (
        <span
          className="font-serif font-semibold leading-none tracking-tight"
          style={{ fontSize: size * 0.78 }}
        >
          Gate
        </span>
      )}
    </span>
  );
}
