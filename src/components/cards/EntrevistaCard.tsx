
"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { Entrevista, Tema } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ChevronRight, MessageSquare, PlayCircle, Link as LinkIconLucide } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { useState, useEffect } from 'react'; // Added import

interface EntrevistaCardProps {
  entrevista: Entrevista;
  temasMap: Map<string, string>; 
}

export default function EntrevistaCard({ entrevista, temasMap }: EntrevistaCardProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (entrevista.fechaGrabacionORecopilacion) {
      const dateObj = entrevista.fechaGrabacionORecopilacion instanceof Timestamp 
        ? entrevista.fechaGrabacionORecopilacion.toDate() 
        : new Date(entrevista.fechaGrabacionORecopilacion);
      setFormattedDate(dateObj.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
  }, [entrevista.fechaGrabacionORecopilacion]);

  const linkProps = entrevista.tipoContenido === 'enlace_video_externo' && entrevista.urlVideoExterno
    ? { href: entrevista.urlVideoExterno, target: "_blank", rel: "noopener noreferrer" }
    : { href: `/explorar/historia-oral/${entrevista.id}` };

  const displayTemas = entrevista.idsTemasSaber
    ?.map(id => temasMap.get(id))
    .filter(Boolean) as string[] || [];

  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out group">
      {entrevista.imagenMiniaturaURL && (
        <div className="relative w-full h-48 bg-muted">
          <Image
            src={entrevista.imagenMiniaturaURL}
            alt={`Miniatura de ${entrevista.tituloSaber}`}
            fill
            style={{objectFit:"cover"}}
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="interview person rural"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <Link {...linkProps} className="block">
            <CardTitle className="text-xl text-primary group-hover:underline">{entrevista.tituloSaber}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground pt-1">
            {entrevista.fuentesInformacion && entrevista.fuentesInformacion.length > 0 && (
                <span className="block mb-1">Entrevistado(s): {entrevista.fuentesInformacion.join(', ')}</span>
            )}
            <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
                {formattedDate || 'Cargando fecha...'}
            </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pb-3">
        <p className="text-sm text-foreground/80 h-16 overflow-hidden text-ellipsis">
          {entrevista.descripcionSaber}
        </p>
         <Badge variant={entrevista.tipoContenido === 'video_propio' ? 'default' : 'secondary'} className="capitalize">
          {entrevista.tipoContenido.replace('_', ' ')}
        </Badge>
        {displayTemas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {displayTemas.slice(0, 3).map(tema => <Badge key={tema} variant="outline" className="text-xs">{tema}</Badge>)}
            {displayTemas.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Button asChild variant="link" className="p-0 h-auto text-primary text-sm font-medium">
          <Link {...linkProps}>
            {entrevista.tipoContenido === 'enlace_video_externo' ? 'Ver Video Externo' : 'Ver Más'}
            {entrevista.tipoContenido === 'enlace_video_externo' ? <LinkIconLucide className="ml-1.5 h-3.5 w-3.5"/> : <ChevronRight className="ml-1 h-4 w-4" />}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
