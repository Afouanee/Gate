import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";
import { Kolam, CoromandelMap, WhiteTown, Compass } from "@/components/pondichery/illustrations";
import { ArchivePhoto } from "@/components/pondichery/archive-photo";

type Lang = "fr" | "en";
type Bi = { fr: string; en: string };

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const lang: Lang = params.locale === "en" ? "en" : "fr";
  const meta = {
    title: {
      fr: "Pondichéry · Gate",
      en: "Pondicherry · Gate",
    },
    description: {
      fr: "Pondichéry, des marchands de la côte de Coromandel au comptoir français, sa communauté musulmane, le rattachement à l'Inde et la diaspora indo-pondichérienne en France. Une histoire en sept chapitres.",
      en: "Pondicherry, from the merchants of the Coromandel Coast to the French trading post, its Muslim community, the union with India and the Indo-Pondicherrian diaspora in France. A story in seven chapters.",
    },
  };
  return {
    title: meta.title[lang],
    description: meta.description[lang],
  };
}

const CHAPTERS: { id: string; num: string; title: Bi }[] = [
  { id: "origines", num: "01", title: { fr: "Avant les Français", en: "Before the French" } },
  { id: "comptoir", num: "02", title: { fr: "La naissance du comptoir", en: "The birth of the trading post" } },
  { id: "age-or", num: "03", title: { fr: "Âge d'or et rivalités", en: "Golden age and rivalries" } },
  { id: "musulmans", num: "04", title: { fr: "La communauté musulmane", en: "The Muslim community" } },
  { id: "indochine", num: "05", title: { fr: "La route de l'Indochine", en: "The road to Indochina" } },
  { id: "rattachement", num: "06", title: { fr: "Le rattachement à l'Inde", en: "The union with India" } },
  { id: "emigration", num: "07", title: { fr: "L'émigration vers la France", en: "Emigration to France" } },
  { id: "aujourdhui", num: "08", title: { fr: "Pondichéry aujourd'hui", en: "Pondicherry today" } },
];

