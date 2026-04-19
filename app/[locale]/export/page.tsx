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

    const nodeMap = new Map<string, any>();
    exportData.nodes.forEach((n: any) => nodeMap.set(n.id, n));

    // BFS pour assigner une génération à chaque nœud (ancêtres = gen négative, descendants = gen positive)
    const genMap = new Map<string, number>();
    const bfsQ: Array<{ id: string; gen: number }> = [{ id: exportData.rootPerson.id, gen: 0 }];
    const bfsVisited = new Set<string>();
    while (bfsQ.length > 0) {
      const { id, gen } = bfsQ.shift()!;
      if (bfsVisited.has(id)) continue;
      bfsVisited.add(id);
      genMap.set(id, gen);
      for (const e of exportData.edges) {
        if (e.type === "SPOUSE") continue;
        if (e.sourceId === id && !bfsVisited.has(e.targetId)) bfsQ.push({ id: e.targetId, gen: gen + 1 });
        if (e.targetId === id && !bfsVisited.has(e.sourceId)) bfsQ.push({ id: e.sourceId, gen: gen - 1 });
      }
    }
    exportData.nodes.forEach((n: any) => { if (!genMap.has(n.id)) genMap.set(n.id, 0); });

    // Grouper par génération
    const byGen = new Map<number, any[]>();
    exportData.nodes.forEach((n: any) => {
      const g = genMap.get(n.id)!;
      if (!byGen.has(g)) byGen.set(g, []);
      byGen.get(g)!.push(n);
    });

    // Placer les conjoints dans la même rangée, juste à côté
    for (const e of exportData.edges) {
      if (e.type !== "SPOUSE") continue;
      const srcGen = genMap.get(e.sourceId);
      const tgtGen = genMap.get(e.targetId);
      if (srcGen !== undefined && tgtGen !== undefined && srcGen !== tgtGen) {
        genMap.set(e.targetId, srcGen);
        const oldArr = byGen.get(tgtGen) || [];
        byGen.set(tgtGen, oldArr.filter((n: any) => n.id !== e.targetId));
        const arr = byGen.get(srcGen) || [];
        const srcIdx = arr.findIndex((n: any) => n.id === e.sourceId);
        arr.splice(srcIdx + 1, 0, nodeMap.get(e.targetId));
        byGen.set(srcGen, arr);
      }
    }

    // Constantes de mise en page
    const R       = 44;   // rayon du cercle avatar
    const NODE_W  = R * 2;
    const H_GAP   = 60;   // espace horizontal entre cercles
    const V_GAP   = 100;  // espace vertical entre rangées
    const LABEL_H = 36;   // hauteur du texte sous le cercle
    const ROW_H   = NODE_W + LABEL_H; // hauteur totale d'un nœud

    const sortedGens = Array.from(byGen.keys()).sort((a, b) => a - b);
    const rowMap = new Map<number, number>();
    sortedGens.forEach((g, i) => rowMap.set(g, i));

    const totalRows  = sortedGens.length;
    const maxPerRow  = Math.max(...Array.from(byGen.values()).map((a) => a.length));
    const canvasW    = Math.max(600, maxPerRow * (NODE_W + H_GAP) + H_GAP);
    const canvasH    = totalRows * (ROW_H + V_GAP) + V_GAP + 60;

    // Position du centre de chaque cercle
    const posMap = new Map<string, { cx: number; cy: number }>();
    byGen.forEach((nodes, gen) => {
      const row    = rowMap.get(gen)!;
      const rowW   = nodes.length * NODE_W + (nodes.length - 1) * H_GAP;
      const startX = (canvasW - rowW) / 2 + R;
      const cy     = V_GAP + row * (ROW_H + V_GAP) + R;
      nodes.forEach((n: any, i: number) => {
        posMap.set(n.id, { cx: startX + i * (NODE_W + H_GAP), cy });
      });
    });

    // Couleurs par genre
    const gc = (g: string) => g === "MALE" ? "#4f8ef7" : g === "FEMALE" ? "#e879a0" : "#9ca3af";
    const gb = (g: string) => g === "MALE" ? "#e8f0fe" : g === "FEMALE" ? "#fce7f3" : "#f3f4f6";

    // Lignes SVG
    const svgLines = exportData.edges.map((e: any) => {
      const src = posMap.get(e.sourceId);
      const tgt = posMap.get(e.targetId);
      if (!src || !tgt) return "";

      if (e.type === "SPOUSE") {
        // Ligne horizontale pointillée entre conjoints
        const y  = src.cy;
        const x1 = Math.min(src.cx, tgt.cx) + R;
        const x2 = Math.max(src.cx, tgt.cx) - R;
        return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#c084fc" stroke-width="2" stroke-dasharray="6,4"/>`;
      }

      // Lien parent → enfant : ligne qui part du bas du cercle parent,
      // descend verticalement jusqu'à mi-chemin, bifurque horizontalement, puis remonte au cercle enfant
      const x1   = src.cx;
      const y1   = src.cy + R;
      const x2   = tgt.cx;
      const y2   = tgt.cy - R;
      const midY = (y1 + y2) / 2;
      return `<path d="M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join("\n");

    // Cercles SVG + texte en dessous
    const svgNodes = exportData.nodes.map((n: any) => {
      const pos    = posMap.get(n.id);
      if (!pos) return "";
      const { cx, cy } = pos;
      const color  = gc(n.gender);
      const bg     = gb(n.gender);
      const init   = (n.firstName?.[0] || "").toUpperCase() + (n.lastName?.[0] || "").toUpperCase();
      const isRoot = n.id === exportData.rootPerson.id;
      const year   = config.showDates && n.birthDate ? new Date(n.birthDate).getFullYear() : null;
      const died   = config.showDates && n.deathDate ? new Date(n.deathDate).getFullYear() : null;
      const dateTxt = year ? `${year}${died ? `–${died}` : ""}` : "";

      // Ombre portée via filter
      const shadow = isRoot ? `filter="url(#shadow)"` : "";

      return `
  <!-- ${n.firstName} ${n.lastName} -->
  <circle cx="${cx}" cy="${cy}" r="${R + 4}" fill="white" ${shadow}/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="${bg}" stroke="${color}" stroke-width="${isRoot ? 3.5 : 2}"/>
  ${n.photoUrl
    ? `<clipPath id="clip-${n.id}"><circle cx="${cx}" cy="${cy}" r="${R - 2}"/></clipPath>
       <image href="${n.photoUrl}" x="${cx - R + 2}" y="${cy - R + 2}" width="${(R - 2) * 2}" height="${(R - 2) * 2}" clip-path="url(#clip-${n.id})" preserveAspectRatio="xMidYMid slice"/>`
    : `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="900" fill="${color}">${init}</text>`}
  ${isRoot ? `<circle cx="${cx}" cy="${cy}" r="${R + 7}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="4,3" opacity="0.5"/>` : ""}
  <text x="${cx}" y="${cy + R + 16}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#1e293b">${n.firstName}</text>
  <text x="${cx}" y="${cy + R + 28}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="600" fill="#64748b">${n.lastName.toUpperCase()}</text>
  ${dateTxt ? `<text x="${cx}" y="${cy + R + 40}" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#94a3b8">${dateTxt}</text>` : ""}`;
    }).join("\n");

    const content = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Arbre — ${exportData.rootPerson.firstName} ${exportData.rootPerson.lastName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;background:#f8fafc;color:#09090b;padding:36px}
  .header{margin-bottom:28px}
  .header h1{font-size:26px;font-weight:900;letter-spacing:-.02em;color:#0f172a}
  .header p{font-size:12px;color:#94a3b8;margin-top:5px;letter-spacing:.05em;text-transform:uppercase;font-weight:600}
  .tree-wrap{background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:auto;box-shadow:0 1px 8px rgba(0,0,0,.06)}
  .banner{margin-top:20px;padding:10px 16px;background:#f1f5f9;border-radius:10px;font-size:11px;color:#64748b;display:flex;gap:20px}
  .banner span{display:flex;align-items:center;gap:6px}
  .footer{margin-top:20px;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8}
  .footer b{color:#0f172a}
  @media print{body{padding:12px;background:#fff}.tree-wrap{border:none;box-shadow:none}}
</style>
</head>
<body>

<div class="header">
  <h1>${exportData.rootPerson.firstName} ${exportData.rootPerson.lastName.toUpperCase()}</h1>
  <p>Arbre généalogique · ${exportData.type} · ${exportData.depth} génération${exportData.depth > 1 ? "s" : ""}</p>
</div>

<div class="tree-wrap">
  <svg width="${canvasW}" height="${canvasH}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.12"/>
      </filter>
    </defs>
    <!-- Lignes -->
    ${svgLines}
    <!-- Nœuds -->
    ${svgNodes}
    <!-- Bandeau titre bas -->
    <rect x="${canvasW/2 - 120}" y="${canvasH - 44}" width="240" height="30" rx="15" fill="#0f172a"/>
    <text x="${canvasW/2}" y="${canvasH - 24}" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="white" letter-spacing="2">✦ FAMILY TREE ✦</text>
  </svg>
</div>

<div class="banner">
  <span>⬤ <span style="color:#4f8ef7">Homme</span></span>
  <span>⬤ <span style="color:#e879a0">Femme</span></span>
  <span>- - - Conjoint(e)</span>
  <span>——— Filiation</span>
  <span style="margin-left:auto">${exportData.nodes.length} profils · ${exportData.edges.length} liens</span>
</div>

<div class="footer">
  <span><b>Gate</b> — by Afouanee.dev</span>
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
