"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Search, Loader2, CheckCircle, XCircle, Clock, AlertCircle, ArrowRight, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Status = "PENDING" | "APPROVED" | "REJECTED";

export default function RattachementPage() {
  const t = useTranslations("linkRequest");
  const locale = useLocale();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const { data: session } = useSession();
  const { toast } = useToast();

  const statusConfig: Record<Status, { label: string; icon: any; color: string }> = {
    PENDING:  { label: t("statusPending"),  icon: Clock,       color: "bg-paper-deep text-ink-soft" },
    APPROVED: { label: t("statusApproved"), icon: CheckCircle, color: "bg-seal-tint text-seal" },
    REJECTED: { label: t("statusRejected"), icon: XCircle,     color: "border border-destructive/30 text-destructive bg-seal-tint" },
  };

  const [requests, setRequests]           = useState<any[]>([]);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [message, setMessage]             = useState("");
  const [loading, setLoading]             = useState(false);
  const [searching, setSearching]         = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    const res = await fetch("/api/link-requests");
    if (res.ok) setRequests(await res.json());
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json().catch(() => ({}));
      setSearchResults(data.results || []);
    } catch {
      toast({ title: t("errorTitle"), description: t("errorConnection"), variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || !message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/link-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: selectedPerson.id, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast({ title: t("requestSentTitle"), description: t("success") });
        setSelectedPerson(null); setMessage(""); setSearchQuery(""); setSearchResults([]);
        fetchRequests();
      } else {
        const msg = data.error === "ALREADY_LINKED"       ? t("alreadyLinked")
                  : data.error === "REQUEST_PENDING"      ? t("errorRequestPending")
                  : data.error === "PERSON_ALREADY_LINKED" ? t("errorPersonAlreadyLinked")
                  : t("error");
        toast({ title: t("errorTitle"), description: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: t("errorTitle"), description: t("errorConnection"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const hasPendingOrApproved = requests.some((r) => r.status === "PENDING" || r.status === "APPROVED");

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-10" style={{ animation: "fade-in 0.4s ease-out both" }}>
          <span className="section-no mb-2 block">{t("sectionNo")}</span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight mb-2">{t("title")}</h1>
          <p className="text-sm text-ink-soft">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Formulaire */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
              <div className="px-6 py-4 border-b border-ink-line bg-paper-warm flex items-center gap-2">
                <Link2 className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
                <h2 className="meta-label">{t("newRequest")}</h2>
              </div>
              <div className="p-6">
                {hasPendingOrApproved ? (
                  <div className="flex items-start gap-3 p-4 rounded-[var(--radius)] border border-ink-line bg-paper-warm">
                    <AlertCircle className="h-4 w-4 text-ink-soft mt-0.5 shrink-0" strokeWidth={1.75} />
                    <p className="text-sm text-ink-soft">
                      {t("activeRequestNotice")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Recherche */}
                    <div>
                      <label htmlFor="rattachement-search" className="meta-label mb-2 block">
                        {t("searchProfile")}
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="rattachement-search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                          placeholder={t("searchPlaceholder")}
                          autoComplete="off"
                          className="flex-1 h-10 px-4 rounded-[var(--radius)] border border-ink-line bg-paper-deep text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleSearch}
                          disabled={searching}
                          aria-label={t("searchAria")}
                          className="h-10 w-10 rounded-full border border-ink-line flex items-center justify-center text-ink-soft hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
                        >
                          {searching ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : <Search className="h-4 w-4" strokeWidth={1.75} />}
                        </button>
                      </div>

                      {/* Résultats */}
                      {searchResults.length > 0 && (
                        <div className="mt-2 border border-ink-line rounded-[var(--radius)] overflow-hidden max-h-48 overflow-y-auto">
                          {searchResults.map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => { setSelectedPerson(person); setSearchResults([]); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-paper-warm border-b border-ink-line last:border-0 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-paper-warm border border-ink-line flex items-center justify-center text-xs font-serif font-semibold text-ink-soft shrink-0">
                                {person.firstName?.[0]}{person.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-ink">{person.firstName} {person.lastName}</p>
                                {person.birthDate && <p className="text-xs text-ink-faint tabular">{new Date(person.birthDate).getFullYear()}</p>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Sélectionné */}
                      {selectedPerson && (
                        <div className="mt-2 flex items-center justify-between p-3 rounded-[var(--radius)] border border-ink-line bg-paper-warm">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center text-paper text-xs font-serif font-semibold shrink-0">
                              {selectedPerson.firstName?.[0]}
                            </div>
                            <span className="text-sm font-semibold text-ink">
                              {selectedPerson.firstName} {selectedPerson.lastName}
                            </span>
                          </div>
                          <button type="button" onClick={() => setSelectedPerson(null)} aria-label={t("removeSelection")} className="text-ink-faint hover:text-ink transition-colors">
                            <XCircle className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="rattachement-message" className="meta-label mb-2 block">
                        {t("presentationMessage")}
                      </label>
                      <textarea
                        id="rattachement-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("messagePlaceholder")}
                        required
                        minLength={10}
                        rows={5}
                        className="w-full px-4 py-3 rounded-[var(--radius)] border border-ink-line bg-paper-deep text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !selectedPerson || message.length < 10}
                      className="group w-full h-11 bg-seal text-paper text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-seal-bright active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
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

          {/* Mes demandes */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
              <div className="px-6 py-4 border-b border-ink-line bg-paper-warm">
                <h2 className="meta-label">{t("myRequests")}</h2>
              </div>
              <div className="p-4">
                {requests.length === 0 ? (
                  <p className="text-sm text-ink-soft text-center py-6">{t("noRequests")}</p>
                ) : (
                  <div className="space-y-3">
                    {requests.map((r) => {
                      const cfg = statusConfig[r.status as Status];
                      const Icon = cfg.icon;
                      return (
                        <div key={r.id} className="p-4 rounded-[var(--radius)] border border-ink-line">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="text-sm font-semibold text-ink">
                              {r.person.firstName} {r.person.lastName}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] shrink-0 ${cfg.color}`}>
                              <Icon className="h-3 w-3" strokeWidth={1.75} />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-ink-soft truncate">{r.message}</p>
                          <p className="text-[11px] text-ink-faint mt-1 tabular">
                            {new Date(r.createdAt).toLocaleDateString(dateLocale)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
