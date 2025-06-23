import { proyectosService } from "@/lib/supabase/services/proyectosService";
import { ProyectoDetailPage } from "@/components/admin/proyectos/ProyectoDetailPage";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProyectoAdminPage({ params }: PageProps) {
  const { id } = await params;
  const { data: proyecto, error } = await proyectosService.getById(id);

  if (error || !proyecto) {
    notFound();
  }

  return <ProyectoDetailPage proyecto={proyecto} />;
}
