/**
 * Internationalisation (i18n) Configuration
 *
 * Setup next-intl pour FR/EN bilingue
 * Charge les traductions depuis les fichiers JSON
 *
 * Usage:
 * - Server Components: useTranslations() hook
 * - Chemin messages: ./messages/[fr|en].json
 */

import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const locales = ["fr", "en"];

/**
 * Configuration i18n pour chaque requête
 * - Détecte locale depuis paramètre URL
 * - Valide contre liste supportée
 * - Charge fichier messages correspondant
 *
 * @param requestLocale Locale détecté par middleware
 * @returns {locale, messages} pour le rendering
 * @throws notFound() si locale non supportée
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // Valide que locale est dans la liste supportée
  if (!locale || !locales.includes(locale)) notFound();

  return {
    locale,
    // Import dynamique du fichier JSON appropriate (FR ou EN)
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
