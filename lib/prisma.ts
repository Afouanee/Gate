/**
 * Prisma Client Singleton
 *
 * Crée une instance unique de PrismaClient pour éviter les multiples connexions
 * En développement: le client est stocké sur globalThis pour la hot reload
 * En production: une nouvelle instance par requête
 */

import { PrismaClient } from "@prisma/client";

/**
 * Type pour globalThis avec Prisma
 * Permet le typing du singleton en développement
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton: retourne le client existant ou crée un nouveau
 * - Dev: stocke sur globalThis pour éviter recreation à chaque hot reload
 * - Prod: crée une instance par requête (sans stockage)
 * - Logs: query, warn, error en dev; error seulement en prod
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Stockage du singleton en développement (pas de rechargement inutile)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
