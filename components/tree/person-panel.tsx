"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Calendar, MapPin, ExternalLink, EyeOff, Loader2 } from "lucide-react";
import { formatDate, getAge } from "@/lib/utils";

interface PersonPanelProps {
  personId: string;
  onClose: () => void;
}

const genderAvatar: Record<string, string> = {
  MALE:    "border-blue-200 bg-blue-50 text-blue-700",
  FEMALE:  "border-pink-200 bg-pink-50 text-pink-700",
  OTHER:   "border-purple-200 bg-purple-50 text-purple-700",
  UNKNOWN: "border-zinc-200 bg-zinc-50 text-zinc-500",
};

export function PersonPanel({ personId, onClose }: PersonPanelProps) {
  const router = useRouter();
  const [person, setPerson]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/persons/${personId}`);
        if (res.ok) setPerson(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, [personId]);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-zinc-100 flex flex-col shadow-2xl z-10 animate-fade-in">

      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Profil</h3>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-900 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
          </div>
        ) : person ? (
          <div className="space-y-5">

            {/* Avatar + name */}
            <div className="text-center">
              {person.photoUrl ? (
                <img
                  src={person.photoUrl}
                  alt={`${person.firstName} ${person.lastName}`}
                  className="h-20 w-20 rounded-full object-cover border-2 border-zinc-200 mx-auto mb-3"
                />
              ) : (
                <div className={`h-20 w-20 rounded-full border-2 flex items-center justify-center text-xl font-black font-heading mx-auto mb-3 ${genderAvatar[person.gender] || genderAvatar.UNKNOWN}`}>
                  {person.firstName?.[0]}{person.lastName?.[0]}
                </div>
              )}
              <h2 className="text-lg font-black font-heading leading-tight">
                {person.firstName} <span className="uppercase">{person.lastName}</span>
              </h2>
              {person.gender !== "UNKNOWN" && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  {person.gender === "MALE" ? "Homme" : person.gender === "FEMALE" ? "Femme" : "Autre"}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 border-t border-zinc-100 pt-4">
              {person.birthDate ? (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="text-zinc-500">Né(e)</span>
                  <span className="font-medium text-zinc-900">{formatDate(person.birthDate)}</span>
                  {getAge(person.birthDate, person.deathDate) !== null && (
                    <span className="text-zinc-400 text-xs">({getAge(person.birthDate, person.deathDate)} ans)</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <EyeOff className="h-3.5 w-3.5" />
                  Date de naissance masquée
                </div>
              )}

              {person.deathDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="text-zinc-500">Décédé(e)</span>
                  <span className="font-medium text-zinc-900">{formatDate(person.deathDate)}</span>
                </div>
              )}

              {person.birthPlace && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="text-zinc-700">{person.birthPlace}</span>
                </div>
              )}
            </div>

            {/* Relations */}
            {(person.relationsAsSource?.length > 0 || person.relationsAsTarget?.length > 0) && (
              <div className="border-t border-zinc-100 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Relations</p>
                <div className="space-y-1.5">
                  {[...(person.relationsAsSource || []), ...(person.relationsAsTarget || [])].map((rel: any) => {
                    const related = rel.sourceId === person.id ? rel.target : rel.source;
                    if (!related) return null;
                    return (
                      <button
                        key={rel.id}
                        onClick={() => { onClose(); router.push(`/profil/${related.id}`); }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-50 transition-colors text-left"
                      >
                        <div className={`h-7 w-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${genderAvatar[related.gender] || genderAvatar.UNKNOWN}`}>
                          {related.firstName?.[0]}{related.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-zinc-900">{related.firstName} {related.lastName}</p>
                          <p className="text-[10px] text-zinc-400">
                            {rel.type === "PARENT_CHILD"
                              ? (rel.sourceId === person.id ? "Enfant" : "Parent")
                              : rel.type === "SPOUSE" ? "Conjoint(e)"
                              : rel.label || "Relation"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-400 text-sm text-center py-12">Profil introuvable</p>
        )}
      </div>

      {/* Footer */}
      {person && (
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={() => router.push(`/profil/${personId}`)}
            className="w-full h-9 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Voir le profil complet
          </button>
        </div>
      )}
    </div>
  );
}
