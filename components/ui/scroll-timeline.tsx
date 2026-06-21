"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Frise chronologique animée au scroll, DA « Éditorial Archive ».
 *  - la ligne verticale (encre) se remplit à mesure qu'on descend
 *  - chaque entrée apparaît en fondu + léger glissement quand elle entre dans le viewport
 *  - pastille au sceau bordeaux qui « éclôt » à l'apparition
 * Pas de dépendance externe (IntersectionObserver + scroll natif).
 * Respecte prefers-reduced-motion (tout est affiché, sans animation).
 */
export type TimelineEntry = { year: string; text: string };

export function ScrollTimeline({ items }: { items: TimelineEntry[] }) {
  const containerRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Remplissage de la ligne proportionnel au scroll dans le conteneur.
  useEffect(() => {
    if (reduced) {
      if (fillRef.current) fillRef.current.style.transform = "scaleY(1)";
      return;
    }
    const el = containerRef.current;
    const fill = fillRef.current;
    if (!el || !fill) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progression : 0 quand le haut atteint ~75% de l'écran, 1 quand le bas l'a dépassé
      const start = vh * 0.75;
      const total = rect.height + start;
      const scrolled = Math.min(Math.max(start - rect.top, 0), total);
      const p = Math.min(scrolled / rect.height, 1);
      fill.style.transform = `scaleY(${p.toFixed(3)})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  // Apparition des entrées une à une.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>("[data-tl-item]"));
    if (reduced || typeof IntersectionObserver === "undefined") {
      targets.forEach((t) => t.classList.add("tl-in"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("tl-in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <ol ref={containerRef} className="relative ml-2 space-y-7 pl-8">
      {/* rail de fond */}
      <span aria-hidden className="absolute left-[5px] top-1 bottom-1 w-px bg-ink-line" />
      {/* rail rempli (encre) qui grandit au scroll */}
      <span
        ref={fillRef}
        aria-hidden
        className="absolute left-[5px] top-1 bottom-1 w-px origin-top bg-ink"
        style={{ transform: "scaleY(0)" }}
      />

      {items.map((t, i) => (
        <li
          key={`${t.year}-${i}`}
          data-tl-item
          className="tl-item relative"
        >
          <span aria-hidden className="tl-dot absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-seal" />
          <span className="font-mono text-sm font-semibold text-seal">{t.year}</span>
          <p className="mt-0.5 text-[15px] leading-relaxed text-ink-soft">{t.text}</p>
        </li>
      ))}

      <style>{`
        .tl-item { opacity: 0; transform: translateY(14px); transition: opacity .55s cubic-bezier(.16,1,.3,1), transform .55s cubic-bezier(.16,1,.3,1); }
        .tl-item.tl-in { opacity: 1; transform: translateY(0); }
        .tl-dot { transform: scale(0); transition: transform .4s cubic-bezier(.34,1.56,.64,1) .1s; }
        .tl-item.tl-in .tl-dot { transform: scale(1); }
        @media (prefers-reduced-motion: reduce) {
          .tl-item { opacity: 1; transform: none; }
          .tl-dot { transform: scale(1); }
        }
      `}</style>
    </ol>
  );
}
