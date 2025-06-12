// /app/admin/noticias/page.tsx
import { cookies } from "next/headers";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiasClientPage } from "@/components/admin/noticias/NoticiasClientPage";

export default async function NoticiasAdminPage() {
  const { data: noticias, error } = await noticiasService.getAll(true);

  if (error) {
    // Manejar el error
    return <div>Error al cargar las noticias.</div>;
  }

  return <NoticiasClientPage allNoticias={noticias || []} />;
}
