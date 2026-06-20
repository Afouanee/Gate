import { requireAdmin } from "@/lib/session";
import { SpotlightAdmin } from "@/components/admin/spotlight-admin";

export const metadata = { title: "À l'honneur · Admin · Gate" };

export default async function AdminSpotlightsPage() {
  await requireAdmin();
  return <SpotlightAdmin />;
}
