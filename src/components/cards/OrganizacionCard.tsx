
"use client";

import Image from 'next/image';
import type { Organizacion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, CheckCircle, Globe, Mail, MapPin, Tag, XCircle } from 'lucide-react';
import { organizacionTipoLabels } from '@/lib/schemas/organizacionSchema'; // Assuming you have this for labels

interface OrganizacionCardProps {
  organizacion: Organizacion;
}

export default function OrganizacionCard({ organizacion }: OrganizacionCardProps) {
  const displayName = organizacion.nombreFantasia || organizacion.nombreOficial;
  const tipoLabel = organizacion.tipo ? organizacionTipoLabels[organizacion.tipo] : organizacion.tipo;

  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="relative w-full h-48 bg-muted flex items-center justify-center">
        {organizacion.logoURL ? (
          <Image
            src={organizacion.logoURL}
            alt={`Logo de ${displayName}`}
            layout="fill"
            objectFit="contain" // Changed to contain to better fit logos
            className="p-4" // Added padding for logos
            data-ai-hint="organization logo"
          />
        ) : (
          <Building className="h-24 w-24 text-muted-foreground/50" />
        )}
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary group-hover:underline">{displayName}</CardTitle>
        <CardDescription className="flex items-center text-xs pt-1 text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5 mr-1.5" />
          {tipoLabel || 'Tipo no especificado'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pb-3">
        {organizacion.descripcion && (
          <p className="text-sm text-foreground/80 h-16 overflow-hidden text-ellipsis">
            {organizacion.descripcion.substring(0, 100) + (organizacion.descripcion.length > 100 ? '...' : '')}
          </p>
        )}
        {organizacion.areasDeInteres && organizacion.areasDeInteres.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              Áreas de Interés:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {organizacion.areasDeInteres.slice(0, 3).map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
              ))}
              {organizacion.areasDeInteres.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
            </div>
          </div>
        )}
        {organizacion.ubicacion?.localidad && (
          <p className="text-xs text-muted-foreground flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            {organizacion.ubicacion.localidad}
            {organizacion.ubicacion.provincia && `, ${organizacion.ubicacion.provincia}`}
          </p>
        )}
        <div className="text-xs text-muted-foreground space-y-1">
            {organizacion.emailContacto && (
                 <a href={`mailto:${organizacion.emailContacto}`} className="flex items-center hover:text-primary transition-colors">
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> {organizacion.emailContacto}
                 </a>
            )}
            {organizacion.sitioWeb && (
                <a href={organizacion.sitioWeb} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors">
                    <Globe className="h-3.5 w-3.5 mr-1.5" /> {organizacion.sitioWeb.replace(/^https?:\/\//, '')}
                </a>
            )}
        </div>
         <div className="pt-2">
          {organizacion.abiertaAColaboraciones === false ? ( // Explicitly check for false
            <Badge variant="outline" className="text-xs items-center gap-1 text-orange-600 border-orange-400">
              <XCircle className="h-3 w-3" /> No disponible por ahora
            </Badge>
          ) : ( // True or undefined/null (default to available)
            <Badge variant="outline" className="text-xs items-center gap-1 text-green-600 border-green-400">
              <CheckCircle className="h-3 w-3" /> Disponible para nuevos proyectos
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Button variant="outline" size="sm" className="w-full" disabled>
          Ver Perfil Completo (Próximamente)
        </Button>
      </CardFooter>
    </Card>
  );
}
