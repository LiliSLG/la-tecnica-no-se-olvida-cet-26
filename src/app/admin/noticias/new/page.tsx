// src/app/admin/noticias/new/page.tsx
import { NoticiaForm } from "@/components/admin/noticias/NoticiaForm";
import { BackButton } from "@/components/common/BackButton";

export default function NewNoticiaPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton />
      <h1 className="text-3xl font-bold mb-8">Nueva Noticia</h1>
      <NoticiaForm />
    </div>
  );
}
