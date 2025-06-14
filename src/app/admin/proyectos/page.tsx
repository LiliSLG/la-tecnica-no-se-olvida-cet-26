import { proyectosService } from "@/lib/supabase/services/proyectosService";
import { ProyectosListPage } from "@/components/admin/proyectos/ProyectosListPage";
import { Database } from "@/lib/supabase/types/database.types";

type Proyecto = Database["public"]["Tables"]["proyectos"]["Row"];

export default async function ProyectosAdminPage() {
  try {
    const { data: allProyectos, error } = await proyectosService.getAll(true);

    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }

    return <ProyectosListPage allProyectos={allProyectos || []} />;
  } catch (error) {
    console.error("Error in ProyectosAdminPage:", error);
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">
          Ha ocurrido un error al cargar los proyectos. Por favor, intente
          nuevamente.
        </p>
      </div>
    );
  }
}
