import { Loader2 } from "lucide-react";

export default function ArbreLoading() {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-gold-500" />
        <p className="text-muted-foreground text-sm">Chargement de l'arbre généalogique...</p>
      </div>
    </div>
  );
}
