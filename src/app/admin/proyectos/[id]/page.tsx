import { proyectosService } from "@/lib/supabase/services/proyectosService";
import { ProyectoDetailPage } from "@/components/admin/proyectos/ProyectoDetailPage";
import { notFound } from "next/navigation";

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

  return <ProyectoDetailPage proyecto={proyecto} />;
}
