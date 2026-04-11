"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Download, Search, Settings, Crown, Loader2,
  CheckCircle, AlertTriangle, FileDown, Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const EXPORT_TYPES = [
  { value: "ASCENDANCE", label: "Ascendance" },
  { value: "DESCENDANCE", label: "Descendance" },
  { value: "MIXTE", label: "Mixte" },
  { value: "CUSTOM", label: "Personnalisé" },
];

export default function ExportPage() {
  const t = useTranslations("export");
  const { data: session } = useSession();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<any>(null);

  const [config, setConfig] = useState({
    type: "ASCENDANCE",
    depth: 3,
    includeSpouses: true,
    includeCustom: false,
    showPhotos: true,
    showDates: true,
    showDescriptions: true,
  });

  const isPremium = session?.user?.role === "PREMIUM" || session?.user?.role === "ADMIN";

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

  const handleGenerate = async () => {
    if (!selectedPerson) return;
    setLoading(true);
    setExportData(null);

    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: selectedPerson.id, ...config }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setExportData(data.data);
        toast({ title: "Succès !", description: t("success") });
      } else {
        if (data.error === "EXPORT_LIMIT_REACHED") {
          toast({ title: "Limite atteinte", description: t("limitReached"), variant: "destructive" });
        } else {
          toast({ title: "Erreur", description: t("error"), variant: "destructive" });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!exportData) return;

    const content = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Arbre généalogique — ${exportData.rootPerson.firstName} ${exportData.rootPerson.lastName}</title>
<style>
  body { font-family: 'Poppins', Arial, sans-serif; background: #fff; color: #111; padding: 40px; }
  h1 { color: #c9930f; font-size: 28px; }
  h2 { font-size: 18px; color: #444; }
  .person { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 8px 0; }
  .person-name { font-weight: bold; font-size: 16px; }
  .person-dates { color: #888; font-size: 13px; }
  .meta { color: #aaa; font-size: 12px; margin-top: 4px; }
  .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; color: #888; font-size: 12px; }
</style>
</head>
<body>
<h1>Arbre généalogique</h1>
<h2>${exportData.rootPerson.firstName} ${exportData.rootPerson.lastName} — ${exportData.type}</h2>
<p class="meta">Généré le ${new Date(exportData.generatedAt).toLocaleDateString("fr-FR")} | ${exportData.nodes.length} profils | Profondeur: ${exportData.depth}</p>
<hr />
${exportData.nodes.map((n: any) => `
<div class="person">
  <div class="person-name">${n.firstName} ${n.lastName}</div>
  ${n.birthDate ? `<div class="person-dates">Né(e) : ${new Date(n.birthDate).toLocaleDateString("fr-FR")}</div>` : ""}
  ${n.deathDate ? `<div class="person-dates">Décédé(e) : ${new Date(n.deathDate).toLocaleDateString("fr-FR")}</div>` : ""}
  ${n.description ? `<p style="font-size:13px; color:#555; margin-top:6px;">${n.description}</p>` : ""}
</div>
`).join("")}
<div class="footer">Gate — by Afouanee.dev</div>
</body>
</html>`;

    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gate-arbre-${exportData.rootPerson.lastName}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black font-heading mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        {!isPremium && (
          <div className="mb-6 p-4 rounded-xl border border-gold-800/30 bg-gold-900/10 flex items-start gap-3">
            <Crown className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">{t("limitReached")}</p>
              <p className="text-xs text-muted-foreground mb-2">{t("upgradeToPremium")}</p>
              <Link href="/pricing">
                <Button size="sm" variant="premium" className="gap-1.5">
                  <Crown className="h-3.5 w-3.5" />
                  Passer à Premium
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-gold-500" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Person search */}
              <div className="space-y-2">
                <Label>{t("targetPerson")}</Label>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPerson")}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleSearch}
                    disabled={searching}
                  >
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-gate-border rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setSelectedPerson(p); setSearchResults([]); }}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-gate-card text-left border-b border-gate-border last:border-0 transition-colors"
                      >
                        <div className="h-7 w-7 rounded-full bg-gate-card border border-gate-border flex items-center justify-center text-xs font-bold shrink-0">
                          {p.firstName?.[0]}{p.lastName?.[0]}
                        </div>
                        <span className="text-sm">{p.firstName} {p.lastName}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedPerson && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-gold-800/30 bg-gold-900/10 text-sm">
                    <span className="font-medium">{selectedPerson.firstName} {selectedPerson.lastName}</span>
                    <button onClick={() => setSelectedPerson(null)} className="text-muted-foreground hover:text-foreground ml-2">✕</button>
                  </div>
                )}
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>{t("type")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPORT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setConfig({ ...config, type: type.value })}
                      className={`p-2.5 text-sm rounded-lg border text-center transition-colors ${
                        config.type === type.value
                          ? "border-gold-600 bg-gold-900/20 text-gold-400"
                          : "border-gate-border hover:border-gold-800/50 text-muted-foreground"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Depth */}
              <div className="space-y-2">
                <Label>{t("depth")} : <span className="text-gold-400 font-bold">{config.depth}</span></Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={config.depth}
                  onChange={(e) => setConfig({ ...config, depth: parseInt(e.target.value) })}
                  className="w-full accent-gold-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 génération</span>
                  <span>10 générations</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label>{t("options")}</Label>
                {[
                  { key: "includeSpouses", label: t("includeSpouses") },
                  { key: "includeCustom", label: t("includeCustom") },
                  { key: "showPhotos", label: t("showPhotos") },
                  { key: "showDates", label: t("showDates") },
                  { key: "showDescriptions", label: t("showDescriptions") },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setConfig({ ...config, [opt.key]: !(config as any)[opt.key] })}
                      className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                        (config as any)[opt.key] ? "bg-gold-600" : "bg-gate-border"
                      }`}
                    >
                      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                        (config as any)[opt.key] ? "translate-x-4" : "translate-x-0.5"
                      }`} />
                    </div>
                    <span className="text-sm group-hover:text-foreground transition-colors text-muted-foreground">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedPerson}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {t("generate")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview / Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-gold-500" />
                Résultat
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-gold-500" />
                  <p className="text-muted-foreground text-sm">Génération en cours...</p>
                  <p className="text-xs text-muted-foreground">Cela peut prendre quelques secondes.</p>
                </div>
              ) : exportData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-green-800/30 bg-green-900/10">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{t("success")}</p>
                      <p className="text-xs text-muted-foreground">{exportData.nodes.length} profils inclus</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Personne cible</span>
                      <span className="font-medium text-foreground">{exportData.rootPerson.firstName} {exportData.rootPerson.lastName}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Type</span>
                      <span className="font-medium text-foreground">{exportData.type}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Profondeur</span>
                      <span className="font-medium text-foreground">{exportData.depth} générations</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Profils</span>
                      <span className="font-medium text-foreground">{exportData.nodes.length}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Relations</span>
                      <span className="font-medium text-foreground">{exportData.edges.length}</span>
                    </div>
                  </div>

                  <Button onClick={handleDownloadPDF} className="w-full gap-2">
                    <FileDown className="h-4 w-4" />
                    {t("download")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Download className="h-12 w-12 opacity-20" />
                  <p className="text-sm">Configurez et générez votre arbre.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
