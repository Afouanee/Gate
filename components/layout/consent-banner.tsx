"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

export function ConsentBanner() {
  const t = useTranslations("rgpd.consent");
  const { data: session } = useSession();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("gate_rgpd_consent")) setShow(true);
  }, []);

  const handleAccept = async () => {
    localStorage.setItem("gate_rgpd_consent", "accepted");
    setShow(false);
    if (session?.user?.id) {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rgpd", accepted: true }),
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem("gate_rgpd_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
      style={{ animation: "slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
    >
      <div className="flex w-full max-w-xl flex-col items-start gap-4 rounded-[var(--radius)] border border-ink-line bg-card p-5 shadow-paper-lg sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 font-serif text-sm font-semibold text-ink">{t("title")}</p>
          <p className="text-xs leading-relaxed text-ink-soft">{t("message")}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleDecline}
            className="rounded-full border border-ink-line px-4 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {t("decline")}
          </button>
          <button
            onClick={handleAccept}
            className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
