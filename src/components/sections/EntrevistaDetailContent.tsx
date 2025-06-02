"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getEntrevistaById } from "@/lib/supabase/entrevistasService";
import type { Entrevista, Tema } from "@/lib/types";
import { getTemasByIds } from "@/lib/supabase/temasService";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  CalendarDays,
  UserCircle,
  Tag,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  Download,
  PlayCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface EntrevistaDetailContentProps {
  entrevistaId: string;
}

export default function EntrevistaDetailContent({
  entrevistaId,
}: EntrevistaDetailContentProps) {
  const [entrevista, setEntrevista] = useState<Entrevista | null>(null);
  const [temasSaber, setTemasSaber] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchEntrevistaData = async () => {
      if (!entrevistaId) {
        setError("ID de entrevista no válido.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const fetchedEntrevista = await getEntrevistaById(entrevistaId);
        if (
          fetchedEntrevista &&
          fetchedEntrevista.estaPublicada &&
          !fetchedEntrevista.estaEliminada
        ) {
          setEntrevista(fetchedEntrevista);

          if (fetchedEntrevista.temas && fetchedEntrevista.temas.length > 0) {
            setTemasSaber(fetchedEntrevista.temas);
          }
        } else {
          setError("Entrevista no encontrada o no disponible.");
        }
      } catch (err) {
        console.error("Error fetching entrevista details:", err);
        setError("No se pudo cargar el detalle de la entrevista.");
        toast({
          title: "Error",
          description: "No se pudo cargar el detalle.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEntrevistaData();
  }, [entrevistaId, toast]);

  const formatDateSafe = (timestamp: any) => {
    if (!timestamp) return "Fecha no disponible";
    try {
      const date =
        timestamp instanceof Timestamp
          ? timestamp.toDate()
          : new Date(timestamp);
      return format(date, "PPP", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  const breadcrumbItems = entrevista
    ? [
        { label: "Inicio", href: "/" },
        { label: "Explorar", href: "/explorar/historia-oral" },
        { label: "Historia Oral", href: "/explorar/historia-oral" },
        { label: entrevista.tituloSaber },
      ]
    : [
        { label: "Inicio", href: "/" },
        { label: "Explorar", href: "/explorar/historia-oral" },
        { label: "Historia Oral", href: "/explorar/historia-oral" },
      ];

  if (loading) {
    return (
      <div className="text-center py-20">
        {" "}
        <RefreshCw className="h-10 w-10 mx-auto animate-spin text-primary mb-4" />{" "}
        <p className="text-muted-foreground">Cargando entrevista...</p>{" "}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        {" "}
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />{" "}
        <p className="text-xl text-destructive mb-2">{error}</p>{" "}
        <Button asChild variant="outline">
          {" "}
          <Link href="/explorar/historia-oral">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Archivo
          </Link>{" "}
        </Button>{" "}
      </div>
    );
  }

  if (!entrevista) {
    return (
      <div className="text-center py-20">
        {" "}
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />{" "}
        <p className="text-xl text-muted-foreground">
          Entrevista no encontrada.
        </p>{" "}
        <Button asChild variant="outline" className="mt-4">
          {" "}
          <Link href="/explorar/historia-oral">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Archivo
          </Link>{" "}
        </Button>{" "}
      </div>
    );
  }

  const isExternalLink =
    entrevista.tipoContenido === "enlace_video_externo" &&
    entrevista.urlVideoExterno;
  const videoUrl =
    entrevista.tipoContenido === "video_propio"
      ? entrevista.videoPropioURL
      : entrevista.urlVideoExterno;

  // Basic YouTube embed URL generator
  const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
      const videoIdMatch = url.match(
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      if (videoIdMatch && videoIdMatch[1]) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
      }
    } catch (e) {
      console.error("Error parsing YouTube URL", e);
    }
    return null;
  };

  const embedUrl =
    videoUrl &&
    (entrevista.plataformaVideoPropio === "youtube_propio" ||
      entrevista.plataformaVideoExterno === "youtube")
      ? getYouTubeEmbedUrl(videoUrl)
      : null; // Add more for Vimeo etc. if needed

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Breadcrumbs items={breadcrumbItems} />
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/explorar/historia-oral">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Archivo
        </Link>
      </Button>

      <article className="bg-card p-6 sm:p-8 md:p-10 rounded-xl shadow-xl">
        {entrevista.imagenMiniaturaURL &&
          !embedUrl && ( // Show image if no embed
            <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={entrevista.imagenMiniaturaURL}
                alt={`Miniatura de ${entrevista.tituloSaber}`}
                fill
                style={{ objectFit: "cover" }}
                data-ai-hint="interview thumbnail"
              />
            </div>
          )}

        {embedUrl && (
          <div className="aspect-video mb-8 rounded-lg overflow-hidden shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={entrevista.tituloSaber}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {!embedUrl &&
          videoUrl && ( // If not embeddable but there's a URL, show a link
            <div className="mb-8 text-center">
              <Button asChild variant="default" size="lg">
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <PlayCircle className="mr-2 h-5 w-5" /> Ver Video en{" "}
                  {entrevista.plataformaVideoExterno ||
                    entrevista.plataformaVideoPropio ||
                    "Plataforma Externa"}
                </a>
              </Button>
            </div>
          )}

        <header className="mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-3">
            {entrevista.tituloSaber}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5 text-primary/70" />{" "}
              Recopilado:{" "}
              {formatDateSafe(entrevista.fechaGrabacionORecopilacion)}
            </span>
            {entrevista.fuentesInformacion &&
              entrevista.fuentesInformacion.length > 0 && (
                <span className="flex items-center">
                  <UserCircle className="h-4 w-4 mr-1.5 text-primary/70" />{" "}
                  Entrevistados: {entrevista.fuentesInformacion.join(", ")}
                </span>
              )}
            {entrevista.ambitoSaber && (
              <span className="flex items-center">
                <Tag className="h-4 w-4 mr-1.5 text-primary/70" /> Ámbito:{" "}
                {entrevista.ambitoSaber}
              </span>
            )}
            {entrevista.duracionMediaMinutos && (
              <span className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1.5 text-primary/70" />{" "}
                Duración: {entrevista.duracionMediaMinutos} min
              </span>
            )}
          </div>
        </header>

        <section className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
          <p>{entrevista.descripcionSaber}</p>
        </section>

        {entrevista.transcripcionTextoCompleto && (
          <section className="mt-8 pt-6 border-t border-border">
            <h3 className="text-xl font-semibold text-primary mb-3">
              Transcripción Completa
            </h3>
            <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
              {entrevista.transcripcionTextoCompleto}
            </p>
          </section>
        )}

        {entrevista.transcripcionFileURL && (
          <div className="mt-8 pt-6 border-t border-border">
            <Button asChild variant="outline">
              <a
                href={entrevista.transcripcionFileURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" /> Descargar Transcripción
                (Archivo)
              </a>
            </Button>
          </div>
        )}

        {temasSaber.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-1.5">
              <Tag className="h-5 w-5" />
              Temas
            </h3>
            <div className="flex flex-wrap gap-2">
              {temasSaber.map((tema) => (
                <Badge key={tema.id} variant="secondary">
                  {tema.nombre}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {entrevista.palabrasClaveSaber &&
          entrevista.palabrasClaveSaber.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-1.5">
                <Tag className="h-5 w-5" />
                Palabras Clave
              </h3>
              <div className="flex flex-wrap gap-2">
                {entrevista.palabrasClaveSaber.map((kw) => (
                  <Badge key={kw} variant="outline">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
      </article>
    </div>
  );
}
