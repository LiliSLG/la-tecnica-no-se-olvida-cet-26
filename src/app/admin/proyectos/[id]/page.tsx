import { proyectosService } from '@/lib/supabase/services/proyectosService';
import { ProyectoAdminClientPage } from '@/components/admin/proyectos/ProyectoAdminClientPage';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProyectoAdminPage({ params }: PageProps) {
  const { data: proyecto, error } = await proyectosService.getById(params.id);

  if (error || !proyecto) {
    notFound();
  }

  return <ProyectoAdminClientPage proyecto={proyecto} />;
} 