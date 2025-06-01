
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPersonaById } from '@/lib/firebase/personasService';
import type { Persona, EstadoSituacionLaboral } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Info,
  GraduationCap,
  Star,
  BookOpen,
  Layers,
  Award,
  HeartHandshake,
  Phone,
  Building,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { categoriasPrincipalesPersonaLabels, estadoSituacionLaboralLabels } from '@/lib/schemas/personaSchema';

interface PersonaDetailContentProps {
  personaId: string;
}

export default function PersonaDetailContent({ personaId }: PersonaDetailContentProps) {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personaId) {
      setError("ID de perfil no válido.");
      setLoading(false);
      return;
    }

    const fetchPersona = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPersona = await getPersonaById(personaId);
        if (fetchedPersona && !fetchedPersona.estaEliminada && fetchedPersona.activo) {
          // Basic visibility check based on general profile settings
          if (fetchedPersona.visibilidadPerfil === 'privado' && currentUser?.uid !== fetchedPersona.id) {
            // Further check: if the current user is an admin, they should be able to see it.
            // This requires knowing if currentUser is an admin. For now, we'll stick to simpler logic.
            // We'd need to fetch current user's admin status if not already in useAuth context.
            setError("Este perfil es privado.");
            setPersona(null);
          } else {
            setPersona(fetchedPersona);
          }
        } else {
          setError("Perfil no encontrado o no disponible.");
        }
      } catch (err) {
        console.error("Error fetching persona details:", err);
        setError("No se pudo cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchPersona();
  }, [personaId, currentUser]);

  const canViewSensitiveInfo = (targetPersona: Persona | null): boolean => {
    if (authLoading || !targetPersona) return false;
    if (currentUser?.uid === targetPersona.id) return true; // Owner can always see
    if (targetPersona.visibilidadPerfil === 'publico') return true;
    if (currentUser && (targetPersona.visibilidadPerfil === 'solo_registrados_plataforma' || targetPersona.visibilidadPerfil === 'solo_registrados')) return true;
    // TODO: Add admin check if admins should see all
    return false;
  };

  const getInitials = (nombre?: string | null, apellido?: string | null) => {
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    const initials = `${n}${a}`.trim().toUpperCase();
    return initials.length > 0 ? initials : (persona?.email?.charAt(0) || '?').toUpperCase();
  };

  if (loading || authLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Cargando perfil...</p></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive">{error}</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="text-center py-10">
        <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">Perfil no encontrado.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const showSensitive = canViewSensitiveInfo(persona);
  const fullName = `${persona.nombre || ''} ${persona.apellido || ''}`.trim();
  const categoriaLabel = persona.categoriaPrincipal ? categoriasPrincipalesPersonaLabels[persona.categoriaPrincipal] : 'No especificada';
  const situacionLaboralLabel = persona.estadoSituacionLaboral ? (estadoSituacionLaboralLabels[persona.estadoSituacionLaboral as EstadoSituacionLaboral] || persona.estadoSituacionLaboral) : 'No especificada';

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4">
      <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="bg-muted/30 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary shadow-lg">
              <AvatarImage src={persona.fotoURL || undefined} alt={fullName} data-ai-hint="person portrait" />
              <AvatarFallback className="text-5xl bg-primary/10 text-primary">{getInitials(persona.nombre, persona.apellido)}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">{fullName}</h1>
              {persona.tituloProfesional && <p className="text-lg text-foreground/80 flex items-center justify-center md:justify-start gap-1.5 mt-1"><Briefcase className="h-5 w-5" /> {persona.tituloProfesional}</p>}
              <div className="mt-2 space-y-1">
                <Badge variant="secondary" className="text-sm">{categoriaLabel}</Badge>
                 {persona.esExAlumnoCET && persona.anoEgresoCET && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-1.5">
                    <GraduationCap className="h-4 w-4" /> Egresado/a en {persona.anoEgresoCET}
                  </p>
                )}
                {persona.categoriaPrincipal === 'estudiante_cet' && persona.anoCursadaActualCET && (
                  <p className="text-sm text-muted-foreground mt-1">Estudiante CET - {persona.anoCursadaActualCET}° Año</p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {(persona.descripcionPersonalOProfesional) && (
              <section>
                <h2 className="text-xl font-semibold text-primary mb-2 flex items-center gap-2"><User className="h-5 w-5"/> Sobre Mí</h2>
                <p className="text-foreground/90 whitespace-pre-line leading-relaxed">{persona.descripcionPersonalOProfesional}</p>
              </section>
            )}

            {persona.historiaDeExitoOResumenTrayectoria && (
              <section>
                <Separator className="my-4" />
                <h2 className="text-xl font-semibold text-primary mb-2 flex items-center gap-2"><History className="h-5 w-5"/> Resumen de Trayectoria</h2>
                <p className="text-foreground/90 whitespace-pre-line leading-relaxed">{persona.historiaDeExitoOResumenTrayectoria}</p>
              </section>
            )}

            <section>
              <Separator className="my-4" />
              <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2"><Building className="h-5 w-5"/> Situación Actual y Aspiraciones</h2>
              <div className="space-y-1.5 text-sm">
                <p><strong className="font-medium text-foreground/90">Estado Laboral:</strong> {situacionLaboralLabel}</p>
                {persona.empresaOInstitucionActual && <p><strong className="font-medium text-foreground/90">Empresa/Institución:</strong> {persona.empresaOInstitucionActual}</p>}
                {persona.cargoActual && <p><strong className="font-medium text-foreground/90">Cargo:</strong> {persona.cargoActual}</p>}
                {persona.buscandoOportunidades && (
                  <Badge className="mt-2 text-base items-center gap-1.5" variant="default">
                    <Star className="h-4 w-4 text-yellow-300 fill-yellow-400" /> Buscando Oportunidades
                  </Badge>
                )}
              </div>
            </section>

             <section>
                <Separator className="my-4" />
                <h2 className="text-xl font-semibold text-primary mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5"/> Proyectos Destacados en el CET</h2>
                <p className="text-sm text-muted-foreground">(Funcionalidad próximamente disponible)</p>
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-lg flex items-center gap-1.5"><Layers className="h-4 w-4"/>Áreas de Expertise e Intereses</CardTitle></CardHeader>
              <CardContent>
                {(Array.isArray(persona.areasDeInteresOExpertise) && persona.areasDeInteresOExpertise.length > 0) ? (
                  <div className="flex flex-wrap gap-2">
                    {persona.areasDeInteresOExpertise.map(area => <Badge key={area} variant="secondary">{area}</Badge>)}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No especificadas.</p>}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-lg flex items-center gap-1.5"><Award className="h-4 w-4"/>Disponibilidad para Colaborar</CardTitle></CardHeader>
              <CardContent>
                {persona.disponibleParaProyectos !== false ? (
                  <p className="flex items-center gap-1.5 text-green-600"><CheckCircle className="h-5 w-5" /> Disponible para nuevos proyectos</p>
                ) : (
                  <p className="flex items-center gap-1.5 text-orange-600"><XCircle className="h-5 w-5" /> No disponible por ahora</p>
                )}
              </CardContent>
            </Card>
            
            {Array.isArray(persona.ofreceColaboracionComo) && persona.ofreceColaboracionComo.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-1.5"><HeartHandshake className="h-4 w-4"/>Ofrece Colaboración Como</CardTitle></CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {persona.ofreceColaboracionComo.map(rol => <Badge key={rol} variant="outline">{rol}</Badge>)}
                    </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-lg flex items-center gap-1.5"><Mail className="h-4 w-4"/>Contacto</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {showSensitive ? (
                  <>
                    {persona.email && <p className="flex items-center gap-1.5 break-all"><Mail className="h-4 w-4 text-muted-foreground" /> {persona.email}</p>}
                    {persona.telefonoContacto && <p className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-muted-foreground" /> {persona.telefonoContacto}</p>}
                    {(!persona.email && !persona.telefonoContacto) && <p className="text-muted-foreground">No hay información de contacto directo disponible.</p>}
                  </>
                ) : (
                  <p className="text-muted-foreground">Información de contacto visible según la configuración de privacidad del perfil y si has iniciado sesión.</p>
                )}
                {Array.isArray(persona.linksProfesionales) && persona.linksProfesionales.length > 0 && persona.linksProfesionales.some(l => l && l.url) && (
                  <div className="pt-2">
                    <h4 className="font-medium mb-1">Enlaces:</h4>
                    {persona.linksProfesionales.filter(link => link && link.url).map((link, index) => (
                      <a key={index} href={link.url!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline break-all">
                        <LinkIcon className="h-4 w-4" /> {link.tipo || link.url}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {persona.ubicacionResidencial?.localidad && (
              <Card className="shadow-sm">
                <CardHeader><CardTitle className="text-lg flex items-center gap-1.5"><MapPin className="h-4 w-4"/>Ubicación</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <p>{persona.ubicacionResidencial.localidad}
                    {persona.ubicacionResidencial.provincia && `, ${persona.ubicacionResidencial.provincia}`}
                  </p>
                  {showSensitive && persona.ubicacionResidencial.direccionTextoCompleto && <p className="text-muted-foreground text-xs mt-1">{persona.ubicacionResidencial.direccionTextoCompleto}</p>}
                </CardContent>
              </Card>
            )}
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}


    