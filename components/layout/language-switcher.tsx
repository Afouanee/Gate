"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    if (segments[1] === "fr" || segments[1] === "en") {
      segments[1] = newLocale;
      router.push(segments.join("/") || "/");
    } else {
      router.push(`/${newLocale}${pathname}`);
    }
  };

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-ink-line p-0.5">
      {["fr", "en"].map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          aria-label={l === "fr" ? "Français" : "English"}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-150 ${
            locale === l
              ? "bg-ink text-paper"
              : "text-ink-faint hover:text-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
