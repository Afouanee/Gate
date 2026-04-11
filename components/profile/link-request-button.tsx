"use client";

import { useState } from "react";
import { Link2, Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface LinkRequestButtonProps {
  personId: string;
  personName: string;
}

export function LinkRequestButton({ personId, personName }: LinkRequestButtonProps) {
  const { toast } = useToast();
  const [open, setOpen]       = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch("/api/link-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, message }),
      });
      const data = await res.json();

      if (res.ok) {
        setSent(true);
        setTimeout(() => { setOpen(false); setSent(false); }, 2000);
      } else {
        const msg =
          data.error === "ALREADY_LINKED"        ? "Vous êtes déjà rattaché à un profil." :
          data.error === "REQUEST_PENDING"        ? "Vous avez déjà une demande en attente." :
          data.error === "PERSON_ALREADY_LINKED"  ? "Ce profil est déjà rattaché à un utilisateur." :
          "Une erreur est survenue.";
        toast({ title: "Erreur", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full h-9 border border-zinc-200 rounded-lg flex items-center justify-center gap-1.5 text-sm font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors">
          <Link2 className="h-3.5 w-3.5" />
          Demander le rattachement
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demande de rattachement</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <p className="font-semibold text-zinc-900">Demande envoyée !</p>
            <p className="text-sm text-zinc-400 mt-1">Un administrateur examinera votre demande.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50 text-sm">
              <p className="text-xs text-zinc-400 mb-0.5">Profil sélectionné</p>
              <p className="font-semibold text-zinc-900">{personName}</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                Message * <span className="font-normal normal-case">(min. 10 caractères)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Expliquez pourquoi vous souhaitez vous rattacher à ce profil..."
                required
                minLength={10}
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors">
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || message.length < 10}
                className="h-9 px-4 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Envoyer
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
