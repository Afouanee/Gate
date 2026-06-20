import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";
import { Kolam, Compass } from "@/components/pondichery/illustrations";
import { ArchivePhoto } from "@/components/pondichery/archive-photo";

export const metadata = {
  title: "Karaikal · Gate",
  description:
    "Karaikal, ancien comptoir français de la côte de Coromandel, son port marchand et sa communauté musulmane, sur la route qui a mené des familles de l'Inde vers la France.",
};

const TIMELINE = [
  { year: "1739", text: "Karaikal passe sous contrôle français et devient l'un des cinq comptoirs de l'Inde française." },
  { year: "XIXᵉ", text: "Le port marchand relie Karaikal au commerce de la côte de Coromandel et au reste de l'océan Indien." },
  { year: "1954", text: "Comme Pondichéry, Karaikal est transférée de facto à l'Inde." },
  { year: "1962", text: "Rattachement officiel ; les liens avec la France perdurent à travers les familles." },
];

export default function KaraikalPage() {
  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-ink-line px-4 py-16 sm:px-6 md:py-24">
        <Kolam className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 text-ink/[0.06] sm:h-64 sm:w-64 md:h-96 md:w-96" />
        <div className="container relative z-10 mx-auto max-w-3xl">
          <span className="section-no">№ · Mémoire</span>
          <h1 className="mt-3 font-serif text-[clamp(2.4rem,7vw,4.5rem)] font-semibold leading-[0.92] tracking-tight">
            Karaikal,
            <br />
            <span className="italic text-seal">l&apos;autre rivage.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            À une centaine de kilomètres au sud de Pondichéry, Karaikal fut elle
            aussi un comptoir français de la côte de Coromandel. Un port, des
            marchands, et des familles dont le fil rejoint le nôtre.
          </p>
        </div>
      </section>

      {/* ── Photo pleine largeur ─────────────────────────── */}
      <div className="container mx-auto max-w-4xl px-4 pt-12 sm:px-6">
        <Reveal>
          <ArchivePhoto
            src="/karaikal/port.jpg"
            alt="Le port de Karaikal"
            caption="Le port de Karaikal, ouvert sur la côte de Coromandel."
            credit="Wikimedia · CC BY-SA"
          />
        </Reveal>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">

        {/* ── 01 · Le comptoir ─────────────────────────────── */}
        <Reveal as="section">
          <div className="flex items-baseline gap-4">
            <span className="section-no shrink-0">№ 01</span>
            <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              Un comptoir de l&apos;Inde française
            </h2>
          </div>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            <p>
              Karaikal devient française au XVIIIᵉ siècle et compte parmi les cinq
              établissements de l&apos;Inde française, aux côtés de Pondichéry, Mahé,
              Yanaon et Chandernagor. Son port en fait un point de commerce actif sur
              la côte de Coromandel.
            </p>
            <p>
              On y retrouve, comme à Pondichéry, l&apos;empreinte française : tracé
              des rues, bâtiments administratifs, maisons à l&apos;architecture
              coloniale encore debout aujourd&apos;hui.
            </p>
          </div>
          <ArchivePhoto
            className="mt-6"
            src="/karaikal/french-house.jpg"
            alt="Maison de style français à Karaikal"
            caption="Une maison de style français à Karaikal."
            credit="Wikimedia · CC BY"
          />
        </Reveal>

        <div className="rule-line my-12" />

        {/* ── 02 · La communauté musulmane ─────────────────── */}
        <Reveal as="section">
          <div className="flex items-baseline gap-4">
            <span className="section-no shrink-0">№ 02</span>
            <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              Marchands et mémoire musulmane
            </h2>
          </div>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            <p>
              Karaikal partage avec Pondichéry une longue présence musulmane, liée au
              négoce maritime. Les familles de marchands tamouls musulmans y ont tenu
              boutiques et entrepôts, et la grande mosquée témoigne de
              l&apos;ancienneté de cette communauté.
            </p>
            <p>
              Beaucoup de familles ont des branches des deux côtés : un grand-père né
              à Karaikal, un cousin resté à Pondichéry, une tante partie à Chennai.
              C&apos;est ce maillage que l&apos;arbre permet de rassembler.
            </p>
          </div>
          <ArchivePhoto
            className="mt-6"
            src="/karaikal/grand-masjid.jpg"
            alt="La grande mosquée de Karaikal"
            caption="La grande mosquée de Karaikal."
            credit="Wikimedia · CC BY-SA"
          />
        </Reveal>

        <div className="rule-line my-12" />

        {/* ── Frise ────────────────────────────────────────── */}
        <Reveal as="section">
          <div className="mb-6 flex items-center gap-4">
            <span className="section-no whitespace-nowrap">№ 03 · Repères</span>
            <div className="rule-line" />
            <Compass className="hidden h-12 w-12 shrink-0 text-ink md:block" />
          </div>
          <ol className="relative ml-2 space-y-5 border-l border-ink-line pl-6">
            {TIMELINE.map((t) => (
              <li key={t.year} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-seal" />
                <span className="font-mono text-sm font-semibold text-seal tabular">{t.year}</span>
                <p className="mt-0.5 text-[15px] leading-relaxed text-ink-soft">{t.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Lien vers Pondichéry */}
        <Reveal as="div" className="mt-14 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-ink-line bg-paper-warm p-5">
          <div>
            <p className="meta-label mb-1">À lire aussi</p>
            <p className="font-serif text-lg font-semibold">L&apos;histoire de Pondichéry</p>
          </div>
          <Link
            href="/pondichery"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm text-ink transition-colors hover:border-ink hover:bg-card"
          >
            Découvrir
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </Reveal>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/arbre"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98]"
          >
            Explorer l&apos;arbre
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-ink-line px-6 py-3 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Contribuer à la mémoire
          </Link>
        </div>

      </div>
    </div>
  );
}
