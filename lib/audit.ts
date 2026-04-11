/**
 * Audit Logging
 *
 * Fonction helper pour enregistrer les actions audit
 * Utilisée pour la conformité légale et la traçabilité
 */

import { prisma } from "./prisma";
import { AuditAction, Prisma } from "@prisma/client";

/**
 * Crée un log d'audit pour une action
 *
 * Enregistre:
 * - Qui a fait l'action (userId)
 * - Quoi (action + entity + entityId)
 * - Quand (createdAt auto générée)
 * - D'où (IP + User-Agent)
 * - Détails supplémentaires (JSON customisé)
 *
 * Les erreurs sont loggées mais pas remontées (audit ne doit pas bloquer)
 *
 * @param userId Utilisateur qui a fait l'action (undefined = système)
 * @param action Type d'action (cf enum AuditAction)
 * @param entity Nom de la table/entité
 * @param entityId ID de l'entité affectée
 * @param details JSON supplémentaires (avant/après, etc.)
 * @param ip IP de l'utilisateur
 * @param userAgent User-Agent du navigateur
 */
export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  details,
  ip,
  userAgent,
}: {
  userId?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  details?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  ip?: string;
  userAgent?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    // Log l'erreur en console mais ne remonte pas l'exception
    // pour ne pas bloquer les opérations
    console.error("Failed to create audit log:", error);
  }
}
