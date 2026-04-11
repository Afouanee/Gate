"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "form" | "verify";

export default function RegisterPage() {
  const te = useTranslations("auth.errors");
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [verifyEmail, setVerifyEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Erreur", description: te("passwordMismatch"), variant: "destructive" });
      return;
    }
    if (formData.password.length < 8) {
      toast({ title: "Erreur", description: te("weakPassword"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error === "EMAIL_EXISTS" ? te("emailExists")
          : data.error === "DISPOSABLE_EMAIL" ? te("disposableEmail")
          : "Une erreur est survenue.";
        toast({ title: "Erreur", description: msg, variant: "destructive" });
        return;
      }
      setVerifyEmail(data.email);
      setStep("verify");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) document.getElementById(`code-${index + 1}`)?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, code: fullCode }),
      });
      await res.json();
      if (!res.ok) {
        toast({ title: "Code invalide", description: te("codeExpired"), variant: "destructive" });
        return;
      }
      toast({ title: "Email vérifié !", description: "Vous pouvez maintenant vous connecter." });
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-white flex">

      {/* ── Colonne gauche — déco ─────────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/10" />

        <div className="relative z-10 text-center">
          <img src="/favicon.ico" alt="Gate" className="w-16 h-16 rounded-2xl mx-auto mb-8 object-contain bg-white p-1" />
          <h2 className="text-4xl font-black font-heading text-white mb-4 leading-tight tracking-tight">
            Commencez<br />votre voyage.
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            Gratuit pour toujours. Passez Premium quand vous êtes prêt.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {["Inscription en 2 minutes", "Email vérifié, données sécurisées", "Arbre interactif inclus"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="text-sm text-zinc-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Colonne droite ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm" style={{ animation: "fade-in-scale 0.4s ease-out both" }}>

          <div className="lg:hidden flex items-center gap-2 mb-10">
            <img src="/favicon.ico" alt="Gate" className="h-8 w-8 rounded-lg object-contain" />
            <span className="font-black font-heading text-lg">Gate</span>
          </div>

          {step === "form" ? (
            <>
              <h1 className="text-2xl font-black font-heading mb-1 tracking-tight">Créer un compte</h1>
              <p className="text-sm text-zinc-400 mb-8">C'est gratuit, pour toujours.</p>

              <form onSubmit={handleRegister} className="space-y-4">
                {[
                  { id: "name",  label: "Nom",             type: "text",     icon: User, placeholder: "Jean Dupont",       field: "name" as const },
                  { id: "email", label: "Email",            type: "email",    icon: Mail, placeholder: "votre@email.com",   field: "email" as const },
                  { id: "pwd",   label: "Mot de passe",     type: "password", icon: Lock, placeholder: "Minimum 8 caractères", field: "password" as const },
                  { id: "cpwd",  label: "Confirmer",        type: "password", icon: Lock, placeholder: "Répéter le mot de passe", field: "confirmPassword" as const },
                ].map(({ id, label, type, icon: Icon, placeholder, field }) => (
                  <div key={id}>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                      {label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input
                        id={id}
                        type={type}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        placeholder={placeholder}
                        required
                        minLength={field === "password" || field === "confirmPassword" ? 8 : 2}
                        className="w-full h-11 pl-9 pr-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>Créer mon compte <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>

                <p className="text-center text-xs text-zinc-400 pt-1">
                  Déjà un compte ?{" "}
                  <Link href="/login" className="text-zinc-900 font-semibold hover:underline">
                    Se connecter
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-zinc-700" />
                </div>
                <div>
                  <h1 className="text-xl font-black font-heading tracking-tight">Vérification</h1>
                  <p className="text-xs text-zinc-400">Code envoyé à {verifyEmail}</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4 block">
                    Entrez le code à 6 chiffres
                  </label>
                  <div className="flex gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !digit && index > 0) {
                            document.getElementById(`code-${index - 1}`)?.focus();
                          }
                        }}
                        className="flex-1 h-14 text-center text-2xl font-black font-heading border border-zinc-200 rounded-xl bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.join("").length !== 6}
                  className="w-full h-11 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <><CheckCircle className="h-4 w-4" /> Vérifier</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/resend-code", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: verifyEmail }),
                    });
                    toast({ title: "Code renvoyé", description: "Vérifiez votre boîte mail." });
                  }}
                  className="w-full text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Renvoyer le code
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
