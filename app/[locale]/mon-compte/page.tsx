"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Loader2, CheckCircle, AlertTriangle, ArrowRight, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden">
      <div className="px-6 py-4 border-b border-ink-line bg-paper-warm">
        <h2 className="meta-label">{title}</h2>
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
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.url) window.location.href = data.url;
      setLoading(false);
    } catch {
      toast({ title: "Erreur", description: "Connexion impossible, réessayez.", variant: "destructive" });
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        toast({ title: "Erreur", description: "Impossible de supprimer le compte.", variant: "destructive" });
        setLoading(false);
      }
    } catch {
      toast({ title: "Erreur", description: "Connexion impossible, réessayez.", variant: "destructive" });
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100svh-4rem)] bg-paper">
        <Loader2 className="h-6 w-6 animate-spin text-ink-faint" strokeWidth={1.75} />
      </div>
    );
  }

  if (!session) return null;

  const isPremium = session.user.role === "PREMIUM";
  const isAdmin   = session.user.role === "ADMIN";
  const initial = (session.user.name || session.user.email || "?")[0].toUpperCase();

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-10" style={{ animation: "fade-in 0.4s ease-out both" }}>
          <span className="section-no mb-2 block">№ · Mon compte</span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            {session.user.name || "Votre espace"}
          </h1>
        </div>

        <div className="space-y-4">

          {/* Profil */}
          <Section title="Profil">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-ink flex items-center justify-center text-paper text-xl font-serif font-semibold shrink-0">
                {initial}
              </div>
              <div>
                <p className="font-semibold text-ink">{session.user.name || "Sans nom"}</p>
                <p className="text-sm text-ink-soft">{session.user.email}</p>
                <div className="mt-1.5">
                  {isAdmin && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] bg-ink text-paper">
                      Admin
                    </span>
                  )}
                  {isPremium && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] bg-seal-tint text-seal">
                      <Crown className="h-2.5 w-2.5" strokeWidth={1.75} /> Premium
                    </span>
                  )}
                  {!isPremium && !isAdmin && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] bg-paper-deep text-ink-soft">
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
                  <div className="w-8 h-8 rounded-full bg-seal-tint flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-seal" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {isAdmin ? "Accès administrateur" : "Premium actif"}
                    </p>
                    {subscription?.stripeCurrentPeriodEnd && (
                      <p className="text-xs text-ink-faint">
                        Renouvellement le <span className="tabular">{formatDate(subscription.stripeCurrentPeriodEnd)}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-ink-line pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Recherches illimitées", "Exports PDF illimités", "Arbre complet"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-ink-soft">
                      <span className="w-1 h-1 rounded-full bg-seal shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-ink-soft">Vous êtes sur le plan gratuit.</p>
                <div className="rounded-[var(--radius)] p-5 bg-ink text-paper">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-serif font-semibold text-base">Gate Premium</p>
                      <p className="text-paper/60 text-xs"><span className="tabular">3,99 €</span> / 3 mois</p>
                    </div>
                    <span className="seal-badge bg-seal text-paper">✦ Pro</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full h-10 bg-seal hover:bg-seal-bright text-paper text-sm font-semibold rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : (
                      <>Passer Premium <ArrowRight className="h-4 w-4" strokeWidth={1.75} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Rattachement */}
          <Section title="Rattachement profil">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-soft">Liez votre compte à un profil de l'arbre.</p>
              <Link
                href="/rattachement"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-seal transition-colors"
              >
                Gérer
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
              </Link>
            </div>
          </Section>

          {/* Supprimer le compte */}
          <Section title="Zone de danger">
            <div className="space-y-4">
              {deleteConfirm && (
                <div className="flex items-center gap-3 p-4 rounded-[var(--radius)] border border-destructive/30 bg-seal-tint text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  Cette action est irréversible. Vos données seront anonymisées.
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-destructive border border-destructive/30 rounded-full hover:bg-destructive hover:text-paper hover:border-destructive transition-all duration-200 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : <Trash2 className="h-4 w-4" strokeWidth={1.75} />}
                  {deleteConfirm ? "Confirmer la suppression" : "Supprimer mon compte"}
                </button>
                {deleteConfirm && (
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
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
