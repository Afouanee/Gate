import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

export default function PaiementAnnulationPage() {
  const t = useTranslations("payment.cancel");

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper flex items-center justify-center px-6">
      <div className="text-center max-w-sm" style={{ animation: "fade-in-scale 0.4s ease-out both" }}>

        <div className="w-16 h-16 rounded-full bg-paper-deep border border-ink-line flex items-center justify-center mx-auto mb-8">
          <X className="h-7 w-7 text-ink-soft" strokeWidth={1.75} />
        </div>

        <h1 className="font-serif text-2xl font-semibold tracking-tight mb-3">{t("title")}</h1>
        <p className="text-sm text-ink-soft mb-2">{t("subtitle")}</p>
        <p className="text-sm text-ink-soft mb-10">{t("message")}</p>

        <p className="text-xs text-ink-faint mb-8">{t("noCharge")}</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink text-paper text-sm font-semibold rounded-full hover:bg-ink-soft active:scale-[0.98] transition-all duration-200"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
          </Link>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-ink-soft border border-ink-line rounded-full hover:border-ink hover:text-ink transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
