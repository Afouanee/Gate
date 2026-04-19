"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function ProfileEditDialog({
  person,
  canEditVisibility,
}: {
  person: any;
  canEditVisibility: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: person.firstName || "",
    lastName: person.lastName || "",
    gender: person.gender || "UNKNOWN",
    birthDate: person.birthDate ? new Date(person.birthDate).toISOString().slice(0, 10) : "",
    deathDate: person.deathDate ? new Date(person.deathDate).toISOString().slice(0, 10) : "",
    birthPlace: person.birthPlace || "",
    deathPlace: person.deathPlace || "",
    photoUrl: person.photoUrl || "",
    description: person.description || "",
    profession: person.profession || "",
    currentCity: person.currentCity || "",
    isAlive: Boolean(person.isAlive),
    showBirthDate: Boolean(person.showBirthDate),
    showDeathDate: Boolean(person.showDeathDate),
    showPhoto: Boolean(person.showPhoto),
    showMarriage: Boolean(person.showMarriage),
    showPersonalData: Boolean(person.showPersonalData),
  });

  const setField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/persons/${person.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          birthDate: form.birthDate || null,
          deathDate: form.deathDate || null,
          birthPlace: form.birthPlace || null,
          deathPlace: form.deathPlace || null,
          photoUrl: form.photoUrl || null,
          description: form.description || null,
          profession: form.profession || null,
          currentCity: form.currentCity || null,
        }),
      });

      if (!res.ok) {
        toast({ title: "Erreur", description: "Impossible d'enregistrer les modifications.", variant: "destructive" });
        return;
      }

      toast({ title: "Profil mis a jour" });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full h-10 border border-zinc-200 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 transition-colors">
          <Pencil className="h-4 w-4" />
          Modifier le profil
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>Les champs visibles ici peuvent etre mis a jour immediatement.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Prenom</label>
              <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Nom</label>
              <input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Genre</label>
              <select value={form.gender} onChange={(e) => setField("gender", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200 bg-white">
                <option value="UNKNOWN">Non renseigne</option>
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                <input type="checkbox" checked={form.isAlive} onChange={(e) => setField("isAlive", e.target.checked)} />
                Personne en vie
              </label>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Date de naissance</label>
              <input type="date" value={form.birthDate} onChange={(e) => setField("birthDate", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Date de deces</label>
              <input type="date" value={form.deathDate} onChange={(e) => setField("deathDate", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Lieu de naissance</label>
              <input value={form.birthPlace} onChange={(e) => setField("birthPlace", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Lieu de deces</label>
              <input value={form.deathPlace} onChange={(e) => setField("deathPlace", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Photo URL</label>
            <input value={form.photoUrl} onChange={(e) => setField("photoUrl", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Profession</label>
            <input value={form.profession} onChange={(e) => setField("profession", e.target.value)} className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Habite à</label>
            <input value={form.currentCity} onChange={(e) => setField("currentCity", e.target.value)} placeholder="Ville de résidence" className="w-full h-10 px-4 rounded-lg border border-zinc-200" />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-2 block">Description</label>
            <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={5} className="w-full px-4 py-3 rounded-lg border border-zinc-200 resize-none" />
          </div>

          {canEditVisibility && (
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-3">Visibilite</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-700">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.showBirthDate} onChange={(e) => setField("showBirthDate", e.target.checked)} /> Date de naissance visible</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.showDeathDate} onChange={(e) => setField("showDeathDate", e.target.checked)} /> Date de deces visible</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.showPhoto} onChange={(e) => setField("showPhoto", e.target.checked)} /> Photo visible</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.showMarriage} onChange={(e) => setField("showMarriage", e.target.checked)} /> Mariage visible</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.showPersonalData} onChange={(e) => setField("showPersonalData", e.target.checked)} /> Donnees personnelles visibles</label>
              </div>
            </div>
          )}

          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 rounded-lg border border-zinc-200 text-sm font-semibold text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="h-9 px-4 rounded-full bg-zinc-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-40">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
              Enregistrer
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
