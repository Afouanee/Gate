"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { EyeOff } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface PersonNodeData {
  id: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  birthDate: string | null;
  deathDate: string | null;
  isAlive: boolean;
  photoUrl: string | null;
  blurred?: boolean;
  isCurrentUser?: boolean;
  highlighted?: boolean;
}

/**
 * Marque de genre par un FILET coloré sobre (pas de fond saturé) — cohérent DA.
 * Teintes désaturées, chaudes, lisibles sur papier.
 */
const genderAccent: Record<string, string> = {
  MALE:    "#3F5B72", // ardoise bleutée sourde
  FEMALE:  "#8A4A52", // vieux rose sourd
  OTHER:   "#5E5070", // prune sourde
  UNKNOWN: "#8A8378", // encre estompée
};

const genderLabel: Record<string, string> = {
  MALE: "♂",
  FEMALE: "♀",
  OTHER: "⚥",
  UNKNOWN: "·",
};

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeData>) {
  const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : null;
  const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : null;
  const accent = genderAccent[data.gender] || genderAccent.UNKNOWN;

  return (
    <div
      className={cn(
        "group relative w-44 overflow-hidden rounded-[var(--radius)] bg-card cursor-pointer",
        "border border-ink-line shadow-paper transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-paper-md hover:border-ink/40",
        selected && "ring-2 ring-seal ring-offset-2 ring-offset-paper-warm shadow-paper-md",
        data.highlighted && "ring-2 ring-patina ring-offset-2 ring-offset-paper-warm",
        data.isCurrentUser && "border-ink"
      )}
    >
      {/* Filet de genre en tête de carte */}
      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: accent }} />

      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !opacity-0" />
      {/* Ports latéraux pour le lien conjoint (trait droit horizontal).
          Chaque côté a un handle source ET target pour pouvoir relier dans les deux sens. */}
      <Handle type="source" id="right" position={Position.Right} className="!h-2 !w-2 !border-0 !opacity-0" />
      <Handle type="target" id="right" position={Position.Right} className="!h-2 !w-2 !border-0 !opacity-0" />
      <Handle type="source" id="left" position={Position.Left} className="!h-2 !w-2 !border-0 !opacity-0" />
      <Handle type="target" id="left" position={Position.Left} className="!h-2 !w-2 !border-0 !opacity-0" />

      <div className="flex flex-col items-center gap-2 px-4 pb-4 pt-5">
        {/* Avatar */}
        <div className="relative">
          {data.photoUrl && !data.blurred ? (
            <img
              src={data.photoUrl}
              alt={`${data.firstName} ${data.lastName}`}
              className="h-16 w-16 rounded-full border-2 object-cover"
              style={{ borderColor: accent }}
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 bg-paper-warm"
              style={{ borderColor: accent, color: accent }}
            >
              {data.blurred ? (
                <EyeOff className="h-5 w-5 text-ink-faint" strokeWidth={1.75} />
              ) : (
                <span className="font-serif text-lg font-semibold">
                  {getInitials(data.firstName, data.lastName)}
                </span>
              )}
            </div>
          )}
          {/* Genre */}
          <span
            className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border border-ink-line bg-card text-[11px] leading-none"
            style={{ color: accent }}
            aria-hidden
          >
            {genderLabel[data.gender]}
          </span>
          {/* Décédé */}
          {!data.isAlive && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-ink-line bg-card text-[10px] font-semibold text-ink-faint">
              ✝
            </span>
          )}
        </div>

        {/* Nom */}
        <div className="w-full text-center">
          <p
            className={cn(
              "truncate font-serif text-sm font-semibold leading-tight",
              data.blurred ? "select-none blur-sm" : "text-ink"
            )}
          >
            {data.firstName}
          </p>
          <p
            className={cn(
              "truncate font-mono text-[10px] uppercase tracking-[0.12em]",
              data.blurred ? "select-none blur-sm" : "text-ink-faint"
            )}
          >
            {data.lastName}
          </p>
        </div>

        {/* Années */}
        {birthYear && !data.blurred && (
          <p className="font-mono text-[10px] text-ink-faint tabular">
            {birthYear}
            {deathYear ? ` – ${deathYear}` : ""}
          </p>
        )}

        {/* Badge Moi */}
        {data.isCurrentUser && (
          <span className="seal-badge bg-seal text-paper">Moi</span>
        )}
      </div>
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
