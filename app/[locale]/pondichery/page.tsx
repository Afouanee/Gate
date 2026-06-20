import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";
import { Kolam, CoromandelMap, WhiteTown, Compass } from "@/components/pondichery/illustrations";
import { ArchivePhoto } from "@/components/pondichery/archive-photo";

export const metadata = {
  title: "Pondichéry · Gate",
  description:
    "Pondichéry, comptoir français de l'Inde, et l'histoire de sa communauté musulmane : marchands de la côte de Coromandel, langues croisées et mémoire d'une famille partie vers la France.",
};

const TIMELINE = [
  { year: "1674", text: "La Compagnie française des Indes orientales établit son comptoir à Pondichéry." },
  { year: "XVIIIᵉ", text: "La ville devient le cœur de l'Inde française ; le négoce maritime prospère sur la côte de Coromandel." },
  { year: "1816", text: "Après les guerres napoléoniennes, Pondichéry redevient durablement française." },
  { year: "1954", text: "Transfert de facto à l'Inde ; une partie des habitants conserve la nationalité française." },
  { year: "1962", text: "Rattachement officiel à l'Inde. Les départs vers la France métropolitaine s'accélèrent." },
];

export default function PondicheryPage() {
  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper">

      {/* ── HERO illustré ────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-ink-line px-4 py-16 sm:px-6 md:py-24">
        <Kolam className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 text-ink/[0.06] sm:h-64 sm:w-64 md:h-96 md:w-96" />
        <div className="container relative z-10 mx-auto max-w-3xl">
          <span className="section-no">№ · Mémoire</span>
          <h1 className="mt-3 font-serif text-[clamp(2.4rem,7vw,4.5rem)] font-semibold leading-[0.92] tracking-tight">
            Pondichéry,
            <br />
            <span className="italic text-seal">d&apos;où nous venons.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            Sur la côte de Coromandel, au sud-est de l&apos;Inde, une ville où le
            français, le tamoul et l&apos;arabe se sont croisés pendant trois siècles.
            Voici quelques repères, et le chemin qui a mené une famille jusqu&apos;en France.
          </p>
        </div>
      </section>

      {/* ── Photo d'archive pleine largeur ───────────────── */}
      <div className="container mx-auto max-w-4xl px-4 pt-12 sm:px-6">
        <Reveal>
          <ArchivePhoto
            src="/pondichery/waterfront-1880s.jpg"
            alt="Le front de mer de Pondichéry dans les années 1880"
            caption="Le front de mer de Pondichéry, années 1880."
          />
        </Reveal>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">

        {/* ── 01 · Le comptoir ─────────────────────────────── */}
        <Reveal as="section" className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <div className="flex items-baseline gap-4">
              <span className="section-no shrink-0">№ 01</span>
              <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                Un comptoir français en terre tamoule
              </h2>
            </div>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
              <p>
                Pondichéry (Puducherry) fut fondée comme comptoir par la Compagnie
                française des Indes orientales à la fin du XVIIᵉ siècle. Pendant
                près de trois siècles, elle reste le cœur de l&apos;Inde française.
              </p>
              <p>
                On y reconnaît encore la « ville blanche » au tracé en damier, ses
                rues aux noms français, ses maisons à vérandas et son front de mer.
                La langue française y a laissé une empreinte profonde, transmise de
                génération en génération.
              </p>
            </div>
          </div>
          <WhiteTown className="hidden h-auto w-56 text-ink md:block" />
        </Reveal>

        <div className="rule-line my-12" />

        {/* ── 02 · Les musulmans de Pondichéry ─────────────── */}
        <Reveal as="section" className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
          <Kolam className="hidden h-40 w-40 text-seal md:block" />
          <div>
            <div className="flex items-baseline gap-4">
              <span className="section-no shrink-0">№ 02</span>
              <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
                Les musulmans de Pondichéry
              </h2>
            </div>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
              <p>
                La communauté musulmane de Pondichéry est ancienne et tisse ses
                racines dans le commerce maritime de la côte de Coromandel. Beaucoup
                descendent des marchands tamouls musulmans, parfois appelés
                <span className="text-ink"> Maraikkayar</span> (Marakkayar), dont le
                nom même évoque la mer et le négoce.
              </p>
              <p>
                Familles de commerçants en textile, en cuir, en denrées, installées
                de longue date entre Pondichéry, Karaikal et les ports voisins. On y
                parle le tamoul au quotidien, on prie en arabe, et l&apos;on a vécu
                sous administration française : un métissage rare de langues et de
                cultures.
              </p>
              <p>
                Les mosquées de la vieille ville, les quartiers marchands et les
                fêtes de l&apos;Aïd rythment une mémoire collective transmise
                oralement, bien plus que par l&apos;écrit. C&apos;est cette mémoire
                fragile que l&apos;arbre cherche à fixer.
              </p>
            </div>
            <ArchivePhoto
              className="mt-6"
              src="/pondichery/market.jpg"
              alt="Scène de marché à Pondichéry"
              caption="Le marché de Pondichéry, cœur du négoce de la côte de Coromandel."
            />
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* ── Frise chronologique ──────────────────────────── */}
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

        <div className="rule-line my-12" />

        {/* ── 04 · Le départ vers la France (avec carte) ───── */}
        <Reveal as="section">
          <div className="flex items-baseline gap-4">
            <span className="section-no shrink-0">№ 04</span>
            <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              Le départ vers la France
            </h2>
          </div>
          <div className="mt-5 overflow-hidden rounded-[var(--radius)] border border-ink-line bg-paper-warm p-5">
            <CoromandelMap className="mx-auto h-auto w-full max-w-md text-ink-soft" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ArchivePhoto
              src="/pondichery/view-1857.jpg"
              alt="Vue de Pondichéry en 1857"
              caption="Pondichéry, 1857."
            />
            <ArchivePhoto
              src="/pondichery/waterfront-1900.jpg"
              alt="Le front de mer de Pondichéry vers 1900"
              caption="Le front de mer, vers 1900."
            />
          </div>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            <p>
              Au moment du rattachement de Pondichéry à l&apos;Inde, une partie des
              habitants conserve la nationalité française. Dans les décennies
              suivantes, beaucoup de familles, dont des familles musulmanes,
              s&apos;installent en France, souvent à Marseille, Paris ou dans le Sud.
            </p>
            <p>
              Ce départ marque une rupture douce mais réelle. On connaît ses parents,
              ses grands-parents, parfois ses arrière-grands-parents. Mais au-delà, le
              fil se perd : les noms s&apos;écrivent autrement, les dates deviennent
              floues, les branches restées à Pondichéry s&apos;éloignent.
            </p>
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* ── 05 · Pourquoi un registre ────────────────────── */}
        <Reveal as="section">
          <div className="flex items-baseline gap-4">
            <span className="section-no shrink-0">№ 05</span>
            <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              Pourquoi un registre
            </h2>
          </div>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            <p>
              Gate est né d&apos;un constat simple : à partir d&apos;un certain degré,
              on ne sait plus qui était qui. Reconstituer l&apos;arbre, c&apos;est
              rassembler ce que chacun garde en mémoire, recouper les souvenirs, et
              redonner un nom et une place à ceux d&apos;avant.
            </p>
            <p>
              Conserver cette mémoire, c&apos;est aussi la transmettre. Aux enfants
              nés en France qui n&apos;ont jamais vu Pondichéry, l&apos;arbre raconte
              d&apos;où ils viennent.
            </p>
          </div>
        </Reveal>

        {/* Lien vers Karaikal */}
        <Reveal as="div" className="mt-14 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-ink-line bg-paper-warm p-5">
          <div>
            <p className="meta-label mb-1">À lire aussi</p>
            <p className="font-serif text-lg font-semibold">Karaikal, l&apos;autre comptoir</p>
          </div>
          <Link
            href="/karaikal"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm text-ink transition-colors hover:border-ink hover:bg-card"
          >
            Découvrir
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </Reveal>

        {/* Note */}
        <Reveal as="div" className="mt-8 rounded-[var(--radius)] border border-ink-line bg-paper-warm p-6">
          <p className="meta-label mb-2">Note</p>
          <p className="text-sm leading-relaxed text-ink-soft">
            Cette page propose des repères généraux. Les histoires familiales, les
            graphies des noms et les dates exactes varient d&apos;une branche à
            l&apos;autre : c&apos;est précisément ce que l&apos;arbre sert à préciser
            et à conserver.
          </p>
        </Reveal>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center gap-3">
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
