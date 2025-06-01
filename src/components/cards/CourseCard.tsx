
"use client";

import type { Curso, NivelCurso } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CalendarDays, Clock, Star, Tag, ExternalLink, UserCircle } from 'lucide-react'; // Added Star icon
import Image from 'next/image';
import Link from 'next/link';

const nivelLabels: Record<NivelCurso, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  todos: 'Todos los niveles',
};

interface CourseCardProps {
  curso: Curso;
}

export default function CourseCard({ curso }: CourseCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
      <div className="relative w-full h-48">
        <Image
          src={curso.imagenURL || "https://placehold.co/600x400.png"}
          alt={`Portada de ${curso.titulo}`}
          data-ai-hint={curso.dataAiHint || "course education"}
          fill
          style={{objectFit:"cover"}}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary group-hover:underline">{curso.titulo}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5 mb-1">
            <UserCircle className="h-4 w-4" /> {curso.instructor}
          </span>
          {curso.modalidad && (
            <Badge variant="outline" className="capitalize text-xs mr-2">
              {curso.modalidad}
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize text-xs">
            {nivelLabels[curso.nivel] || curso.nivel}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-foreground/80 text-sm h-16 overflow-hidden text-ellipsis">
          {curso.descripcionCorta}
        </p>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          {curso.duracion && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary/80" /> Duración: {curso.duracion}
            </div>
          )}
          {curso.fechaInicio && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary/80" /> Inicio: {curso.fechaInicio}
            </div>
          )}
           {curso.puntosOtorgados !== undefined && (
            <div className="flex items-center gap-1.5 text-accent-foreground font-medium">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" /> {curso.puntosOtorgados} Puntos
            </div>
          )}
        </div>
        {curso.temas && curso.temas.length > 0 && (
          <div className="pt-1 space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Tag className="h-3.5 w-3.5"/>Temas:</h4>
            <div className="flex flex-wrap gap-1.5">
              {curso.temas.slice(0, 3).map((tema) => (
                <Badge key={tema} variant="outline" className="text-xs">{tema}</Badge>
              ))}
              {curso.temas.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="default" className="w-full" disabled={!curso.linkMasInfo}>
          <Link href={curso.linkMasInfo || "#"} target={curso.linkMasInfo && curso.linkMasInfo.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
            Más Información <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

    