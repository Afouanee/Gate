import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo + tagline */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/favicon.ico" alt="Gate" className="h-7 w-7 rounded-md object-contain" />
              <span className="font-black font-heading text-sm text-zinc-900">Gate</span>
            </Link>
            <span className="hidden sm:block w-px h-4 bg-zinc-200" />
            <span className="hidden sm:block text-xs text-zinc-400">La porte vers vos origines</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {[
              { href: "/pricing", label: "Tarifs" },
              { href: "/contact", label: "Contact" },
              { href: "/charte",  label: "Charte" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* By */}
          <p className="text-xs text-zinc-400 font-medium">
            by{" "}
            <span className="text-zinc-700 font-semibold font-heading">Afouanee.dev</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
