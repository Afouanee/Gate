"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Download, Search, Crown, Loader2,
  CheckCircle, FileDown, Sliders, XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EXPORT_TYPES = [
  { value: "ASCENDANCE",  label: "Ascendance" },
  { value: "DESCENDANCE", label: "Descendance" },
  { value: "MIXTE",       label: "Mixte" },
  { value: "CUSTOM",      label: "Personnalisé" },
];

export default function ExportPage() {
  const t = useTranslations("export");
  const { data: session } = useSession();
  const { toast } = useToast();

  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchResults,  setSearchResults]  = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [searching,      setSearching]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [exportData,     setExportData]     = useState<any>(null);

  const [config, setConfig] = useState({
    type:               "ASCENDANCE",
    depth:              3,
    includeSpouses:     true,
    includeCustom:      false,
    showPhotos:         true,
    showDates:          true,
    showDescriptions:   true,
  });

  const isPremium = session?.user?.role === "PREMIUM" || session?.user?.role === "ADMIN";

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } finally {
      setSearching(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedPerson) return;
    setLoading(true);
    setExportData(null);
    try {
      const res  = await fetch("/api/export/pdf", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ personId: selectedPerson.id, ...config }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExportData(data.data);
        toast({ title: "Succès !", description: t("success") });
      } else {
        toast({
          title:       data.error === "EXPORT_LIMIT_REACHED" ? "Limite atteinte" : "Erreur",
          description: data.error === "EXPORT_LIMIT_REACHED" ? t("limitReached") : t("error"),
          variant:     "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!exportData) return;

    // Build the tree HTML — visual genealogy tree with colored lines
    const nodeMap = new Map<string, any>();
    exportData.nodes.forEach((n: any) => nodeMap.set(n.id, n));

    const genderColor = (g: string) =>
      g === "MALE" ? "#3b82f6" : g === "FEMALE" ? "#ec4899" : "#a1a1aa";

    const renderPerson = (n: any) => `
      <div class="person" style="border-left: 4px solid ${genderColor(n.gender)}">
        <div class="person-initials" style="background:${genderColor(n.gender)}20; color:${genderColor(n.gender)}; border:2px solid ${genderColor(n.gender)}40">
          ${(n.firstName?.[0] || "") + (n.lastName?.[0] || "")}
        </div>
        <div class="person-info">
          <div class="person-name">${n.firstName} <span style="text-transform:uppercase; letter-spacing:.05em">${n.lastName}</span></div>
          ${config.showDates && n.birthDate ? `<div class="person-meta">Né(e) ${new Date(n.birthDate).getFullYear()}${n.deathDate ? ` — ${new Date(n.deathDate).getFullYear()}` : ""}</div>` : ""}
          ${n.birthPlace ? `<div class="person-meta">📍 ${n.birthPlace}</div>` : ""}
          ${config.showDescriptions && n.description ? `<div class="person-desc">${n.description}</div>` : ""}
        </div>
      </div>`;

    // Group edges by type for the legend
    const hasSpouse  = exportData.edges.some((e: any) => e.type === "SPOUSE");
    const hasCustom  = exportData.edges.some((e: any) => e.type === "CUSTOM");

    const content = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Arbre généalogique — ${exportData.rootPerson.firstName} ${exportData.rootPerson.lastName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', Arial, sans-serif;
    background: #fff;
    color: #09090b;
    padding: 48px;
    max-width: 960px;
    margin: 0 auto;
  }

  /* Header */
  .header {
    border-bottom: 2px solid #09090b;
    padding-bottom: 24px;
    margin-bottom: 40px;
  }
  .header-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: #a1a1aa;
    margin-bottom: 8px;
  }
  .header-title {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: -.02em;
    line-height: 1;
    margin-bottom: 6px;
  }
  .header-sub {
    font-size: 14px;
    color: #71717a;
  }
  .header-meta {
    display: flex;
    gap: 24px;
    margin-top: 16px;
  }
  .meta-item {
    display: flex;
    flex-direction: column;
  }
  .meta-label { font-size: 10px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #a1a1aa; }
  .meta-value { font-size: 15px; font-weight: 700; color: #09090b; }

  /* Legend */
  .legend {
    display: flex;
    gap: 20px;
    padding: 12px 16px;
    background: #f4f4f5;
    border-radius: 10px;
    margin-bottom: 32px;
    font-size: 11px;
    font-weight: 600;
    color: #52525b;
  }
  .legend-item { display: flex; align-items: center; gap: 8px; }
  .legend-line {
    width: 28px;
    height: 2px;
  }
  .legend-line.parent  { background: #18181b; }
  .legend-line.spouse  { background: #6366f1; border-top: 2px dashed #6366f1; }
  .legend-line.custom  { background: #a21caf; }

  /* Section title */
  .section-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: #a1a1aa;
    margin: 32px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e4e7;
  }

  /* Person card */
  .person {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 16px;
    margin-bottom: 8px;
    border-radius: 10px;
    border: 1px solid #e4e4e7;
    border-left-width: 4px;
    page-break-inside: avoid;
  }
  .person:hover { background: #fafafa; }
  .person-initials {
    width: 40px; height: 40px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 900;
    flex-shrink: 0;
  }
  .person-info { flex: 1; }
  .person-name { font-size: 15px; font-weight: 700; }
  .person-meta { font-size: 12px; color: #71717a; margin-top: 3px; }
  .person-desc { font-size: 12px; color: #52525b; margin-top: 6px; line-height: 1.5; }

  /* Relations section */
  .relations-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
  .relation-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    font-size: 12px;
  }
  .relation-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .relation-dot.parent-child { background: #18181b; }
  .relation-dot.spouse { background: #6366f1; }
  .relation-dot.custom { background: #a21caf; }
  .relation-name { font-weight: 600; }
  .relation-type { color: #a1a1aa; font-size: 10px; margin-top: 1px; }

  /* Footer */
  .footer {
    margin-top: 48px;
    padding-top: 20px;
    border-top: 1px solid #e4e4e7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #a1a1aa;
  }
  .footer-brand { font-weight: 900; color: #09090b; letter-spacing: -.01em; }

  @media print {
    body { padding: 24px; }
    .person { page-break-inside: avoid; }
  }
</style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-eyebrow">Arbre généalogique · Gate</div>
    <div class="header-title">${exportData.rootPerson.firstName} <span style="color:#71717a;text-transform:uppercase;letter-spacing:.03em">${exportData.rootPerson.lastName}</span></div>
    <div class="header-sub">${exportData.type} · Profondeur ${exportData.depth} génération${exportData.depth > 1 ? "s" : ""}</div>
    <div class="header-meta">
      <div class="meta-item">
        <span class="meta-label">Profils</span>
        <span class="meta-value">${exportData.nodes.length}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Relations</span>
        <span class="meta-value">${exportData.edges.length}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Généré le</span>
        <span class="meta-value">${new Date(exportData.generatedAt).toLocaleDateString("fr-FR")}</span>
      </div>
    </div>
  </div>

  <!-- Legend -->
  <div class="legend">
    <div class="legend-item">
      <div class="legend-line parent"></div>
      <span>Parent → Enfant</span>
    </div>
    ${hasSpouse ? `<div class="legend-item"><div class="legend-line spouse"></div><span>Conjoint(e)</span></div>` : ""}
    ${hasCustom ? `<div class="legend-item"><div class="legend-line custom"></div><span>Relation personnalisée</span></div>` : ""}
  </div>

  <!-- Persons -->
  <div class="section-title">Membres (${exportData.nodes.length})</div>
  ${exportData.nodes.map((n: any) => renderPerson(n)).join("")}

  <!-- Relations -->
  ${exportData.edges.length > 0 ? `
  <div class="section-title">Relations (${exportData.edges.length})</div>
  <div class="relations-grid">
    ${exportData.edges.map((e: any) => {
      const src = nodeMap.get(e.sourceId);
      const tgt = nodeMap.get(e.targetId);
      if (!src || !tgt) return "";
      const typeLabel = e.type === "PARENT_CHILD" ? "Parent → Enfant" : e.type === "SPOUSE" ? "Conjoint(e)" : e.label || "Relation";
      const dotClass  = e.type === "PARENT_CHILD" ? "parent-child" : e.type === "SPOUSE" ? "spouse" : "custom";
      return `
      <div class="relation-item">
        <div class="relation-dot ${dotClass}"></div>
        <div>
          <div class="relation-name">${src.firstName} ${src.lastName} → ${tgt.firstName} ${tgt.lastName}</div>
          <div class="relation-type">${typeLabel}</div>
        </div>
      </div>`;
    }).join("")}
  </div>` : ""}

  <!-- Footer -->
  <div class="footer">
    <span><span class="footer-brand">Gate</span> — by Afouanee.dev</span>
    <span>Exporté le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
  </div>

</body>
</html>`;

    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `gate-arbre-${exportData.rootPerson.lastName}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white py-16 px-6">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Export</p>
          <h1 className="text-3xl font-black font-heading tracking-tight mb-2">{t("title")}</h1>
          <p className="text-sm text-zinc-400">{t("subtitle")}</p>
        </div>

        {/* Premium gate */}
        {!isPremium && (
          <div className="mb-8 p-5 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-start gap-4">
            <Crown className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">{t("limitReached")}</p>
              <p className="text-xs text-zinc-400 mb-3">{t("upgradeToPremium")}</p>
              <Link href="/pricing">
                <button className="h-9 px-4 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center gap-2 hover:bg-zinc-700 transition-colors">
                  <Crown className="h-3.5 w-3.5" />
                  Passer à Premium
                </button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Config */}
          <div className="border border-zinc-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-zinc-400" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Configuration</h2>
            </div>
            <div className="p-6 space-y-6">

              {/* Search person */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">{t("targetPerson")}</label>
                <div className="flex gap-2">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t("searchPerson")}
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

                {searchResults.length > 0 && (
                  <div className="mt-2 border border-zinc-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setSelectedPerson(p); setSearchResults([]); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0 transition-colors"
                      >
                        <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                          {p.firstName?.[0]}{p.lastName?.[0]}
                        </div>
                        <span className="text-sm font-medium text-zinc-900">{p.firstName} {p.lastName}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedPerson && (
                  <div className="mt-2 flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                    <span className="text-sm font-semibold text-zinc-900">{selectedPerson.firstName} {selectedPerson.lastName}</span>
                    <button onClick={() => setSelectedPerson(null)} className="text-zinc-300 hover:text-zinc-700 transition-colors">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">{t("type")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPORT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setConfig({ ...config, type: type.value })}
                      className={`p-2.5 text-sm rounded-xl border text-center font-medium transition-colors ${
                        config.type === type.value
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Depth */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">
                  {t("depth")} : <span className="text-zinc-900 font-black">{config.depth}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={config.depth}
                  onChange={(e) => setConfig({ ...config, depth: parseInt(e.target.value) })}
                  className="w-full accent-zinc-900"
                />
                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                  <span>1 génération</span>
                  <span>10 générations</span>
                </div>
              </div>

              {/* Options toggles */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-3 block">{t("options")}</label>
                <div className="space-y-3">
                  {[
                    { key: "includeSpouses",   label: t("includeSpouses") },
                    { key: "includeCustom",    label: t("includeCustom") },
                    { key: "showPhotos",       label: t("showPhotos") },
                    { key: "showDates",        label: t("showDates") },
                    { key: "showDescriptions", label: t("showDescriptions") },
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-zinc-600 group-hover:text-zinc-900 transition-colors">{opt.label}</span>
                      <div
                        onClick={() => setConfig({ ...config, [opt.key]: !(config as any)[opt.key] })}
                        className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          (config as any)[opt.key] ? "bg-zinc-900" : "bg-zinc-200"
                        }`}
                      >
                        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          (config as any)[opt.key] ? "translate-x-4" : "translate-x-0.5"
                        }`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !selectedPerson}
                className="w-full h-11 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Génération...</>
                ) : (
                  <><Download className="h-4 w-4" /> {t("generate")}</>
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="border border-zinc-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
              <FileDown className="h-4 w-4 text-zinc-400" />
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Résultat</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-zinc-200" />
                  <p className="text-sm text-zinc-400">Génération en cours...</p>
                </div>
              ) : exportData ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-green-800">{t("success")}</p>
                      <p className="text-xs text-green-600">{exportData.nodes.length} profils inclus</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: "Personne cible", value: `${exportData.rootPerson.firstName} ${exportData.rootPerson.lastName}` },
                      { label: "Type",            value: exportData.type },
                      { label: "Profondeur",      value: `${exportData.depth} génération${exportData.depth > 1 ? "s" : ""}` },
                      { label: "Profils",         value: exportData.nodes.length },
                      { label: "Relations",       value: exportData.edges.length },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm border-b border-zinc-50 pb-2 last:border-0">
                        <span className="text-zinc-400">{row.label}</span>
                        <span className="font-semibold text-zinc-900">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full h-11 bg-zinc-900 text-white text-sm font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-zinc-700 active:scale-[0.98] transition-all"
                  >
                    <FileDown className="h-4 w-4" />
                    {t("download")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Download className="h-12 w-12 text-zinc-100" />
                  <p className="text-sm text-zinc-400">Configurez et générez votre arbre.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
