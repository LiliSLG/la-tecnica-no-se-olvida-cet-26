
import EditProjectContent from '@/components/sections/EditProjectContent';

export default function EditarProyectoPage({ params }: { params: { id: string } }) {
  return <EditProjectContent projectId={params.id} />;
}
