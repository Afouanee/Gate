import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";
import { Kolam, Compass } from "@/components/pondichery/illustrations";
import { ArchivePhoto } from "@/components/pondichery/archive-photo";
import { ScrollTimeline } from "@/components/ui/scroll-timeline";

type Lang = "fr" | "en";
type Bi = { fr: string; en: string };

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const lang: Lang = params.locale === "en" ? "en" : "fr";
  const meta = {
    title: {
      fr: "Karaikal · Gate",
      en: "Karaikal · Gate",
    },
    description: {
      fr: "Karaikal, comptoir français de la côte de Coromandel : son port, sa communauté musulmane marchande, la route de l'Indochine, le rattachement à l'Inde et la diaspora en France.",
      en: "Karaikal, a French trading post on the Coromandel Coast: its port, its Muslim merchant community, the road to Indochina, the union with India and the diaspora in France.",
    },
  };
  return {
    title: meta.title[lang],
    description: meta.description[lang],
  };
}

const CHAPTERS: { id: string; num: string; title: Bi }[] = [
  { id: "ville", num: "01", title: { fr: "Une ville de la côte", en: "A town of the coast" } },
  { id: "comptoir", num: "02", title: { fr: "Le comptoir français", en: "The French trading post" } },
  { id: "musulmans", num: "03", title: { fr: "Marchands et mémoire musulmane", en: "Merchants and Muslim memory" } },
  { id: "indochine", num: "04", title: { fr: "La route de l'Indochine", en: "The road to Indochina" } },
  { id: "rattachement", num: "05", title: { fr: "Le rattachement et le départ", en: "The union and the departure" } },
  { id: "aujourdhui", num: "06", title: { fr: "Karaikal aujourd'hui", en: "Karaikal today" } },
];

const TIMELINE: { year: Bi; text: Bi }[] = [
  {
    year: { fr: "Origines", en: "Origins" },
    text: {
      fr: "Port et bourg marchand du delta de la Cauvery, tourné vers le commerce de l'océan Indien.",
      en: "A port and merchant town of the Cauvery delta, turned toward Indian Ocean trade.",
    },
  },
  {
    year: { fr: "1739", en: "1739" },
    text: {
      fr: "Karaikal passe sous contrôle français et rejoint les établissements de l'Inde française.",
      en: "Karaikal comes under French control and joins the settlements of French India.",
    },
  },
  {
    year: { fr: "XIXᵉ", en: "19th c." },
    text: {
      fr: "Le port relie Karaikal au commerce de la côte de Coromandel et au-delà.",
      en: "The port links Karaikal to the trade of the Coromandel Coast and beyond.",
    },
  },
  {
    year: { fr: "1880–1950", en: "1880–1950" },
    text: {
      fr: "Des Karaikalais partent travailler en Indochine française, notamment à Saïgon.",
      en: "People from Karaikal leave to work in French Indochina, notably in Saigon.",
    },
  },
  {
    year: { fr: "1954", en: "1954" },
    text: {
      fr: "Comme Pondichéry, Karaikal est transférée de facto à l'Inde.",
      en: "Like Pondicherry, Karaikal is transferred de facto to India.",
    },
  },
  {
    year: { fr: "1962", en: "1962" },
    text: {
      fr: "Rattachement officiel ; les liens avec la France perdurent à travers les familles.",
      en: "Official union; ties with France endure through the families.",
    },
  },
];

function ChapterHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="section-no shrink-0 tabular">№ {num}</span>
      <h2 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
    </div>
  );
}

function Aside({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <aside className="my-6 border-l-2 border-seal/40 bg-paper-warm/60 py-4 pl-5 pr-4">
      <p className="meta-label mb-1 text-seal">{label}</p>
      <p className="text-[15px] italic leading-relaxed text-ink-soft">{children}</p>
    </aside>
  );
}

