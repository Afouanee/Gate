import { useTranslations } from "next-intl";
import { Shield, Eye, Lock, FileText } from "lucide-react";

const SECTION_META = [
  { id: "utilisation", icon: Shield,   num: "01" },
  { id: "rgpd",        icon: Eye,      num: "02" },
  { id: "visibilite",  icon: Lock,     num: "03" },
  { id: "mentions",    icon: FileText, num: "04" },
] as const;

export default function ChartePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations("charter.page");
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";

  // Construit les sections à partir de l'i18n (textes) et des métadonnées (icônes, ids).
  const sections = SECTION_META.map((meta) => {
    const base = `sections.${meta.id}`;
    const section: {
      id: string;
      icon: typeof meta.icon;
      num: string;
      title: string;
      content: string[];
      lists?: { title: string; items: string[] }[];
      legal?: Record<string, string>;
    } = {
      id: meta.id,
      icon: meta.icon,
      num: meta.num,
      title: t(`${base}.title`),
      content: (t.raw(`${base}.content`) as string[]) ?? [],
    };

    if (meta.id === "rgpd") {
      section.lists = [
        {
          title: t(`${base}.listCollectedTitle`),
          items: t.raw(`${base}.listCollected`) as string[],
        },
        {
          title: t(`${base}.listRightsTitle`),
          items: t.raw(`${base}.listRights`) as string[],
        },
      ];
    }

    if (meta.id === "mentions") {
      section.legal = {
        [t(`${base}.legalEditorLabel`)]: t(`${base}.legalEditorValue`),
        [t(`${base}.legalHostingLabel`)]: t(`${base}.legalHostingValue`),
        [t(`${base}.legalContactLabel`)]: t(`${base}.legalContactValue`),
        [t(`${base}.legalPaymentsLabel`)]: t(`${base}.legalPaymentsValue`),
      };
    }

    return section;
  });

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper">
      <div className="container mx-auto max-w-3xl px-4 py-20 sm:px-6">

        {/* Header */}
        <div className="mb-16" style={{ animation: "fade-in 0.5s ease-out both" }}>
          <span className="section-no mb-4 block">{t("sectionNo")}</span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-4">
            {t("heading")}
          </h1>
          <p className="meta-label">
            {t("lastUpdated")}{" "}
            <span className="tabular">
              {new Date().toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </p>
        </div>

        {/* Nav rapide */}
        <div className="flex flex-wrap gap-2 mb-16 pb-8 border-b border-ink-line">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 text-xs font-medium border border-ink-line rounded-full text-ink-soft hover:border-ink hover:text-ink transition-all duration-200"
            >
              <span className="tabular text-seal">{s.num}</span> {s.title}
            </a>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-24"
              style={{ animation: `fade-in 0.5s ${i * 0.08}s ease-out both` }}
            >
              <div className="flex items-start gap-5 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-deep">
                  <s.icon className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
                </div>
                <div>
                  <span className="section-no tabular block">№ {s.num}</span>
                  <h2 className="font-serif text-xl font-semibold tracking-tight text-ink">{s.title}</h2>
                </div>
              </div>

              <div className="pl-0 sm:pl-[3.75rem] space-y-4">
                {s.content.map((p, j) => (
                  <p key={j} className="text-sm text-ink-soft leading-relaxed">{p}</p>
                ))}

                {s.lists?.map((list) => (
                  <div key={list.title} className="pt-2">
                    <p className="meta-label mb-3">{list.title}</p>
                    <ul className="space-y-2">
                      {list.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                          <span className="w-1 h-1 rounded-full bg-seal mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {s.legal && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {Object.entries(s.legal).map(([k, v]) => (
                      <div key={k} className="bg-card border border-ink-line rounded-[var(--radius)] p-4">
                        <p className="meta-label mb-1">{k}</p>
                        <p className="text-sm text-ink">{v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

      </div>
    </div>
  );
}
