"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { X, ArrowRight, ArrowLeft, GitBranch, Search, FileDown, BookOpen } from "lucide-react";

/**
 * Visite guidée d'accueil (1er passage), sans dépendance externe : un panneau
 * centré « archive » qui présente l'essentiel de Gate en 4 étapes. Pensé pour une
 * famille non technique : on explique quoi faire en arrivant, simplement.
 *
 * - Ne s'affiche qu'une fois (localStorage `gate_tour_seen_v1`) et seulement pour
 *   un membre connecté (on ne dérange pas un visiteur de la landing).
 * - DA « Éditorial Archive / Daylight » : papier, filets, numéro de section,
 *   accent ocre `seal`, serif Fraunces. Respecte prefers-reduced-motion (pas
 *   d'animation forcée). Fermable (croix, « Passer »), touch targets ≥44px.
 *
 * Les textes sont volontairement en dur ici (FR) pour rester simple ; à passer en
 * i18n (clés `tour.*`) si besoin d'une version EN soignée.
 */

const STORAGE_KEY = "gate_tour_seen_v1";

type Step = { icon: React.ElementType; no: string; title: string; body: string };

const STEPS: Step[] = [
  {
    icon: GitBranch,
    no: "№ 01",
    title: "Votre arbre, d'un coup d'œil",
    body: "L'arbre relie toute la famille, des aïeux de Pondichéry aux générations d'aujourd'hui. Déplacez-vous librement, zoomez, ouvrez une fiche pour découvrir un proche.",
  },
  {
    icon: Search,
    no: "№ 02",
    title: "Retrouver les siens",
    body: "Cherchez un nom, un prénom ou un lieu pour retrouver quelqu'un en un instant. Et si vous ne vous voyez pas encore dans l'arbre, demandez votre rattachement : un administrateur vous reliera à votre fiche.",
  },
  {
    icon: FileDown,
    no: "№ 03",
    title: "Garder une trace",
    body: "Exportez l'arbre en PDF pour l'imprimer ou le partager. La version souvenir est gratuite ; les Bienfaiteurs obtiennent un rendu haute définition sans filigrane.",
  },
  {
    icon: BookOpen,
    no: "№ 04",
    title: "La mémoire de la ville",
    body: "Les pages Pondichéry et Karaikal racontent l'histoire de la ville, son commerce, son architecture et la migration des familles. Un fil pour comprendre d'où l'on vient.",
  },
];

export function WelcomeTour() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    let seen = true;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // localStorage indisponible : on ne force pas l'ouverture.
    }
    if (!seen) setOpen(true);
  }, [status]);

  function close() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // tant pis, se rejouera : non bloquant.
    }
    setOpen(false);
  }

  if (!open) return null;

  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;
  const Icon = step.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenue sur Gate"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 px-4 backdrop-blur-sm"
      style={{ animation: "fade-in 0.25s both" }}
    >
      <div className="w-full max-w-md rounded-[var(--radius)] border border-ink-line bg-paper p-7 shadow-paper-lg sm:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-seal">{step.no}</span>
          <button
            type="button"
            onClick={close}
            aria-label="Passer la visite"
            className="-mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-paper-warm hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-seal-tint text-seal">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-ink">{step.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>

        {/* Pastilles de progression */}
        <div className="mt-6 flex items-center gap-1.5" aria-hidden>
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className={
                "h-1.5 rounded-full transition-all " +
                (idx === i ? "w-6 bg-seal" : "w-1.5 bg-ink-line")
              }
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={close}
            className="text-sm font-medium text-ink-faint transition-colors hover:text-ink"
          >
            Passer
          </button>
          <div className="flex items-center gap-2">
            {i > 0 && (
              <button
                type="button"
                onClick={() => setI((v) => v - 1)}
                aria-label="Étape précédente"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line text-ink transition-colors hover:bg-paper-warm"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? close() : setI((v) => v + 1))}
              className="flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-paper transition-transform active:scale-[0.98]"
            >
              {isLast ? "C'est parti" : "Suivant"}
              {!isLast && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
