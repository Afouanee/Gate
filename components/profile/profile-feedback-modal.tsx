"use client";

import { useState } from "react";
import { CheckCircle, Flag, Info, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ERROR_TYPES = [
  "Identite",
  "Dates",
  "Lieu",
  "Lien familial",
  "Photo",
  "Autre",
];

export function ProfileFeedbackModal({
  personId,
  personFirstName,
  personLastName,
  mode,
}: {
  personId: string;
  personFirstName: string;
  personLastName: string;
  mode: "ERROR" | "ADDITION";
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [errorType, setErrorType] = useState(ERROR_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isError = mode === "ERROR";

  const reset = () => {
    setMessage("");
    setEmail("");
    setErrorType(ERROR_TYPES[0]);
    setSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personId,
          type: mode,
          errorType: isError ? errorType : undefined,
          message,
          reporterEmail: email || undefined,
        }),
      });

      if (!res.ok) {
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer votre message.",
          variant: "destructive",
        });
        return;
      }

      setSent(true);
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>
        {isError ? (
          <button className="w-full h-10 border border-zinc-200 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 transition-colors">
            <Flag className="h-4 w-4" />
            Signaler une erreur
          </button>
        ) : (
          <button className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
            <p className="text-sm font-semibold text-emerald-900">Contribuer a enrichir ce profil</p>
            <p className="text-xs text-emerald-700 mt-1">Vous avez des informations complementaires sur cette personne ?</p>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isError ? "Signaler une erreur" : "Ajouter une information"}</DialogTitle>
          <DialogDescription>
            {isError
              ? `Aidez-nous a corriger le profil de ${personFirstName} ${personLastName}.`
              : `Partagez une information utile sur ${personFirstName} ${personLastName}.`}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <p className="font-semibold text-zinc-900">
              {isError ? "Signalement envoye avec succes." : "Contribution envoyee avec succes."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">Profil concerne</p>
              <p className="font-semibold text-zinc-900">{personFirstName} {personLastName}</p>
            </div>

            {isError && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                  Type d'erreur
                </label>
                <select
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  {ERROR_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                Email <span className="font-normal normal-case">(facultatif)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isError ? "Decrivez l'erreur constatee..." : "Partagez l'information complementaire..."}
                required
                minLength={10}
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-4 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || message.length < 10}
                className="h-9 px-4 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isError ? (
                  <Flag className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                {isError ? "Envoyer le signalement" : "Envoyer la contribution"}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
