"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GateMark, Logo } from "@/components/brand/logo";

export default function LoginPage() {
  const te = useTranslations("auth.errors");
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/arbre";

  const [mode, setMode] = useState<"credentials" | "magic">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        const message =
          result.error === "EMAIL_NOT_VERIFIED"
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
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le lien.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-4rem)] bg-paper">

      {/* ── Colonne gauche — couverture de registre ─────── */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink p-14 text-paper lg:flex">
        <div className="flex items-center justify-between">
          <Logo size={26} className="text-paper" seal={false} />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/40">
            Le registre
          </span>
        </div>

        {/* Filet + monogramme filigrane */}
        <GateMark
          size={420}
          seal={false}
          className="pointer-events-none absolute -right-24 bottom-0 text-paper/[0.04]"
        />

        <div className="relative z-10 max-w-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-seal-bright">
            № · Accès
          </span>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight">
            Votre histoire,
            <br />
            <span className="italic">préservée.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-paper/50">
            Reprenez le fil de votre arbre, là où vous l&apos;avez laissé.
          </p>
        </div>

        <p className="relative z-10 font-serif text-sm italic text-paper/40">
          « Dis-moi qui tu es, je te dirai d&apos;où tu viens. »
        </p>
      </aside>

      {/* ── Colonne droite — formulaire ──────────────────── */}
      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-sm" style={{ animation: "fade-in-scale 0.5s both" }}>

          <div className="mb-10 lg:hidden">
            <Logo size={26} />
          </div>

          <span className="section-no">№ · Connexion</span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Content de vous revoir.
          </h1>

          {/* Sélecteur de mode */}
          <div className="mt-8 mb-6 flex gap-1 rounded-full border border-ink-line p-1">
            {(["credentials", "magic"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-all duration-200 ${
                  mode === m
                    ? "bg-ink text-paper"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                {m === "magic" && <Sparkles className="h-3 w-3" strokeWidth={1.75} />}
                {m === "credentials" ? "Mot de passe" : "Lien magique"}
              </button>
            ))}
          </div>

          {magicSent ? (
            <div className="py-10 text-center" role="status">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-seal-tint">
                <Mail className="h-6 w-6 text-seal" strokeWidth={1.75} />
              </span>
              <p className="font-serif text-lg font-semibold">Email envoyé</p>
              <p className="mt-1 text-sm text-ink-soft">
                Vérifiez votre boîte mail et cliquez sur le lien.
              </p>
            </div>
          ) : mode === "credentials" ? (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <Field label="Email" htmlFor="email">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.75} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="input-archive pl-9 pr-4"
                />
              </Field>

              <Field label="Mot de passe" htmlFor="password">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.75} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-archive pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </Field>

              <SubmitButton loading={loading}>
                Se connecter <ArrowRight className="h-4 w-4" />
              </SubmitButton>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <Field label="Email" htmlFor="magic-email">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.75} />
                <input
                  id="magic-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="input-archive pl-9 pr-4"
                />
              </Field>
              <SubmitButton loading={loading}>
                <Sparkles className="h-4 w-4" /> Recevoir le lien
              </SubmitButton>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-ink-faint">
            Pas encore de compte ?{" "}
            <Link href="/register" className="link-underline font-medium text-ink">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>

      <FieldStyles />
    </div>
  );
}

/* ── sous-composants locaux ───────────────────────────── */

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block meta-label">
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

/** Style partagé des inputs auth (évite la répétition de classes) */
function FieldStyles() {
  return (
    <style>{`
      .input-archive {
        width: 100%;
        height: 2.75rem;
        border-radius: 9999px;
        border: 1px solid hsl(var(--input));
        background: hsl(var(--card));
        font-size: 0.875rem;
        color: hsl(var(--foreground));
        transition: border-color .15s, box-shadow .15s;
      }
      .input-archive::placeholder { color: #8A8378; }
      .input-archive:focus {
        outline: none;
        border-color: #7A2E2E;
        box-shadow: 0 0 0 3px rgba(122,46,46,0.12);
      }
    `}</style>
  );
}
