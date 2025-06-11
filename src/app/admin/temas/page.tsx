import { temasService } from "@/lib/supabase/services/temasService";
import { TemasClientPage } from "./components/TemasClientPage";

export default async function TemasPage() {
  const result = await temasService.getAll(true);
  
  if (!result.success || !result.data) {
    throw new Error('Failed to fetch temas');
  }

  return <TemasClientPage allTemas={result.data} />;
} 