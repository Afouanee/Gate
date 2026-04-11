import { requireSession } from "@/lib/session";
import { FamilyTree } from "@/components/tree/family-tree";
import Link from "next/link";
import { Download } from "lucide-react";

export default async function ArbrePage() {
  await requireSession();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
      {/* Toolbar */}
      <div className="shrink-0 h-12 border-b border-zinc-100 bg-white flex items-center px-4 gap-3">
        <h1 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Arbre généalogique</h1>
        <div className="flex-1" />
        <Link href="/export">
          <button className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors">
            <Download className="h-3.5 w-3.5" />
            Exporter PDF
          </button>
        </Link>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-hidden">
        <FamilyTree />
      </div>
    </div>
  );
}
