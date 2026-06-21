"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GateMark, Logo } from "@/components/brand/logo";

type Step = "form" | "verify";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
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
      toast({ title: te("title"), description: te("passwordMismatch"), variant: "destructive" });
      return;
    }
    if (formData.password.length < 8) {
      toast({ title: te("title"), description: te("weakPassword"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data.error === "EMAIL_EXISTS"
            ? te("emailExists")
            : data.error === "DISPOSABLE_EMAIL"
            ? te("disposableEmail")
            : t("errorGeneric");
        toast({ title: te("title"), description: msg, variant: "destructive" });
        return;
      }
      setVerifyEmail(data.email);
      setStep("verify");
    } catch {
      toast({ title: te("title"), description: t("errorConnection"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) return;
    const newCode = [...code];
    newCode[index] = clean;
    setCode(newCode);
    if (clean && index < 5) document.getElementById(`code-${index + 1}`)?.focus();
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
      await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: t("codeInvalidTitle"), description: te("codeExpired"), variant: "destructive" });
        return;
      }
      toast({ title: t("verifiedTitle"), description: t("verifiedBody") });
      router.push("/login");
    } catch {
      toast({ title: te("title"), description: t("errorConnection"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const FIELDS = [
    { id: "name", label: t("fieldName"), type: "text", icon: User, placeholder: t("namePlaceholder"), field: "name" as const, autoComplete: "name" },
    { id: "email", label: t("fieldEmail"), type: "email", icon: Mail, placeholder: t("emailPlaceholder"), field: "email" as const, autoComplete: "email" },
    { id: "pwd", label: t("fieldPassword"), type: "password", icon: Lock, placeholder: t("passwordPlaceholder"), field: "password" as const, autoComplete: "new-password" },
    { id: "cpwd", label: t("fieldConfirm"), type: "password", icon: Lock, placeholder: t("confirmPlaceholder"), field: "confirmPassword" as const, autoComplete: "new-password" },
  ];

  return (
    <div className="flex min-h-[calc(100svh-4rem)] bg-paper">

      {/* ── Colonne gauche — couverture de registre ─────── */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ink p-14 text-paper lg:flex">
        <div className="flex items-center justify-between">
          <Logo size={26} className="text-paper" seal={false} />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/40">
            {t("asideRegister")}
          </span>
        </div>

        <GateMark
          size={420}
          seal={false}
          className="pointer-events-none absolute -right-24 bottom-0 text-paper/[0.04]"
        />

        <div className="relative z-10 max-w-sm">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-seal-bright">
            {t("asideLabel")}
          </span>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight">
            {t("asideTitleLine1")}
            <br />
            <span className="italic">{t("asideTitleLine2")}</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {[
              t("asideBenefit1"),
              t("asideBenefit2"),
              t("asideBenefit3"),
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-paper/60">
                <CheckCircle className="h-4 w-4 shrink-0 text-seal-bright" strokeWidth={1.75} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 font-serif text-sm italic text-paper/40">
          {t("asideFree")}
        </p>
      </aside>

      {/* ── Colonne droite ───────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-sm" style={{ animation: "fade-in-scale 0.5s both" }}>

          <div className="mb-10 lg:hidden">
            <Logo size={26} />
          </div>

          {step === "form" ? (
            <>
              <span className="section-no">{t("sectionNo")}</span>
              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
                {t("createTitle")}
              </h1>
              <p className="mt-2 text-sm text-ink-soft">{t("createSubtitle")}</p>

              <form onSubmit={handleRegister} className="mt-8 space-y-4">
                {FIELDS.map(({ id, label, type, icon: Icon, placeholder, field, autoComplete }) => (
                  <div key={id}>
                    <label htmlFor={id} className="mb-1.5 block meta-label">
                      {label}
                    </label>
                    <div className="relative">
                      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" strokeWidth={1.75} />
                      <input
                        id={id}
                        type={type}
                        autoComplete={autoComplete}
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        placeholder={placeholder}
                        required
                        minLength={field === "password" || field === "confirmPassword" ? 8 : 2}
                        className="input-archive pl-9"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <>{t("submit")} <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>

                <p className="pt-1 text-center text-xs text-ink-faint">
                  {t("alreadyAccount")}{" "}
                  <Link href="/login" className="link-underline font-medium text-ink">
                    {t("login")}
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-seal-tint">
                  <ShieldCheck className="h-5 w-5 text-seal" strokeWidth={1.75} />
                </span>
                <div>
                  <h1 className="font-serif text-xl font-semibold tracking-tight">{t("verifyTitle")}</h1>
                  <p className="text-xs text-ink-faint">{t("codeSentTo")} {verifyEmail}</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="mb-4 block meta-label">{t("enterCodeLabel")}</label>
                  <div className="flex gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !digit && index > 0) {
                            document.getElementById(`code-${index - 1}`)?.focus();
                          }
                        }}
                        className="h-14 flex-1 rounded-[var(--radius)] border border-ink-line bg-card text-center font-serif text-2xl font-semibold text-ink tabular transition-colors focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/40"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.join("").length !== 6}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    <><CheckCircle className="h-4 w-4" /> {t("verify")}</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch("/api/auth/resend-code", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: verifyEmail }),
                      });
                      toast({ title: t("codeResentTitle"), description: t("codeResentBody") });
                    } catch {
                      toast({ title: te("title"), description: t("errorConnection"), variant: "destructive" });
                    }
                  }}
                  className="link-underline mx-auto block text-xs text-ink-faint hover:text-ink"
                >
                  {t("resendCode")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Style partagé des inputs */}
      <style>{`
        .input-archive {
          width: 100%;
          height: 2.75rem;
          border-radius: 9999px;
          border: 1px solid hsl(var(--input));
          background: hsl(var(--card));
          padding-right: 1rem;
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
    </div>
  );
}
