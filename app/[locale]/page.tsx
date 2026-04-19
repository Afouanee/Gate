import Link from "next/link";
import { ArrowRight, TreePine } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    <div className="min-h-[100svh] bg-white flex flex-col">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">

        {/* Grille subtile */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Cercle décoratif */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-zinc-100"
          style={{ animation: "spin-slow 60s linear infinite" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-zinc-50"
          style={{ animation: "spin-slow 90s linear infinite reverse" }}
        />

        <div className="relative z-10 max-w-2xl mx-auto">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 mb-10 px-3.5 py-1.5 rounded-full border border-zinc-200 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400"
            style={{ animation: "fade-in 0.4s 0.1s ease-out both" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Arbre généalogique
          </div>

          {/* Titre */}
          <div className="overflow-hidden mb-5">
            <h1
              className="text-[clamp(5rem,18vw,10rem)] font-black font-heading leading-[0.85] tracking-[-0.05em] text-zinc-900"
              style={{ animation: "slide-up 0.9s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              Gate
            </h1>
          </div>

          <div className="overflow-hidden mb-12">
            <p
              className="text-base md:text-lg text-zinc-400 font-light tracking-wide italic"
              style={{ animation: "slide-up 0.9s 0.35s cubic-bezier(0.16,1,0.3,1) both" }}
            >
              "Dis-moi qui tu es, je te dirai d'où tu viens."
            </p>
          </div>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ animation: "fade-in 0.5s 0.55s ease-out both" }}
          >
            {session ? (
              <Link
                href="/arbre"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-zinc-900 text-white text-sm font-semibold rounded-full hover:bg-zinc-700 transition-all duration-200"
              >
                <TreePine className="h-4 w-4" />
                Voir l'arbre
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-zinc-900 text-white text-sm font-semibold rounded-full hover:bg-zinc-700 transition-all duration-200"
                >
                  Commencer — c'est gratuit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="px-7 py-3.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 rounded-full border border-zinc-200 hover:border-zinc-400 transition-all duration-200"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>

          {/* Mini stats */}
          {(stats.persons > 0 || stats.relations > 0) && (
            <div
              className="mt-14 flex items-center justify-center gap-10"
              style={{ animation: "fade-in 0.5s 0.75s ease-out both" }}
            >
              {stats.persons > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-black font-heading">{stats.persons.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest mt-0.5">profils</p>
                </div>
              )}
              {stats.persons > 0 && stats.relations > 0 && (
                <div className="w-px h-8 bg-zinc-200" />
              )}
              {stats.relations > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-black font-heading">{stats.relations.toLocaleString("fr-FR")}</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest mt-0.5">liens</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ animation: "fade-in 0.5s 1.2s ease-out both" }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-zinc-200 to-transparent" />
        </div>
      </section>

      {/* ── PRICING TEASER ───────────────────────────────── */}
      <section className="border-t border-zinc-100 py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* FREE */}
            <div className="border border-zinc-200 rounded-2xl p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Gratuit</p>
              <p className="text-3xl font-black font-heading tracking-tight mb-1">0 €</p>
              <p className="text-xs text-zinc-400 mb-6">pour toujours</p>
              <ul className="space-y-2.5 mb-7">
                {["5 recherches", "10 profils", "1 export PDF"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600">
                    <span className="w-1 h-1 rounded-full bg-zinc-300 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center py-2.5 px-5 text-sm font-semibold border border-zinc-900 text-zinc-900 rounded-full hover:bg-zinc-900 hover:text-white transition-all duration-200"
              >
                Commencer
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="bg-zinc-900 text-white rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-white text-zinc-900 px-2 py-0.5 rounded-full">
                ✦ Premium
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Premium</p>
              <p className="text-3xl font-black font-heading tracking-tight mb-1">3,99 €</p>
              <p className="text-xs text-zinc-500 mb-6">tous les 3 mois</p>
              <ul className="space-y-2.5 mb-7">
                {["Illimité", "Arbre complet", "Exports PDF"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <span className="w-1 h-1 rounded-full bg-zinc-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block text-center py-2.5 px-5 text-sm font-semibold bg-white text-zinc-900 rounded-full hover:bg-zinc-100 transition-all duration-200"
              >
                Voir les détails
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
