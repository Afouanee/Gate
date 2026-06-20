import { Shield, Eye, Lock, FileText } from "lucide-react";

const sections = [
  {
    id: "utilisation",
    icon: Shield,
    num: "01",
    title: "Conditions d'utilisation",
    content: [
      "Gate est une plateforme dédiée à la généalogie. En utilisant nos services, vous acceptez les présentes conditions.",
      "Il est strictement interdit de publier des informations fausses, diffamatoires, portant atteinte à la vie privée de tiers, ou illégales sur la plateforme Gate.",
      "Tout abus peut entraîner la suspension immédiate du compte, sans remboursement.",
    ],
  },
  {
    id: "rgpd",
    icon: Eye,
    num: "02",
    title: "Protection des données · RGPD",
    content: [
      "Conformément au RGPD, Gate s'engage à traiter vos données personnelles de manière transparente et sécurisée.",
    ],
    lists: [
      {
        title: "Données collectées",
        items: ["Email et nom (création de compte)", "Données de profil généalogique (optionnelles)", "Paiements gérés exclusivement par Stripe", "Logs de connexion et d'audit (sécurité)"],
      },
      {
        title: "Vos droits",
        items: ["Droit d'accès : consultez vos données depuis votre compte.", "Droit à l'effacement : suppression = anonymisation immédiate.", "Droit à la portabilité : export de vos données sur demande.", "Contact : privacy@gate.afouanee.dev"],
      },
    ],
  },
  {
    id: "visibilite",
    icon: Lock,
    num: "03",
    title: "Visibilité des profils",
    content: [
      "Par défaut, seuls prénom et nom sont visibles. Les données sensibles (dates, photos, infos personnelles) sont masquées.",
      "Les administrateurs configurent la visibilité de chaque champ. Les utilisateurs Premium accèdent aux données complètes selon ces paramètres.",
    ],
  },
  {
    id: "mentions",
    icon: FileText,
    num: "04",
    title: "Mentions légales",
    content: [],
    legal: {
      Éditeur: "Afouanee.dev",
      Hébergement: "Vercel Inc. (San Francisco, CA) / Supabase",
      Contact: "contact@gate.afouanee.dev",
      Paiements: "Stripe Inc. (San Francisco, CA)",
    },
  },
];

export default function ChartePage() {
  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper">
      <div className="container mx-auto max-w-3xl px-4 py-20 sm:px-6">

        {/* Header */}
        <div className="mb-16" style={{ animation: "fade-in 0.5s ease-out both" }}>
          <span className="section-no mb-4 block">№ · Légal</span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-4">
            Charte d'utilisation
          </h1>
          <p className="meta-label">
            Dernière mise à jour :{" "}
            <span className="tabular">
              {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
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
