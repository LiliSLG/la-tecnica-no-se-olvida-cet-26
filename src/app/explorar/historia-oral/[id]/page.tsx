
import EntrevistaDetailContent from '@/components/sections/EntrevistaDetailContent';

interface EntrevistaDetailPageProps {
  params: { id: string };
}

export default function EntrevistaDetailPage({ params }: EntrevistaDetailPageProps) {
  return <EntrevistaDetailContent entrevistaId={params.id} />;
}

    