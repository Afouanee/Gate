"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Download, ArrowLeftRight, Loader2 } from "lucide-react";
import { FamilyTree } from "./family-tree";

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
        const res = await fetch(`/api/persons?q=${encodeURIComponent(query)}&limit=8`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.persons || []);
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
      <div className="h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <div className="border border-zinc-200 rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">Arbre genealogique</p>
            <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight text-zinc-900 mb-3">
              Rechercher une personne pour ouvrir son arbre
            </h1>
            <p className="text-sm md:text-base text-zinc-500 mb-8">
              Selectionnez un profil pour afficher l’arbre associe et centrer directement la vue sur cette personne.
            </p>

            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un prenom ou un nom..."
                className="w-full h-16 rounded-2xl border border-zinc-200 pl-14 pr-5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="mt-5 min-h-20">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recherche en cours...
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => setSelectedPerson(person)}
                      className="w-full flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3 text-left hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
                    >
                      <div className="h-11 w-11 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center text-sm font-black text-zinc-700">
                        {person.firstName?.[0]}{person.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{person.firstName} {person.lastName}</p>
                        <p className="text-xs text-zinc-400">
                          {person.birthDate ? new Date(person.birthDate).getFullYear() : "Date inconnue"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <p className="text-sm text-zinc-400">Aucun profil ne correspond a votre recherche.</p>
              ) : (
                <p className="text-sm text-zinc-400">Commencez par saisir un nom pour afficher des profils.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
      <div className="shrink-0 h-14 border-b border-zinc-100 bg-white flex items-center px-4 gap-3">
        <button
          onClick={() => setSelectedPerson(null)}
          className="h-9 px-3 flex items-center gap-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          Changer de personne
        </button>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Arbre cible</p>
          <p className="text-sm font-semibold text-zinc-900 truncate">{selectedPerson.firstName} {selectedPerson.lastName}</p>
        </div>
        <div className="flex-1" />
        <Link href="/export">
          <button className="h-9 px-3 flex items-center gap-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors">
            <Download className="h-3.5 w-3.5" />
            Exporter PDF
          </button>
        </Link>
      </div>

      <div className="flex-1 overflow-hidden">
        <FamilyTree focusPersonId={selectedPerson.id} />
      </div>
    </div>
  );
}
