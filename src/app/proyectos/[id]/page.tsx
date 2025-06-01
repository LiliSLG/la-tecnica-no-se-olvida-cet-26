
import ProjectDetailContent from '@/components/sections/ProjectDetailContent';

interface ProjectDetailPageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return <ProjectDetailContent projectId={params.id} />;
}
