"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Sélecteur de langue FR/EN.
 * Transition fluide : la pastille active glisse (translate animé) et le contenu
 * de la page se fond légèrement pendant la navigation (useTransition + classe
 * appliquée sur <body> via data-attribute écouté en CSS).
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) return;

    // Indique au reste de la page qu'une transition de langue est en cours
    // (le CSS global applique un léger fondu, voir globals.css).
    document.documentElement.setAttribute("data-lang-switching", "true");

    const segments = pathname.split("/");
    const target =
      segments[1] === "fr" || segments[1] === "en"
        ? ((segments[1] = newLocale), segments.join("/") || "/")
        : `/${newLocale}${pathname}`;

    startTransition(() => {
      router.replace(target);
      // Laisse le temps au fondu de jouer avant de retirer l'état.
      window.setTimeout(() => {
        document.documentElement.removeAttribute("data-lang-switching");
      }, 450);
    });
  };

  const options = ["fr", "en"] as const;

  return (
    <div
      className={cn(
        "relative flex items-center rounded-full border border-ink-line p-0.5 transition-opacity",
        isPending && "opacity-70"
      )}
      role="group"
      aria-label="Langue"
    >
      {/* Pastille qui glisse sous l'option active */}
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-ink transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: locale === "en" ? "translateX(100%)" : "translateX(0)" }}
      />
      {options.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          aria-label={l === "fr" ? "Français" : "English"}
          aria-pressed={locale === l}
          className={cn(
            "relative z-10 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-300",
            locale === l ? "text-paper" : "text-ink-faint hover:text-ink"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
