import { temasService } from "@/lib/supabase/services/temasService";
import { TemasListPage } from "../../../components/admin/temas/TemasListPage";

export default async function TemasPage() {
  const result = await temasService.getAll(true);
  console.log(result);
  if (!result.success || !result.data) {
    throw new Error("Failed to fetch temas");
  }

  return <TemasListPage allTemas={result.data} />;
}