export default function KaraikalPage({ params }: { params: { locale: string } }) {
  const lang: Lang = params.locale === "en" ? "en" : "fr";
  const t = (o: Bi) => o[lang];

  const ui = {
    heroEyebrow: { fr: "№ · Mémoire", en: "№ · Memory" },
    heroTitle: { fr: "Karaikal,", en: "Karaikal," },
    heroSubtitle: { fr: "l'autre rivage.", en: "the other shore." },
    heroLead: {
      fr: "À une centaine de kilomètres au sud de Pondichéry, Karaikal fut elle aussi un comptoir français de la côte de Coromandel. Un port, des marchands, une route vers l'Indochine, et des familles dont le fil rejoint le nôtre.",
      en: "Some hundred kilometres south of Pondicherry, Karaikal was also a French trading post on the Coromandel Coast. A port, merchants, a road to Indochina, and families whose thread joins our own.",
    },
    portAlt: { fr: "Le port de Karaikal", en: "The port of Karaikal" },
    portCaption: {
      fr: "Le port de Karaikal, ouvert sur la côte de Coromandel.",
      en: "The port of Karaikal, open onto the Coromandel Coast.",
    },
    toc: { fr: "Sommaire", en: "Contents" },
    timelineLabel: { fr: "№ · Chronologie", en: "№ · Timeline" },
    readAlso: { fr: "À lire aussi", en: "Read also" },
    pondicheryTeaser: { fr: "L'histoire de Pondichéry", en: "The story of Pondicherry" },
    discover: { fr: "Découvrir", en: "Discover" },
    exploreTree: { fr: "Explorer l'arbre", en: "Explore the tree" },
    contribute: { fr: "Contribuer à la mémoire", en: "Contribute to the memory" },
  } satisfies Record<string, Bi>;

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-ink-line px-4 py-16 sm:px-6 md:py-24">
        <Kolam className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 text-ink/[0.06] sm:h-64 sm:w-64 md:h-96 md:w-96" />
        <div className="container relative z-10 mx-auto max-w-3xl">
          <span className="section-no">{t(ui.heroEyebrow)}</span>
          <h1 className="mt-3 font-serif text-[clamp(2.4rem,7vw,4.5rem)] font-semibold leading-[0.92] tracking-tight">
            {t(ui.heroTitle)}
            <br />
            <span className="italic text-seal">{t(ui.heroSubtitle)}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            {t(ui.heroLead)}
          </p>
        </div>
      </section>

      {/* ── Photo + sommaire ─────────────────────────────── */}
      <div className="container mx-auto max-w-4xl px-4 pt-12 sm:px-6">
        <Reveal>
          <ArchivePhoto
            src="/karaikal/port.jpg"
            alt={t(ui.portAlt)}
            caption={t(ui.portCaption)}
            credit="Wikimedia · CC BY-SA"
          />
        </Reveal>

        <Reveal as="nav" className="mt-10 rounded-[var(--radius)] border border-ink-line bg-card p-5">
          <p className="meta-label mb-3">{t(ui.toc)}</p>
          <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`} className="group flex items-baseline gap-3 text-sm text-ink-soft transition-colors hover:text-ink">
                  <span className="font-mono text-xs text-seal tabular">{c.num}</span>
                  <span className="link-underline">{t(c.title)}</span>
                </a>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <article className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">

        {/* 01 · Une ville de la côte */}
        <Reveal as="section" id="ville" className="scroll-mt-24">
          <ChapterHead num="01" title={t(CHAPTERS[0].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Karaikal s&apos;étend dans le delta de la Cauvery, là où le fleuve
                  rejoint la mer. Très tôt, son port en fait un lieu d&apos;échanges :
                  riz, textiles, denrées circulent vers Ceylan, l&apos;Asie du Sud-Est et
                  les ports de l&apos;océan Indien.
                </p>
                <p>
                  La ville est aussi un haut lieu de dévotion : on y vénère la sainte
                  tamoule Karaikal Ammaiyar, l&apos;une des figures les plus anciennes de
                  la poésie shivaïte. Hindous et musulmans y cohabitent de longue date,
                  dans une région façonnée par le commerce.
                </p>
              </>
            ) : (
              <>
                <p>
                  Karaikal stretches across the Cauvery delta, where the river meets the
                  sea. Very early on, its port made it a place of exchange: rice, textiles
                  and goods flowed toward Ceylon, Southeast Asia and the ports of the
                  Indian Ocean.
                </p>
                <p>
                  The town is also a major place of devotion: it venerates the Tamil saint
                  Karaikal Ammaiyar, one of the oldest figures of Shaivite poetry. Hindus
                  and Muslims have lived side by side here for a long time, in a region
                  shaped by trade.
                </p>
              </>
            )}
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* 02 · Le comptoir français */}
        <Reveal as="section" id="comptoir" className="scroll-mt-24">
          <ChapterHead num="02" title={t(CHAPTERS[1].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  En 1739, Karaikal passe sous contrôle français et devient l&apos;un des
                  cinq établissements de l&apos;Inde française, aux côtés de Pondichéry,
                  Mahé, Yanaon et Chandernagor. Son port en fait un point de commerce
                  actif et un relais de l&apos;administration coloniale.
                </p>
                <p>
                  On y retrouve, comme à Pondichéry, l&apos;empreinte française : tracé
                  des rues, bâtiments administratifs, maisons à l&apos;architecture
                  coloniale dont certaines tiennent encore debout aujourd&apos;hui.
                </p>
              </>
            ) : (
              <>
                <p>
                  In 1739, Karaikal came under French control and became one of the five
                  settlements of French India, alongside Pondicherry, Mahé, Yanaon and
                  Chandernagore. Its port made it an active point of trade and a relay of
                  the colonial administration.
                </p>
                <p>
                  As in Pondicherry, the French imprint can be found here: the layout of
                  the streets, administrative buildings, houses of colonial architecture,
                  some of which still stand today.
                </p>
              </>
            )}
          </div>
          <ArchivePhoto
            className="mt-6"
            src="/karaikal/french-house.jpg"
            alt={lang === "fr" ? "Maison de style français à Karaikal" : "A French-style house in Karaikal"}
            caption={
              lang === "fr"
                ? "Une maison de style français à Karaikal."
                : "A French-style house in Karaikal."
            }
            credit="Wikimedia · CC BY"
          />
        </Reveal>

        <div className="rule-line my-12" />

        {/* 03 · Marchands et mémoire musulmane */}
        <Reveal as="section" id="musulmans" className="scroll-mt-24">
          <ChapterHead num="03" title={t(CHAPTERS[2].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Karaikal partage avec Pondichéry une longue présence musulmane, liée au
                  négoce maritime. Les familles de marchands tamouls musulmans y ont tenu
                  boutiques et entrepôts, et la grande mosquée témoigne de
                  l&apos;ancienneté de cette communauté.
                </p>
                <p>
                  Beaucoup de familles ont des branches des deux côtés : un grand-père né
                  à Karaikal, un cousin resté à Pondichéry, une tante partie à Chennai.
                  C&apos;est ce maillage entre les deux villes que l&apos;arbre permet de
                  rassembler.
                </p>
              </>
            ) : (
              <>
                <p>
                  Karaikal shares with Pondicherry a long Muslim presence, tied to
                  maritime trade. The families of Tamil Muslim merchants kept shops and
                  warehouses there, and the great mosque bears witness to the long history
                  of this community.
                </p>
                <p>
                  Many families have branches on both sides: a grandfather born in
                  Karaikal, a cousin who stayed in Pondicherry, an aunt who left for
                  Chennai. It is this web between the two towns that the tree makes it
                  possible to gather together.
                </p>
              </>
            )}
          </div>
          <Aside label={lang === "fr" ? "Deux villes, une famille" : "Two towns, one family"}>
            {lang === "fr"
              ? "Entre Karaikal et Pondichéry, à peine cent kilomètres : mariages, commerces et déplacements ont tissé des liens si serrés qu'une même lignée se lit souvent sur les deux rivages."
              : "Between Karaikal and Pondicherry, barely a hundred kilometres: marriages, businesses and movements have woven ties so close that a single lineage can often be read on both shores."}
          </Aside>
          <ArchivePhoto
            className="mt-6"
            src="/karaikal/grand-masjid.jpg"
            alt={lang === "fr" ? "La grande mosquée de Karaikal" : "The great mosque of Karaikal"}
            caption={lang === "fr" ? "La grande mosquée de Karaikal." : "The great mosque of Karaikal."}
            credit="Wikimedia · CC BY-SA"
          />
        </Reveal>

        <div className="rule-line my-12" />

        {/* 04 · La route de l'Indochine */}
        <Reveal as="section" id="indochine" className="scroll-mt-24">
          <ChapterHead num="04" title={t(CHAPTERS[3].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Comme leurs voisins de Pondichéry, beaucoup de Karaikalais, sujets
                  français, ont pris la route de l&apos;Indochine française. De la fin du
                  XIXᵉ siècle aux années 1950, ils partent vers Saïgon, Hanoï ou Phnom
                  Penh.
                </p>
                <p>
                  Parlant français, ils y travaillent dans l&apos;administration, la
                  douane, le commerce et la banque. À Saïgon, une communauté indienne, en
                  partie musulmane et marchande, s&apos;installe et y bâtit ses lieux de
                  culte. La fin de l&apos;Indochine française renvoie ces familles vers
                  Karaikal, Pondichéry ou directement vers la France.
                </p>
              </>
            ) : (
              <>
                <p>
                  Like their neighbours from Pondicherry, many people from Karaikal, French
                  subjects, took the road to French Indochina. From the end of the 19th
                  century to the 1950s, they left for Saigon, Hanoi or Phnom Penh.
                </p>
                <p>
                  French-speaking, they worked there in administration, customs, trade and
                  banking. In Saigon, an Indian community, partly Muslim and merchant,
                  settled and built its places of worship. The end of French Indochina sent
                  these families back to Karaikal, Pondicherry or directly to France.
                </p>
              </>
            )}
          </div>
          <Aside label={lang === "fr" ? "Pondichéry · Saïgon · Marseille" : "Pondicherry · Saigon · Marseille"}>
            {lang === "fr"
              ? "Pour certaines branches, l'itinéraire familial passe par trois continents. Ces détours expliquent bien des silences dans les arbres : des naissances à l'étranger, des actes perdus, des noms transformés."
              : "For some branches, the family itinerary passes through three continents. These detours explain many silences in the trees: births abroad, lost records, names transformed."}
          </Aside>
        </Reveal>

        <div className="rule-line my-12" />

        {/* 05 · Le rattachement et le départ */}
        <Reveal as="section" id="rattachement" className="scroll-mt-24">
          <ChapterHead num="05" title={t(CHAPTERS[4].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  En 1954, Karaikal est transférée de facto à l&apos;Inde, puis rattachée
                  officiellement en 1962, en même temps que les autres comptoirs. Comme à
                  Pondichéry, un droit d&apos;option permet à une partie des habitants de
                  conserver la nationalité française.
                </p>
                <p>
                  Dans les décennies suivantes, des familles s&apos;installent en France.
                  Le fil entre les générations se distend : on se souvient des proches,
                  moins de ceux d&apos;avant. C&apos;est cette mémoire que l&apos;arbre
                  cherche à retenir.
                </p>
              </>
            ) : (
              <>
                <p>
                  In 1954, Karaikal was transferred de facto to India, then officially
                  united in 1962, at the same time as the other trading posts. As in
                  Pondicherry, a right of option allowed some of the inhabitants to keep
                  French nationality.
                </p>
                <p>
                  In the following decades, families settled in France. The thread between
                  generations stretches thin: people remember their close relatives, less
                  so those who came before. It is this memory that the tree seeks to hold
                  on to.
                </p>
              </>
            )}
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* 06 · Karaikal aujourd'hui */}
        <Reveal as="section" id="aujourdhui" className="scroll-mt-24">
          <ChapterHead num="06" title={t(CHAPTERS[5].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Karaikal est aujourd&apos;hui un district du territoire de Puducherry,
                  séparé géographiquement de la ville de Pondichéry mais rattaché au même
                  territoire. Son port, sa plage et ses lieux de culte continuent de
                  rythmer la vie locale.
                </p>
                <p>
                  Pour les familles de la diaspora, Karaikal reste un nom qui revient sur
                  les vieux papiers et dans les récits : un point d&apos;origine, au même
                  titre que Pondichéry, qu&apos;il s&apos;agit de ne pas laisser
                  s&apos;effacer.
                </p>
              </>
            ) : (
              <>
                <p>
                  Karaikal is today a district of the territory of Puducherry,
                  geographically separate from the city of Pondicherry but attached to the
                  same territory. Its port, its beach and its places of worship continue to
                  set the rhythm of local life.
                </p>
                <p>
                  For the families of the diaspora, Karaikal remains a name that comes back
                  on old papers and in the stories: a point of origin, just like
                  Pondicherry, one that must not be allowed to fade away.
                </p>
              </>
            )}
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* Frise */}
        <Reveal as="section">
          <div className="mb-6 flex items-center gap-4">
            <span className="section-no whitespace-nowrap">{t(ui.timelineLabel)}</span>
            <div className="rule-line" />
            <Compass className="hidden h-12 w-12 shrink-0 text-ink md:block" />
          </div>
          <ScrollTimeline items={TIMELINE.map((item) => ({ year: t(item.year), text: t(item.text) }))} />
        </Reveal>

        {/* Lien Pondichéry */}
        <Reveal as="div" className="mt-14 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-ink-line bg-paper-warm p-5">
          <div>
            <p className="meta-label mb-1">{t(ui.readAlso)}</p>
            <p className="font-serif text-lg font-semibold">{t(ui.pondicheryTeaser)}</p>
          </div>
          <Link
            href="/pondichery"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm text-ink transition-colors hover:border-ink hover:bg-card"
          >
            {t(ui.discover)}
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </Reveal>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/arbre"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98]"
          >
            {t(ui.exploreTree)}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full border border-ink-line px-6 py-3 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {t(ui.contribute)}
          </Link>
        </div>

      </article>
    </div>
  );
}
