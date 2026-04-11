"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Crown, LogOut, User, Settings, TreePine, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./language-switcher";

export function Navbar() {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const navLinks = [
    { href: "/arbre",   label: t("tree"),    icon: TreePine, auth: true  },
    { href: "/export",  label: t("export"),  icon: Download, auth: true  },
    { href: "/pricing", label: t("pricing"), icon: null,     auth: false },
    { href: "/contact", label: t("contact"), icon: null,     auth: false },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)]"
          : "bg-white border-b border-zinc-100"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/favicon.ico"
            alt="Gate"
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="text-lg font-black font-heading tracking-tight text-zinc-900">
            Gate
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => {
            if (link.auth && !session) return null;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  active
                    ? "text-zinc-900 bg-zinc-50"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                {link.icon && <link.icon className="h-3.5 w-3.5" />}
                {link.label}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-zinc-900 rounded-full" />
                )}
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
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-zinc-900 text-white rounded-full"
                >
                  <Settings className="h-3 w-3" />
                  Admin
                </Link>
              )}
              {session.user.role === "PREMIUM" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border border-zinc-200 text-zinc-600 rounded-full">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              )}
              <Link
                href="/mon-compte"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">
                  {(session.user.name || session.user.email || "?")[0].toUpperCase()}
                </div>
                <span className="hidden lg:block max-w-[100px] truncate">
                  {session.user.name || session.user.email}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title={t("logout")}
                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {t("register")}
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => {
              if (link.auth && !session) return null;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-zinc-50 text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}

            <div className="border-t border-zinc-100 pt-3 mt-2 flex flex-col gap-1">
              {session ? (
                <>
                  <Link
                    href="/mon-compte"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    {t("myAccount")}
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      {t("admin")}
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-center text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                    {t("login")}
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-center text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                    {t("register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
