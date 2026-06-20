import Link from "next/link";
import { ArrowRight, TreePine } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GateMark } from "@/components/brand/logo";
import { Reveal } from "@/components/layout/reveal";
import { LivingTree } from "@/components/brand/living-tree";
import { SpotlightBanner } from "@/components/home/spotlight-banner";

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

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();

  return (
    <div className="bg-paper">

      {/* ── HERO « Archive vivante » ─────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden px-4 sm:px-6">

        {/* Arbre qui se trace en fond (filigrane encre) */}
        <LivingTree className="pointer-events-none absolute right-[-8%] top-1/2 hidden h-[120%] w-[60%] -translate-y-1/2 text-ink/[0.13] md:block" />

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
            <span className="section-no whitespace-nowrap">№ 001 · Registre familial</span>
            <span className="h-px flex-1 bg-ink-line/60" />
            <span className="meta-label hidden sm:block">Pondichéry → France</span>
          </div>

          {/* Titre géant qui déborde */}
          <h1 className="font-serif font-semibold leading-[0.82] tracking-tightest text-ink">
            <span className="block overflow-hidden">
              <span
                className="block text-[clamp(2.75rem,15vw,12rem)]"
                style={{ animation: "slide-up 1s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                La porte
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="block pl-[8vw] text-[clamp(2.75rem,15vw,12rem)] text-ink-faint"
                style={{ animation: "slide-up 1s 0.32s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                vers vos
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="relative block text-[clamp(2.75rem,15vw,12rem)] italic text-seal"
                style={{ animation: "slide-up 1s 0.44s cubic-bezier(0.16,1,0.3,1) both" }}
              >
                origines.
                {/* tampon d'archive */}
                <span
                  aria-hidden
                  className="absolute -right-2 top-2 hidden rotate-[-8deg] rounded-sm border-2 border-seal/40 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-seal/60 md:inline-block"
                  style={{ animation: "seal-in 0.6s 1.1s both" }}
                >
                  Vérifié
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
              Un registre familial vivant. Reliez les générations, conservez la
              mémoire des vôtres et remontez le fil.
              <span className="italic text-ink"> Un nom, une date, un lien à la fois.</span>
            </p>

            <div
              className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-end"
              style={{ animation: "fade-in 0.7s 0.85s both" }}
            >
              {session ? (
                <Link
                  href="/arbre"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98]"
                >
                  <TreePine className="h-4 w-4" strokeWidth={1.75} />
                  Ouvrir l&apos;arbre
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98]"
                  >
                    Commencer, c&apos;est gratuit
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-ink-line px-7 py-3.5 text-sm text-ink-soft transition-all hover:border-ink hover:text-ink"
                  >
                    Se connecter
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
              « Dis-moi qui tu es, je te dirai d&apos;où tu viens. »
            </p>

            {(stats.persons > 0 || stats.relations > 0) && (
              <div className="flex items-center gap-8" style={{ animation: "fade-in 0.7s 1.1s both" }}>
                {stats.persons > 0 && (
                  <div>
                    <p className="font-serif text-4xl font-semibold tabular">
                      {stats.persons.toLocaleString("fr-FR")}
                    </p>
                    <p className="meta-label mt-1">profils</p>
                  </div>
                )}
                {stats.persons > 0 && stats.relations > 0 && <div className="h-12 w-px bg-ink-line" />}
                {stats.relations > 0 && (
                  <div>
                    <p className="font-serif text-4xl font-semibold tabular">
                      {stats.relations.toLocaleString("fr-FR")}
                    </p>
                    <p className="meta-label mt-1">liens</p>
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
          <span className="meta-label">défiler</span>
          <span className="h-10 w-px bg-gradient-to-b from-ink-line to-transparent" />
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────── */}
      <section className="border-t border-ink-line bg-paper-warm py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <Reveal className="mb-14 flex items-end justify-between">
            <div>
              <span className="section-no">№ 02</span>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
                Trois gestes, un arbre.
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] border border-ink-line bg-ink-line md:grid-cols-3">
            {[
              {
                no: "01",
                title: "Cherchez les vôtres",
                body: "Retrouvez un parent, un aïeul, une branche. Chaque profil est une fiche d'archive.",
              },
              {
                no: "02",
                title: "Tissez les liens",
                body: "Parent, enfant, conjoint : reliez les générations et voyez l'arbre se dessiner.",
              },
              {
                no: "03",
                title: "Transmettez",
                body: "Exportez un arbre soigné en PDF et partagez la mémoire familiale.",
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
            <span className="section-no">№ 03 · Contribuer</span>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Votre famille mérite d&apos;être dans l&apos;arbre.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              Vous ne vous retrouvez pas, ou vous souhaitez enrichir une branche ?
              Écrivez-nous, chaque lien compte.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink-line px-6 py-3 text-sm text-ink transition-all hover:border-ink hover:bg-paper-warm"
            >
              Nous contacter
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
            <span className="section-no">№ 04 · Tarifs</span>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
              Commencez gratuitement.
            </h2>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* FREE */}
            <Reveal className="card-paper p-7">
              <span className="meta-label">Gratuit</span>
              <p className="mt-4 font-serif text-4xl font-semibold tabular">0 €</p>
              <p className="mt-1 text-xs text-ink-faint">pour toujours</p>
              <ul className="my-6 space-y-2.5">
                {["5 recherches / mois", "10 profils", "1 export / mois"].map((f) => (
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
                Commencer
              </Link>
            </Reveal>

            {/* PREMIUM */}
            <Reveal delay={90} className="relative overflow-hidden rounded-[var(--radius)] bg-ink p-7 text-paper">
              <span className="seal-badge absolute right-4 top-4 bg-seal text-paper">
                ✦ Premium
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
                Premium
              </span>
              <p className="mt-4 font-serif text-4xl font-semibold tabular">3,99 €</p>
              <p className="mt-1 text-xs text-paper/40">tous les 3 mois</p>
              <ul className="my-6 space-y-2.5">
                {["Illimité", "Arbre complet", "Exports PDF"].map((f) => (
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
                Voir les détails
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  );
}
