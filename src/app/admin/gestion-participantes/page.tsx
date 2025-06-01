
import AdminParticipanteList from '@/components/admin/AdminParticipanteList';

export default function AdminGestionParticipantesPage() {
  return (
    <div>
      <header className="pb-6 border-b border-border mb-6">
        <h1 className="text-3xl font-bold text-primary">Gestión de Participantes</h1>
        <p className="text-muted-foreground mt-1">Administra los perfiles de todas las personas en la plataforma.</p>
      </header>
      <AdminParticipanteList />
    </div>
  );
}
