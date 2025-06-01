
import PersonaDetailContent from '@/components/sections/PersonaDetailContent';

interface PersonaDetailPageProps {
  params: { personaId: string };
}

export default function PersonaDetailPage({ params }: PersonaDetailPageProps) {
  return <PersonaDetailContent personaId={params.personaId} />;
}
