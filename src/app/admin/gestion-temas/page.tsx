
import AdminTemaList from '@/components/admin/AdminTemaList';

export default function AdminGestionTemasPage() {
  return (
    <div>
      <header className="pb-6 border-b border-border mb-6">
        <h1 className="text-3xl font-bold text-primary">Gestión de Temas</h1>
        <p className="text-muted-foreground mt-1">Administra los temas y categorías temáticas de la plataforma.</p>
      </header>
      <AdminTemaList />
    </div>
  );
}
