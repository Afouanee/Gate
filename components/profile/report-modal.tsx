"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag, Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ReportModalProps {
  personId: string;
  personFirstName: string;
  personLastName: string;
}

export function ReportModal({ personId, personFirstName, personLastName }: ReportModalProps) {
  const t = useTranslations("profile");
  const { toast } = useToast();
  const [open, setOpen]       = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, message, reporterEmail: email || undefined }),
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => { setOpen(false); setSent(false); setMessage(""); setEmail(""); }, 2000);
      } else {
        toast({ title: "Erreur", description: "Impossible d'envoyer le signalement.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full h-9 border border-zinc-200 rounded-lg flex items-center justify-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition-colors">
          <Flag className="h-3.5 w-3.5" />
          {t("report")}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reportTitle")}</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <p className="font-semibold text-zinc-900">{t("reportSuccess")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50 text-sm space-y-1">
              <div className="flex gap-3">
                <span className="text-zinc-400 w-14 shrink-0 text-xs">Profil</span>
                <span className="font-semibold text-zinc-900">{personFirstName} {personLastName}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-zinc-400 w-14 shrink-0 text-xs">ID</span>
                <span className="font-mono text-xs text-zinc-500">{personId}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                Email <span className="font-normal normal-case">(optionnel, pour suivi)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                {t("reportMessage")} *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez l'erreur ou la modification souhaitée..."
                required
                minLength={10}
                rows={4}
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
                {t("reportSubmit")}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
