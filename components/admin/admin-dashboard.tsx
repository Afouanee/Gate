"use client";

import { useEffect, useState } from "react";
import {
  Users, TreePine, Link2, FileUp, Flag, ScrollText,
  Eye, EyeOff, Check, X, Loader2, Settings, Search,
  AlertCircle, User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminImport } from "./admin-import";

type Tab = "stats" | "users" | "persons" | "requests" | "reports" | "import" | "audit";

type PendingToggle = {
  person: any;
  field: string;
  newValue: boolean;
  label: string;
} | null;

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
      <Icon className="h-4 w-4 text-zinc-400" />
      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">{title}</h2>
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
    } finally {
      setRoleLoading(null);
    }
  };

  const handleLinkRequest = async (id: string, action: "APPROVED" | "REJECTED") => {
    const res = await fetch(`/api/link-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      toast({ title: action === "APPROVED" ? "Demande approuvée" : "Demande rejetée" });
      fetchRequests();
      fetchStats();
    }
  };

  const handleResolveReport = async (id: string) => {
    const res = await fetch(`/api/admin/reports/${id}`, { method: "PATCH" });
    if (res.ok) {
      toast({ title: "Signalement résolu" });
      fetchReports();
      fetchStats();
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
    <div className="min-h-[calc(100vh-4rem)] bg-white py-12 px-6">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Administration</p>
          <h1 className="text-3xl font-black font-heading tracking-tight">Tableau de bord</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <div className="lg:w-52 shrink-0">
            <nav className="space-y-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{tab.label}</span>
                  {tab.badge != null && tab.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Stats */}
            {activeTab === "stats" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats ? [
                  { label: "Utilisateurs",       value: stats.totalUsers,      color: "text-blue-600",   bg: "bg-blue-50" },
                  { label: "Premium",             value: stats.premiumUsers,    color: "text-zinc-900",   bg: "bg-zinc-100" },
                  { label: "Profils",             value: stats.totalPersons,    color: "text-green-700",  bg: "bg-green-50" },
                  { label: "Relations",           value: stats.totalRelations,  color: "text-purple-700", bg: "bg-purple-50" },
                  { label: "Demandes en attente", value: stats.pendingRequests, color: "text-amber-700",  bg: "bg-amber-50" },
                  { label: "Signalements",        value: stats.pendingReports,  color: "text-red-600",    bg: "bg-red-50" },
                ].map((s) => (
                  <div key={s.label} className="border border-zinc-100 rounded-2xl p-5">
                    <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2 font-bold">{s.label}</p>
                    <p className={`text-4xl font-black font-heading ${s.color}`}>{s.value ?? "—"}</p>
                  </div>
                )) : Array(6).fill(0).map((_, i) => (
                  <div key={i} className="border border-zinc-100 rounded-2xl p-5 animate-pulse">
                    <div className="h-3 bg-zinc-100 rounded w-1/2 mb-3" />
                    <div className="h-10 bg-zinc-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Users */}
            {activeTab === "users" && (
              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                <SectionHeader icon={Users} title={`Utilisateurs — ${users.length}`} />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="text-left px-6 py-3">Utilisateur</th>
                        <th className="text-left px-4 py-3">Rôle</th>
                        <th className="text-left px-4 py-3">Vérifié</th>
                        <th className="text-left px-4 py-3">Recherches</th>
                        <th className="text-left px-4 py-3">Abonnement</th>
                        <th className="text-left px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-zinc-900">{u.name || "—"}</p>
                            <p className="text-xs text-zinc-400">{u.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.role === "ADMIN"   ? "border-zinc-900 bg-zinc-900 text-white" :
                              u.role === "PREMIUM" ? "border-zinc-300 bg-zinc-100 text-zinc-700" :
                              "border-zinc-200 text-zinc-400"
                            }`}>
                              {u.role === "PREMIUM" && <Crown className="h-2.5 w-2.5 mr-1" />}
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {u.emailVerified
                              ? <Check className="h-4 w-4 text-green-500" />
                              : <X className="h-4 w-4 text-zinc-300" />
                            }
                          </td>
                          <td className="px-4 py-4 text-zinc-400">{u.searchCount}</td>
                          <td className="px-4 py-4">
                            <span className={`text-xs font-medium ${
                              u.subscription?.status === "active" ? "text-green-600" : "text-zinc-300"
                            }`}>
                              {u.subscription?.status || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {u.role !== "ADMIN" && (
                              roleLoading === u.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                              ) : (
                                <select
                                  value={u.role}
                                  onChange={(e) => handleSetRole(u.id, e.target.value)}
                                  className="text-xs border border-zinc-200 rounded-lg px-2 py-1 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
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
                    <p className="text-center text-zinc-400 text-sm py-12">Aucun utilisateur.</p>
                  )}
                </div>
              </div>
            )}

            {/* Persons */}
            {activeTab === "persons" && (
              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                {/* Header avec barre de recherche */}
                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-3">
                  <TreePine className="h-4 w-4 text-zinc-400 shrink-0" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 flex-1">
                    Profils — Visibilité
                    {personSearch && (
                      <span className="ml-2 normal-case tracking-normal font-normal text-zinc-400">
                        ({persons.filter(p =>
                          `${p.firstName} ${p.lastName}`.toLowerCase().includes(personSearch.toLowerCase())
                        ).length} résultat{persons.filter(p =>
                          `${p.firstName} ${p.lastName}`.toLowerCase().includes(personSearch.toLowerCase())
                        ).length > 1 ? "s" : ""})
                      </span>
                    )}
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      value={personSearch}
                      onChange={(e) => setPersonSearch(e.target.value)}
                      placeholder="Rechercher un profil..."
                      className="pl-8 pr-3 h-8 w-52 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                    />
                    {personSearch && (
                      <button
                        onClick={() => setPersonSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50/50 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="text-left px-6 py-3">Profil</th>
                        <th className="text-center px-3 py-3">Photo</th>
                        <th className="text-center px-3 py-3">Naissance</th>
                        <th className="text-center px-3 py-3">Décès</th>
                        <th className="text-center px-3 py-3">Mariage</th>
                        <th className="text-center px-3 py-3">Données</th>
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
                                className={`p-1.5 rounded-lg transition-colors ${
                                  value ? "text-green-600 hover:bg-green-50" : "text-zinc-300 hover:bg-zinc-50 hover:text-zinc-500"
                                }`}
                              >
                                {value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                            );
                          }
                          return (
                            <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-3">
                                <p className="font-semibold text-zinc-900">{p.firstName} {p.lastName}</p>
                                <p className="text-xs text-zinc-400">{p.gender}</p>
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
                    <p className="text-center text-zinc-400 text-sm py-12">Aucun profil.</p>
                  )}
                  {persons.length > 0 &&
                    personSearch &&
                    persons.filter((p) =>
                      `${p.firstName} ${p.lastName}`.toLowerCase().includes(personSearch.toLowerCase().trim())
                    ).length === 0 && (
                      <div className="flex flex-col items-center py-12 gap-2">
                        <Search className="h-6 w-6 text-zinc-200" />
                        <p className="text-center text-zinc-400 text-sm">
                          Aucun profil pour <span className="font-semibold text-zinc-600">"{personSearch}"</span>
                        </p>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Link requests */}
            {activeTab === "requests" && (
              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                <SectionHeader icon={Link2} title="Demandes de rattachement" />
                <div className="p-6">
                  {requests.length === 0 ? (
                    <p className="text-zinc-400 text-sm text-center py-8">Aucune demande.</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((r) => (
                        <div key={r.id} className="p-4 rounded-xl border border-zinc-100">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="font-semibold text-sm text-zinc-900">{r.user?.name || r.user?.email}</span>
                                <span className="text-zinc-300 text-xs">→</span>
                                <span className="font-semibold text-sm text-zinc-900">{r.person?.firstName} {r.person?.lastName}</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  r.status === "APPROVED" ? "border-green-200 bg-green-50 text-green-700" :
                                  r.status === "REJECTED" ? "border-red-200 bg-red-50 text-red-700" :
                                  "border-amber-200 bg-amber-50 text-amber-700"
                                }`}>
                                  {r.status}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 line-clamp-2">{r.message}</p>
                              <p className="text-[10px] text-zinc-300 mt-1">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                            {r.status === "PENDING" && (
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => handleLinkRequest(r.id, "APPROVED")}
                                  className="h-8 px-3 bg-zinc-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-zinc-700 transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => handleLinkRequest(r.id, "REJECTED")}
                                  className="h-8 px-3 border border-red-200 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-red-50 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Rejeter
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports */}
            {activeTab === "reports" && (
              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                <SectionHeader icon={Flag} title="Signalements" />
                <div className="p-6">
                  {reports.length === 0 ? (
                    <p className="text-zinc-400 text-sm text-center py-8">Aucun signalement.</p>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((r) => (
                        <div key={r.id} className={`p-4 rounded-xl border ${r.resolved ? "border-zinc-100 opacity-50" : "border-orange-200 bg-orange-50/30"}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Flag className={`h-3.5 w-3.5 ${r.resolved ? "text-zinc-300" : "text-orange-500"}`} />
                                <span className="font-semibold text-sm text-zinc-900">{r.person?.firstName} {r.person?.lastName}</span>
                                {r.resolved && (
                                  <span className="text-[10px] border border-zinc-200 rounded-full px-2 py-0.5 text-zinc-400 font-bold">Résolu</span>
                                )}
                              </div>
                              {r.reporterEmail && <p className="text-xs text-zinc-400">Par : {r.reporterEmail}</p>}
                              <p className="text-sm text-zinc-700 mt-1">{r.message}</p>
                              <p className="text-[10px] text-zinc-300 mt-1">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                            {!r.resolved && (
                              <button
                                onClick={() => handleResolveReport(r.id)}
                                className="h-8 px-3 border border-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:border-zinc-900 hover:text-zinc-900 transition-colors shrink-0"
                              >
                                <Check className="h-3.5 w-3.5" />
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
              <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                <SectionHeader icon={ScrollText} title="Journaux d'audit" />
                <div className="p-6">
                  <p className="text-zinc-400 text-sm">
                    Consultez la table <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs">audit_logs</code> directement dans Supabase pour l'historique complet.
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Card */}
          <div
            className="relative bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-sm p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setPendingToggle(null)}
              disabled={confirmLoading}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-300 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Carte du profil */}
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-3">Profil concerné</p>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black font-heading shrink-0 ${
                  pendingToggle.person.gender === "MALE"   ? "border-blue-200 bg-blue-50 text-blue-700" :
                  pendingToggle.person.gender === "FEMALE" ? "border-pink-200 bg-pink-50 text-pink-700" :
                  "border-zinc-200 bg-white text-zinc-500"
                }`}>
                  {pendingToggle.person.firstName?.[0]}{pendingToggle.person.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">{pendingToggle.person.firstName} {pendingToggle.person.lastName}</p>
                  <p className="text-xs text-zinc-400">{pendingToggle.person.gender}</p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">Modification</p>
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                pendingToggle.newValue ? "border-green-200 bg-green-50" : "border-red-100 bg-red-50"
              }`}>
                {pendingToggle.newValue
                  ? <Eye className="h-4 w-4 text-green-600 shrink-0" />
                  : <EyeOff className="h-4 w-4 text-red-500 shrink-0" />
                }
                <p className="text-sm font-medium">
                  <span className="font-semibold">{pendingToggle.label}</span>{" "}
                  <span className={pendingToggle.newValue ? "text-green-700" : "text-red-600"}>
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
                className="flex-1 h-9 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                onClick={confirmToggle}
                disabled={confirmLoading}
                className="flex-1 h-9 bg-zinc-900 text-white rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >
                {confirmLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><Check className="h-4 w-4" /> Confirmer</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
