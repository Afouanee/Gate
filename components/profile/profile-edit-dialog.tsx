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
    nickname: person.nickname || "",
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
          nickname: form.nickname || null,
        }),
      });

      if (!res.ok) {
        toast({ title: "Erreur", description: "Impossible d'enregistrer les modifications.", variant: "destructive" });
        return;
      }

      toast({ title: "Profil mis a jour" });
      setOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Erreur", description: "Connexion impossible, réessayez.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-10 px-4 rounded-[var(--radius)] border border-ink-line bg-paper-deep text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full h-10 border border-ink-line rounded-full flex items-center justify-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink hover:border-ink transition-colors">
          <Pencil className="h-4 w-4" strokeWidth={1.75} />
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
              <label htmlFor="edit-firstName" className="meta-label mb-2 block">Prenom</label>
              <input id="edit-firstName" autoComplete="given-name" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="edit-lastName" className="meta-label mb-2 block">Nom</label>
              <input id="edit-lastName" autoComplete="family-name" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="edit-gender" className="meta-label mb-2 block">Genre</label>
              <select id="edit-gender" value={form.gender} onChange={(e) => setField("gender", e.target.value)} className={inputClass}>
                <option value="UNKNOWN">Non renseigne</option>
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
                <input type="checkbox" className="accent-seal" checked={form.isAlive} onChange={(e) => setField("isAlive", e.target.checked)} />
                Personne en vie
              </label>
            </div>
            <div>
              <label htmlFor="edit-birthDate" className="meta-label mb-2 block">Date de naissance</label>
              <input id="edit-birthDate" type="date" value={form.birthDate} onChange={(e) => setField("birthDate", e.target.value)} className={`${inputClass} tabular`} />
            </div>
            <div>
              <label htmlFor="edit-deathDate" className="meta-label mb-2 block">Date de deces</label>
              <input id="edit-deathDate" type="date" value={form.deathDate} onChange={(e) => setField("deathDate", e.target.value)} className={`${inputClass} tabular`} />
            </div>
            <div>
              <label htmlFor="edit-birthPlace" className="meta-label mb-2 block">Lieu de naissance</label>
              <input id="edit-birthPlace" value={form.birthPlace} onChange={(e) => setField("birthPlace", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="edit-deathPlace" className="meta-label mb-2 block">Lieu de deces</label>
              <input id="edit-deathPlace" value={form.deathPlace} onChange={(e) => setField("deathPlace", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="edit-photoUrl" className="meta-label mb-2 block">Photo URL</label>
            <input id="edit-photoUrl" value={form.photoUrl} onChange={(e) => setField("photoUrl", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="edit-profession" className="meta-label mb-2 block">Profession</label>
            <input id="edit-profession" value={form.profession} onChange={(e) => setField("profession", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="edit-currentCity" className="meta-label mb-2 block">Habite à</label>
            <input id="edit-currentCity" value={form.currentCity} onChange={(e) => setField("currentCity", e.target.value)} placeholder="Ville de résidence" className={inputClass} />
          </div>

          <div>
            <label htmlFor="edit-nickname" className="meta-label mb-2 block">Surnom</label>
            <input id="edit-nickname" value={form.nickname} onChange={(e) => setField("nickname", e.target.value)} placeholder="Ex : Mémé, Tonton Jo, Papounet..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="edit-description" className="meta-label mb-2 block">Description</label>
            <textarea id="edit-description" value={form.description} onChange={(e) => setField("description", e.target.value)} rows={5} className="w-full px-4 py-3 rounded-[var(--radius)] border border-ink-line bg-paper-deep text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-seal focus:border-seal transition-colors resize-none" />
          </div>

          {canEditVisibility && (
            <div className="rounded-[var(--radius)] border border-ink-line bg-paper-warm p-4">
              <p className="meta-label mb-3">Visibilite</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-ink-soft">
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-seal" checked={form.showBirthDate} onChange={(e) => setField("showBirthDate", e.target.checked)} /> Date de naissance visible</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-seal" checked={form.showDeathDate} onChange={(e) => setField("showDeathDate", e.target.checked)} /> Date de deces visible</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-seal" checked={form.showPhoto} onChange={(e) => setField("showPhoto", e.target.checked)} /> Photo visible</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-seal" checked={form.showMarriage} onChange={(e) => setField("showMarriage", e.target.checked)} /> Mariage visible</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-seal" checked={form.showPersonalData} onChange={(e) => setField("showPersonalData", e.target.checked)} /> Donnees personnelles visibles</label>
              </div>
            </div>
          )}

          <DialogFooter>
            <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 rounded-full border border-ink-line text-sm font-semibold text-ink-soft hover:border-ink hover:text-ink transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="h-9 px-4 rounded-full bg-seal text-paper text-sm font-semibold flex items-center gap-2 hover:bg-seal-bright transition-colors disabled:opacity-40">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : <Pencil className="h-4 w-4" strokeWidth={1.75} />}
              Enregistrer
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
