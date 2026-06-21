"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, Loader2, CheckCircle, ArrowRight, Clock } from "lucide-react";
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
      else toast({ title: t("errorTitle"), description: t("error"), variant: "destructive" });
    } catch {
      toast({ title: t("errorTitle"), description: t("error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper">

      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-start">

          {/* ── Colonne gauche ─────────────────────────── */}
          <div className="lg:col-span-2" style={{ animation: "fade-in 0.5s ease-out both" }}>
            <span className="section-no mb-4 block">{t("sectionNo")}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-6">
              {t("heading")}
            </h1>
            <p className="text-sm text-ink-soft leading-relaxed mb-10">
              {t("intro")}
            </p>

            <div className="rule-line mb-8" />

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-paper-deep flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="meta-label mb-1">{t("directEmailLabel")}</p>
                  <p className="text-sm text-ink">{t("directEmail")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-paper-deep flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="meta-label mb-1">{t("responseDelayLabel")}</p>
                  <p className="text-sm text-ink">{t("responseDelay")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Formulaire ─────────────────────────────── */}
          <div className="lg:col-span-3" style={{ animation: "fade-in 0.5s 0.15s ease-out both" }}>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-seal-tint flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-seal" strokeWidth={1.75} />
                </div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight mb-2">{t("sentTitle")}</h2>
                <p className="text-sm text-ink-soft">{t("sentBody")}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { id: "name",  label: t("fieldName"),  type: "text",  placeholder: t("namePlaceholder"),  field: "name" as const,  autoComplete: "name" },
                    { id: "email", label: t("fieldEmail"), type: "email", placeholder: t("emailPlaceholder"), field: "email" as const, autoComplete: "email" },
                  ].map(({ id, label, type, placeholder, field, autoComplete }) => (
                    <div key={id}>
                      <label htmlFor={id} className="meta-label mb-1.5 block">
                        {label}
                      </label>
                      <input
                        id={id}
                        type={type}
                        autoComplete={autoComplete}
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        placeholder={placeholder}
                        required
                        className="w-full h-11 px-4 rounded-[var(--radius)] border border-ink-line bg-card text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label htmlFor="subject" className="meta-label mb-1.5 block">
                    {t("subject")}
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={t("subjectPlaceholder")}
                    required
                    minLength={3}
                    className="w-full h-11 px-4 rounded-[var(--radius)] border border-ink-line bg-card text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="meta-label mb-1.5 block">
                    {t("message")}
                  </label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t("messagePlaceholder")}
                    required
                    minLength={10}
                    rows={7}
                    className="w-full px-4 py-3 rounded-[var(--radius)] border border-ink-line bg-card text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full h-11 bg-ink text-paper text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-ink-soft active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : (
                    <>{t("submit")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} /></>
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
