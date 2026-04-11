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
      const data = await res.json();
      setResult(data);
      if (res.ok) {
        toast({ title: "Import terminé", description: `${data.total} lignes traitées.`, variant: "success" });
      } else {
        toast({ title: "Erreur", description: "Échec de l'import.", variant: "destructive" });
      }
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
      <div className="border border-zinc-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-zinc-400" />
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Import CSV / Excel</h2>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
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
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
              dragOver ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"
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
                <Loader2 className="h-10 w-10 animate-spin text-zinc-400" />
                <p className="text-sm text-zinc-400">Import en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <FileSpreadsheet className="h-10 w-10 text-zinc-300" />
                <p className="font-semibold text-zinc-700">Glissez un fichier ou cliquez pour sélectionner</p>
                <p className="text-sm text-zinc-400">CSV, Excel (.xlsx, .xls) — max 10 MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`border rounded-2xl overflow-hidden ${result.errors?.length > 0 ? "border-orange-200" : "border-green-200"}`}>
          <div className={`p-5 flex items-center gap-3 ${result.errors?.length > 0 ? "bg-orange-50" : "bg-green-50"}`}>
            {result.errors?.length > 0
              ? <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
              : <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            }
            <div>
              <p className="font-semibold text-sm">
                {result.errors?.length > 0 ? "Import terminé avec avertissements" : "Import réussi"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{result.total} lignes · {result.errors?.length || 0} erreurs</p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="p-4 bg-white max-h-40 overflow-y-auto">
              {result.errors.slice(0, 20).map((err: string, i: number) => (
                <p key={i} className="text-xs text-orange-600 font-mono py-0.5">{err}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Columns reference */}
      <div className="border border-zinc-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">Colonnes supportées</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {columns.map((c) => (
            <div key={c.col} className="flex items-start gap-3">
              <code className={`font-mono px-2 py-0.5 rounded text-xs shrink-0 ${
                c.required ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
              }`}>
                {c.col}
              </code>
              <span className="text-xs text-zinc-500">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
