/**
 * Root Layout (app/layout.tsx)
 *
 * Layout racine — point unique du <html>/<body>.
 * Charge les polices du design system « Éditorial Archive » via next/font :
 *  - Fraunces (serif déclaré) pour les titres
 *  - Inter (grotesque) pour le corps
 *  - JetBrains Mono pour méta/labels/chiffres
 *
 * Le locale layout ([locale]/layout.tsx) n'émet PAS de <html> (évite le double).
 */

import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  // Fraunces est une police variable : on laisse next/font charger toute la
  // plage de graisses (ne PAS combiner `weight` et `axes`).
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Gate · La porte vers vos origines",
  description:
    "Registre familial vivant. Tracez vos racines, reliez les générations et conservez la mémoire des vôtres.",
  manifest: "/manifest.json",
  // La favicon est générée automatiquement par Next depuis `app/icon.svg`
  // (monogramme « G » dans la DA « Daylight »). Ne pas re-pointer vers un .ico.
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper text-ink font-sans flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
