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

const genderBorder: Record<string, string> = {
  MALE:    "border-blue-300 bg-blue-50",
  FEMALE:  "border-pink-300 bg-pink-50",
  OTHER:   "border-purple-300 bg-purple-50",
  UNKNOWN: "border-zinc-200 bg-white",
};

const genderText: Record<string, string> = {
  MALE:    "text-blue-700",
  FEMALE:  "text-pink-700",
  OTHER:   "text-purple-700",
  UNKNOWN: "text-zinc-500",
};

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeData>) {
  const birthYear = data.birthDate ? new Date(data.birthDate).getFullYear() : null;
  const deathYear = data.deathDate ? new Date(data.deathDate).getFullYear() : null;

  return (
    <div
      className={cn(
        "relative w-44 rounded-2xl bg-white cursor-pointer transition-all duration-200",
        "border-2 shadow-[0_2px_12px_rgba(0,0,0,0.07)]",
        genderBorder[data.gender] || genderBorder.UNKNOWN,
        selected         && "ring-2 ring-offset-2 ring-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.13)]",
        data.highlighted && "ring-2 ring-offset-1 ring-amber-400 scale-105",
        data.isCurrentUser && "border-zinc-800",
        "hover:shadow-[0_4px_20px_rgba(0,0,0,0.11)] hover:scale-[1.02]"
      )}
    >
      <Handle type="target" position={Position.Top}    className="!w-2 !h-2 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Right}  id="right" className="!w-2 !h-2 !border-0 !opacity-0" />
      <Handle type="target" position={Position.Left}   id="left"  className="!w-2 !h-2 !border-0 !opacity-0" />

      <div className="px-4 pt-5 pb-4 flex flex-col items-center gap-2">

        {/* Avatar */}
        <div className="relative">
          {data.photoUrl && !data.blurred ? (
            <img
              src={data.photoUrl}
              alt={`${data.firstName} ${data.lastName}`}
              className={cn("w-16 h-16 rounded-full object-cover border-2", genderBorder[data.gender])}
            />
          ) : (
            <div className={cn(
              "w-16 h-16 rounded-full border-2 flex items-center justify-center",
              genderBorder[data.gender],
              genderText[data.gender]
            )}>
              {data.blurred
                ? <EyeOff className="h-5 w-5 text-zinc-300" />
                : <span className="text-lg font-black font-heading">{getInitials(data.firstName, data.lastName)}</span>
              }
            </div>
          )}
          {/* Badge décédé */}
          {!data.isAlive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-zinc-400 border-2 border-white flex items-center justify-center text-[8px] text-white font-black">✝</span>
          )}
        </div>

        {/* Nom */}
        <div className="text-center w-full">
          <p className={cn("text-sm font-bold font-heading leading-tight truncate",
            data.blurred ? "blur-sm select-none" : "text-zinc-900"
          )}>
            {data.firstName}
          </p>
          <p className={cn("text-[11px] font-black font-heading uppercase tracking-wider truncate",
            data.blurred ? "blur-sm select-none" : "text-zinc-500"
          )}>
            {data.lastName}
          </p>
        </div>

        {/* Années */}
        {birthYear && !data.blurred && (
          <p className="text-[10px] text-zinc-400 tabular-nums">
            {birthYear}{deathYear ? ` – ${deathYear}` : ""}
          </p>
        )}

        {/* Badge Moi */}
        {data.isCurrentUser && (
          <span className="text-[9px] bg-zinc-900 text-white px-2.5 py-0.5 rounded-full font-bold tracking-wide">
            Moi
          </span>
        )}
      </div>
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
