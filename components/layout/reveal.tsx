"use client";

import { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

/**
 * Wrapper de scroll-reveal utilisable dans les Server Components.
 * Rend l'élément `as` (div par défaut) avec la classe `reveal` puis
 * `reveal-in` à l'entrée dans le viewport.
 */
export function Reveal({
  children,
  className,
  as: As = "div",
  delay,
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** délai d'apparition en ms */
  delay?: number;
  /** ancre (pour les liens de sommaire) */
  id?: string;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <As
      ref={ref as never}
      id={id}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </As>
  );
}
