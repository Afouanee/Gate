import { Loader2 } from "lucide-react";

export default function ArbreLoading() {
  return (
    <div className="flex h-[calc(100svh-4rem)] items-center justify-center bg-paper-warm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-ink-faint" />
        <p className="meta-label">Chargement de l&apos;arbre…</p>
      </div>
    </div>
  );
}
