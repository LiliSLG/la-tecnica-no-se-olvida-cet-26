
import AdminOrganizacionList from '@/components/admin/AdminOrganizacionList';

export default function AdminOrganizacionesGestionPage() {
  return (
    <div>
      <header className="pb-6 border-b border-border mb-6">
        <h1 className="text-3xl font-bold text-primary">Gestión de Organizaciones</h1>
        <p className="text-muted-foreground mt-1">Administra las organizaciones colaboradoras y tutoras.</p>
      </header>
      <AdminOrganizacionList />
    </div>
  );
}
