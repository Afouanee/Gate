"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Loader2, CheckCircle, AlertTriangle, ArrowRight, Link2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-100 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function MonComptePage() {
  const t = useTranslations("account");
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/stripe/subscription")
        .then((r) => r.json())
        .then(setSubscription)
        .catch(() => {});
    }
  }, [session?.user?.id]);

  const handleCheckout = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setLoading(true);
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      toast({ title: "Erreur", description: "Impossible de supprimer le compte.", variant: "destructive" });
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100svh-4rem)] bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!session) return null;

  const isPremium = session.user.role === "PREMIUM";
  const isAdmin   = session.user.role === "ADMIN";
  const initial = (session.user.name || session.user.email || "?")[0].toUpperCase();

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-white py-16 px-6">
      <div className="container mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-10" style={{ animation: "fade-in 0.4s ease-out both" }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Mon compte</p>
          <h1 className="text-3xl font-black font-heading tracking-tight">
            {session.user.name || "Votre espace"}
          </h1>
        </div>

        <div className="space-y-4">

          {/* Profil */}
          <Section title="Profil">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xl font-black font-heading shrink-0">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-zinc-900">{session.user.name || "Sans nom"}</p>
                <p className="text-sm text-zinc-400">{session.user.email}</p>
                <div className="mt-1.5">
                  {isAdmin && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-zinc-900 text-white">
                      Admin
                    </span>
                  )}
                  {isPremium && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-zinc-200 text-zinc-600">
                      <Crown className="h-2.5 w-2.5" /> Premium
                    </span>
                  )}
                  {!isPremium && !isAdmin && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-zinc-100 text-zinc-500">
                      Gratuit
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Abonnement */}
          <Section title="Abonnement">
            {isPremium || isAdmin ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-zinc-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {isAdmin ? "Accès administrateur" : "Premium actif"}
                    </p>
                    {subscription?.stripeCurrentPeriodEnd && (
                      <p className="text-xs text-zinc-400">
                        Renouvellement le {formatDate(subscription.stripeCurrentPeriodEnd)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-zinc-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Recherches illimitées", "Exports PDF illimités", "Arbre complet"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="w-1 h-1 rounded-full bg-zinc-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-500">Vous êtes sur le plan gratuit.</p>
                <div className="border border-zinc-900 rounded-2xl p-5 bg-zinc-900 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-black font-heading text-base">Gate Premium</p>
                      <p className="text-zinc-400 text-xs">3,99 € / 3 mois</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-white text-zinc-900 px-2 py-0.5 rounded-full">✦ Pro</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full h-10 bg-white text-zinc-900 text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all duration-150 disabled:opacity-40"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>Passer Premium <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Rattachement */}
          <Section title="Rattachement profil">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Liez votre compte à un profil de l'arbre.</p>
              <Link
                href="/rattachement"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 hover:underline"
              >
                Gérer
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Section>

          {/* Supprimer le compte */}
          <Section title="Zone de danger">
            <div className="space-y-4">
              {deleteConfirm && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Cette action est irréversible. Vos données seront anonymisées.
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-full hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-150 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {deleteConfirm ? "Confirmer la suppression" : "Supprimer mon compte"}
                </button>
                {deleteConfirm && (
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
