/**
 * Visibilité des champs Person — source unique de vérité.
 *
 * Règle (unifiée sur tous les endpoints : /tree, /search, /persons/[id], /export) :
 *   un champ est visible si l'utilisateur est Premium/Admin OU si le flag
 *   `showXxx` de la personne l'autorise publiquement.
 *
 * Auparavant /tree et /search utilisaient un ET (jamais visible pour les FREE)
 * alors que /persons/[id] utilisait un OU → fuite/incohérence selon la page.
 */

import type { Role } from "@prisma/client";

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

/** Un champ « date/photo » est-il visible pour cet utilisateur ? */
export function canSeeField(isPremium: boolean, flag: boolean | null | undefined): boolean {
  return isPremium || !!flag;
}

/**
 * Données personnelles « riches » (lieux, description, profession, ville).
 * Visibles si Premium OU si la personne a activé showPersonalData.
 */
export function canSeePersonalData(isPremium: boolean, flags: PersonVisibilityFlags): boolean {
  return isPremium || !!flags.showPersonalData;
}
