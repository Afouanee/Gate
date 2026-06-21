"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Curseur personnalisé « Archive »
 *  - point d'encre + anneau qui suit avec un léger retard (lerp)
 *  - vire au sceau (bordeaux) au survol d'un élément interactif
 *  - se masque sur les champs texte (curseur natif rendu)
 *  - inactif sur tactile / pointeur grossier et si prefers-reduced-motion
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);

  const [enabled, setEnabled] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(false);

  // N'activer que sur souris fine + mouvement non réduit
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduced);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setHovering(!!el?.closest("a, button, [role='button'], select, label[for], summary, [data-cursor='link']"));
      setHidden(!!el?.closest("input:not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']"));
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const loop = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.16);
        ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.16);
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled || hidden) return null;

  const ink = "#1A1714";
  const saffron = "#D98324"; // accent chaud (Inde) au survol

  return (
    <>
      {/* Point central — exact */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999,
          pointerEvents: "none",
          width: clicking ? 5 : hovering ? 6 : 5,
          height: clicking ? 5 : hovering ? 6 : 5,
          borderRadius: "50%",
          background: hovering ? saffron : ink,
          boxShadow: hovering ? "0 0 10px rgba(217,131,36,0.6)" : "none",
          transition: "width 0.15s, height 0.15s, background 0.2s, box-shadow 0.2s",
          willChange: "transform",
        }}
      />
      {/* Anneau — suit avec retard */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99998,
          pointerEvents: "none",
          width: clicking ? 26 : hovering ? 38 : 30,
          height: clicking ? 26 : hovering ? 38 : 30,
          borderRadius: "50%",
          border: `1.5px solid ${hovering ? "rgba(217,131,36,0.6)" : "rgba(26,23,20,0.28)"}`,
          background: hovering ? "rgba(217,131,36,0.07)" : "transparent",
          transition:
            "width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.2s, background 0.2s",
          willChange: "transform",
        }}
      />
    </>
  );
}
