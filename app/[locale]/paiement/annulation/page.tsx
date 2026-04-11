import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PaiementAnnulationPage() {
  const t = useTranslations("payment.cancel");

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-sm" style={{ animation: "fade-in-scale 0.4s ease-out both" }}>

        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-8">
          <span className="text-2xl">✕</span>
        </div>

        <h1 className="text-2xl font-black font-heading tracking-tight mb-3">{t("title")}</h1>
        <p className="text-sm text-zinc-400 mb-2">{t("subtitle")}</p>
        <p className="text-sm text-zinc-400 mb-10">{t("message")}</p>

        <p className="text-xs text-zinc-300 mb-8">Aucun montant n'a été débité.</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 text-white text-sm font-semibold rounded-full hover:bg-zinc-700 transition-all duration-200"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-zinc-500 border border-zinc-200 rounded-full hover:border-zinc-900 hover:text-zinc-900 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
