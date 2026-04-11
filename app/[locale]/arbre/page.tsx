/**
 * Page: /arbre
 *
 * Arbre généalogique complet
 * - Route PROTÉGÉE: require session
 * - Charge TreeExplorer (reactflow + search)
 * - FREE: affiche limite de profils (10)
 * - PREMIUM: arbre complet illimité
 */

import { requireSession } from "@/lib/session";
import { TreeExplorer } from "@/components/tree/tree-explorer";

export default async function ArbrePage() {
  await requireSession();

  return <TreeExplorer />;
}
