// src/app/admin/noticias/[id]/edit/page.tsx
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiaForm } from "@/components/admin/noticias/NoticiaForm";
import { BackButton } from "@/components/common/BackButton";
import { notFound } from "next/navigation";

interface EditNoticiaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditNoticiaPage({
  params,
}: EditNoticiaPageProps) {
  // ✅ ARREGLO Next.js 15: await params antes de usar sus propiedades
  const { id } = await params;

  try {
    const result = await noticiasService.getById(id);

    if (!result.success || !result.data) {
      notFound();
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <BackButton />
        <h1 className="text-3xl font-bold mb-8">Editar Noticia</h1>
        <NoticiaForm initialData={result.data} />
      </div>
    );
  } catch (error) {
    console.error("Error loading noticia for edit:", error);
    notFound();
  }
}
