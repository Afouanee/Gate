/**
 * Utility Functions
 *
 * Fonctions utilitaires générales pour:
 * - Formatage de dates
 * - Calcul d'âge
 * - Manipulation de chaînes
 * - Utilitaires Tailwind
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInYears } from "date-fns";
import { fr, enUS } from "date-fns/locale";

/**
 * Combine les classes Tailwind intelligemment
 * Résout les conflits de classes (ex: w-full vs w-1/2)
 * Utilise clsx pour la logique conditionnelle + twMerge pour les conflits
 *
 * @param inputs Classes à combiner
 * @returns Classes fusionnées sans conflits
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une Date en chaîne lisible
 * Localisation FR/EN automatique
 *
 * @param date Date à formater (Date, string ISO, ou null)
 * @param locale "fr" ou "en"
 * @returns Ex: "15 janvier 2024"
 */
export function formatDate(date: Date | string | null, locale = "fr"): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy", { locale: locale === "fr" ? fr : enUS });
}

/**
 * Calcule l'âge d'une personne
 * Supporte les personnes décédées (calcule l'âge au décès)
 *
 * @param birthDate Date de naissance (Date ou string ISO)
 * @param deathDate Date de décès optionnelle
 * @returns Âge en années (null si birthDate vide)
 */
export function getAge(birthDate: Date | string | null, deathDate?: Date | string | null): number | null {
  if (!birthDate) return null;
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const end = deathDate ? (typeof deathDate === "string" ? new Date(deathDate) : deathDate) : new Date();
  return differenceInYears(end, birth);
}

/**
 * Tronque une chaîne et ajoute des points de suspension
 * Utilisé pour les titres long dans l'UI
 *
 * @param str Chaîne à tronquer
 * @param maxLength Longueur max
 * @returns Chaîne tronquée + "..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Extrait les initiales d'une personne pour avatar
 * Ex: "Jean Dupont" -> "JD"
 *
 * @param firstName Prénom
 * @param lastName Nom
 * @returns Initiales en majuscules
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}
