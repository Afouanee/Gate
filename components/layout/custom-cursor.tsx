"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);

  const pos      = useRef({ x: -100, y: -100 });
  const ringPos  = useRef({ x: -100, y: -100 });
  const raf      = useRef<number>(0);

  const [clicking,  setClicking]  = useState(false);
  const [hovering,  setHovering]  = useState(false);
  const [hidden,    setHidden]    = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };

      // Déterminer si on est sur un élément interactif
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const interactive = el?.closest("a, button, [role='button'], select, label");
      setHovering(!!interactive);

      // Masquer sur les inputs texte
      const textInput = el?.closest("input[type='text'], input[type='email'], input[type='password'], input[type='search'], input[type='number'], textarea");
      setHidden(!!textInput);
    };

    const onDown  = () => setClicking(true);
    const onUp    = () => setClicking(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener("mousemove",   onMove);
    window.addEventListener("mousedown",   onDown);
    window.addEventListener("mouseup",     onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    // Animation loop — le ring suit avec un léger lag
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.12);
        ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.12);
        ringRef.current.style.transform =
          `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove",   onMove);
      window.removeEventListener("mousedown",   onDown);
      window.removeEventListener("mouseup",     onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (hidden) return null;

  return (
    <>
      {/* Dot central — suit la souris exactement */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position:        "fixed",
          top:             0,
          left:            0,
          zIndex:          99999,
          pointerEvents:   "none",
          width:           clicking ? "6px" : hovering ? "8px" : "6px",
          height:          clicking ? "6px" : hovering ? "8px" : "6px",
          borderRadius:    "50%",
          background:      hovering
            ? "linear-gradient(135deg, #6366f1, #a855f7)"
            : "linear-gradient(135deg, #09090b, #3f3f46)",
          transition:      "width 0.15s, height 0.15s, background 0.2s",
          mixBlendMode:    "normal",
          willChange:      "transform",
        }}
      />

      {/* Ring extérieur — suit avec lag (lerp) */}
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          zIndex:        99998,
          pointerEvents: "none",
          width:         clicking ? "28px" : hovering ? "40px" : "32px",
          height:        clicking ? "28px" : hovering ? "40px" : "32px",
          borderRadius:  "50%",
          border:        hovering
            ? "1.5px solid rgba(99,102,241,0.5)"
            : "1.5px solid rgba(9,9,11,0.2)",
          background:    hovering
            ? "rgba(99,102,241,0.06)"
            : "transparent",
          backdropFilter: hovering ? "blur(2px)" : "none",
          transition:    "width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.2s, background 0.2s",
          willChange:    "transform",
        }}
      />
    </>
  );
}
