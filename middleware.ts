/**
 * Middleware Next.js
 *
 * Gère deux aspects:
 * 1. Internationalisation (i18n): next-intl
 * 2. Authentification: routes protégées
 *
 * Ordre d'exécution:
 * - Détecte si route est protégée
 * - Si oui: applique authMiddleware (NextAuth) puis i18n
 * - Si non: applique i18n uniquement
 *
 * Routes protégées (nécessitent session):
 * - /arbre: arbre généalogique complet
 * - /mon-compte: profil utilisateur
 * - /rattachement: demande de lien avec profil
 * - /export: export de données
 * - /admin: tableaux de bord admin
 */

import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["fr", "en"];
const defaultLocale = "fr";

/**
 * Middleware i18n (next-intl)
 * - Détecte langue depuis URL/header
 * - Charge messages appropriés
 * - localePrefix: "as-needed" = /fr/ seulement si différent du défaut
 */
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  // Français forcé par défaut : on n'auto-détecte PAS la langue du navigateur.
  // Un visiteur arrive toujours en FR ; /en reste accessible manuellement.
  localeDetection: false,
});

/**
 * Middleware auth (NextAuth)
 * - Protège les routes: require token valide
 * - Redirige vers "/login" si pas authentifié
 * - Chaîné avec intlMiddleware en cas de succès
 */
const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token != null,
    },
    pages: {
      signIn: "/login",
    },
  }
);

/**
 * Middleware principal
 * Décide quel middleware appliquer selon la route
 */
/**
 * Interrupteur global d'authentification.
 * Mettre AUTH_DISABLED="true" dans .env.local pour naviguer librement
 * (aucune route n'est protégée). À retirer pour réactiver l'auth.
 */
const AUTH_DISABLED = process.env.AUTH_DISABLED === "true";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth désactivée → on applique uniquement l'i18n, plus aucune protection.
  if (AUTH_DISABLED) {
    return intlMiddleware(req);
  }

  /**
   * Patterns de routes protégées
   * Supporte les versions avec et sans préfixe locale
   */
  const protectedPatterns = [
    // Sans préfixe locale
    /^\/arbre/,
    /^\/mon-compte/,
    /^\/rattachement/,
    /^\/export/,
    /^\/admin/,
    // Avec préfixe locale (fr|en)
    /^\/(fr|en)\/arbre/,
    /^\/(fr|en)\/mon-compte/,
    /^\/(fr|en)\/rattachement/,
    /^\/(fr|en)\/export/,
    /^\/(fr|en)\/admin/,
  ];

  const isProtected = protectedPatterns.some((pattern) =>
    pattern.test(pathname)
  );

  // Applique authMiddleware si protégée, sinon juste i18n
  if (isProtected) {
    return (authMiddleware as any)(req);
  }

  return intlMiddleware(req);
}

/**
 * Config du matcher
 * Exclut: API, assets statiques (_next), fichiers config
 * Match tout le reste pour i18n
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
