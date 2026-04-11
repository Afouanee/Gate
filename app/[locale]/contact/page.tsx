"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Send, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const t = useTranslations("contact");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSent(true);
      else toast({ title: "Erreur", description: t("error"), variant: "destructive" });
    } catch {
      toast({ title: "Erreur", description: t("error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-white">

      <div className="container mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-20 items-start">

          {/* ── Colonne gauche ─────────────────────────── */}
          <div className="lg:col-span-2" style={{ animation: "fade-in 0.5s ease-out both" }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Contact</p>
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-black font-heading tracking-tight leading-tight mb-6">
              On vous répond.
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed mb-12">
              Une question, un problème, une suggestion ? Écrivez-nous.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Email direct</p>
                  <p className="text-sm text-zinc-700">contact@gate.afouanee.dev</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                  <span className="text-sm">⏱</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Délai de réponse</p>
                  <p className="text-sm text-zinc-700">Sous 24h en jours ouvrés</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Formulaire ─────────────────────────────── */}
          <div className="lg:col-span-3" style={{ animation: "fade-in 0.5s 0.15s ease-out both" }}>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-zinc-700" />
                </div>
                <h2 className="text-2xl font-black font-heading mb-2">Message envoyé</h2>
                <p className="text-sm text-zinc-400">On vous répondra dans les plus brefs délais.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { id: "name",  label: "Nom",   type: "text",  placeholder: "Jean Dupont",   field: "name" as const },
                    { id: "email", label: "Email",  type: "email", placeholder: "jean@email.com", field: "email" as const },
                  ].map(({ id, label, type, placeholder, field }) => (
                    <div key={id}>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                        {label}
                      </label>
                      <input
                        id={id}
                        type={type}
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        placeholder={placeholder}
                        required
                        className="w-full h-11 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                    Sujet
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="En quelques mots..."
                    required
                    minLength={3}
                    className="w-full h-11 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre demande..."
                    required
                    minLength={10}
                    rows={7}
                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full h-11 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>Envoyer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
