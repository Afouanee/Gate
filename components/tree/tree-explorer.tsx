"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Download, ArrowLeftRight, Loader2 } from "lucide-react";
import { FamilyTree } from "./family-tree";

const genderAccent: Record<string, string> = {
  MALE: "#3F5B72",
  FEMALE: "#8A4A52",
  OTHER: "#5E5070",
  UNKNOWN: "#8A8378",
};

export function TreeExplorer() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        // On passe par /api/search (sanitisé via les flags showXxx) et non plus
        // /api/persons qui est réservé aux admins et renvoyait des données brutes.
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setResults((data.results || []).slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  if (!selectedPerson) {
    return (
      <div className="flex h-[calc(100svh-4rem)] items-center justify-center bg-paper-warm px-4 sm:px-6">
        <div className="w-full max-w-2xl">
          <div
            className="rounded-[var(--radius)] border border-ink-line bg-card p-6 shadow-paper-lg sm:p-8 md:p-10"
            style={{ animation: "fade-in 0.5s both" }}
          >
            <span className="section-no">№ · Arbre généalogique</span>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Ouvrir l&apos;arbre d&apos;une personne
            </h1>
            <p className="mt-3 text-sm text-ink-soft md:text-base">
              Sélectionnez un profil : l&apos;arbre s&apos;affiche et se centre directement sur lui.
            </p>

            <div className="relative mt-8">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" strokeWidth={1.75} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un prénom ou un nom…"
                aria-label="Rechercher une personne"
                autoFocus
                className="h-14 w-full rounded-full border border-ink-line bg-paper pl-12 pr-5 text-base text-ink placeholder:text-ink-faint transition-colors focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/30"
              />
            </div>

            <div className="mt-5 min-h-20">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-ink-faint">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recherche en cours…
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((person) => {
                    const accent = genderAccent[person.gender] || genderAccent.UNKNOWN;
                    return (
                      <button
                        key={person.id}
                        onClick={() => setSelectedPerson(person)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius)] border border-ink-line px-4 py-3 text-left transition-colors hover:border-ink hover:bg-paper-warm"
                      >
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-paper-warm font-serif text-sm font-semibold"
                          style={{ borderColor: accent, color: accent }}
                        >
                          {person.firstName?.[0]}
                          {person.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {person.firstName} {person.lastName}
                          </p>
                          <p className="font-mono text-xs text-ink-faint tabular">
                            {person.birthDate
                              ? new Date(person.birthDate).getFullYear()
                              : "Date inconnue"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : query.trim() ? (
                <p className="text-sm text-ink-faint">
                  Aucun profil ne correspond à votre recherche.
                </p>
              ) : (
                <p className="text-sm text-ink-faint">
                  Commencez par saisir un nom pour afficher des profils.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col bg-paper-warm">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-ink-line bg-paper px-3 sm:gap-3 sm:px-4">
        <button
          onClick={() => setSelectedPerson(null)}
          aria-label="Changer de personne"
          className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-ink-line px-3 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Changer de personne</span>
        </button>
        <div className="min-w-0">
          <p className="meta-label">Arbre cible</p>
          <p className="truncate text-sm font-medium text-ink">
            {selectedPerson.firstName} {selectedPerson.lastName}
          </p>
        </div>
        <div className="flex-1" />
        <Link href="/export" className="shrink-0">
          <button
            aria-label="Exporter PDF"
            className="flex h-9 items-center gap-1.5 rounded-full border border-ink-line px-3 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Exporter PDF</span>
          </button>
        </Link>
      </div>

      <div className="flex-1 overflow-hidden">
        <FamilyTree focusPersonId={selectedPerson.id} />
      </div>
    </div>
  );
}
