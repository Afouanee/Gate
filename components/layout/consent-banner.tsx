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
      <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 mb-0.5">{t("title")}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{t("message")}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 rounded-full border border-zinc-200 hover:border-zinc-400 transition-all duration-150"
          >
            {t("decline")}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-full hover:bg-zinc-700 transition-all duration-150"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
