"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, TreePine, Link2, FileUp, Flag, ScrollText,
  Eye, EyeOff, Check, X, Loader2, Settings, Search,
  AlertCircle, User, Crown, MessageSquare, Info, Star, ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminImport } from "./admin-import";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "stats" | "users" | "persons" | "requests" | "reports" | "import" | "audit";

type PendingToggle = {
  person: any;
  field: string;
  newValue: boolean;
  label: string;
} | null;

type LinkRequestActionState = {
  request: any;
  action: "APPROVED" | "REJECTED";
  message: string;
} | null;

const genderInk: Record<string, string> = {
  MALE:    "#3F5B72",
  FEMALE:  "#8A4A52",
  OTHER:   "#5E5070",
  UNKNOWN: "#8A8378",
};

function getFirstName(name?: string | null, fallback = "Bonjour") {
  return name?.trim()?.split(/\s+/)[0] || fallback;
}

function getLinkRequestTemplate(request: any, action: "APPROVED" | "REJECTED") {
  const firstName = getFirstName(request.user?.name, request.person?.firstName || "Bonjour");
  const personName = `${request.person?.firstName || ""} ${request.person?.lastName || ""}`.trim();

  if (action === "APPROVED") {
    return `Bienvenue ${firstName},

Votre demande de rattachement au profil ${personName} a ete acceptee.

Vous pouvez desormais completer votre profil et explorer votre arbre genealogique.

- L'equipe Gate`;
  }

  return `Bonjour ${firstName},

Votre demande de rattachement au profil ${personName} a ete refusee.

Raison : merci de preciser ici la raison du refus.

Vous pouvez soumettre une nouvelle demande si vous pensez qu'il s'agit d'une erreur.

- L'equipe Gate`;
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="px-6 py-4 border-b border-ink-line bg-paper-warm flex items-center gap-2">
      <Icon className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
      <h2 className="meta-label">{title}</h2>
    </div>
  );
}

