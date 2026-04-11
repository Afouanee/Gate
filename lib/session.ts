/**
 * Session Utilities
 *
 * Helper functions pour:
 * - Récupérer la session utilisateur (côté serveur)
 * - Protéger les routes selon rôles
 */

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

/**
 * Récupère la session utilisateur côté serveur
 * Peut retourner null si non authentifié
 *
 * @returns Session NextAuth ou null
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Middleware: Redirige vers login si non authentifié
 * Usage: dans les Server Components pour protéger l'accès
 *
 * @returns Session si authentifié
 * @throws Redirige vers /login si non authentifié
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Middleware: Protège l'accès admin
 * Redirige vers /403 si rôle != ADMIN
 * Usage: dans les pages/API admin
 *
 * @returns Session si administrateur
 * @throws Redirige vers /login (non auth) ou /403 (non admin)
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/403");
  }
  return session;
}

/**
 * Middleware: Redirige FREE vers pricing
 * Autorise: PREMIUM et ADMIN
 * Usage: pour les fonctionnalités payantes
 *
 * @returns Session si PREMIUM ou ADMIN
 * @throws Redirige vers /login (non auth) ou /pricing (FREE)
 */
export async function requirePremiumOrAdmin() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role === "FREE") {
    redirect("/pricing");
  }
  return session;
}