const TIMELINE: { year: Bi; text: Bi }[] = [
  {
    year: { fr: "Avant 1674", en: "Before 1674" },
    text: {
      fr: "Village de pêcheurs et de tisserands sur la côte de Coromandel, déjà inscrit dans le commerce de l'océan Indien.",
      en: "A village of fishermen and weavers on the Coromandel Coast, already part of Indian Ocean trade.",
    },
  },
  {
    year: { fr: "1674", en: "1674" },
    text: {
      fr: "La Compagnie française des Indes orientales y établit son comptoir, sous l'impulsion de François Martin.",
      en: "The French East India Company establishes its trading post there, driven by François Martin.",
    },
  },
  {
    year: { fr: "1742", en: "1742" },
    text: {
      fr: "Sous Dupleix, Pondichéry devient la capitale florissante des établissements français en Inde.",
      en: "Under Dupleix, Pondicherry becomes the flourishing capital of the French settlements in India.",
    },
  },
  {
    year: { fr: "1761", en: "1761" },
    text: {
      fr: "Prise et détruite par les Britanniques ; elle sera reconstruite puis rendue à la France.",
      en: "Captured and destroyed by the British; it would later be rebuilt and returned to France.",
    },
  },
  {
    year: { fr: "1816", en: "1816" },
    text: {
      fr: "Après les guerres napoléoniennes, Pondichéry redevient durablement française.",
      en: "After the Napoleonic Wars, Pondicherry returns to lasting French rule.",
    },
  },
  {
    year: { fr: "1880–1950", en: "1880–1950" },
    text: {
      fr: "De nombreux Pondichériens partent travailler en Indochine française, notamment à Saïgon.",
      en: "Many people from Pondicherry leave to work in French Indochina, notably in Saigon.",
    },
  },
  {
    year: { fr: "1954", en: "1954" },
    text: {
      fr: "Transfert de facto à l'Inde ; les habitants peuvent conserver la nationalité française.",
      en: "De facto transfer to India; inhabitants are allowed to keep French nationality.",
    },
  },
  {
    year: { fr: "1962", en: "1962" },
    text: {
      fr: "Rattachement officiel. Les départs vers la France métropolitaine s'accélèrent.",
      en: "Official union. Departures to mainland France accelerate.",
    },
  },
  {
    year: { fr: "2006", en: "2006" },
    text: {
      fr: "La ville est officiellement renommée Puducherry, capitale de son territoire.",
      en: "The city is officially renamed Puducherry, capital of its territory.",
    },
  },
  {
    year: { fr: "Aujourd'hui", en: "Today" },
    text: {
      fr: "Patrimoine franco-tamoul vivant ; une importante diaspora indo-pondichérienne demeure en France.",
      en: "A living Franco-Tamil heritage; a large Indo-Pondicherrian diaspora remains in France.",
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

export default function PondicheryPage({ params }: { params: { locale: string } }) {
  const lang: Lang = params.locale === "en" ? "en" : "fr";
  const t = (o: Bi) => o[lang];

  const ui = {
    heroEyebrow: { fr: "№ · Mémoire", en: "№ · Memory" },
    heroTitle: { fr: "Pondichéry,", en: "Pondicherry," },
    heroSubtitle: { fr: "une histoire en sept chapitres.", en: "a story in seven chapters." },
    heroLead: {
      fr: "Des marchands de la côte de Coromandel au comptoir français, du rattachement à l'Inde jusqu'à la diaspora d'aujourd'hui : le récit de la ville d'où une famille est partie, et de ce qu'elle a laissé derrière elle.",
      en: "From the merchants of the Coromandel Coast to the French trading post, from the union with India to today's diaspora: the story of the city a family left behind, and of what it left behind it.",
    },
    waterfrontAlt: {
      fr: "Le front de mer de Pondichéry dans les années 1880",
      en: "The Pondicherry waterfront in the 1880s",
    },
    waterfrontCaption: {
      fr: "Le front de mer de Pondichéry, années 1880.",
      en: "The Pondicherry waterfront, 1880s.",
    },
    toc: { fr: "Sommaire", en: "Contents" },
    timelineLabel: { fr: "№ · Chronologie", en: "№ · Timeline" },
    readAlso: { fr: "À lire aussi", en: "Read also" },
    karaikalTeaser: { fr: "Karaikal, l'autre comptoir", en: "Karaikal, the other trading post" },
    discover: { fr: "Découvrir", en: "Discover" },
    noteLabel: { fr: "Note", en: "Note" },
    note: {
      fr: "Cette page propose des repères généraux. Les histoires familiales, les graphies des noms et les dates exactes varient d'une branche à l'autre : c'est précisément ce que l'arbre sert à préciser et à conserver.",
      en: "This page offers general landmarks. Family histories, the spelling of names and exact dates vary from one branch to another: that is precisely what the tree serves to clarify and preserve.",
    },
    exploreTree: { fr: "Explorer l'arbre", en: "Explore the tree" },
    contribute: { fr: "Contribuer à la mémoire", en: "Contribute to the memory" },
  } satisfies Record<string, Bi>;

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-ink-line px-4 py-16 sm:px-6 md:py-24">
        <Kolam className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 text-ink/[0.06] sm:h-64 sm:w-64 md:h-96 md:w-96" />
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
            src="/pondichery/waterfront-1880s.jpg"
            alt={t(ui.waterfrontAlt)}
            caption={t(ui.waterfrontCaption)}
          />
        </Reveal>

        {/* Sommaire */}
        <Reveal as="nav" className="mt-10 rounded-[var(--radius)] border border-ink-line bg-card p-5">
          <p className="meta-label mb-3">{t(ui.toc)}</p>
          <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className="group flex items-baseline gap-3 text-sm text-ink-soft transition-colors hover:text-ink"
                >
                  <span className="font-mono text-xs text-seal tabular">{c.num}</span>
                  <span className="link-underline">{t(c.title)}</span>
                </a>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <article className="container mx-auto max-w-3xl px-4 py-16 sm:px-6">

        {/* 01 · Avant les Français */}
        <Reveal as="section" id="origines" className="scroll-mt-24">
          <ChapterHead num="01" title={t(CHAPTERS[0].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Bien avant l&apos;arrivée des Européens, la côte de Coromandel est un
                  monde de commerce. Pondichéry n&apos;est alors qu&apos;un modeste
                  village de pêcheurs et de tisserands, mais la région tout entière vit
                  du négoce : toiles de coton peintes, épices, perles, échanges avec
                  Ceylan, l&apos;Asie du Sud-Est et les ports arabes.
                </p>
                <p>
                  C&apos;est dans ce tissu marchand ancien que s&apos;enracinent les
                  familles tamoules, hindoues comme musulmanes, qui peupleront plus tard
                  les quartiers de la ville. La mer, ici, n&apos;a jamais été une
                  frontière : elle est une route.
                </p>
              </>
            ) : (
              <>
                <p>
                  Long before the Europeans arrived, the Coromandel Coast was a world of
                  trade. Pondicherry was then only a modest village of fishermen and
                  weavers, but the whole region lived from commerce: painted cotton
                  cloth, spices, pearls, exchanges with Ceylon, Southeast Asia and the
                  Arab ports.
                </p>
                <p>
                  It was within this ancient merchant fabric that the Tamil families,
                  Hindu as well as Muslim, took root, families that would later fill the
                  neighbourhoods of the city. Here, the sea was never a border: it was a
                  road.
                </p>
              </>
            )}
          </div>
          <WhiteTown className="mt-6 hidden h-auto w-full max-w-sm text-ink md:block" />
        </Reveal>

        <div className="rule-line my-12" />

        {/* 02 · La naissance du comptoir */}
        <Reveal as="section" id="comptoir" className="scroll-mt-24">
          <ChapterHead num="02" title={t(CHAPTERS[1].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  En 1674, la Compagnie française des Indes orientales obtient le droit de
                  s&apos;installer à Pondichéry. L&apos;artisan de cette implantation,
                  François Martin, en fait peu à peu un véritable établissement : entrepôts,
                  fortifications, premières rues tracées au cordeau.
                </p>
                <p>
                  La ville se dessine en deux parties qui marqueront durablement son
                  visage : la « ville blanche », côté mer, où vivent les Européens, et la
                  « ville noire », où se concentrent les communautés indiennes, marchands
                  et artisans. Entre les deux, un canal. Le plan en damier, lui, traverse
                  les siècles.
                </p>
              </>
            ) : (
              <>
                <p>
                  In 1674, the French East India Company obtained the right to settle in
                  Pondicherry. The architect of this settlement, François Martin, gradually
                  turned it into a genuine establishment: warehouses, fortifications, the
                  first streets laid out in straight lines.
                </p>
                <p>
                  The city took shape in two parts that would lastingly mark its face: the
                  White Town, on the sea side, where the Europeans lived, and the Black
                  Town, where the Indian communities, merchants and artisans were
                  concentrated. Between the two, a canal. The grid plan, for its part, has
                  crossed the centuries.
                </p>
              </>
            )}
          </div>
          <Aside label={lang === "fr" ? "La ville blanche" : "The White Town"}>
            {lang === "fr"
              ? "Maisons à vérandas, persiennes, rues aux noms français : trois siècles plus tard, ce décor existe encore et fait la signature de Pondichéry."
              : "Houses with verandas, shutters, streets with French names: three centuries later, this setting still exists and forms the signature of Pondicherry."}
          </Aside>
        </Reveal>

        <div className="rule-line my-12" />

        {/* 03 · Âge d'or et rivalités */}
        <Reveal as="section" id="age-or" className="scroll-mt-24">
          <ChapterHead num="03" title={t(CHAPTERS[2].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Au XVIIIᵉ siècle, sous le gouverneur Dupleix, Pondichéry connaît son
                  apogée. Elle devient la capitale des établissements français en Inde et
                  rêve un moment d&apos;un empire sur le sous-continent. C&apos;est l&apos;époque
                  des grandes ambitions, mais aussi des guerres franco-britanniques.
                </p>
                <p>
                  En 1761, les Britanniques s&apos;emparent de la ville et la détruisent.
                  Elle est rendue, reconstruite, reprise, rendue de nouveau : Pondichéry
                  change de mains au gré des traités. Après 1816, elle reste française,
                  petite enclave de la République au milieu de l&apos;Inde britannique.
                </p>
              </>
            ) : (
              <>
                <p>
                  In the 18th century, under Governor Dupleix, Pondicherry reached its
                  height. It became the capital of the French settlements in India and,
                  for a moment, dreamed of an empire over the subcontinent. This was the
                  era of great ambitions, but also of the Franco-British wars.
                </p>
                <p>
                  In 1761, the British seized the city and destroyed it. It was returned,
                  rebuilt, retaken, returned again: Pondicherry changed hands at the whim
                  of treaties. After 1816, it remained French, a small enclave of the
                  Republic in the middle of British India.
                </p>
              </>
            )}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ArchivePhoto
              src="/pondichery/view-1857.jpg"
              alt={lang === "fr" ? "Vue de Pondichéry en 1857" : "View of Pondicherry in 1857"}
              caption={lang === "fr" ? "Pondichéry, 1857." : "Pondicherry, 1857."}
            />
            <ArchivePhoto
              src="/pondichery/waterfront-1900.jpg"
              alt={lang === "fr" ? "Le front de mer vers 1900" : "The waterfront around 1900"}
              caption={lang === "fr" ? "Le front de mer, vers 1900." : "The waterfront, around 1900."}
            />
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* 04 · La communauté musulmane */}
        <Reveal as="section" id="musulmans" className="scroll-mt-24">
          <ChapterHead num="04" title={t(CHAPTERS[3].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  La présence musulmane à Pondichéry est ancienne et indissociable du
                  commerce maritime. Beaucoup de familles descendent des marchands tamouls
                  musulmans, parfois appelés <span className="text-ink">Maraikkayar</span>
                  {" "}(Marakkayar) : négociants en textile, en cuir, en denrées, installés
                  de longue date entre Pondichéry, Karaikal et les ports voisins.
                </p>
                <p>
                  On y parle le tamoul au quotidien, on prie en arabe, et l&apos;on a vécu
                  sous administration française : un métissage rare de langues et de
                  cultures. Les mosquées de la vieille ville, les quartiers marchands et
                  les fêtes de l&apos;Aïd rythment une mémoire collective transmise
                  oralement, bien plus que par l&apos;écrit.
                </p>
              </>
            ) : (
              <>
                <p>
                  The Muslim presence in Pondicherry is ancient and inseparable from
                  maritime trade. Many families descend from the Tamil Muslim merchants,
                  sometimes called <span className="text-ink">Maraikkayar</span>
                  {" "}(Marakkayar): traders in textiles, leather and goods, long settled
                  between Pondicherry, Karaikal and the neighbouring ports.
                </p>
                <p>
                  There, Tamil is spoken every day, prayers are said in Arabic, and people
                  lived under French administration: a rare blending of languages and
                  cultures. The mosques of the old town, the merchant quarters and the Eid
                  festivals give rhythm to a collective memory passed on orally, far more
                  than in writing.
                </p>
              </>
            )}
          </div>
          <Aside label={lang === "fr" ? "Le nom Maraikkayar" : "The name Maraikkayar"}>
            {lang === "fr"
              ? "Le terme évoquerait la mer et la navigation : un nom de famille qui dit, à lui seul, des siècles de commerce le long de la côte."
              : "The term is said to evoke the sea and navigation: a family name that alone speaks of centuries of trade along the coast."}
          </Aside>
          <ArchivePhoto
            className="mt-6"
            src="/pondichery/market.jpg"
            alt={lang === "fr" ? "Scène de marché à Pondichéry" : "A market scene in Pondicherry"}
            caption={
              lang === "fr"
                ? "Le marché de Pondichéry, cœur du négoce de la côte de Coromandel."
                : "The Pondicherry market, the heart of trade on the Coromandel Coast."
            }
          />
        </Reveal>

        <div className="rule-line my-12" />

        {/* 05 · La route de l'Indochine */}
        <Reveal as="section" id="indochine" className="scroll-mt-24">
          <ChapterHead num="05" title={t(CHAPTERS[4].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Sujets français mais éloignés de la métropole, les Pondichériens et les
                  Karaikalais furent nombreux à emprunter une autre route de l&apos;empire :
                  celle de l&apos;Indochine française. Dès la fin du XIXᵉ siècle et durant
                  la première moitié du XXᵉ, beaucoup partent vers Saïgon (aujourd&apos;hui
                  Hô Chi Minh-Ville), mais aussi Hanoï ou Phnom Penh.
                </p>
                <p>
                  Parlant français et formés dans les écoles des comptoirs, ils y occupent
                  des postes dans l&apos;administration coloniale, la douane, les chemins de
                  fer, le commerce et la banque. À Saïgon, une communauté indienne, en
                  partie musulmane, tient boutiques et comptoirs ; des mosquées y sont
                  bâties, fréquentées par ces marchands venus de la côte de Coromandel.
                </p>
                <p>
                  La décolonisation de l&apos;Indochine, dans les années 1950, met fin à
                  cet épisode. Beaucoup de ces familles rentrent à Pondichéry ou à
                  Karaikal, d&apos;autres rejoignent directement la France. Pour certaines
                  branches, l&apos;itinéraire est ainsi triple : <span className="text-ink">
                  Pondichéry, Saïgon, puis Marseille ou Paris.</span>
                </p>
              </>
            ) : (
              <>
                <p>
                  French subjects but far from the mainland, many people from Pondicherry
                  and Karaikal took another road of the empire: that of French Indochina.
                  From the end of the 19th century and through the first half of the 20th,
                  many left for Saigon (now Ho Chi Minh City), but also Hanoi or Phnom
                  Penh.
                </p>
                <p>
                  French-speaking and trained in the schools of the trading posts, they
                  held positions in the colonial administration, customs, the railways,
                  trade and banking. In Saigon, an Indian community, partly Muslim, ran
                  shops and trading houses; mosques were built there, frequented by these
                  merchants from the Coromandel Coast.
                </p>
                <p>
                  The decolonisation of Indochina, in the 1950s, brought this episode to
                  an end. Many of these families returned to Pondicherry or Karaikal,
                  others went directly to France. For some branches, the itinerary was
                  thus threefold: <span className="text-ink">
                  Pondicherry, Saigon, then Marseille or Paris.</span>
                </p>
              </>
            )}
          </div>
          <Aside label={lang === "fr" ? "Un détour par l'Asie" : "A detour through Asia"}>
            {lang === "fr"
              ? "Dans bien des familles, un grand-oncle « parti à Saïgon » reste une trace vivace. Ces allers-retours entre l'Inde, l'Indochine et la France font partie des fils que l'arbre aide à renouer."
              : "In many families, a great-uncle who \"went to Saigon\" remains a vivid trace. These journeys back and forth between India, Indochina and France are among the threads the tree helps to retie."}
          </Aside>
        </Reveal>

        <div className="rule-line my-12" />

        {/* 06 · Le rattachement à l'Inde */}
        <Reveal as="section" id="rattachement" className="scroll-mt-24">
          <ChapterHead num="06" title={t(CHAPTERS[5].title)} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Après l&apos;indépendance de l&apos;Inde en 1947, le sort des comptoirs
                  français se joue. En 1954, un transfert de facto place Pondichéry sous
                  administration indienne ; le rattachement devient officiel en 1962.
                </p>
                <p>
                  Particularité décisive pour de nombreuses familles : un droit d&apos;option
                  permet à une partie des habitants de conserver la nationalité française.
                  Ce choix, fait par certains et pas par d&apos;autres, séparera des
                  branches d&apos;une même famille de part et d&apos;autre de l&apos;océan.
                </p>
              </>
            ) : (
              <>
                <p>
                  After India&apos;s independence in 1947, the fate of the French trading
                  posts was decided. In 1954, a de facto transfer placed Pondicherry under
                  Indian administration; the union became official in 1962.
                </p>
                <p>
                  A decisive feature for many families: a right of option allowed some of
                  the inhabitants to keep French nationality. This choice, made by some and
                  not by others, would separate branches of a single family on either side
                  of the ocean.
                </p>
              </>
            )}
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* 07 · L'émigration vers la France */}
        <Reveal as="section" id="emigration" className="scroll-mt-24">
          <ChapterHead num="07" title={t(CHAPTERS[6].title)} />
          <div className="mt-5 overflow-hidden rounded-[var(--radius)] border border-ink-line bg-paper-warm p-5">
            <CoromandelMap className="mx-auto h-auto w-full max-w-md text-ink-soft" />
          </div>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Dans les décennies qui suivent le rattachement, beaucoup de familles,
                  dont des familles musulmanes, s&apos;installent en France, souvent à
                  Marseille, à Paris ou dans le Sud. Certains avaient servi dans
                  l&apos;armée ou l&apos;administration françaises ; d&apos;autres
                  viennent chercher du travail et un avenir.
                </p>
                <p>
                  Ce départ marque une rupture douce mais réelle. On connaît ses parents,
                  ses grands-parents, parfois ses arrière-grands-parents. Mais au-delà, le
                  fil se perd : les noms s&apos;écrivent autrement, les dates deviennent
                  floues, les branches restées à Pondichéry s&apos;éloignent.
                </p>
              </>
            ) : (
              <>
                <p>
                  In the decades following the union, many families, including Muslim
                  families, settled in France, often in Marseille, in Paris or in the
                  South. Some had served in the French army or administration; others came
                  in search of work and a future.
                </p>
                <p>
                  This departure marked a gentle but real break. People know their
                  parents, their grandparents, sometimes their great-grandparents. But
                  beyond that, the thread is lost: names are written differently, dates
                  become blurred, the branches that stayed in Pondicherry drift away.
                </p>
              </>
            )}
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* 08 · Pondichéry aujourd'hui */}
        <Reveal as="section" id="aujourdhui" className="scroll-mt-24">
          <ChapterHead num="08" title={t(CHAPTERS[7].title)} />
          <ArchivePhoto
            className="mt-5"
            src="/pondichery/french-quarter-today.jpg"
            alt={
              lang === "fr"
                ? "Le quartier français de Pondichéry aujourd'hui"
                : "The French quarter of Pondicherry today"
            }
            caption={
              lang === "fr"
                ? "Le quartier français de Pondichéry, aujourd'hui."
                : "The French quarter of Pondicherry, today."
            }
            credit="Wikimedia · CC BY"
          />
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Officiellement renommée Puducherry en 2006, la ville est aujourd&apos;hui
                  la capitale d&apos;un territoire de l&apos;Union indienne. Le quartier
                  français, restauré, attire visiteurs et amoureux du patrimoine ; le
                  français y est encore enseigné, et quelques institutions perpétuent ce
                  lien singulier entre deux pays.
                </p>
                <p>
                  La ville reste aussi connue pour l&apos;ashram de Sri Aurobindo et la
                  cité d&apos;Auroville, qui lui donnent un rayonnement particulier. Mais
                  pour beaucoup de familles, Pondichéry est avant tout un point
                  d&apos;origine : un nom de ville inscrit sur de vieux papiers, un grand-père
                  dont on parle, une cuisine, des mots.
                </p>
                <p>
                  En France, la diaspora indo-pondichérienne reste vivante, de Marseille à
                  Paris. Elle entretient une mémoire que le temps et la distance rendent
                  fragile. C&apos;est précisément là que commence cet arbre.
                </p>
              </>
            ) : (
              <>
                <p>
                  Officially renamed Puducherry in 2006, the city is today the capital of a
                  territory of the Indian Union. The restored French quarter draws visitors
                  and heritage lovers; French is still taught there, and a few institutions
                  carry on this singular bond between two countries.
                </p>
                <p>
                  The city also remains known for the ashram of Sri Aurobindo and the city
                  of Auroville, which give it a particular renown. But for many families,
                  Pondicherry is above all a point of origin: the name of a city written on
                  old papers, a grandfather people speak of, a cuisine, some words.
                </p>
                <p>
                  In France, the Indo-Pondicherrian diaspora remains alive, from Marseille
                  to Paris. It keeps up a memory that time and distance make fragile. That
                  is precisely where this tree begins.
                </p>
              </>
            )}
          </div>
        </Reveal>

        <div className="rule-line my-12" />

        {/* Frise complète */}
        <Reveal as="section">
          <div className="mb-6 flex items-center gap-4">
            <span className="section-no whitespace-nowrap">{t(ui.timelineLabel)}</span>
            <div className="rule-line" />
            <Compass className="hidden h-12 w-12 shrink-0 text-ink md:block" />
          </div>
          <ol className="relative ml-2 space-y-5 border-l border-ink-line pl-6">
            {TIMELINE.map((item) => (
              <li key={item.year.fr} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-seal" />
                <span className="font-mono text-sm font-semibold text-seal">{t(item.year)}</span>
                <p className="mt-0.5 text-[15px] leading-relaxed text-ink-soft">{t(item.text)}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="rule-line my-12" />

        {/* Pourquoi un registre */}
        <Reveal as="section">
          <ChapterHead num="—" title={lang === "fr" ? "Pourquoi un registre" : "Why a register"} />
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">
            {lang === "fr" ? (
              <>
                <p>
                  Gate est né d&apos;un constat simple : à partir d&apos;un certain degré,
                  on ne sait plus qui était qui. Reconstituer l&apos;arbre, c&apos;est
                  rassembler ce que chacun garde en mémoire, recouper les souvenirs, et
                  redonner un nom et une place à ceux d&apos;avant.
                </p>
                <p>
                  Conserver cette mémoire, c&apos;est aussi la transmettre. Aux enfants nés
                  en France qui n&apos;ont jamais vu Pondichéry, l&apos;arbre raconte
                  d&apos;où ils viennent.
                </p>
              </>
            ) : (
              <>
                <p>
                  Gate was born from a simple observation: beyond a certain degree, you no
                  longer know who was who. To rebuild the tree is to gather what each
                  person holds in memory, cross-check recollections, and give back a name
                  and a place to those who came before.
                </p>
                <p>
                  Preserving this memory also means passing it on. To children born in
                  France who have never seen Pondicherry, the tree tells where they come
                  from.
                </p>
              </>
            )}
          </div>
        </Reveal>

        {/* Lien Karaikal */}
        <Reveal as="div" className="mt-14 flex items-center justify-between gap-4 rounded-[var(--radius)] border border-ink-line bg-paper-warm p-5">
          <div>
            <p className="meta-label mb-1">{t(ui.readAlso)}</p>
            <p className="font-serif text-lg font-semibold">{t(ui.karaikalTeaser)}</p>
          </div>
          <Link
            href="/karaikal"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm text-ink transition-colors hover:border-ink hover:bg-card"
          >
            {t(ui.discover)}
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </Reveal>

        {/* Note */}
        <Reveal as="div" className="mt-8 rounded-[var(--radius)] border border-ink-line bg-paper-warm p-6">
          <p className="meta-label mb-2">{t(ui.noteLabel)}</p>
          <p className="text-sm leading-relaxed text-ink-soft">
            {t(ui.note)}
          </p>
        </Reveal>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center gap-3">
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
