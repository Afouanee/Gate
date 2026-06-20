"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Crown, LogOut, User, Settings, TreePine, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "./language-switcher";

export function Navbar() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fermer le menu mobile sur changement de route
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const navLinks = [
    { href: "/arbre", label: t("tree"), icon: TreePine, auth: true },
    { href: "/export", label: t("export"), icon: Download, auth: true },
    { href: "/pondichery", label: "Pondichéry", icon: null, auth: false },
    { href: "/pricing", label: t("pricing"), icon: null, auth: false },
    { href: "/contact", label: t("contact"), icon: null, auth: false },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-paper/85 backdrop-blur-md border-b border-ink-line"
          : "bg-paper border-b border-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link
          href="/"
          aria-label="Gate, accueil"
          className="group inline-flex items-center transition-opacity hover:opacity-80"
        >
          <Logo size={26} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            if (link.auth && !session) return null;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-[var(--radius)] transition-colors",
                  active
                    ? "text-ink"
                    : "text-ink-faint hover:text-ink"
                )}
              >
                {link.icon && <link.icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-px left-3.5 right-3.5 h-px bg-seal origin-left transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {session ? (
            <div className="hidden md:flex items-center gap-2">
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] bg-ink text-paper rounded-full hover:bg-ink-soft transition-colors"
                >
                  <Settings className="h-3 w-3" strokeWidth={1.75} />
                  Admin
                </Link>
              )}
              {session.user.role === "PREMIUM" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] border border-seal/30 bg-seal-tint text-seal rounded-full">
                  <Crown className="h-3 w-3" strokeWidth={1.75} />
                  Premium
                </span>
              )}
              <Link
                href="/mon-compte"
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 text-sm text-ink-soft hover:text-ink hover:bg-paper-warm rounded-full transition-colors"
              >
                <span className="h-7 w-7 rounded-full bg-ink flex items-center justify-center text-paper text-xs font-semibold">
                  {(session.user.name || session.user.email || "?")[0].toUpperCase()}
                </span>
                <span className="hidden lg:block max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title={t("logout")}
                aria-label={t("logout")}
                className="p-2 text-ink-faint hover:text-seal hover:bg-paper-warm rounded-[var(--radius)] transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-ink-soft hover:text-ink hover:bg-paper-warm rounded-full transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-paper bg-ink hover:bg-ink-soft rounded-full transition-colors active:scale-[0.98]"
              >
                {t("register")}
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-ink-soft hover:text-ink hover:bg-paper-warm rounded-[var(--radius)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-line bg-paper animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => {
              if (link.auth && !session) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-3 rounded-[var(--radius)] text-sm transition-colors",
                    isActive(link.href)
                      ? "bg-paper-warm text-ink"
                      : "text-ink-soft hover:text-ink hover:bg-paper-warm"
                  )}
                >
                  {link.icon && <link.icon className="h-4 w-4" strokeWidth={1.75} />}
                  {link.label}
                </Link>
              );
            })}

            <div className="rule-line my-2" />

            {session ? (
              <>
                <Link
                  href="/mon-compte"
                  className="flex items-center gap-2.5 px-3 py-3 rounded-[var(--radius)] text-sm text-ink-soft hover:text-ink hover:bg-paper-warm transition-colors"
                >
                  <User className="h-4 w-4" strokeWidth={1.75} />
                  {t("myAccount")}
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-3 py-3 rounded-[var(--radius)] text-sm text-ink-soft hover:text-ink hover:bg-paper-warm transition-colors"
                  >
                    <Settings className="h-4 w-4" strokeWidth={1.75} />
                    {t("admin")}
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-[var(--radius)] text-sm text-seal hover:bg-seal-tint transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                  {t("logout")}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/login"
                  className="px-4 py-3 text-sm text-center text-ink border border-ink-line rounded-full hover:bg-paper-warm transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-3 text-sm font-medium text-center text-paper bg-ink rounded-full hover:bg-ink-soft transition-colors"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
