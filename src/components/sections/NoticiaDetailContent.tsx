
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getNoticiaById } from '@/lib/supabase/noticiasService';
import type { Noticia } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Newspaper, CalendarDays, UserCircle, Tag, ArrowLeft, AlertTriangle, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

interface NoticiaDetailContentProps {
  noticiaId: string;
}

export default function NoticiaDetailContent({ noticiaId }: NoticiaDetailContentProps) {
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchNoticiaData = async () => {
      if (!noticiaId) {
        setError("ID de noticia no válido.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedNoticia = await getNoticiaById(noticiaId);
        if (fetchedNoticia && fetchedNoticia.estaPublicada && !fetchedNoticia.estaEliminada) {
          if (fetchedNoticia.tipoContenido === 'articulo_propio') {
            setNoticia(fetchedNoticia);
          } else {
            setError("Esta noticia es un enlace externo y no tiene una página de detalle propia.");
            toast({ title: "Información", description: "Esta noticia es un enlace externo.", variant: "default" });
            if (fetchedNoticia.urlExterna) {
                window.open(fetchedNoticia.urlExterna, '_blank');
                router.push('/noticias'); 
            }
          }
        } else {
          setError("Noticia no encontrada o no disponible.");
        }
      } catch (err) {
        console.error("Error fetching noticia details:", err);
        setError("No se pudo cargar el detalle de la noticia.");
        toast({ title: "Error", description: "No se pudo cargar el detalle de la noticia.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchNoticiaData();
  }, [noticiaId, toast, router]);

  const formatDateSafe = (value: string | Date | null | undefined) => {
    if (!value) return "Fecha no disponible";
    try {
      // Si ya es un Date lo usamos, si es string ISO lo convertimos:
      const date = value instanceof Date ? value : new Date(value);
      return format(date, "PPP", { locale: es });
    } catch {
      return "Fecha inválida";
    }
  };

  const breadcrumbItems = noticia
    ? [ { label: 'Inicio', href: '/' }, { label: 'Noticias', href: '/noticias' }, { label: noticia.titulo }, ]
    : [ { label: 'Inicio', href: '/' }, { label: 'Noticias', href: '/noticias' }, ];

  if (loading) {
    return ( <div className="text-center py-20"> <RefreshCw className="h-10 w-10 mx-auto animate-spin text-primary mb-4" /> <p className="text-muted-foreground">Cargando noticia...</p> </div> );
  }

  if (error) {
    return ( <div className="text-center py-20"> <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" /> <p className="text-xl text-destructive mb-2">{error}</p> <Button asChild variant="outline"> <Link href="/noticias"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Noticias</Link> </Button> </div> );
  }

  if (!noticia) {
    return ( <div className="text-center py-20"> <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" /> <p className="text-xl text-muted-foreground">Noticia no encontrada.</p> <Button asChild variant="outline" className="mt-4"> <Link href="/noticias"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Noticias</Link> </Button> </div> );
  }
  
  if (noticia.tipoContenido !== 'articulo_propio') {
    return ( <div className="text-center py-20"> <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" /> <p className="text-xl text-muted-foreground">Esta es una noticia externa.</p> <Button asChild variant="outline" className="mt-4"> <Link href="/noticias"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a Noticias</Link> </Button> </div> );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Breadcrumbs items={breadcrumbItems} />
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/noticias">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Noticias
        </Link>
      </Button>

      <article className="bg-card p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
        {noticia.imagenPrincipalURL && (
          <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={noticia.imagenPrincipalURL}
              alt={`Imagen de ${noticia.titulo}`}
              fill
              style={{ objectFit: "cover" }}
              data-ai-hint="news article image"
            />
          </div>
        )}

        <header className="mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-3">
            {noticia.titulo}
          </h1>
          {noticia.subtitulo && (
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">
              {noticia.subtitulo}
            </p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5 text-primary/70" />{" "}
              Publicado: {formatDateSafe(noticia.fechaPublicacion)}
            </span>
            {noticia.autorNoticia && (
              <span className="flex items-center">
                <UserCircle className="h-4 w-4 mr-1.5 text-primary/70" /> Por:{" "}
                {noticia.autorNoticia}
              </span>
            )}
          </div>
        </header>

        {noticia.contenido && (
          <section
            className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: noticia.contenido.replace(/\n/g, "<br />"),
            }}
          />
        )}

        {noticia.temas && noticia.temas.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-1.5">
              <Tag className="h-5 w-5" />
              Categorías
            </h3>
            <div className="flex flex-wrap gap-2">
              {noticia.temas.map((t) => (
                <Badge key={t.id} variant="secondary">
                  {t.nombre}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
