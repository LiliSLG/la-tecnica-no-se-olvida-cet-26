// /app/admin/proyectos/[id]/edit/page.tsx
import { ProyectoForm } from '@/components/admin/proyectos/ProyectoForm';
import { proyectosService } from '@/lib/supabase/services/proyectosService';
import { notFound } from 'next/navigation';

interface EditPageProps {
  params: { id: string };
}

export default async function EditarProyectoPage({ params }: EditPageProps) {
  const { data: proyecto, error } = await proyectosService.getById(params.id);

  if (error || !proyecto) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Proyecto</h1>
      <ProyectoForm initialData={proyecto} />
    </div>
  );
}