export function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [personSearch, setPersonSearch] = useState("");
  const [pendingToggle, setPendingToggle] = useState<PendingToggle>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [requestActionState, setRequestActionState] = useState<LinkRequestActionState>(null);
  const [requestActionLoading, setRequestActionLoading] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    const loaders: Record<Tab, () => void> = {
      stats: fetchStats,
      users: fetchUsers,
      persons: fetchPersons,
      requests: fetchRequests,
      reports: fetchReports,
      import: () => {},
      audit: () => {},
    };
    loaders[activeTab]?.();
  }, [activeTab]);

  const fetchStats = async () => {
    const res = await fetch("/api/admin/stats");
    if (res.ok) setStats(await res.json());
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) { const d = await res.json(); setUsers(d.users); }
  };

  const fetchPersons = async () => {
    const res = await fetch("/api/persons?limit=50");
    if (res.ok) { const d = await res.json(); setPersons(d.persons); }
  };

  const fetchRequests = async () => {
    const res = await fetch("/api/link-requests");
    if (res.ok) setRequests(await res.json());
  };

  const fetchReports = async () => {
    const res = await fetch("/api/reports");
    if (res.ok) setReports(await res.json());
  };

  const handleSetRole = async (userId: string, role: string) => {
    setRoleLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        toast({ title: "Rôle mis à jour", description: `Compte passé en ${role}.`, variant: "success" });
        fetchUsers();
        fetchStats();
      } else {
        toast({ title: "Erreur", description: "Impossible de modifier le rôle.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Connexion impossible, réessayez.", variant: "destructive" });
    } finally {
      setRoleLoading(null);
    }
  };

  const openLinkRequestAction = (request: any, action: "APPROVED" | "REJECTED") => {
    setRequestActionState({
      request,
      action,
      message: getLinkRequestTemplate(request, action),
    });
  };

  const handleLinkRequest = async () => {
    if (!requestActionState) return;

    setRequestActionLoading(true);
    try {
      const res = await fetch(`/api/link-requests/${requestActionState.request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: requestActionState.action,
          adminMessage: requestActionState.message,
        }),
      });

      if (res.ok) {
        toast({ title: requestActionState.action === "APPROVED" ? "Demande approuvee" : "Demande rejetee" });
        setRequestActionState(null);
        fetchRequests();
        fetchStats();
      } else {
        toast({ title: "Erreur", description: "Impossible de traiter cette demande.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Connexion impossible, réessayez.", variant: "destructive" });
    } finally {
      setRequestActionLoading(false);
    }
  };

  const handleResolveReport = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "PATCH" });
      if (res.ok) {
        toast({ title: "Signalement résolu" });
        fetchReports();
        fetchStats();
      }
    } catch {
      toast({ title: "Erreur", description: "Connexion impossible, réessayez.", variant: "destructive" });
    }
  };

  const fieldLabels: Record<string, string> = {
    showPhoto:       "Photo",
    showBirthDate:   "Date de naissance",
    showDeathDate:   "Date de décès",
    showMarriage:    "Mariage",
    showPersonalData:"Données personnelles",
  };

  const requestToggle = (person: any, field: string, newValue: boolean) => {
    setPendingToggle({ person, field, newValue, label: fieldLabels[field] || field });
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;
    setConfirmLoading(true);
    try {
      const res = await fetch(`/api/persons/${pendingToggle.person.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [pendingToggle.field]: pendingToggle.newValue }),
      });
      if (res.ok) {
        toast({ title: "Visibilité mise à jour", description: `${pendingToggle.label} ${pendingToggle.newValue ? "visible" : "masquée"} pour ${pendingToggle.person.firstName} ${pendingToggle.person.lastName}.` });
        fetchPersons();
      } else {
        toast({ title: "Erreur", description: "Impossible de modifier la visibilité.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Connexion impossible, réessayez.", variant: "destructive" });
    } finally {
      setConfirmLoading(false);
      setPendingToggle(null);
    }
  };

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "stats",    label: "Statistiques",   icon: Settings },
    { id: "users",    label: "Utilisateurs",   icon: Users,    badge: stats?.totalUsers },
    { id: "persons",  label: "Profils",         icon: TreePine, badge: stats?.totalPersons },
    { id: "requests", label: "Rattachements",  icon: Link2,    badge: stats?.pendingRequests },
    { id: "reports",  label: "Signalements",   icon: Flag,     badge: stats?.pendingReports },
    { id: "import",   label: "Import",          icon: FileUp },
    { id: "audit",    label: "Audit",           icon: ScrollText },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper py-12 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <span className="section-no mb-2 block">№ · Administration</span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Tableau de bord</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <div className="lg:w-52 shrink-0">
            <nav className="space-y-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-sm font-medium transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-ink text-paper"
                      : "text-ink-soft hover:text-ink hover:bg-paper-warm"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="flex-1">{tab.label}</span>
                  {tab.badge != null && tab.badge > 0 && (
                    <span className={`tabular text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-paper/20 text-paper" : "bg-paper-deep text-ink-soft"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}

              {/* Lien externe vers la gestion « À l'honneur » */}
              <Link
                href="/admin/spotlights"
                className="mt-1 flex w-full items-center gap-2.5 rounded-full px-3 py-2.5 text-left text-sm font-medium text-ink-soft transition-colors hover:bg-paper-warm hover:text-ink"
              >
                <Star className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="flex-1">À l&apos;honneur</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
              </Link>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Stats */}
            {activeTab === "stats" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats ? [
                  { label: "Utilisateurs",       value: stats.totalUsers },
                  { label: "Premium",             value: stats.premiumUsers },
                  { label: "Profils",             value: stats.totalPersons },
                  { label: "Relations",           value: stats.totalRelations },
                  { label: "Demandes en attente", value: stats.pendingRequests },
                  { label: "Signalements",        value: stats.pendingReports },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-ink-line rounded-[var(--radius)] p-5 shadow-paper">
                    <p className="meta-label mb-2">{s.label}</p>
                    <p className="font-serif text-4xl font-semibold text-ink tabular">{s.value ?? "·"}</p>
                  </div>
                )) : Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-card border border-ink-line rounded-[var(--radius)] p-5 animate-pulse">
                    <div className="h-3 bg-paper-deep rounded w-1/2 mb-3" />
                    <div className="h-10 bg-paper-deep rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Users */}
            {activeTab === "users" && (
              <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
                <SectionHeader icon={Users} title={`Utilisateurs · `} />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-line bg-paper-warm">
                        <th className="text-left px-6 py-3"><span className="meta-label">Utilisateur</span></th>
                        <th className="text-left px-4 py-3"><span className="meta-label">Rôle</span></th>
                        <th className="text-left px-4 py-3"><span className="meta-label">Vérifié</span></th>
                        <th className="text-left px-4 py-3"><span className="meta-label">Recherches</span></th>
                        <th className="text-left px-4 py-3"><span className="meta-label">Abonnement</span></th>
                        <th className="text-left px-4 py-3"><span className="meta-label">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-ink-line/60 hover:bg-paper-warm/60 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-ink">{u.name || "·"}</p>
                            <p className="text-xs text-ink-faint">{u.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] ${
                              u.role === "ADMIN"   ? "bg-ink text-paper" :
                              u.role === "PREMIUM" ? "bg-seal-tint text-seal" :
                              "bg-paper-deep text-ink-soft"
                            }`}>
                              {u.role === "PREMIUM" && <Crown className="h-2.5 w-2.5 mr-1" strokeWidth={1.75} />}
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {u.emailVerified
                              ? <Check className="h-4 w-4 text-seal" strokeWidth={1.75} />
                              : <X className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
                            }
                          </td>
                          <td className="px-4 py-4 text-ink-soft tabular">{u.searchCount}</td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-medium ${
                              u.subscription?.status === "active" ? "text-seal" : "text-ink-faint"
                            }`}>
                              {u.subscription?.status || "·"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {u.role !== "ADMIN" && (
                              roleLoading === u.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-ink-faint" strokeWidth={1.75} />
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleSetRole(u.id, e.target.value)}
                                  aria-label={`Modifier le rôle de ${u.name || u.email}`}
                                  className="text-xs border border-ink-line rounded-[var(--radius)] px-2 py-1 bg-paper-deep text-ink-soft focus:outline-none focus:ring-2 focus:ring-seal cursor-pointer"
                                >
                                  <option value="FREE">FREE</option>
                                  <option value="PREMIUM">PREMIUM</option>
                                </select>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <p className="text-center text-ink-soft text-sm py-12">Aucun utilisateur.</p>
                  )}
                </div>
              </div>
            )}

            {/* Persons */}
            {activeTab === "persons" && (
              <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
                {/* Header avec barre de recherche */}
                <div className="px-4 py-4 sm:px-6 border-b border-ink-line bg-paper-warm flex flex-col gap-3 sm:flex-row sm:items-center">
                  <TreePine className="hidden h-4 w-4 text-ink-faint shrink-0 sm:block" strokeWidth={1.75} />
                  <h2 className="meta-label flex-1">
                    Profils · Visibilité
                    {personSearch && (
                      <span className="ml-2 normal-case tracking-normal font-normal text-ink-faint lowercase">
                        ({persons.filter(p =>
                          `${p.firstName} ${p.lastName}`.toLowerCase().includes(personSearch.toLowerCase())
                        ).length} résultat{persons.filter(p =>
                          `${p.firstName} ${p.lastName}`.toLowerCase().includes(personSearch.toLowerCase())
                        ).length > 1 ? "s" : ""})
                      </span>
                    )}
                  </h2>
                  <div className="relative w-full sm:w-52">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-faint" strokeWidth={1.75} />
                    <input
                      value={personSearch}
                      onChange={(e) => setPersonSearch(e.target.value)}
                      placeholder="Rechercher un profil..."
                      aria-label="Rechercher un profil"
                      className="pl-8 pr-8 h-8 w-full rounded-full border border-ink-line bg-paper-deep text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors"
                    />
                    {personSearch && (
                      <button
                        onClick={() => setPersonSearch("")}
                        aria-label="Effacer la recherche"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-ink-line bg-paper-warm">
                        <th className="text-left px-6 py-3"><span className="meta-label">Profil</span></th>
                        <th className="text-center px-3 py-3"><span className="meta-label">Photo</span></th>
                        <th className="text-center px-3 py-3"><span className="meta-label">Naissance</span></th>
                        <th className="text-center px-3 py-3"><span className="meta-label">Décès</span></th>
                        <th className="text-center px-3 py-3"><span className="meta-label">Mariage</span></th>
                        <th className="text-center px-3 py-3"><span className="meta-label">Données</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {persons
                        .filter((p) =>
                          `${p.firstName} ${p.lastName}`
                            .toLowerCase()
                            .includes(personSearch.toLowerCase().trim())
                        )
                        .map((p) => {
                          function Toggle({ field, value }: { field: string; value: boolean }) {
                            return (
                              <button
                                onClick={() => requestToggle(p, field, !value)}
                                aria-label={value ? "Masquer" : "Afficher"}
                                className={`p-1.5 rounded-full transition-colors ${
                                  value ? "text-seal hover:bg-seal-tint" : "text-ink-faint hover:bg-paper-warm hover:text-ink-soft"
                                }`}
                              >
                                {value ? <Eye className="h-4 w-4" strokeWidth={1.75} /> : <EyeOff className="h-4 w-4" strokeWidth={1.75} />}
                              </button>
                            );
                          }
                          return (
                            <tr key={p.id} className="border-b border-ink-line/60 hover:bg-paper-warm/60 transition-colors">
                              <td className="px-6 py-3">
                                <p className="font-semibold text-ink">{p.firstName} {p.lastName}</p>
                                <p className="text-xs text-ink-faint">{p.gender}</p>
                              </td>
                              <td className="text-center px-3"><Toggle field="showPhoto" value={p.showPhoto} /></td>
                              <td className="text-center px-3"><Toggle field="showBirthDate" value={p.showBirthDate} /></td>
                              <td className="text-center px-3"><Toggle field="showDeathDate" value={p.showDeathDate} /></td>
                              <td className="text-center px-3"><Toggle field="showMarriage" value={p.showMarriage} /></td>
                              <td className="text-center px-3"><Toggle field="showPersonalData" value={p.showPersonalData} /></td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>

                  {persons.length === 0 && (
                    <p className="text-center text-ink-soft text-sm py-12">Aucun profil.</p>
                  )}
                  {persons.length > 0 &&
                    personSearch &&
                    persons.filter((p) =>
                      `${p.firstName} ${p.lastName}`.toLowerCase().includes(personSearch.toLowerCase().trim())
                    ).length === 0 && (
                      <div className="flex flex-col items-center py-12 gap-2">
                        <Search className="h-6 w-6 text-ink-faint" strokeWidth={1.75} />
                        <p className="text-center text-ink-soft text-sm">
                          Aucun profil pour <span className="font-semibold text-ink">"{personSearch}"</span>
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Link requests */}
            {activeTab === "requests" && (
              <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
                <SectionHeader icon={Link2} title="Demandes de rattachement" />
                <div className="p-6">
                  {requests.length === 0 ? (
                    <p className="text-ink-soft text-sm text-center py-8">Aucune demande.</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((r) => (
                        <div key={r.id} className="p-4 rounded-[var(--radius)] border border-ink-line">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="font-semibold text-sm text-ink">{r.user?.name || r.user?.email}</span>
                                <span className="text-ink-faint text-xs">→</span>
                                <span className="font-semibold text-sm text-ink">{r.person?.firstName} {r.person?.lastName}</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] ${
                                  r.status === "APPROVED" ? "bg-seal-tint text-seal" :
                                  r.status === "REJECTED" ? "border border-destructive/30 text-destructive bg-seal-tint" :
                                  "bg-paper-deep text-ink-soft"
                                }`}>
                                  {r.status}
                                </span>
                              </div>
                              <p className="text-xs text-ink-soft line-clamp-2">{r.message}</p>
                              <p className="text-[11px] text-ink-faint mt-1 tabular">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                            {r.status === "PENDING" && (
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => openLinkRequestAction(r, "APPROVED")}
                                  className="h-8 px-3 bg-seal text-paper text-xs font-semibold rounded-full flex items-center gap-1.5 hover:bg-seal-bright transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => openLinkRequestAction(r, "REJECTED")}
                                  className="h-8 px-3 border border-destructive/30 text-destructive text-xs font-semibold rounded-full flex items-center gap-1.5 hover:bg-seal-tint transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                                  Rejeter
                                </button>
                              </div>
                            )}
                          </div>
                          {r.adminMessage && (
                            <div className="mt-3 rounded-[var(--radius)] border border-ink-line bg-paper-warm p-3">
                              <p className="meta-label mb-1">Message envoye</p>
                              <p className="text-sm text-ink-soft whitespace-pre-wrap">{r.adminMessage}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports */}
            {activeTab === "reports" && (
              <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
                <SectionHeader icon={Flag} title="Signalements" />
                <div className="p-6">
                  {reports.length === 0 ? (
                    <p className="text-ink-soft text-sm text-center py-8">Aucun signalement.</p>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((r) => (
                        <div key={r.id} className={`p-4 rounded-[var(--radius)] border ${r.resolved ? "border-ink-line opacity-50" : "border-seal/30 bg-seal-tint"}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Flag className={`h-3.5 w-3.5 ${r.resolved ? "text-ink-faint" : "text-seal"}`} strokeWidth={1.75} />
                                <span className="font-semibold text-sm text-ink">{r.person?.firstName} {r.person?.lastName}</span>
                                {r.resolved && (
                                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] border border-ink-line rounded-full px-2 py-0.5 text-ink-faint">Résolu</span>
                                )}
                              </div>
                              {r.reporterEmail && <p className="text-xs text-ink-faint">Par : {r.reporterEmail}</p>}
                              <p className="text-sm text-ink-soft mt-1">{r.message}</p>
                              <p className="text-[11px] text-ink-faint mt-1 tabular">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                            {!r.resolved && (
                              <button
                                onClick={() => handleResolveReport(r.id)}
                                className="h-8 px-3 border border-ink-line text-ink-soft text-xs font-semibold rounded-full flex items-center gap-1.5 hover:border-ink hover:text-ink transition-colors shrink-0"
                              >
                                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                                Résoudre
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "import" && <AdminImport />}

            {activeTab === "audit" && (
              <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
                <SectionHeader icon={ScrollText} title="Journaux d'audit" />
                <div className="p-6">
                  <p className="text-ink-soft text-sm">
                    Consultez la table <code className="bg-paper-deep px-1.5 py-0.5 rounded text-xs font-mono">audit_logs</code> directement dans Supabase pour l'historique complet.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal de confirmation toggle visibilité */}
      {pendingToggle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !confirmLoading && setPendingToggle(null)}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Card */}
          <div
            className="relative bg-card rounded-[var(--radius)] border border-ink-line shadow-paper-lg w-full max-w-sm p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setPendingToggle(null)}
              disabled={confirmLoading}
              aria-label="Fermer"
              className="absolute right-4 top-4 p-1.5 rounded-full text-ink-faint hover:text-ink hover:bg-paper-warm transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>

            {/* Carte du profil */}
            <div className="mb-5">
              <p className="meta-label mb-3">Profil concerné</p>
              <div className="flex items-center gap-3 p-4 rounded-[var(--radius)] border border-ink-line bg-paper-warm">
                <div
                  className="w-10 h-10 rounded-full border bg-paper-warm flex items-center justify-center text-sm font-serif font-semibold shrink-0"
                  style={{
                    borderColor: genderInk[pendingToggle.person.gender] || genderInk.UNKNOWN,
                    color: genderInk[pendingToggle.person.gender] || genderInk.UNKNOWN,
                  }}
                >
                  {pendingToggle.person.firstName?.[0]}{pendingToggle.person.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-ink">{pendingToggle.person.firstName} {pendingToggle.person.lastName}</p>
                  <p className="text-xs text-ink-faint">{pendingToggle.person.gender}</p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mb-6">
              <p className="meta-label mb-2">Modification</p>
              <div className={`flex items-center gap-3 p-3 rounded-[var(--radius)] border ${
                pendingToggle.newValue ? "border-seal/30 bg-seal-tint" : "border-ink-line bg-paper-deep"
              }`}>
                {pendingToggle.newValue
                  ? <Eye className="h-4 w-4 text-seal shrink-0" strokeWidth={1.75} />
                  : <EyeOff className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
                }
                <p className="text-sm font-medium text-ink">
                  <span className="font-semibold">{pendingToggle.label}</span>{" "}
                  <span className={pendingToggle.newValue ? "text-seal" : "text-ink-soft"}>
                    {pendingToggle.newValue ? "→ visible" : "→ masquée"}
                  </span>
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-2">
              <button
                onClick={() => setPendingToggle(null)}
                disabled={confirmLoading}
                className="flex-1 h-9 border border-ink-line rounded-full text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                onClick={confirmToggle}
                disabled={confirmLoading}
                className="flex-1 h-9 bg-seal text-paper rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-seal-bright transition-colors disabled:opacity-40"
              >
                {confirmLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  : <><Check className="h-4 w-4" strokeWidth={1.75} /> Confirmer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(requestActionState)}
        onOpenChange={(open) => !open && !requestActionLoading && setRequestActionState(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {requestActionState?.action === "APPROVED" ? "Accepter la demande" : "Refuser la demande"}
            </DialogTitle>
            <DialogDescription>
              Personnalisez le message envoye a l'utilisateur avant validation.
            </DialogDescription>
          </DialogHeader>

          {requestActionState && (
            <div className="space-y-4">
              <div className="rounded-[var(--radius)] border border-ink-line bg-paper-warm p-4">
                <p className="meta-label mb-2">Demande concernee</p>
                <p className="text-sm text-ink">
                  <span className="font-semibold">{requestActionState.request.user?.name || requestActionState.request.user?.email}</span>
                  {" "}→{" "}
                  <span className="font-semibold">{requestActionState.request.person?.firstName} {requestActionState.request.person?.lastName}</span>
                </p>
              </div>

              <div className={`rounded-[var(--radius)] border p-4 ${
                requestActionState.action === "APPROVED" ? "border-seal/30 bg-seal-tint" : "border-destructive/30 bg-seal-tint"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {requestActionState.action === "APPROVED" ? (
                    <MessageSquare className="h-4 w-4 text-seal" strokeWidth={1.75} />
                  ) : (
                    <Info className="h-4 w-4 text-destructive" strokeWidth={1.75} />
                  )}
                  <p className="text-sm font-semibold text-ink">
                    {requestActionState.action === "APPROVED" ? "Template de bienvenue" : "Template de refus"}
                  </p>
                </div>
                <textarea
                  value={requestActionState.message}
                  onChange={(e) => setRequestActionState((prev) => prev ? { ...prev, message: e.target.value } : prev)}
                  rows={10}
                  aria-label="Message envoyé à l'utilisateur"
                  className="w-full rounded-[var(--radius)] border border-ink-line bg-card px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              disabled={requestActionLoading}
              onClick={() => setRequestActionState(null)}
              className="h-9 px-4 rounded-full border border-ink-line text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={requestActionLoading || !requestActionState?.message.trim()}
              onClick={handleLinkRequest}
              className="h-9 px-4 rounded-full bg-seal text-paper text-sm font-semibold flex items-center gap-2 hover:bg-seal-bright transition-colors disabled:opacity-40"
            >
              {requestActionLoading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : <Check className="h-4 w-4" strokeWidth={1.75} />}
              Valider
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
