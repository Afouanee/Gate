/**
 * Root Layout (app/layout.tsx)
 *
 * Layout racine de l'application Next.js
 * - Métadonnées (titre, description, favicon)
 * - Viewport config pour PWA
 * - Structure HTML minimale
 *
 * Note: Locale layout ([locale]/layout.tsx) enveloppe ce layout pour i18n
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Métadonnées SEO et PWA
 */
export const metadata: Metadata = {
  title: "Gate — La porte vers vos origines",
  description: "Plateforme d'arbre généalogique avancé permettant de représenter des relations familiales complexes et croisées.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

/**
 * Configuration viewport pour PWA et mobile
 */
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

/**
 * Root layout render
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
