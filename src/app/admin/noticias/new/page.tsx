// /app/admin/noticias/new/page.tsx
import { NoticiaForm } from '@/components/admin/noticias/NoticiaForm';

export default function NuevoNoticiaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Crear Nueva Noticia</h1>
      {/* Le pasamos el formulario sin initialData para que sepa que es modo 'crear' */}
      <NoticiaForm />
    </div>
  );
}