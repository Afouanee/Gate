"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminImport() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      toast({ title: "Format invalide", description: "Seuls CSV et Excel sont acceptés.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      setResult(data);
      if (res.ok) {
        toast({ title: "Import terminé", description: `${data.total} lignes traitées.`, variant: "success" });
      } else {
        toast({ title: "Erreur", description: "Échec de l'import.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Connexion impossible, réessayez.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `firstName,lastName,gender,birthDate,deathDate,birthPlace,deathPlace,description,isAlive,parentId,spouseId
Jean,Dupont,M,1950-03-15,,Paris,,Fondateur de la famille,true,,
Marie,Dupont,F,1952-07-22,,Lyon,,Épouse de Jean,true,0,
Pierre,Dupont,M,1975-11-10,,Paris,,Fils de Jean et Marie,true,0,`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gate-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { col: "firstName",   desc: "Prénom",            required: true },
    { col: "lastName",    desc: "Nom",               required: true },
    { col: "gender",      desc: "M / F / Other / Unknown" },
    { col: "birthDate",   desc: "YYYY-MM-DD" },
    { col: "deathDate",   desc: "YYYY-MM-DD" },
    { col: "birthPlace",  desc: "Lieu de naissance" },
    { col: "deathPlace",  desc: "Lieu de décès" },
    { col: "description", desc: "Texte libre" },
    { col: "isAlive",     desc: "true / false" },
    { col: "parentId",    desc: "Index ligne parent (0-based)" },
    { col: "spouseId",    desc: "Index conjoint(e)" },
  ];

  return (
    <div className="space-y-4">

      {/* Upload zone */}
      <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
        <div className="px-6 py-4 border-b border-ink-line bg-paper-warm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-ink-faint" strokeWidth={1.75} />
            <h2 className="meta-label">Import CSV / Excel</h2>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink transition-colors"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Modèle CSV
          </button>
        </div>
        <div className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleUpload(file);
            }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-[var(--radius)] p-12 text-center cursor-pointer transition-all duration-200 ${
              dragOver ? "border-seal bg-seal-tint" : "border-ink-line hover:border-ink-soft/50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-ink-faint" strokeWidth={1.75} />
                <p className="text-sm text-ink-soft">Import en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <FileSpreadsheet className="h-10 w-10 text-ink-faint" strokeWidth={1.75} />
                <p className="font-semibold text-ink">Glissez un fichier ou cliquez pour sélectionner</p>
                <p className="text-sm text-ink-soft">CSV, Excel (.xlsx, .xls) · max 10 MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`bg-card border rounded-[var(--radius)] overflow-hidden shadow-paper ${result.errors?.length > 0 ? "border-destructive/30" : "border-seal/30"}`}>
          <div className={`p-5 flex items-center gap-3 ${result.errors?.length > 0 ? "bg-seal-tint" : "bg-seal-tint"}`}>
            {result.errors?.length > 0
              ? <AlertTriangle className="h-5 w-5 text-destructive shrink-0" strokeWidth={1.75} />
              : <CheckCircle className="h-5 w-5 text-seal shrink-0" strokeWidth={1.75} />
            }
            <div>
              <p className="font-semibold text-sm text-ink">
                {result.errors?.length > 0 ? "Import terminé avec avertissements" : "Import réussi"}
              </p>
              <p className="text-xs text-ink-soft mt-0.5 tabular">{result.total} lignes · {result.errors?.length || 0} erreurs</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="p-4 bg-card max-h-40 overflow-y-auto">
              {result.errors.slice(0, 20).map((err: string, i: number) => (
                <p key={i} className="text-xs text-destructive font-mono py-0.5">{err}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Columns reference */}
      <div className="bg-card border border-ink-line rounded-[var(--radius)] overflow-hidden shadow-paper">
        <div className="px-6 py-4 border-b border-ink-line bg-paper-warm">
          <h2 className="meta-label">Colonnes supportées</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {columns.map((c) => (
            <div key={c.col} className="flex items-start gap-3">
              <code className={`font-mono px-2 py-0.5 rounded text-xs shrink-0 ${
                c.required ? "bg-ink text-paper" : "bg-paper-deep text-ink-soft"
              }`}>
                {c.col}
              </code>
              <span className="text-xs text-ink-soft">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
