import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-paper px-6">
      <div className="max-w-sm text-center" style={{ animation: "fade-in-scale 0.5s both" }}>
        <span className="section-no">№ · Introuvable</span>
        <p className="my-2 select-none font-serif text-[8rem] font-semibold leading-none text-ink-line tabular">
          404
        </p>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Cette page n&apos;est pas au registre.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          La page recherchée n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-all hover:bg-ink-soft active:scale-[0.98]"
        >
          Retour à l&apos;accueil
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
