import { useTranslations } from "next-intl";
import Link from "next/link";
import { Check, TreePine, ArrowRight } from "lucide-react";

export default function PaiementSuccesPage() {
  const t = useTranslations("payment.success");

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-sm" style={{ animation: "fade-in-scale 0.4s ease-out both" }}>

        {/* Icône succès */}
        <div className="w-20 h-20 rounded-full bg-seal flex items-center justify-center mx-auto mb-8 shadow-paper-md">
          <Check className="h-10 w-10 text-paper" strokeWidth={2.5} />
        </div>

        <span className="section-no mb-3 block">{t("sectionNo")}</span>
        <h1 className="font-serif text-3xl font-semibold tracking-tight mb-3">{t("title")}</h1>
        <p className="text-sm text-ink-soft mb-10 leading-relaxed">{t("message")}</p>

        {/* Features unlocked */}
        <div className="bg-card border border-ink-line rounded-[var(--radius)] p-6 mb-8 text-left shadow-paper">
          <p className="meta-label mb-4">{t("unlockedLabel")}</p>
          <ul className="space-y-3">
            {[t("unlocked1"), t("unlocked2"), t("unlocked3"), t("unlocked4")].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-ink-soft">
                <div className="w-5 h-5 rounded-full bg-seal-tint flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-seal" strokeWidth={1.75} />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/arbre"
          className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink text-paper text-sm font-semibold rounded-full hover:bg-ink-soft active:scale-[0.98] transition-all duration-200"
        >
          <TreePine className="h-4 w-4" strokeWidth={1.75} />
          {t("cta")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
        </Link>
      </div>
    </div>
  );
}
