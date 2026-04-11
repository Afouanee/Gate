import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ForbiddenPage() {
  const t = useTranslations("errors.403");

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm" style={{ animation: "fade-in-scale 0.4s ease-out both" }}>
        <p className="text-[9rem] font-black font-heading leading-none text-zinc-100 select-none mb-0">
          403
        </p>
        <h1 className="text-2xl font-black font-heading tracking-tight mb-3 -mt-4">{t("title")}</h1>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">{t("subtitle")}</p>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-full hover:bg-zinc-700 transition-all duration-200"
        >
          {t("cta")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
