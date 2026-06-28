import Link from "next/link";
import { ArrowRight, TreePine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GateMark } from "@/components/brand/logo";
import { Reveal } from "@/components/layout/reveal";
import { LivingTree } from "@/components/brand/living-tree";
import { SpotlightBanner } from "@/components/home/spotlight-banner";
import { CountUp } from "@/components/ui/count-up";

async function getStats() {
  try {
    const [persons, relations] = await Promise.all([
      prisma.person.count(),
      prisma.relation.count(),
    ]);
    return { persons, relations };
  } catch {
    return { persons: 0, relations: 0 };
  }
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  const stats = await getStats();
  const t = await getTranslations("home");
  const numberLocale = locale === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="bg-paper">

      {/* ── HERO « Archive vivante » ─────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden px-4 sm:px-6">

        {/* Arbre qui se trace en fond (filigrane encre) */}
        <LivingTree aria-hidden className="pointer-events-none absolute right-[-8%] top-1/2 hidden h-[120%] w-[60%] -translate-y-1/2 text-ink/[0.13] md:block" />

        {/* Énorme numéro de cote en filigrane (décoratif, masqué sur mobile) */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-4 top-1/2 hidden -translate-y-1/2 select-none font-serif text-[40vh] font-semibold leading-none text-ink/[0.035] md:block md:text-[58vh]"
          style={{ animation: "fade-in 1.2s 0.1s both" }}
        >
          1
        </span>

        {/* Filets de marge */}
        <div className="pointer-events-none absolute inset-y-0 left-8 hidden w-px bg-ink-line/40 lg:block" />

        <div className="container relative z-10 mx-auto max-w-6xl">
          {/* Bandeau de registre */}
          <div
            className="mb-6 flex items-center gap-4"
            style={{ animation: "fade-in 0.6s 0.05s both" }}
          >
            <span className="section-no whitespace-nowrap">{t("hero.registerLabel")}</span>
            <span className="h-px flex-1 bg-ink-line/60" />
            <span className="meta-label hidden sm:block">{t("hero.route")}</span>
          </div>

          {/* Titre géant qui déborde */}
          <h1 className="font-serif font-semibold leading-[0.82] tracking-tightest text-ink">
            <span className="block overflow-hidden">
              <span
                className="block text-[clamp(2.75rem,15vw,12rem)]"
                style={{ animation: "slide-up 1s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                {t("hero.titleLine1")}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="block pl-[8vw] text-[clamp(2.75rem,15vw,12rem)] text-ink-faint"
                style={{ animation: "slide-up 1s 0.32s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                {t("hero.titleLine2")}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="text-gradient-indo relative block text-[clamp(2.75rem,15vw,12rem)] italic"
                style={{ animation: "slide-up 1s 0.44s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                {t("hero.titleLine3")}
                {/* tampon d'archive */}
                <span
                  aria-hidden
                  className="absolute -right-2 top-2 hidden rotate-[-8deg] rounded-sm border-2 border-seal/40 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-seal/60 md:inline-block"
                  style={{ animation: "seal-in 0.6s 1.1s both" }}
                >
                  {t("hero.verified")}
                </span>
              </span>
            </span>
          </h1>

          {/* Sous-texte + CTA */}
          <div className="mt-10 grid max-w-4xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <p
              className="max-w-md text-base leading-relaxed text-ink-soft"
              style={{ animation: "fade-in 0.7s 0.7s both" }}
            >
              {t("hero.lead")}
              <span className="italic text-ink"> {t("hero.leadEmphasis")}</span>
            </p>

            <div
              className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end"
              style={{ animation: "fade-in 0.7s 0.85s both" }}
            >
              {session ? (
                <Link
                  href="/arbre"
                  className="btn-indo group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all active:scale-[0.98]"
                >
                  <TreePine className="h-4 w-4" strokeWidth={1.75} />
                  {t("hero.openTree")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-indo group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all active:scale-[0.98]"
                  >
                    {t("hero.startFree")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-ink-line px-7 py-3.5 text-sm text-ink-soft transition-all hover:border-ink hover:text-ink"
                  >
                    {t("hero.login")}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Devise + stats */}
          <div className="mt-14 flex flex-wrap items-end justify-between gap-6 border-t border-ink-line/60 pt-6">
            <p
              className="font-serif text-lg italic text-ink-faint"
              style={{ animation: "fade-in 0.7s 1s both" }}
            >
              {t("hero.quote")}
            </p>

            {(stats.persons > 0 || stats.relations > 0) && (
              <div className="flex items-center gap-8" style={{ animation: "fade-in 0.7s 1.1s both" }}>
                {stats.persons > 0 && (
                  <div>
                    <p className="font-serif text-4xl font-semibold tabular">
                      <CountUp value={stats.persons} locale={numberLocale} />
                    </p>
                    <p className="meta-label mt-1">{t("hero.statProfiles")}</p>
                  </div>
                )}
                {stats.persons > 0 && stats.relations > 0 && <div className="h-12 w-px bg-ink-line" />}
                {stats.relations > 0 && (
                  <div>
                    <p className="font-serif text-4xl font-semibold tabular">
                      <CountUp value={stats.relations} locale={numberLocale} />
                    </p>
                    <p className="meta-label mt-1">{t("hero.statLinks")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Indicateur de scroll */}
        <div
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          style={{ animation: "fade-in 1s 1.4s both" }}
        >
          <span className="meta-label">{t("hero.scroll")}</span>
          <span className="h-10 w-px bg-gradient-to-b from-ink-line to-transparent" />
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────── */}
      <section className="border-t border-ink-line bg-paper-warm py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="mb-14 flex items-end justify-between">
            <div>
              <span className="section-no">{t("howItWorks.sectionNo")}</span>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
                {t("howItWorks.title")}
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-ink-line bg-ink-line md:grid-cols-3">
            {[
              {
                no: "01",
                title: t("howItWorks.step1Title"),
                body: t("howItWorks.step1Body"),
              },
              {
                no: "02",
                title: t("howItWorks.step2Title"),
                body: t("howItWorks.step2Body"),
              },
              {
                no: "03",
                title: t("howItWorks.step3Title"),
                body: t("howItWorks.step3Body"),
              },
            ].map((step, i) => (
              <Reveal
                key={step.no}
                delay={i * 90}
                className="group flex flex-col bg-paper p-8 transition-colors hover:bg-card"
              >
                <span className="font-mono text-sm text-seal">№ {step.no}</span>
                <h3 className="mt-4 font-serif text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTRIBUER ───────────────────────────────────── */}
      <section className="border-t border-ink-line py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <Reveal>
            <GateMark size={40} className="mx-auto mb-6 text-ink" />
            <span className="section-no">{t("contribute.sectionNo")}</span>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              {t("contribute.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              {t("contribute.body")}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink-line px-6 py-3 text-sm text-ink transition-all hover:border-ink hover:bg-paper-warm"
            >
              {t("contribute.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── À L'HONNEUR (projets des proches, curé admin) ── */}
      <SpotlightBanner />

      {/* ── TARIFS (teaser) ──────────────────────────────── */}
      <section className="border-t border-ink-line bg-paper-warm py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <Reveal className="mb-10 text-center">
            <span className="section-no">{t("pricingTeaser.sectionNo")}</span>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
              {t("pricingTeaser.title")}
            </h2>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* FREE */}
            <Reveal className="card-paper p-7">
              <span className="meta-label">{t("pricingTeaser.freeLabel")}</span>
              <p className="mt-4 font-serif text-4xl font-semibold tabular">{t("pricingTeaser.freePrice")}</p>
              <p className="mt-1 text-xs text-ink-faint">{t("pricingTeaser.freePeriod")}</p>
              <ul className="my-6 space-y-2.5">
                {[t("pricingTeaser.freeFeature1"), t("pricingTeaser.freeFeature2"), t("pricingTeaser.freeFeature3")].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-ink-soft">
                    <span className="h-1 w-1 rounded-full bg-ink-faint" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block rounded-full border border-ink px-5 py-2.5 text-center text-sm font-medium text-ink transition-all hover:bg-ink hover:text-paper"
              >
                {t("pricingTeaser.freeCta")}
              </Link>
            </Reveal>

            {/* PREMIUM */}
            <Reveal delay={90} className="relative overflow-hidden rounded-[var(--radius)] bg-ink p-7 text-paper">
              <span className="seal-badge absolute right-4 top-4 bg-seal text-paper">
                {t("pricingTeaser.premiumBadge")}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
                {t("pricingTeaser.premiumLabel")}
              </span>
              <p className="mt-4 font-serif text-4xl font-semibold tabular">{t("pricingTeaser.premiumPrice")}</p>
              <p className="mt-1 text-xs text-paper/40">{t("pricingTeaser.premiumPeriod")}</p>
              <ul className="my-6 space-y-2.5">
                {[t("pricingTeaser.premiumFeature1"), t("pricingTeaser.premiumFeature2"), t("pricingTeaser.premiumFeature3")].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-paper/70">
                    <span className="h-1 w-1 rounded-full bg-seal-bright" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block rounded-full bg-paper px-5 py-2.5 text-center text-sm font-medium text-ink transition-all hover:bg-paper-warm"
              >
                {t("pricingTeaser.premiumCta")}
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  );
}
