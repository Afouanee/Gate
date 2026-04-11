"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PricingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isPremium = session?.user?.role === "PREMIUM";
  const isAdmin   = session?.user?.role === "ADMIN";

  const handleCheckout = async () => {
    if (!session) { window.location.href = "/login?callbackUrl=/pricing"; return; }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast({ title: "Erreur", description: "Impossible de démarrer le paiement.", variant: "destructive" });
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-white py-24 px-6">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="text-center mb-20" style={{ animation: "fade-in 0.5s ease-out both" }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">Tarifs</p>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-black font-heading tracking-[-0.03em] leading-tight mb-4">
            Simple et transparent.
          </h1>
          <p className="text-zinc-400 text-base">Commencez gratuitement. Passez Premium quand vous voulez.</p>
        </div>

        {/* Banner premium actif */}
        {(isPremium || isAdmin) && (
          <div className="mb-10 p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center gap-4 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-zinc-700">
              {isAdmin ? "Administrateur — accès total activé." : "Votre abonnement Premium est actif."}
            </p>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-20">

          {/* FREE */}
          <div
            className="border border-zinc-200 rounded-3xl p-8"
            style={{ animation: "fade-in 0.5s 0.1s ease-out both" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6">Gratuit</p>
            <div className="mb-6">
              <span className="text-5xl font-black font-heading tracking-tight">0 €</span>
              <span className="text-zinc-400 text-sm ml-2">pour toujours</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "5 recherches / mois",
                "10 profils maximum",
                "1 export PDF",
                "Arbre partiel",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-600">
                  <div className="w-5 h-5 rounded-full border border-zinc-200 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-zinc-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            {session ? (
              <div className="w-full h-11 flex items-center justify-center text-sm text-zinc-400 border border-zinc-200 rounded-full">
                Plan actuel
              </div>
            ) : (
              <Link
                href="/register"
                className="group w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold border border-zinc-900 text-zinc-900 rounded-full hover:bg-zinc-900 hover:text-white transition-all duration-200"
              >
                Commencer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          {/* PREMIUM */}
          <div
            className="border-2 border-zinc-900 rounded-3xl p-8 bg-zinc-900 text-white relative"
            style={{ animation: "fade-in 0.5s 0.2s ease-out both" }}
          >
            <div className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest bg-white text-zinc-900 px-2.5 py-1 rounded-full">
              ✦ Recommandé
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">Premium</p>
            <div className="mb-6">
              <span className="text-5xl font-black font-heading tracking-tight">3,99 €</span>
              <span className="text-zinc-500 text-sm ml-2">/ 3 mois</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Recherches illimitées",
                "Profils illimités",
                "Exports PDF illimités",
                "Arbre complet",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                  <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            {isPremium || isAdmin ? (
              <div className="w-full h-11 flex items-center justify-center text-sm text-zinc-500 border border-zinc-700 rounded-full">
                {isPremium ? "Actif" : "Administrateur"}
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="group w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold bg-white text-zinc-900 rounded-full hover:bg-zinc-100 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>Passer Premium <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
            )}

            <p className="text-[11px] text-zinc-600 text-center mt-4">
              Paiement via Stripe · Résiliable à tout moment
            </p>
          </div>

        </div>

        {/* FAQ minimaliste */}
        <div className="max-w-xl mx-auto" style={{ animation: "fade-in 0.5s 0.3s ease-out both" }}>
          <h2 className="text-xl font-black font-heading tracking-tight mb-8 text-center">Questions</h2>
          <div className="space-y-px">
            {[
              {
                q: "Puis-je annuler à tout moment ?",
                a: "Oui. L'annulation prend effet à la fin de la période en cours.",
              },
              {
                q: "Que se passe-t-il si mon paiement échoue ?",
                a: "Vous recevrez un email et votre compte repasse automatiquement en gratuit.",
              },
              {
                q: "Mes données sont-elles conservées si je downgrade ?",
                a: "Oui, tous vos profils et relations sont conservés, mais l'accès est limité.",
              },
            ].map((item, i) => (
              <div key={i} className="py-5 border-b border-zinc-100">
                <p className="font-semibold font-heading text-sm mb-1.5">{item.q}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
