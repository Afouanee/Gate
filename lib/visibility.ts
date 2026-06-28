/**
 * Visibilité des champs Person — source unique de vérité.
 *
 * Règle (unifiée sur tous les endpoints : /tree, /search, /persons, /persons/[id],
 * /export) : un champ est visible si l'utilisateur peut TOUT voir (ADMIN) OU si le
 * flag `showXxx` de la personne l'autorise publiquement.
 *
 * IMPORTANT (modèle « Bienfaiteur ») : la visibilité ne dépend PLUS du paiement.
 * Un membre qui soutient le projet (rôle PREMIUM en base) ne « débloque » AUCUNE
 * donnée masquée d'un proche : faire payer pour voir la date de naissance de sa
 * tante serait contraire à l'esprit familial. Seul l'ADMIN (gestion des données)
 * voit tout ; pour tous les autres membres, la confidentialité est décidée par la
 * famille via les flags `showXxx`, jamais par le portefeuille.
 *
 * `canSeeAll` remplace l'ancien `isUserPremium` dans le chemin de visibilité.
 */

import type { Role } from "@prisma/client";

/** Peut voir TOUS les champs, indépendamment des flags (réservé à l'ADMIN). */
export function canSeeAll(role: Role | string | null | undefined): boolean {
  return role === "ADMIN";
}

/**
 * Conservé pour compatibilité (badge « Bienfaiteur », libellés), MAIS ne doit PLUS
 * servir à décider la visibilité des données. Utiliser `canSeeAll` pour ça.
 * @deprecated pour la visibilité — n'indique qu'un statut de soutien.
 */
export function isUserPremium(role: Role | string | null | undefined): boolean {
  return role === "PREMIUM" || role === "ADMIN";
}

/** Champs de visibilité portés par une Person. */
export interface PersonVisibilityFlags {
  showBirthDate?: boolean | null;
  showDeathDate?: boolean | null;
  showPhoto?: boolean | null;
  showPersonalData?: boolean | null;
}

/**
 * Un champ « date/photo » est-il visible ? `seeAll` (= ADMIN) voit tout ; sinon le
 * flag `showXxx` de la personne décide. Le 1er paramètre est désormais « peut tout
 * voir » (ADMIN), plus « est premium ».
 */
export function canSeeField(seeAll: boolean, flag: boolean | null | undefined): boolean {
  return seeAll || !!flag;
}

/**
 * Données personnelles « riches » (lieux, description, profession, ville).
 * Visibles si ADMIN OU si la personne a activé showPersonalData.
 */
export function canSeePersonalData(seeAll: boolean, flags: PersonVisibilityFlags): boolean {
  return seeAll || !!flags.showPersonalData;
}
