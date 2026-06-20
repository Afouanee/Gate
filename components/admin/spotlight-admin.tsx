"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye, EyeOff, Loader2, ArrowUpRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Spotlight = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  active: boolean;
  order: number;
};

const EMPTY = { title: "", subtitle: "", description: "", url: "", imageUrl: "", order: 0 };

export function SpotlightAdmin() {
  const { toast } = useToast();
  const [items, setItems] = useState<Spotlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/spotlights");
      const data = await res.json();
      setItems(data.spotlights || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/spotlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        toast({ title: "Erreur", description: "Création impossible.", variant: "destructive" });
        return;
      }
      setForm({ ...EMPTY });
      toast({ title: "Ajouté", description: "L'encart a été créé." });
      load();
    } catch {
      toast({ title: "Erreur", description: "Réseau indisponible.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (s: Spotlight) => {
    await fetch(`/api/spotlights/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/spotlights/${id}`, { method: "DELETE" });
    load();
  };

  const inputClass =
    "w-full rounded-[var(--radius)] border border-ink-line bg-paper-deep px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-seal focus:outline-none focus:ring-2 focus:ring-seal/30 transition-colors";

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-paper px-4 py-12 sm:px-6">
      <div className="container mx-auto max-w-4xl">

        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Retour admin
        </Link>

        <header className="mb-10">
          <span className="section-no">№ · À l&apos;honneur</span>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Projets des proches
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Mettez en avant un commerce, un compte, une initiative d&apos;un membre de la famille.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">

          {/* Formulaire de création */}
          <form
            onSubmit={create}
            className="space-y-3 rounded-[var(--radius)] border border-ink-line bg-card p-5 h-fit"
          >
            <p className="meta-label mb-1 flex items-center gap-2">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Nouvel encart
            </p>
            <div>
              <label htmlFor="sp-title" className="mb-1 block meta-label">Titre</label>
              <input id="sp-title" className={inputClass} value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Le resto de Samir" required />
            </div>
            <div>
              <label htmlFor="sp-sub" className="mb-1 block meta-label">Sous-titre</label>
              <input id="sp-sub" className={inputClass} value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Cuisine indo-française · Marseille" />
            </div>
            <div>
              <label htmlFor="sp-desc" className="mb-1 block meta-label">Description</label>
              <textarea id="sp-desc" rows={3} className={inputClass} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Quelques mots sur le projet…" />
            </div>
            <div>
              <label htmlFor="sp-url" className="mb-1 block meta-label">Lien (Insta, site…)</label>
              <input id="sp-url" type="url" className={inputClass} value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://instagram.com/…" />
            </div>
            <div>
              <label htmlFor="sp-img" className="mb-1 block meta-label">Image (URL)</label>
              <input id="sp-img" type="url" className={inputClass} value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…/photo.jpg" />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-seal text-sm font-medium text-paper transition-colors hover:bg-seal-bright disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Ajouter</>}
            </button>
          </form>

          {/* Liste */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-ink-faint">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-[var(--radius)] border border-dashed border-ink-line p-8 text-center text-sm text-ink-faint">
                Aucun encart pour le moment.
              </div>
            ) : (
              items.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 rounded-[var(--radius)] border border-ink-line bg-card p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-serif text-base font-semibold text-ink">{s.title}</p>
                      {!s.active && (
                        <span className="rounded-full bg-paper-deep px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                          masqué
                        </span>
                      )}
                    </div>
                    {s.subtitle && <p className="text-xs text-ink-faint">{s.subtitle}</p>}
                    {s.description && (
                      <p className="mt-1 text-sm text-ink-soft line-clamp-2">{s.description}</p>
                    )}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-seal hover:underline">
                        {s.url} <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => toggle(s)} aria-label={s.active ? "Masquer" : "Afficher"}
                      className="rounded-[var(--radius)] p-2 text-ink-faint transition-colors hover:bg-paper-warm hover:text-ink">
                      {s.active ? <Eye className="h-4 w-4" strokeWidth={1.75} /> : <EyeOff className="h-4 w-4" strokeWidth={1.75} />}
                    </button>
                    <button onClick={() => remove(s.id)} aria-label="Supprimer"
                      className="rounded-[var(--radius)] p-2 text-ink-faint transition-colors hover:bg-seal-tint hover:text-destructive">
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
