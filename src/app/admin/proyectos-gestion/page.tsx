
import AdminProjectList from '@/components/admin/AdminProjectList';

export default function AdminProyectosGestionPage() {
  return (
    <div>
      <header className="pb-6 border-b border-border mb-6">
        <h1 className="text-3xl font-bold text-primary">Gestión de Proyectos</h1>
        <p className="text-muted-foreground mt-1">Administra todos los proyectos técnicos de la plataforma.</p>
      </header>
      <AdminProjectList />
    </div>
  );
}
