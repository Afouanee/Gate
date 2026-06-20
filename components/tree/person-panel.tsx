"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, MapPin, ExternalLink, EyeOff, Loader2, FileText } from "lucide-react";
import { formatDate, getAge } from "@/lib/utils";

interface PersonPanelProps {
  personId: string;
  onClose: () => void;
}

const genderAccent: Record<string, string> = {
  MALE: "#3F5B72",
  FEMALE: "#8A4A52",
  OTHER: "#5E5070",
  UNKNOWN: "#8A8378",
};

export function PersonPanel({ personId, onClose }: PersonPanelProps) {
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/persons/${personId}`);
        if (res.ok) setPerson(await res.json().catch(() => null));
      } catch {
        setPerson(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [personId]);

  // Fermeture au clavier (Échap)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const accent = person ? genderAccent[person.gender] || genderAccent.UNKNOWN : genderAccent.UNKNOWN;

  return (
    <aside
      role="dialog"
      aria-label="Aperçu du profil"
      className="absolute right-0 top-0 bottom-0 z-10 flex w-80 flex-col border-l border-ink-line bg-paper shadow-paper-lg animate-slide-in-right"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-line px-5 py-4">
        <span className="meta-label">Aperçu</span>
        <button
          onClick={onClose}
          aria-label="Fermer l'aperçu"
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius)] border border-ink-line text-ink-faint transition-colors hover:border-ink hover:text-ink"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 fade-bottom">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
          </div>
        ) : person ? (
          <div className="space-y-5">
            {/* Avatar + nom */}
            <div className="text-center">
              {person.photoUrl ? (
                <img
                  src={person.photoUrl}
                  alt={`${person.firstName} ${person.lastName}`}
                  className="mx-auto mb-3 h-20 w-20 rounded-full border-2 object-cover"
                  style={{ borderColor: accent }}
                />
              ) : (
                <div
                  className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 bg-paper-warm font-serif text-xl font-semibold"
                  style={{ borderColor: accent, color: accent }}
                >
                  {person.firstName?.[0]}
                  {person.lastName?.[0]}
                </div>
              )}
              <h2 className="font-serif text-lg font-semibold leading-tight">
                {person.firstName}{" "}
                <span className="uppercase">{person.lastName}</span>
              </h2>
              {person.gender !== "UNKNOWN" && (
                <p className="mt-0.5 text-xs text-ink-faint">
                  {person.gender === "MALE" ? "Homme" : person.gender === "FEMALE" ? "Femme" : "Autre"}
                </p>
              )}
            </div>

            {/* Détails */}
            <div className="space-y-2 border-t border-ink-line pt-4">
              {person.birthDate ? (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={1.75} />
                  <span className="text-ink-soft">Né(e)</span>
                  <span className="font-medium text-ink tabular">{formatDate(person.birthDate)}</span>
                  {getAge(person.birthDate, person.deathDate) !== null && (
                    <span className="text-xs text-ink-faint">
                      ({getAge(person.birthDate, person.deathDate)} ans)
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-ink-faint">
                  <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Date de naissance masquée
                </div>
              )}

              {person.deathDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={1.75} />
                  <span className="text-ink-soft">Décédé(e)</span>
                  <span className="font-medium text-ink tabular">{formatDate(person.deathDate)}</span>
                </div>
              )}

              {person.birthPlace && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-faint" strokeWidth={1.75} />
                  <span className="text-ink-soft">{person.birthPlace}</span>
                </div>
              )}

              {person.description ? (
                <div className="mt-3 rounded-[var(--radius)] border border-ink-line bg-paper-warm p-3">
                  <div className="mb-2 flex items-center gap-2 meta-label">
                    <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Informations essentielles
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-ink-soft line-clamp-4">
                    {person.description}
                  </p>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-xs text-ink-faint">
                  <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Certaines informations peuvent être masquées selon vos permissions.
                </div>
              )}
            </div>

            {/* Relations */}
            {(person.relationsAsSource?.length > 0 || person.relationsAsTarget?.length > 0) && (
              <div className="border-t border-ink-line pt-4">
                <p className="mb-2 meta-label">Relations</p>
                <div className="space-y-1">
                  {[...(person.relationsAsSource || []), ...(person.relationsAsTarget || [])].map(
                    (rel: any) => {
                      const related = rel.sourceId === person.id ? rel.target : rel.source;
                      if (!related) return null;
                      const relAccent = genderAccent[related.gender] || genderAccent.UNKNOWN;
                      return (
                        <button
                          key={rel.id}
                          onClick={() => {
                            onClose();
                            router.push(`/profil/${related.id}`);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-[var(--radius)] p-2 text-left transition-colors hover:bg-paper-warm"
                        >
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                            style={{ borderColor: relAccent, color: relAccent }}
                          >
                            {related.firstName?.[0]}
                            {related.lastName?.[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-ink">
                              {related.firstName} {related.lastName}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                              {rel.type === "PARENT_CHILD"
                                ? rel.sourceId === person.id
                                  ? "Enfant"
                                  : "Parent"
                                : rel.type === "SPOUSE"
                                ? "Conjoint(e)"
                                : rel.label || "Relation"}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-ink-faint">Profil introuvable</p>
        )}
      </div>

      {/* Footer */}
      {person && (
        <div className="border-t border-ink-line p-4">
          <button
            onClick={() => router.push(`/profil/${personId}`)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
            Voir en détail
          </button>
        </div>
      )}
    </aside>
  );
}
