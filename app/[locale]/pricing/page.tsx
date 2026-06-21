"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tilt3D } from "@/components/ui/tilt-3d";

export default function PricingPage() {
  const t = useTranslations("pricing.page");
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const freeFeatures = t.raw("freeFeatures") as string[];
  const premiumFeatures = t.raw("premiumFeatures") as string[];
  const faq = t.raw("faq") as { q: string; a: string }[];

  const isPremium = session?.user?.role === "PREMIUM";
  const isAdmin = session?.user?.role === "ADMIN";

  const handleCheckout = async () => {
    if (!session) {
      window.location.href = "/login?callbackUrl=/pricing";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else
        toast({
          title: t("errorTitle"),
          description: t("errorCheckout"),
          variant: "destructive",
        });
    } catch {
      toast({
        title: t("errorTitle"),
        description: t("errorGeneric"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper px-4 py-20 sm:px-6">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <header className="mb-12 text-center" style={{ animation: "fade-in 0.6s both" }}>
          <span className="section-no">{t("sectionNo")}</span>
          <h1 className="mt-3 font-serif text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-tight tracking-tight">
            {t("headingBefore")}<span className="text-gradient-indo italic">{t("headingHighlight")}</span>{t("headingAfter")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink-soft">
            {t("intro")}
          </p>
        </header>

        {/* Bandeau rassurant */}
        <div className="mx-auto mb-12 max-w-2xl rounded-[var(--radius)] border border-saffron/30 bg-saffron-tint/50 px-5 py-4 text-center">
          <p className="text-sm text-ink-soft">
            <span className="font-medium text-ink">{t("reassureStrong")}</span>{" "}
            {t("reassureRest")}
          </p>
        </div>

        {/* Bandeau plan actif */}
        {(isPremium || isAdmin) && (
          <div className="mx-auto mb-10 flex max-w-md items-center gap-3 rounded-[var(--radius)] border border-seal/30 bg-seal-tint px-5 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seal">
              <Check className="h-4 w-4 text-paper" strokeWidth={2.5} />
            </span>
            <p className="text-sm font-medium text-ink">
              {isAdmin ? t("activeAdmin") : t("activeSupporter")}
            </p>
          </div>
        )}

        {/* Plans */}
        <div className="mx-auto mb-20 grid max-w-2xl gap-4 md:grid-cols-2">

          {/* FREE */}
          <div
            className="card-paper flex flex-col p-8"
            style={{ animation: "fade-in 0.6s 0.1s both" }}
          >
            <span className="meta-label">{t("freeLabel")}</span>
            <div className="mt-5 mb-7">
              <span className="font-serif text-5xl font-semibold tabular">{t("freePrice")}</span>
              <span className="ml-2 text-sm text-ink-faint">{t("freePeriod")}</span>
            </div>
            <ul className="mb-8 flex-1 space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-ink-soft">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink-line">
                    <Check className="h-3 w-3 text-ink-faint" strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            {session ? (
              <div className="flex h-11 items-center justify-center rounded-full border border-ink-line text-sm text-ink-faint">
                {t("currentPlan")}
              </div>
            ) : (
              <Link
                href="/register"
                className="btn-indo group flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium transition-all hover:text-paper active:scale-[0.98]"
              >
                {t("joinFamily")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          {/* SOUTIEN (optionnel) */}
          <Tilt3D max={5}>
          <div
            className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius)] bg-ink p-8 text-paper shadow-paper-lg"
            style={{ animation: "fade-in 0.6s 0.2s both" }}
          >
            {/* Sceau cacheté */}
            <span className="seal-badge absolute right-5 top-5 bg-saffron text-ink">
              {t("supportOptional")}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
              {t("supportLabel")}
            </span>
            <div className="mt-5 mb-7">
              <span className="font-serif text-5xl font-semibold tabular">{t("supportPrice")}</span>
              <span className="ml-2 text-sm text-paper/40">{t("supportPeriod")}</span>
            </div>
            <ul className="mb-8 flex-1 space-y-3">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-paper/80">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-seal">
                    <Check className="h-3 w-3 text-paper" strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {isPremium || isAdmin ? (
              <div className="flex h-11 items-center justify-center rounded-full border border-paper/20 text-sm text-paper/50">
                {isPremium ? t("supportActive") : t("supportAdmin")}
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="group flex h-11 items-center justify-center gap-2 rounded-full bg-saffron text-sm font-medium text-ink transition-all hover:bg-saffron-bright active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {t("supportCta")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            )}

            <p className="mt-4 text-center text-[11px] text-paper/40">
              {t("supportNote")}
            </p>
          </div>
          </Tilt3D>
        </div>

        {/* FAQ accordéon natif accessible */}
        <div className="mx-auto max-w-xl" style={{ animation: "fade-in 0.6s 0.3s both" }}>
          <div className="mb-8 flex items-center gap-4">
            <span className="section-no whitespace-nowrap">{t("faqLabel")}</span>
            <div className="rule-line" />
          </div>
          <div className="divide-y divide-ink-line border-y border-ink-line">
            {faq.map((item, i) => (
              <details key={i} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium text-ink marker:hidden">
                  <span className="font-serif text-base">{item.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="pb-4 pr-8 text-sm leading-relaxed text-ink-soft">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
