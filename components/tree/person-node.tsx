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
  return (
    <div
      className={cn(
        "relative w-40 rounded-2xl border-2 bg-white cursor-pointer transition-all duration-200 shadow-sm",
        genderBorder[data.gender] || genderBorder.UNKNOWN,
        selected        && "ring-2 ring-zinc-900 ring-offset-2 shadow-lg",
        data.highlighted && "ring-2 ring-zinc-400 scale-105",
        data.isCurrentUser && "ring-2 ring-zinc-900 border-zinc-900",
        "hover:shadow-md hover:scale-[1.03]"
      )}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top}    className="!w-2 !h-2 !bg-zinc-300 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-zinc-300 !border-0 !opacity-0" />
      <Handle type="source" position={Position.Right}  id="right" className="!w-2 !h-2 !bg-indigo-300 !border-0 !opacity-0" />
      <Handle type="target" position={Position.Left}   id="left"  className="!w-2 !h-2 !bg-indigo-300 !border-0 !opacity-0" />

      <div className="p-3">
        {/* Avatar */}
        <div className="relative mx-auto mb-2.5 w-12 h-12">
          {data.photoUrl && !data.blurred ? (
            <img
              src={data.photoUrl}
              alt={`${data.firstName} ${data.lastName}`}
              className={cn("w-12 h-12 rounded-full object-cover border-2", genderBorder[data.gender])}
            />
          ) : (
            <div className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold font-heading",
              genderBorder[data.gender],
              genderText[data.gender]
            )}>
              {data.blurred
                ? <EyeOff className="h-4 w-4 text-zinc-300" />
                : <span className="text-xs">{getInitials(data.firstName, data.lastName)}</span>
              }
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <p className={cn("text-xs font-semibold font-heading truncate", data.blurred ? "blur-sm" : "text-zinc-900")}>
            {data.firstName}
          </p>
          <p className={cn("text-xs font-black font-heading truncate uppercase tracking-wide", data.blurred ? "blur-sm" : "text-zinc-700")}>
            {data.lastName}
          </p>
        </div>

        {/* Birth year */}
        {(data.birthDate || data.deathDate) && !data.blurred && (
          <p className="mt-1.5 text-center text-[10px] text-zinc-400">
            {data.birthDate ? new Date(data.birthDate).getFullYear() : "?"}
            {!data.isAlive && data.deathDate ? ` — ${new Date(data.deathDate).getFullYear()}` : ""}
          </p>
        )}

        {/* "Moi" badge */}
        {data.isCurrentUser && (
          <div className="mt-1.5 flex justify-center">
            <span className="text-[9px] bg-zinc-900 text-white px-2 py-0.5 rounded-full font-bold">Moi</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
