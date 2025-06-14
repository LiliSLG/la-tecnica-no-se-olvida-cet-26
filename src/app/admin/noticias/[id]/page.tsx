import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiasClientPage } from "@/components/admin/noticias/NoticiasListPage";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function NoticiaAdminPage({ params }: PageProps) {
  const { data: noticia, error } = await noticiasService.getById(params.id);

  if (error || !noticia) {
    notFound();
  }

  return <NoticiasClientPage allNoticias={noticia} />;
}
