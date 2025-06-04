"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProjectById } from '@/lib/supabase/services/proyectosService';
import { getPersonasByIds } from "@/lib/supabase/services/personasService";
import { getOrganizacionesByIds } from "@/lib/supabase/services/organizacionesService";
import { getTemasByIds as getTemasByIdsService } from "@/lib/supabase/services/temasService";
import type { Proyecto, Persona, Organizacion, Tema } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  CalendarDays,
  Tag,
  Users,
  Link2,
  Download,
  Info,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Briefcase,
  Building,
  ArrowLeft,
  Handshake,
  Tags as TagsIcon // Para temas
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { estadoLabels } from '@/lib/schemas/projectSchema';


interface ProjectDetailContentProps {
  projectId: string;
}

export default function ProjectDetailContent({ projectId }: ProjectDetailContentProps) {
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Proyecto | null>(null);
  const [authorDetails, setAuthorDetails] = useState<Persona[]>([]);
  const [tutorDetails, setTutorDetails] = useState<Persona[]>([]);
  const [collaboratorDetails, setCollaboratorDetails] = useState<Persona[]>([]);
  const [organizationDetails, setOrganizationDetails] = useState<Organizacion[]>([]);
  const [temaDetails, setTemaDetails] = useState<Tema[]>([]); // Para los nombres de los temas
  
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingAuthors, setLoadingAuthors] = useState(false);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingTemas, setLoadingTemas] = useState(false); // Para temas
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) {
        setError("ID de proyecto no válido.");
        setLoadingProject(false);
        return;
      }
      setLoadingProject(true);
      setError(null);
      try {
        const fetchedProject = await getProjectById(projectId);
        if (fetchedProject && !fetchedProject.estaEliminado) {
          setProject(fetchedProject);
        } else {
          setError("Proyecto no encontrado o no disponible.");
          // toast({ title: "Error", description: "Proyecto no encontrado o no disponible.", variant: "destructive" });
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("No se pudo cargar el detalle del proyecto.");
        toast({ title: "Error", description: "No se pudo cargar el detalle del proyecto.", variant: "destructive" });
      } finally {
        setLoadingProject(false);
      }
    };
    fetchProjectData();
  }, [projectId, toast]);

  useEffect(() => {
    if (project?.autores && project.autores.length > 0) {
      setLoadingAuthors(true);
      getPersonasByIds(project.autores.map((persona) => persona.id))
        .then(setAuthorDetails)
        .catch((err) => {
          console.error("Error fetching author details:", err);
        })
        .finally(() => setLoadingAuthors(false));
    
    } else { setAuthorDetails([]); }
  }, [project?.autores]);

  useEffect(() => {
    if (project?.tutores && project.tutores.length > 0) {
      setLoadingTutors(true);
      getPersonasByIds(project.tutores.map((persona) => persona.id))
        .then(setTutorDetails)
        .catch((err) => {
          console.error("Error fetching tutor details:", err);
        })
        .finally(() => setLoadingTutors(false));
    } else {
      setTutorDetails([]);
    }
  }, [project?.tutores]);

  useEffect(() => {
    if (project?.colaboradores && project.colaboradores.length > 0) {
      setLoadingCollaborators(true);
      getPersonasByIds(project.colaboradores.map((persona) => persona.id))
        .then(setCollaboratorDetails)
        .catch((err) => {
          console.error("Error fetching collaborator details:", err);
        })
        .finally(() => setLoadingCollaborators(false));
    } else { setCollaboratorDetails([]); }
  }, [project?.colaboradores]);

  useEffect(() => {
    if (
      project?.organizacionesTutoria &&
      project.organizacionesTutoria.length > 0
    ) {
      setLoadingOrganizations(true);
      getOrganizacionesByIds(
        project.organizacionesTutoria.map((organizacion) => organizacion.id)
      )
        .then(setOrganizationDetails)
        .catch((err) => {
          console.error("Error fetching organization details:", err);
        })
        .finally(() => setLoadingOrganizations(false));
    } else {
      setOrganizationDetails([]);
    }
  }, [project?.organizacionesTutoria]);
  
  useEffect(() => {
    if (project?.temas && project.temas.length > 0) {
      setLoadingTemas(true);
      getTemasByIdsService(project.temas.map((tema) => tema.id)) // Usa la función renombrada
        .then(setTemaDetails)
        .catch((err) => {
          console.error("Error fetching tema details:", err);
        })
        .finally(() => setLoadingTemas(false));
    } else { setTemaDetails([]); }
  }, [project?.temas]);


  const formatDateSafe = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      try {
        return format(timestamp.toDate(), 'PPP', { locale: es });
      } catch (e) { return "Fecha inválida"; }
    }
    return 'No especificada';
  };

  const renderPersonList = (persons: Persona[], isLoading: boolean, fallbackText: string = "N/A") => {
    if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;
    if (!persons || persons.length === 0) return <p className="text-sm text-muted-foreground">{fallbackText}</p>;
    return <p className="text-sm text-foreground/90">{persons.map(p => `${p.nombre} ${p.apellido}`).join(', ')}</p>;
  };

  const renderOrganizationList = (orgs: Organizacion[], isLoading: boolean, fallbackText: string = "N/A") => {
    if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;
    if (!orgs || orgs.length === 0) {
        if (project?.organizacionesTutoria && project.organizacionesTutoria.length > 0 && !isLoading) {
            return <p className="text-sm text-muted-foreground">{project.organizacionesTutoria.join(', ')} (IDs)</p>;
        }
        return <p className="text-sm text-muted-foreground">{fallbackText}</p>;
    }
    return <p className="text-sm text-foreground/90">{orgs.map(o => o.nombreOficial || o.nombreFantasia || o.id).join(', ')}</p>;
  };
  
  const renderTemaList = (temas: Tema[], isLoading: boolean, fallbackText: string = "No especificados") => {
    if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;
    if (!temas || temas.length === 0) return <p className="text-sm text-muted-foreground">{fallbackText}</p>;
    return (
      <div className="flex flex-wrap gap-2">
        {temas.map(tema => <Badge key={tema.id} variant="secondary">{tema.nombre}</Badge>)}
      </div>
    );
  };


  const breadcrumbItems = project
    ? [ { label: 'Inicio', href: '/' }, { label: 'Explorar', href: '/proyectos' }, { label: 'Proyectos Técnicos', href: '/proyectos' }, { label: project.titulo }, ]
    : [ { label: 'Inicio', href: '/' }, { label: 'Explorar', href: '/proyectos' }, { label: 'Proyectos Técnicos', href: '/proyectos' }, ];

  if (loadingProject || authLoading) {
     return ( <div className="text-center py-20"> <RefreshCw className="h-10 w-10 mx-auto animate-spin text-primary mb-4" /> <p className="text-muted-foreground">Cargando detalle del proyecto...</p> </div> );
  }

  if (error) {
    return ( <div className="text-center py-20"> <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" /> <p className="text-xl text-destructive mb-2">{error}</p> <Button asChild variant="outline"> <Link href="/proyectos"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado</Link> </Button> </div> );
  }

  if (!project) {
    return ( <div className="text-center py-20"> <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" /> <p className="text-xl text-muted-foreground">Proyecto no encontrado.</p> <Button asChild variant="outline" className="mt-4"> <Link href="/proyectos"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado</Link> </Button> </div> );
  }

  const canViewRestrictedContent = !!user;

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      <Button asChild variant="outline" size="sm" className="mb-6">
        <Link href="/proyectos">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al listado de proyectos
        </Link>
      </Button>

      <article className="bg-card p-6 sm:p-8 rounded-xl shadow-xl">
        {project.imagenPortadaURL && (
          <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={project.imagenPortadaURL}
              alt={`Portada de ${project.titulo}`}
              fill
              style={{ objectFit: "cover" }}
              data-ai-hint="project cover"
            />
          </div>
        )}

        <header className="mb-8 pb-6 border-b">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-3">
            {project.titulo}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5 text-primary/70" /> Año:{" "}
              {project.anoProyecto}
            </span>
            <span className="flex items-center">
              <Info className="h-4 w-4 mr-1.5 text-primary/70" /> Estado:{" "}
              <Badge variant="outline" className="ml-1.5 capitalize">
                {project.estadoActual
                  ? estadoLabels[project.estadoActual]
                  : "N/A"}
              </Badge>
            </span>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {project.resumenEjecutivo && (
              <section>
                {" "}
                <h2 className="text-2xl font-semibold text-primary mb-3">
                  Resumen Ejecutivo
                </h2>{" "}
                <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
                  {project.resumenEjecutivo}
                </p>{" "}
              </section>
            )}
            <section>
              {" "}
              <h2 className="text-2xl font-semibold text-primary mb-3">
                Descripción General
              </h2>{" "}
              <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
                {project.descripcionGeneral}
              </p>{" "}
            </section>

            <section className="pt-6 border-t">
              <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Involucrados
              </h2>
              <div className="space-y-3">
                <div>
                  {" "}
                  <h3 className="font-semibold text-primary/90 flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    Autores:
                  </h3>{" "}
                  {renderPersonList(authorDetails, loadingAuthors)}{" "}
                </div>
                {(project.tutores && project.tutores.length > 0) ||
                loadingTutors ? (
                  <div>
                    {" "}
                    <h3 className="font-semibold text-primary/90 flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      Tutores (Personas):
                    </h3>{" "}
                    {renderPersonList(
                      tutorDetails,
                      loadingTutors,
                      "No se especificaron tutores."
                    )}{" "}
                  </div>
                ) : null}
                {(project.colaboradores && project.colaboradores.length > 0) ||
                loadingCollaborators ? (
                  <div>
                    {" "}
                    <h3 className="font-semibold text-primary/90 flex items-center gap-1.5">
                      <Handshake className="h-4 w-4" />
                      Colaboradores (Personas):
                    </h3>{" "}
                    {renderPersonList(
                      collaboratorDetails,
                      loadingCollaborators,
                      "No se especificaron colaboradores."
                    )}{" "}
                  </div>
                ) : null}
                {(project.organizacionesTutoria &&
                  project.organizacionesTutoria.length > 0) ||
                loadingOrganizations ? (
                  <div>
                    {" "}
                    <h3 className="font-semibold text-primary/90 flex items-center gap-1.5">
                      <Building className="h-4 w-4" />
                      Organizaciones Tutoras:
                    </h3>{" "}
                    {renderOrganizationList(
                      organizationDetails,
                      loadingOrganizations,
                      "No se especificaron organizaciones tutoras."
                    )}{" "}
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <aside className="md:col-span-1 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                {" "}
                <CardTitle className="text-lg flex items-center">
                  <TagsIcon className="h-5 w-5 mr-2 text-primary" />
                  Temas
                </CardTitle>{" "}
              </CardHeader>
              <CardContent>
                {" "}
                {renderTemaList(temaDetails, loadingTemas)}{" "}
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                {" "}
                <CardTitle className="text-lg flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  Palabras Clave
                </CardTitle>{" "}
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {project.palabrasClave && project.palabrasClave.length > 0 ? (
                  project.palabrasClave.map((kw) => (
                    <Badge key={kw} variant="outline">
                      {kw}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No especificadas
                  </p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                {" "}
                <CardTitle className="text-lg flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                  Fechas Relevantes
                </CardTitle>{" "}
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {project.fechaInicio && (
                  <p>Inicio: {formatDateSafe(project.fechaInicio)}</p>
                )}
                {project.fechaFinalizacionEstimada && (
                  <p>
                    Finalización Estimada:{" "}
                    {formatDateSafe(project.fechaFinalizacionEstimada)}
                  </p>
                )}
                {project.fechaFinalizacionReal && (
                  <p>
                    Finalización Real:{" "}
                    {formatDateSafe(project.fechaFinalizacionReal)}
                  </p>
                )}
                {project.fechaPresentacion && (
                  <p>
                    Presentación: {formatDateSafe(project.fechaPresentacion)}
                  </p>
                )}
                {!(
                  project.fechaInicio ||
                  project.fechaFinalizacionEstimada ||
                  project.fechaFinalizacionReal ||
                  project.fechaPresentacion
                ) && <p>No especificadas</p>}
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-10 pt-6 border-t">
          {project.archivoPrincipalURL ||
          (project.archivosAdjuntos && project.archivosAdjuntos.length > 0) ? (
            !canViewRestrictedContent ? (
              <Card className="p-6 text-center bg-accent/10 shadow-md">
                <KeyRound className="h-10 w-10 mx-auto text-accent-foreground/70 mb-3" />
                <h3 className="text-xl font-semibold text-accent-foreground mb-2">
                  Accede a más detalles y archivos
                </h3>
                <p className="text-accent-foreground/80 mb-4">
                  {" "}
                  Para ver los archivos descargables y otros detalles del
                  proyecto, por favor inicia sesión o regístrate.{" "}
                </p>
                <div className="flex justify-center gap-3">
                  <Button asChild>
                    {" "}
                    <Link href={`/login?redirect=/proyectos/${projectId}`}>
                      Iniciar Sesión
                    </Link>{" "}
                  </Button>
                  <Button asChild variant="outline">
                    {" "}
                    <Link href={`/signup?redirect=/proyectos/${projectId}`}>
                      Registrarse
                    </Link>{" "}
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
                  <Download className="h-6 w-6 mr-2" />
                  Archivos del Proyecto
                </h2>
                {project.archivoPrincipalURL && (
                  <Card className="bg-primary/5 mb-4">
                    <CardHeader>
                      {" "}
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Archivo Principal
                      </CardTitle>{" "}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-1">
                        Nombre:{" "}
                        {project.nombreArchivoPrincipal || "No especificado"}
                      </p>
                      <Button asChild variant="default" size="sm">
                        {" "}
                        <a
                          href={project.archivoPrincipalURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {" "}
                          <Download className="mr-2 h-4 w-4" /> Descargar/Ver
                          Archivo{" "}
                        </a>{" "}
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {project.archivosAdjuntos &&
                  project.archivosAdjuntos.length > 0 && (
                    <Card className="bg-primary/5">
                      <CardHeader>
                        {" "}
                        <CardTitle className="text-lg flex items-center">
                          <Link2 className="h-5 w-5 mr-2 text-primary" />
                          Archivos Adjuntos
                        </CardTitle>{" "}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {project.archivosAdjuntos.map((file, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-md bg-background/50"
                          >
                            <h4 className="font-semibold text-primary/90">
                              {file.nombre}
                            </h4>
                            {file.tipo && (
                              <p className="text-xs text-muted-foreground">
                                Tipo: {file.tipo}
                              </p>
                            )}
                            {file.descripcion && (
                              <p className="text-sm my-1">{file.descripcion}</p>
                            )}
                            <Button asChild variant="outline" size="sm">
                              {" "}
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {" "}
                                <Download className="mr-1.5 h-3.5 w-3.5" />{" "}
                                Acceder al adjunto{" "}
                              </a>{" "}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
              </>
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No hay archivos adjuntos para este proyecto.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
