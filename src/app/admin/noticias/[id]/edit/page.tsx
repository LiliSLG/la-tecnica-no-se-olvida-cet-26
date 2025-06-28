// src/app/admin/noticias/[id]/edit/page.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiaForm } from "@/components/admin/noticias/NoticiaForm";
import { BackButton } from "@/components/shared/navigation/BackButton";
import { notFound } from "next/navigation";
import { noticiaTemasService } from "@/lib/supabase/services/noticiaTemasService";

interface EditNoticiaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditNoticiaPage({
  params,
}: EditNoticiaPageProps) {
  const { id } = await params;

  try {
    console.log("🔍 Loading noticia for edit:", id);

    // 🔄 AGREGAR carga de temas junto con la noticia
    const [noticiaResult, temasResult] = await Promise.all([
      noticiasService.getByIdWithAuthor(id), // o getById según tengas
      noticiaTemasService.getTemasForNoticia(id),
    ]);

    if (!noticiaResult.success || !noticiaResult.data) {
      notFound();
    }

    const noticia = noticiaResult.data;
    const temasIds = temasResult.success ? temasResult.data || [] : [];

    console.log("📊 Loaded noticia with temas:", {
      titulo: noticia.titulo,
      temasCount: temasIds.length,
    });

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton />

          <Card>
            <CardHeader>
              <CardTitle>Editar Noticia</CardTitle>
              <CardDescription>
                Modifica los datos de la noticia "{noticia.titulo}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 🔄 CAMBIO: Pasar los temas iniciales al formulario */}
              <NoticiaForm
                initialData={noticia}
                initialTemas={temasIds} // 🆕 NUEVO
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading noticia for edit:", error);
    notFound();
  }
}
