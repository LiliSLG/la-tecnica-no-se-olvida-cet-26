
import NoticiaDetailContent from '@/components/sections/NoticiaDetailContent';

interface NoticiaDetailPageProps {
  params: { id: string };
}

export default function NoticiaDetailPage({ params }: NoticiaDetailPageProps) {
  // Esta página solo debería renderizar si la noticia es de tipo 'articulo_propio'.
  // La lógica para redirigir o mostrar error si es 'enlace_externo'
  // podría estar en NoticiaDetailContent o aquí si se prefiere.
  return <NoticiaDetailContent noticiaId={params.id} />;
}
