
import AdminEntrevistaList from '@/components/admin/AdminEntrevistaList';

export default function AdminGestionEntrevistasPage() {
  return (
    <div>
      <header className="pb-6 border-b border-border mb-6">
        <h1 className="text-3xl font-bold text-primary">Gestión de Entrevistas</h1>
        <p className="text-muted-foreground mt-1">Administra las entrevistas de historia oral y saberes rurales.</p>
      </header>
      <AdminEntrevistaList />
    </div>
  );
}

    