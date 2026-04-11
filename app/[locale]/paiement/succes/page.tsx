import { useTranslations } from "next-intl";
import Link from "next/link";
import { Check, TreePine, ArrowRight } from "lucide-react";

export default function PaiementSuccesPage() {
  const t = useTranslations("payment.success");

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm" style={{ animation: "fade-in-scale 0.4s ease-out both" }}>

        {/* Icône succès */}
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-8">
          <Check className="h-10 w-10 text-white" strokeWidth={2.5} />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Paiement confirmé</p>
        <h1 className="text-3xl font-black font-heading tracking-tight mb-3">{t("title")}</h1>
        <p className="text-sm text-zinc-400 mb-10 leading-relaxed">{t("message")}</p>

        {/* Features unlocked */}
        <div className="border border-zinc-100 rounded-2xl p-6 mb-8 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-4">Débloqué</p>
          <ul className="space-y-3">
            {["Recherches illimitées", "Profils illimités", "Exports PDF illimités", "Arbre complet"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-700">
                <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-zinc-700" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/arbre"
          className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 text-white text-sm font-semibold rounded-full hover:bg-zinc-700 transition-all duration-200"
        >
          <TreePine className="h-4 w-4" />
          {t("cta")}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
