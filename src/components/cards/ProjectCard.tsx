
"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { Proyecto, Tema } from '@/lib/types'; // Import Tema
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { estadoLabels } from '@/lib/schemas/projectSchema'; 

interface ProjectCardProps {
  project: Proyecto;
  temaObjects?: Tema[]; 
}

export default function ProjectCard({ project, temaObjects }: ProjectCardProps) {
  const summary = project.resumenEjecutivo || project.descripcionGeneral.substring(0, 120) + (project.descripcionGeneral.length > 120 ? '...' : '');
  
  // Use all temaObjects passed for display if available
  const displayTemas = temaObjects || []; 

  return (
    <Link href={`/proyectos/${project.id}`} className="block group h-full">
      <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <div className="relative w-full h-48 bg-muted">
          {project.imagenPortadaURL ? (
            <Image
              src={project.imagenPortadaURL}
              alt={`Portada de ${project.titulo}`}
              fill 
              style={{objectFit:"cover"}} 
              className="transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="project cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <ArchiveIcon className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-primary group-hover:underline">{project.titulo}</CardTitle>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-1 items-center">
            <CardDescription className="flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
              Año: {project.anoProyecto}
            </CardDescription>
            <Badge variant="outline" className="capitalize text-xs px-1.5 py-0.5">
                {project.estadoActual ? estadoLabels[project.estadoActual] : 'N/A'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-3 space-y-3">
          <p className="text-sm text-foreground/80 h-20 overflow-hidden text-ellipsis">
            {summary}
          </p>
          {displayTemas.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1.5" />
                Temas:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {displayTemas.map((tema) => ( // Display all fetched temas for the project
                  <Badge key={tema.id} variant="secondary" className="text-xs">{tema.nombre}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 pb-4">
          <Button variant="link" className="p-0 h-auto text-primary text-sm font-medium">
            Leer Más <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

// Renamed to avoid conflict if Archive is imported from lucide-react directly
const ArchiveIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21 8V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V8H21ZM19 10H5V19H19V10ZM22 3H2C1.44772 3 1 3.44772 1 4V6C1 6.55228 1.44772 7 2 7H22C22.5523 7 23 6.55228 23 6V4C23 3.44772 22.5523 3 22 3ZM13 12H11V14H13V12Z" />
  </svg>
);

