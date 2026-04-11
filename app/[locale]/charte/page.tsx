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
    title: "Protection des données — RGPD",
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
      Hébergement: "Vercel Inc. — San Francisco, CA / Supabase",
      Contact: "contact@gate.afouanee.dev",
      Paiements: "Stripe Inc. — San Francisco, CA",
    },
  },
];

export default function ChartePage() {
  return (
    <div className="min-h-[calc(100svh-4rem)] bg-white">
      <div className="container mx-auto max-w-3xl px-6 py-20">

        {/* Header */}
        <div className="mb-16" style={{ animation: "fade-in 0.5s ease-out both" }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Légal</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black font-heading tracking-tight leading-tight mb-4">
            Charte d'utilisation
          </h1>
          <p className="text-sm text-zinc-400">
            Dernière mise à jour :{" "}
            {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Nav rapide */}
        <div className="flex flex-wrap gap-2 mb-16 pb-8 border-b border-zinc-100">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 text-xs font-semibold border border-zinc-200 rounded-full text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-150"
            >
              {s.num} {s.title}
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <s.icon className="h-4 w-4 text-zinc-600" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 font-heading">{s.num}</span>
                  <h2 className="text-xl font-black font-heading tracking-tight text-zinc-900">{s.title}</h2>
                </div>
              </div>

              <div className="pl-[3.75rem] space-y-4">
                {s.content.map((p, j) => (
                  <p key={j} className="text-sm text-zinc-500 leading-relaxed">{p}</p>
                ))}

                {s.lists?.map((list) => (
                  <div key={list.title} className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-3">{list.title}</p>
                    <ul className="space-y-2">
                      {list.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-500">
                          <span className="w-1 h-1 rounded-full bg-zinc-300 mt-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {s.legal && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {Object.entries(s.legal).map(([k, v]) => (
                      <div key={k} className="border border-zinc-100 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{k}</p>
                        <p className="text-sm text-zinc-700">{v}</p>
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
