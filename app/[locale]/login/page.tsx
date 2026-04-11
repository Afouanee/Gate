"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const te = useTranslations("auth.errors");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/arbre";

  const [mode, setMode] = useState<"credentials" | "magic">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email, password, redirect: false, callbackUrl,
      });
      if (result?.error) {
        const message = result.error === "EMAIL_NOT_VERIFIED"
          ? "Vérifiez votre email avant de vous connecter."
          : te("invalidCredentials");
        toast({ title: "Erreur", description: message, variant: "destructive" });
      } else {
        router.push(callbackUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn("email", { email, redirect: false, callbackUrl });
      setMagicSent(true);
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer le lien.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-white flex">

      {/* ── Colonne gauche — déco ─────────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Cercles déco */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/10" />

        <div className="relative z-10 text-center">
          <img src="/favicon.ico" alt="Gate" className="w-16 h-16 rounded-2xl mx-auto mb-8 object-contain bg-white p-1" />
          <h2 className="text-4xl font-black font-heading text-white mb-4 leading-tight tracking-tight">
            Votre histoire,<br />préservée.
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            Explorez, construisez et partagez votre arbre généalogique avec les personnes qui comptent.
          </p>
        </div>
      </div>

      {/* ── Colonne droite — formulaire ──────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm" style={{ animation: "fade-in-scale 0.4s ease-out both" }}>

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <img src="/favicon.ico" alt="Gate" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-black font-heading text-lg">Gate</span>
          </div>

          <h1 className="text-2xl font-black font-heading mb-1 tracking-tight">Connexion</h1>
          <p className="text-sm text-zinc-400 mb-8">Content de vous revoir.</p>

          {/* Mode switch */}
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-full mb-6">
            {(["credentials", "magic"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {m === "magic" && <Sparkles className="h-3 w-3" />}
                {m === "credentials" ? "Mot de passe" : "Lien magique"}
              </button>
            ))}
          </div>

          {magicSent ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-zinc-600" />
              </div>
              <p className="font-semibold font-heading mb-1">Email envoyé</p>
              <p className="text-sm text-zinc-400">Vérifiez votre boîte mail et cliquez sur le lien.</p>
            </div>
          ) : mode === "credentials" ? (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full h-11 pl-9 pr-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 pl-9 pr-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>Se connecter <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full h-11 pl-9 pr-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <><Sparkles className="h-4 w-4" /> Recevoir le lien</>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-zinc-400 mt-6">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-zinc-900 font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
