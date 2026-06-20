import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-line bg-paper">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

          {/* Logo + devise */}
          <div className="flex flex-col gap-3">
            <Link href="/" aria-label="Gate, accueil" className="transition-opacity hover:opacity-80">
              <Logo size={24} />
            </Link>
            <p className="font-serif text-sm italic text-ink-faint">
              La porte vers vos origines.
            </p>
          </div>

          {/* Liens */}
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {[
              { href: "/pondichery", label: "Pondichéry" },
              { href: "/karaikal", label: "Karaikal" },
              { href: "/pricing", label: "Tarifs" },
              { href: "/contact", label: "Contact" },
              { href: "/charte", label: "Charte" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="link-underline text-sm text-ink-soft hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="rule-line my-8" />

        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            © {year} Gate · Tous droits réservés
          </p>
          <p className="text-xs text-ink-faint">
            par{" "}
            <span className="font-serif font-semibold text-ink-soft">Afouanee.dev</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
