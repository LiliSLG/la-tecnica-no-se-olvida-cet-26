// /app/admin/proyectos/new/page.tsx
import { ProyectoForm } from '@/components/admin/proyectos/ProyectoForm';

export default function NuevoProyectoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Proyecto</h1>
      {/* Le pasamos el formulario sin initialData para que sepa que es modo 'crear' */}
      <ProyectoForm />
    </div>
  );
}