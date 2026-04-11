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
    <div className="flex items-center gap-0.5 p-0.5 bg-zinc-100 rounded-full">
      {["fr", "en"].map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full transition-all duration-150 ${
            locale === l
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-400 hover:text-zinc-700"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
