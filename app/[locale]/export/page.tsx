"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Download, Search, Crown, Loader2,
  CheckCircle, FileDown, Sliders, XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExportPage() {
  const t = useTranslations("export");
  const locale = useLocale();
  const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
  const { data: session } = useSession();
  const { toast } = useToast();

  const EXPORT_TYPES = [
    { value: "ASCENDANCE",  label: t("typeAscendance") },
    { value: "DESCENDANCE", label: t("typeDescendance") },
    { value: "MIXTE",       label: t("typeMixte") },
    { value: "CUSTOM",      label: t("typeCustom") },
  ];

  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchResults,  setSearchResults]  = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [searching,      setSearching]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [exportData,     setExportData]     = useState<any>(null);
  const [previewSvg,     setPreviewSvg]     = useState<string | null>(null);
  const [pdfLoading,     setPdfLoading]     = useState(false);

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
      const data = await res.json().catch(() => ({}));
      setSearchResults(data.results || []);
    } catch {
      toast({ title: t("errorTitle"), description: t("errorConnection"), variant: "destructive" });
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
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setExportData(data.data);
        toast({ title: t("successTitle"), description: t("success") });
      } else {
        toast({
          title:       data.error === "EXPORT_LIMIT_REACHED" ? t("limitTitle") : t("errorTitle"),
          description: data.error === "EXPORT_LIMIT_REACHED" ? t("limitReached") : t("error"),
          variant:     "destructive",
        });
      }
    } catch {
      toast({ title: t("errorTitle"), description: t("errorConnection"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Construit le SVG + le HTML imprimable de l'arbre (fonction pure, réutilisée
  // par l'aperçu inline ET le téléchargement). Renvoie null si pas de données.
  const buildExport = (): { svg: string; html: string } | null => {
    if (!exportData) return null;

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

    // ── Mise en page : arbre STRICTEMENT VERTICAL (haut → bas) ─────────────
    // Chaque génération est une rangée ; les nœuds sont des fiches rectangulaires
    // (registre d'archive), reliés par des connecteurs orthogonaux avec barre de
    // fratrie. DA « Éditorial Archive » : papier crème, encre, sceau bordeaux.

    const escapeXml = (s: string) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    // Palette Archive
    const PAPER = "#FAF7F0";
    const PAPER_WARM = "#F4EFE4";
    const INK = "#1A1714";
    const INK_SOFT = "#46413A";
    const INK_FAINT = "#8A8378";
    const INK_LINE = "#D8CFBD";
    const SEAL = "#7A2E2E";
    const CARD = "#FFFFFF";
    // Teintes de genre désaturées (filet en tête de fiche)
    const genderColor = (g: string) =>
      g === "MALE" ? "#3F5B72" : g === "FEMALE" ? "#8A4A52" : g === "OTHER" ? "#5E5070" : "#8A8378";

    // Fiche
    const CARD_W = 168;
    const CARD_H = 64;
    const H_GAP = 36; // espace horizontal entre fiches d'une même rangée
    const V_GAP = 64; // espace vertical entre générations
    const MARGIN = 56;
    const ROW_PITCH = CARD_H + V_GAP;

    const sortedGens = Array.from(byGen.keys()).sort((a, b) => a - b);
    const rowMap = new Map<number, number>();
    sortedGens.forEach((g, i) => rowMap.set(g, i));

    const totalRows = sortedGens.length;
    const maxPerRow = Math.max(1, ...Array.from(byGen.values()).map((a) => a.length));
    const innerW = maxPerRow * CARD_W + (maxPerRow - 1) * H_GAP;
    const canvasW = innerW + MARGIN * 2;
    const canvasH = totalRows * CARD_H + (totalRows - 1) * V_GAP + MARGIN * 2;

    // Position du coin haut-gauche de chaque fiche (rangée centrée)
    const posMap = new Map<string, { x: number; y: number }>();
    byGen.forEach((nodes, gen) => {
      const row = rowMap.get(gen)!;
      const rowW = nodes.length * CARD_W + (nodes.length - 1) * H_GAP;
      const startX = (canvasW - rowW) / 2;
      const y = MARGIN + row * ROW_PITCH;
      nodes.forEach((n: any, i: number) => {
        posMap.set(n.id, { x: startX + i * (CARD_W + H_GAP), y });
      });
    });

    const center = (id: string) => {
      const p = posMap.get(id)!;
      return { cx: p.x + CARD_W / 2, cy: p.y + CARD_H / 2, top: p.y, bottom: p.y + CARD_H };
    };

    // ── Connecteurs ────────────────────────────────────────────────────────
    const svgLines = exportData.edges
      .map((e: any) => {
        const src = posMap.get(e.sourceId);
        const tgt = posMap.get(e.targetId);
        if (!src || !tgt) return "";

        if (e.type === "SPOUSE") {
          // Trait horizontal sceau entre conjoints (même rangée)
          const a = center(e.sourceId);
          const b = center(e.targetId);
          const y = a.cy;
          const x1 = Math.min(src.x, tgt.x) + CARD_W;
          const x2 = Math.max(src.x, tgt.x);
          return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${SEAL}" stroke-width="1.5" stroke-dasharray="5,4"/>`;
        }

        // Filiation : du BAS du parent vers le HAUT de l'enfant, connecteur orthogonal
        const sc = center(e.sourceId);
        const tc = center(e.targetId);
        const parent = sc.cy <= tc.cy ? sc : tc; // celui du dessus = parent
        const child = sc.cy <= tc.cy ? tc : sc;
        const x1 = parent.cx;
        const y1 = parent.bottom;
        const x2 = child.cx;
        const y2 = child.top;
        const midY = y1 + (y2 - y1) / 2;
        const stroke = e.type === "CUSTOM" ? "#A8842C" : INK_FAINT;
        const dash = e.type === "CUSTOM" ? ` stroke-dasharray="2,3"` : "";
        return `<path d="M${x1},${y1} V${midY} H${x2} V${y2}" fill="none" stroke="${stroke}" stroke-width="1.25"${dash}/>`;
      })
      .join("\n");

    // ── Fiches (rectangles d'archive) ──────────────────────────────────────
    const svgNodes = exportData.nodes
      .map((n: any) => {
        const p = posMap.get(n.id);
        if (!p) return "";
        const { x, y } = p;
        const gColor = genderColor(n.gender);
        const init =
          (n.firstName?.[0] || "").toUpperCase() + (n.lastName?.[0] || "").toUpperCase();
        const isRoot = n.id === exportData.rootPerson.id;
        const year = config.showDates && n.birthDate ? new Date(n.birthDate).getFullYear() : null;
        const died = config.showDates && n.deathDate ? new Date(n.deathDate).getFullYear() : null;
        const dateTxt = year ? `${year}${died ? `–${died}` : ""}` : "";
        const AV = 40; // colonne avatar
        const acx = x + AV / 2 + 6;
        const acy = y + CARD_H / 2;
        const ar = 15;
        const textX = x + AV + 10;

        return `
  <!-- ${escapeXml(n.firstName)} ${escapeXml(n.lastName)} -->
  <g${isRoot ? ' filter="url(#card-shadow)"' : ""}>
    <rect x="${x}" y="${y}" width="${CARD_W}" height="${CARD_H}" rx="3"
          fill="${CARD}" stroke="${isRoot ? SEAL : INK_LINE}" stroke-width="${isRoot ? 1.5 : 1}"/>
    <rect x="${x}" y="${y}" width="${CARD_W}" height="3" rx="1.5" fill="${gColor}"/>
    ${
      n.photoUrl
        ? `<clipPath id="clip-${n.id}"><circle cx="${acx}" cy="${acy}" r="${ar}"/></clipPath>
       <image href="${escapeXml(n.photoUrl)}" x="${acx - ar}" y="${acy - ar}" width="${ar * 2}" height="${ar * 2}" clip-path="url(#clip-${n.id})" preserveAspectRatio="xMidYMid slice"/>
       <circle cx="${acx}" cy="${acy}" r="${ar}" fill="none" stroke="${gColor}" stroke-width="1.25"/>`
        : `<circle cx="${acx}" cy="${acy}" r="${ar}" fill="${PAPER_WARM}" stroke="${gColor}" stroke-width="1.25"/>
       <text x="${acx}" y="${acy + 4}" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="600" fill="${gColor}">${escapeXml(init)}</text>`
    }
    <text x="${textX}" y="${y + 24}" font-family="Georgia,serif" font-size="13" font-weight="600" fill="${INK}">${escapeXml(n.firstName)}</text>
    <text x="${textX}" y="${y + 40}" font-family="'Courier New',monospace" font-size="9.5" letter-spacing="0.8" fill="${INK_SOFT}">${escapeXml((n.lastName || "").toUpperCase())}</text>
    ${dateTxt ? `<text x="${textX}" y="${y + 54}" font-family="'Courier New',monospace" font-size="9" fill="${INK_FAINT}">${escapeXml(dateTxt)}</text>` : ""}
    ${!n.isAlive ? `<text x="${x + CARD_W - 12}" y="${y + 16}" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${INK_FAINT}">✝</text>` : ""}
  </g>`;
      })
      .join("\n");

    const exportDate = new Date().toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const rootName = `${exportData.rootPerson.firstName} ${exportData.rootPerson.lastName}`;
    const typeLabel =
      exportData.type === "ASCENDANCE"
        ? t("typeAscendance")
        : exportData.type === "DESCENDANCE"
        ? t("typeDescendance")
        : exportData.type === "MIXTE"
        ? t("lineageMixte")
        : t("typeCustom");

    // SVG seul, réutilisé pour l'aperçu inline dans la page.
    const svg = `<svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;max-width:100%;height:auto">
      <defs>
        <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${INK}" flood-opacity="0.14"/>
        </filter>
      </defs>
      ${svgLines}
      ${svgNodes}
    </svg>`;

    const genCount = exportData.depth;
    const genLabel = t("generationsCount", { count: genCount, plural: genCount > 1 ? "s" : "" });

    const content = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<title>Arbre · ${escapeXml(rootName)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Georgia,'Times New Roman',serif;background:${PAPER};color:${INK};padding:48px 40px}
  .sheet{max-width:${Math.max(canvasW, 760)}px;margin:0 auto}
  .doc-head{border-bottom:1px solid ${INK_LINE};padding-bottom:20px;margin-bottom:8px}
  .doc-kicker{font-family:'Courier New',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${SEAL};margin-bottom:10px}
  .doc-head h1{font-size:34px;font-weight:600;letter-spacing:-.02em;color:${INK};line-height:1.05}
  .doc-head .sub{font-family:'Courier New',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${INK_FAINT};margin-top:10px}
  .meta-row{display:flex;justify-content:space-between;align-items:baseline;font-family:'Courier New',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${INK_FAINT};margin:14px 0 22px}
  .tree-wrap{background:${PAPER_WARM};border:1px solid ${INK_LINE};border-radius:4px;overflow:auto}
  .tree-wrap svg{display:block;margin:0 auto}
  .legend{display:flex;flex-wrap:wrap;gap:22px;margin-top:18px;font-family:Arial,sans-serif;font-size:11px;color:${INK_SOFT}}
  .legend span{display:flex;align-items:center;gap:8px}
  .legend i{display:inline-block;width:22px;height:0;border-top:1.25px solid ${INK_FAINT}}
  .legend i.spouse{border-top:1.5px dashed ${SEAL}}
  .legend i.custom{border-top:1.5px dotted #A8842C}
  .seal{display:inline-block;width:9px;height:9px;border-radius:50%;background:${SEAL}}
  .doc-foot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${INK_LINE};margin-top:26px;padding-top:16px;font-family:'Courier New',monospace;font-size:10.5px;letter-spacing:.06em;color:${INK_FAINT}}
  .doc-foot b{font-family:Georgia,serif;font-weight:600;color:${INK_SOFT};letter-spacing:0}
  .print-hint{margin-top:18px;text-align:center;font-family:Arial,sans-serif;font-size:11px;color:${INK_FAINT}}
  @media print{
    @page{margin:14mm}
    body{padding:0;background:#fff}
    .tree-wrap{background:#fff;border:none;overflow:visible}
    .print-hint{display:none}
  }
</style>
</head>
<body>
<div class="sheet">

  <div class="doc-head">
    <div class="doc-kicker">${escapeXml(t("docKicker"))}</div>
    <h1>${escapeXml(rootName)}</h1>
    <div class="sub">${escapeXml(typeLabel)} · ${escapeXml(genLabel)}</div>
  </div>

  <div class="meta-row">
    <span>${escapeXml(t("docProfilesLinks", { profiles: exportData.nodes.length, links: exportData.edges.length }))}</span>
    <span>${escapeXml(t("docEstablished", { date: exportDate }))}</span>
  </div>

  <div class="tree-wrap">
    <svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${INK}" flood-opacity="0.14"/>
        </filter>
      </defs>
      ${svgLines}
      ${svgNodes}
    </svg>
  </div>

  <div class="legend">
    <span><i></i> ${escapeXml(t("legendFiliation"))}</span>
    <span><i class="spouse"></i> ${escapeXml(t("legendSpouse"))}</span>
    <span><i class="custom"></i> ${escapeXml(t("legendCustom"))}</span>
    <span style="margin-left:auto"><span class="seal"></span> ${escapeXml(t("legendReference"))}</span>
  </div>

  <div class="doc-foot">
    <span><b>Gate</b> · ${escapeXml(t("footTagline"))}</span>
    <span>by Afouanee.dev</span>
  </div>

  <p class="print-hint">${escapeXml(t("printHint"))}</p>

</div>
</body>
</html>`;

    return { svg, html: content };
  };

  // Génère l'aperçu inline dès qu'un export est prêt (ou quand les options changent).
  useEffect(() => {
    if (!exportData) {
      setPreviewSvg(null);
      return;
    }
    const built = buildExport();
    setPreviewSvg(built?.svg ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportData, config.showDates, config.showPhotos]);

  // Nom de fichier propre : « Arbre-Prenom-Nom-AAAA-MM-JJ »
  const fileBase = () => {
    const slug = (s: string) =>
      String(s || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const date = new Date().toISOString().slice(0, 10);
    return `Arbre-${slug(exportData?.rootPerson?.firstName)}-${slug(exportData?.rootPerson?.lastName)}-${date}`;
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // HTML imprimable (rapide, sans serveur)
  const handleDownloadHtml = () => {
    const built = buildExport();
    if (!built || !exportData) return;
    triggerDownload(new Blob([built.html], { type: "text/html;charset=utf-8" }), `${fileBase()}.html`);
  };

  // Vrai PDF (via Puppeteer côté serveur)
  const handleDownloadPdf = async () => {
    const built = buildExport();
    if (!built || !exportData) return;
    setPdfLoading(true);
    try {
      const res = await fetch("/api/export/render-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: built.html }),
      });
      if (!res.ok) {
        // repli : on télécharge le HTML imprimable si le rendu PDF échoue
        toast({
          title: t("pdfUnavailableTitle"),
          description: t("pdfUnavailableBody"),
          variant: "destructive",
        });
        handleDownloadHtml();
        return;
      }
      triggerDownload(await res.blob(), `${fileBase()}.pdf`);
    } catch {
      toast({ title: t("errorTitle"), description: t("downloadFailed"), variant: "destructive" });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper px-4 py-16 sm:px-6">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <span className="section-no">{t("sectionNo")}</span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-sm text-ink-soft">{t("subtitle")}</p>
        </div>

        {/* Premium gate */}
        {!isPremium && (
          <div className="mb-8 flex items-start gap-4 rounded-[var(--radius)] border border-seal/30 bg-seal-tint p-5">
            <Crown className="mt-0.5 h-5 w-5 shrink-0 text-seal" strokeWidth={1.75} />
            <div>
              <p className="mb-1 text-sm font-medium text-ink">{t("limitReached")}</p>
              <p className="mb-3 text-xs text-ink-soft">{t("upgradeToPremium")}</p>
              <Link href="/pricing">
                <button className="flex h-9 items-center gap-2 rounded-full bg-seal px-4 text-sm font-medium text-paper transition-colors hover:bg-seal-bright">
                  <Crown className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {t("upgradeCta")}
                </button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Config */}
          <div className="overflow-hidden rounded-[var(--radius)] border border-ink-line bg-card">
            <div className="flex items-center gap-2 border-b border-ink-line bg-paper-warm px-6 py-4">
              <Sliders className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
              <h2 className="meta-label">{t("configuration")}</h2>
            </div>
            <div className="space-y-6 p-6">

              {/* Search person */}
              <div>
                <label htmlFor="export-search" className="mb-2 block meta-label">{t("targetPerson")}</label>
                <div className="flex gap-2">
                  <input
                    id="export-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t("searchPerson")}
                    className="h-11 flex-1 rounded-full border border-ink-line bg-paper px-4 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/30"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    aria-label={t("searchAria")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-line text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" strokeWidth={1.75} />}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto overflow-hidden rounded-[var(--radius)] border border-ink-line">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setSelectedPerson(p); setSearchResults([]); }}
                        className="flex w-full items-center gap-3 border-b border-ink-line px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-paper-warm"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-warm font-serif text-xs font-semibold text-ink-soft">
                          {p.firstName?.[0]}{p.lastName?.[0]}
                        </div>
                        <span className="text-sm font-medium text-ink">{p.firstName} {p.lastName}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedPerson && (
                  <div className="mt-2 flex items-center justify-between rounded-[var(--radius)] border border-ink-line bg-paper-warm p-3">
                    <span className="text-sm font-medium text-ink">{selectedPerson.firstName} {selectedPerson.lastName}</span>
                    <button onClick={() => setSelectedPerson(null)} aria-label={t("removeSelection")} className="text-ink-faint transition-colors hover:text-seal">
                      <XCircle className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block meta-label">{t("type")}</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPORT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setConfig({ ...config, type: type.value })}
                      aria-pressed={config.type === type.value}
                      className={`rounded-[var(--radius)] border p-2.5 text-center text-sm font-medium transition-colors ${
                        config.type === type.value
                          ? "border-ink bg-ink text-paper"
                          : "border-ink-line text-ink-soft hover:border-ink"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Depth */}
              <div>
                <label htmlFor="export-depth" className="mb-2 block meta-label">
                  {t("depth")} : <span className="font-serif text-base font-semibold text-ink tabular">{config.depth}</span>
                </label>
                <input
                  id="export-depth"
                  type="range"
                  min={1}
                  max={10}
                  value={config.depth}
                  onChange={(e) => setConfig({ ...config, depth: parseInt(e.target.value) })}
                  className="w-full accent-seal"
                />
                <div className="mt-1 flex justify-between font-mono text-[11px] text-ink-faint">
                  <span>{t("depthOne")}</span>
                  <span>{t("depthTen")}</span>
                </div>
              </div>

              {/* Options toggles */}
              <div>
                <label className="mb-3 block meta-label">{t("options")}</label>
                <div className="space-y-3">
                  {[
                    { key: "includeSpouses",   label: t("includeSpouses") },
                    { key: "includeCustom",    label: t("includeCustom") },
                    { key: "showPhotos",       label: t("showPhotos") },
                    { key: "showDates",        label: t("showDates") },
                    { key: "showDescriptions", label: t("showDescriptions") },
                  ].map((opt) => {
                    const checked = (config as any)[opt.key];
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        onClick={() => setConfig({ ...config, [opt.key]: !checked })}
                        className="group flex w-full items-center justify-between text-left"
                      >
                        <span className="text-sm text-ink-soft transition-colors group-hover:text-ink">{opt.label}</span>
                        <span
                          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-seal" : "bg-paper-deep"}`}
                        >
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !selectedPerson}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98] disabled:opacity-40"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {t("generating")}</>
                ) : (
                  <><Download className="h-4 w-4" strokeWidth={1.75} /> {t("generate")}</>
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="overflow-hidden rounded-[var(--radius)] border border-ink-line bg-card">
            <div className="flex items-center gap-2 border-b border-ink-line bg-paper-warm px-6 py-4">
              <FileDown className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
              <h2 className="meta-label">{t("result")}</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-ink-faint" />
                  <p className="meta-label">{t("generatingFull")}</p>
                </div>
              ) : exportData ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 rounded-[var(--radius)] border border-seal/30 bg-seal-tint p-4">
                    <CheckCircle className="h-5 w-5 shrink-0 text-seal" strokeWidth={1.75} />
                    <div>
                      <p className="text-sm font-medium text-ink">{t("success")}</p>
                      <p className="text-xs text-ink-soft">{t("successProfiles", { count: exportData.nodes.length })}</p>
                    </div>
                  </div>

                  {/* Aperçu de l'arbre AVANT téléchargement */}
                  {previewSvg && (
                    <div>
                      <p className="mb-2 meta-label">{t("preview")}</p>
                      <div
                        className="max-h-[420px] overflow-auto rounded-[var(--radius)] border border-ink-line bg-paper-warm p-3"
                        dangerouslySetInnerHTML={{ __html: previewSvg }}
                      />
                    </div>
                  )}

                  <div className="space-y-px">
                    {[
                      { label: t("rowTargetPerson"), value: `${exportData.rootPerson.firstName} ${exportData.rootPerson.lastName}` },
                      { label: t("rowType"),         value: exportData.type },
                      { label: t("rowDepth"),        value: t("generationsCount", { count: exportData.depth, plural: exportData.depth > 1 ? "s" : "" }) },
                      { label: t("rowProfiles"),     value: exportData.nodes.length },
                      { label: t("rowRelations"),    value: exportData.edges.length },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between border-b border-ink-line py-2 text-sm last:border-0">
                        <span className="text-ink-faint">{row.label}</span>
                        <span className="font-medium text-ink tabular">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={pdfLoading}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-seal text-sm font-medium text-paper transition-all hover:bg-seal-bright active:scale-[0.98] disabled:opacity-50"
                    >
                      {pdfLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> {t("preparingPdf")}</>
                      ) : (
                        <><FileDown className="h-4 w-4" strokeWidth={1.75} /> {t("downloadPdf")}</>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadHtml}
                      disabled={pdfLoading}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-ink-line text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" strokeWidth={1.75} />
                      {t("downloadHtml")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Download className="h-10 w-10 text-ink-line" strokeWidth={1.25} />
                  <p className="text-sm text-ink-faint">{t("emptyState")}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
