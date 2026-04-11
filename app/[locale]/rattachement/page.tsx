"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Search, Loader2, CheckCircle, XCircle, Clock, AlertCircle, ArrowRight, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Status = "PENDING" | "APPROVED" | "REJECTED";

const statusConfig: Record<Status, { label: string; icon: any; color: string }> = {
  PENDING:  { label: "En attente", icon: Clock,         color: "text-amber-600 bg-amber-50 border-amber-200" },
  APPROVED: { label: "Approuvée",  icon: CheckCircle,   color: "text-green-600 bg-green-50 border-green-200" },
  REJECTED: { label: "Rejetée",    icon: XCircle,       color: "text-red-600 bg-red-50 border-red-200" },
};

export default function RattachementPage() {
  const t = useTranslations("linkRequest");
  const { data: session } = useSession();
  const { toast } = useToast();

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
      const data = await res.json();
      setSearchResults(data.results || []);
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
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Demande envoyée", description: t("success") });
        setSelectedPerson(null); setMessage(""); setSearchQuery(""); setSearchResults([]);
        fetchRequests();
      } else {
        const msg = data.error === "ALREADY_LINKED"       ? t("alreadyLinked")
                  : data.error === "REQUEST_PENDING"      ? "Vous avez déjà une demande en attente."
                  : data.error === "PERSON_ALREADY_LINKED" ? "Ce profil est déjà pris."
                  : t("error");
        toast({ title: "Erreur", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const hasPendingOrApproved = requests.some((r) => r.status === "PENDING" || r.status === "APPROVED");

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-white py-16 px-6">
      <div className="container mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-10" style={{ animation: "fade-in 0.4s ease-out both" }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Rattachement</p>
          <h1 className="text-3xl font-black font-heading tracking-tight mb-2">{t("title")}</h1>
          <p className="text-sm text-zinc-400">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Formulaire */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border border-zinc-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-zinc-400" />
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Nouvelle demande</h2>
              </div>
              <div className="p-6">
                {hasPendingOrApproved ? (
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                    <AlertCircle className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-zinc-500">
                      Vous avez déjà une demande active. Elle sera traitée par un administrateur.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Recherche */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                        Rechercher un profil
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                          placeholder="Nom, prénom..."
                          className="flex-1 h-10 px-4 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleSearch}
                          disabled={searching}
                          className="h-10 w-10 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors disabled:opacity-40"
                        >
                          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Résultats */}
                      {searchResults.length > 0 && (
                        <div className="mt-2 border border-zinc-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                          {searchResults.map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => { setSelectedPerson(person); setSearchResults([]); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-black font-heading text-zinc-700 shrink-0">
                                {person.firstName?.[0]}{person.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-zinc-900">{person.firstName} {person.lastName}</p>
                                {person.birthDate && <p className="text-xs text-zinc-400">{new Date(person.birthDate).getFullYear()}</p>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Sélectionné */}
                      {selectedPerson && (
                        <div className="mt-2 flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-black font-heading shrink-0">
                              {selectedPerson.firstName?.[0]}
                            </div>
                            <span className="text-sm font-semibold text-zinc-900">
                              {selectedPerson.firstName} {selectedPerson.lastName}
                            </span>
                          </div>
                          <button type="button" onClick={() => setSelectedPerson(null)} className="text-zinc-300 hover:text-zinc-700 transition-colors">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                        Message de présentation
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("messagePlaceholder")}
                        required
                        minLength={10}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !selectedPerson || message.length < 10}
                      className="group w-full h-11 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-[0.98] transition-all duration-200 disabled:opacity-40"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <>{t("submit")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Mes demandes */}
          <div className="lg:col-span-2">
            <div className="border border-zinc-100 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">{t("myRequests")}</h2>
              </div>
              <div className="p-4">
                {requests.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-6">{t("noRequests")}</p>
                ) : (
                  <div className="space-y-3">
                    {requests.map((r) => {
                      const cfg = statusConfig[r.status as Status];
                      const Icon = cfg.icon;
                      return (
                        <div key={r.id} className="p-4 rounded-xl border border-zinc-100">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-zinc-900">
                              {r.person.firstName} {r.person.lastName}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate">{r.message}</p>
                          <p className="text-[10px] text-zinc-300 mt-1">
                            {new Date(r.createdAt).toLocaleDateString("fr-FR")}
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
