
"use client";

import Image from 'next/image';
import Link from 'next/link'; // Import Link
import type { Persona } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Mail, MapPin, Tag, CheckCircle, XCircle, MessageCircle, BookUser, Users2, Star, GraduationCap, ArrowRight } from 'lucide-react';
import { categoriasPrincipalesPersonaLabels } from '@/lib/schemas/personaSchema';

interface PersonaCardProps {
  persona: Persona;
  context?: 'tutor_colaborador' | 'egresado_estudiante';
}

export default function PersonaCard({ persona, context = 'tutor_colaborador' }: PersonaCardProps) {
  const fullName = `${persona.nombre || ''} ${persona.apellido || ''}`.trim();
  const initials = `${persona.nombre?.charAt(0) || ''}${persona.apellido?.charAt(0) || ''}`.toUpperCase();

  const categoriaLabel = persona.categoriaPrincipal ? categoriasPrincipalesPersonaLabels[persona.categoriaPrincipal] : 'No especificada';

  const descripcionExtracto = persona.descripcionPersonalOProfesional
    ? persona.descripcionPersonalOProfesional.substring(0, 100) + (persona.descripcionPersonalOProfesional.length > 100 ? '...' : '')
    : null;

  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out bg-card">
      <CardHeader className="items-center text-center p-6 bg-muted/30">
        <Avatar className="h-24 w-24 mb-3 border-2 border-primary/50 shadow-md">
          <AvatarImage src={persona.fotoURL || undefined} alt={fullName} data-ai-hint="person portrait" />
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials || <User />}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl text-primary">{fullName}</CardTitle>
        {persona.tituloProfesional && (
          <CardDescription className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Briefcase className="h-3.5 w-3.5" /> {persona.tituloProfesional}
          </CardDescription>
        )}
        <div className="mt-1 space-y-0.5">
            <Badge variant="outline" className="text-xs">
            {context === 'egresado_estudiante' ? <Users2 className="h-3 w-3 mr-1"/> : <BookUser className="h-3 w-3 mr-1"/>}
            {categoriaLabel}
            {persona.esExAlumnoCET && persona.anoEgresoCET && ` (Egreso ${persona.anoEgresoCET})`}
            </Badge>
            {/* Se muestra arriba, dentro de la badge de categoría para exalumnos */}
            {/* {persona.esExAlumnoCET && persona.anoEgresoCET && context === 'egresado_estudiante' && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" /> Egresado/a en: {persona.anoEgresoCET}
                </p>
            )} */}
             {persona.categoriaPrincipal === 'estudiante_cet' && persona.anoCursadaActualCET && (
                 <p className="text-xs text-muted-foreground">Cursando: {persona.anoCursadaActualCET}° año</p>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 p-4 pb-3">
        {descripcionExtracto && (
          <p className="text-sm text-foreground/80 h-16 overflow-hidden text-ellipsis">
            {descripcionExtracto}
          </p>
        )}
        
        {Array.isArray(persona.areasDeInteresOExpertise) && persona.areasDeInteresOExpertise.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              Áreas de Interés/Expertise:
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {persona.areasDeInteresOExpertise.slice(0, 3).map((tema) => (
                <Badge key={tema} variant="secondary" className="text-xs">{tema}</Badge>
              ))}
              {persona.areasDeInteresOExpertise.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
            </div>
          </div>
        )}

        {persona.ubicacionResidencial?.localidad && (
          <p className="text-xs text-muted-foreground flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            {persona.ubicacionResidencial.localidad}
            {persona.ubicacionResidencial.provincia && `, ${persona.ubicacionResidencial.provincia}`}
          </p>
        )}

        {persona.email && (persona.visibilidadPerfil === 'publico' || persona.visibilidadPerfil === 'solo_registrados_plataforma' || persona.visibilidadPerfil === 'solo_registrados') && (
           <p className="text-xs text-muted-foreground flex items-center">
             <Mail className="h-3.5 w-3.5 mr-1.5" />
             {persona.visibilidadPerfil === 'publico' ? persona.email : 'Contacto (usuarios registrados)'}
           </p>
        )}
         {!persona.email && context === 'tutor_colaborador' && (
             <p className="text-xs text-muted-foreground flex items-center">
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Contactar vía CET N°26
            </p>
         )}

        {context === 'tutor_colaborador' && (
            <div className="pt-2">
            {persona.disponibleParaProyectos !== false ? (
                <Badge variant="outline" className="text-xs items-center gap-1 text-green-600 border-green-400">
                    <CheckCircle className="h-3 w-3" /> Disponible para nuevos proyectos
                </Badge>
            ) : (
                <Badge variant="outline" className="text-xs items-center gap-1 text-orange-600 border-orange-400">
                    <XCircle className="h-3 w-3" /> No disponible por ahora
                </Badge>
            )}
            </div>
        )}
        
        {/* {context === 'egresado_estudiante' && persona.categoriaPrincipal === 'estudiante_cet' && persona.anoCursadaActualCET && (
             <p className="text-xs text-muted-foreground">Cursando: {persona.anoCursadaActualCET}° año</p>
        )} */}
        {context === 'egresado_estudiante' && persona.titulacionObtenidaCET && (
             <p className="text-xs text-muted-foreground">Título: {persona.titulacionObtenidaCET}</p>
        )}
         {context === 'egresado_estudiante' && persona.buscandoOportunidades && (
            <Badge variant="default" className="text-xs items-center gap-1 bg-accent text-accent-foreground mt-1">
                <Star className="h-3 w-3" /> Buscando Oportunidades
            </Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm" className="w-full" asChild>
           <Link href={`/comunidad/perfil/${persona.id}`}>
             Ver Perfil Completo <ArrowRight className="ml-2 h-4 w-4" />
           </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

    