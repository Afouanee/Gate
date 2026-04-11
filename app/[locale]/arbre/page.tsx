import { requireSession } from "@/lib/session";
import { TreeExplorer } from "@/components/tree/tree-explorer";

export default async function ArbrePage() {
  await requireSession();

  return <TreeExplorer />;
}
