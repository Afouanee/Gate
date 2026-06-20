/**
 * Quotas FREE mensuels — reset « lazy » sans cron.
 *
 * Principe : on stocke `quotaPeriodStart` sur le User. Au premier appel d'une
 * nouvelle période (mois calendaire écoulé), on remet searchCount/exportCount à 0
 * et on avance la période. Le reset est atomique (updateMany conditionnel) pour
 * rester safe en concurrence. Pas de tâche planifiée nécessaire → serverless-friendly.
 *
 * Quotas appliqués (cf. pricing) : 5 recherches / mois, 1 export / mois (FREE).
 */
import { prisma } from "./prisma";

export const FREE_SEARCH_LIMIT = 5;
export const FREE_EXPORT_LIMIT = 1;

/** Début du mois calendaire courant (UTC). */
export function currentPeriodStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Réinitialise les compteurs si la période de quota de l'utilisateur est révolue.
 * Atomique : si une autre requête a déjà fait le reset, le updateMany ne matche pas
 * (count 0) et on ne refait rien. À appeler AVANT de lire/incrémenter les compteurs.
 *
 * @returns true si un reset a eu lieu (les compteurs valent désormais 0)
 */
export async function ensureQuotaPeriod(userId: string, now = new Date()): Promise<boolean> {
  const periodStart = currentPeriodStart(now);
  const res = await prisma.user.updateMany({
    where: { id: userId, quotaPeriodStart: { lt: periodStart } },
    data: { searchCount: 0, exportCount: 0, quotaPeriodStart: periodStart },
  });
  return res.count > 0;
}
