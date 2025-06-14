// /app/admin/noticias/[id]/edit/page.tsx
import { NoticiaForm } from "@/components/admin/noticias/NoticiaForm";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { notFound } from "next/navigation";

interface EditPageProps {
  params: { id: string };
}

export default async function EditarNoticiaPage({ params }: EditPageProps) {
  const { data: noticia, error } = await noticiasService.getById(params.id);

  if (error || !noticia) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Noticia</h1>
      <NoticiaForm initialData={noticia} />
    </div>
  );
}
