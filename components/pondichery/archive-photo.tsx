import { cn } from "@/lib/utils";

/**
 * Photo d'archive (domaine public) traitée façon registre : léger virage sépia,
 * grain, cadre fin, légende + crédit. Utilisée sur la page Pondichéry.
 */
export function ArchivePhoto({
  src,
  alt,
  caption,
  credit = "Domaine public",
  className,
}: {
  src: string;
  alt: string;
  caption: string;
  credit?: string;
  className?: string;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-[var(--radius)] border border-ink-line bg-card", className)}>
      <div className="relative overflow-hidden bg-paper-warm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-[filter] duration-500"
          style={{ filter: "sepia(0.32) contrast(1.02) brightness(0.99) saturate(0.9)" }}
        />
        {/* grain léger en overlay */}
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-grain opacity-[0.35] mix-blend-multiply" />
      </div>
      <figcaption className="flex items-baseline justify-between gap-3 border-t border-ink-line px-3 py-2">
        <span className="text-xs italic text-ink-soft">{caption}</span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">{credit}</span>
      </figcaption>
    </figure>
  );
}
