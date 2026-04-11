import { Loader2 } from "lucide-react";

export default function ArbreLoading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        <p className="text-zinc-400 text-sm">Chargement de l'arbre...</p>
      </div>
    </div>
  );
}
