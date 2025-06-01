
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProjectsForAdmin, logicalDeleteProject, restoreProject } from '@/lib/firebase/projectsService'; // Removed permanentlyDeleteProject
import { getPersonasByIds } from '@/lib/firebase/personasService';
import type { Proyecto, Persona } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// AlertDialog for permanent delete is removed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Trash2, RotateCcw, PlusCircle, AlertTriangle, Loader2, CheckCircle, XCircle, Users } from 'lucide-react'; // Removed ShieldAlert
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuthorDetail {
  nombre: string;
  apellido: string;
}

export default function AdminProjectList() {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  // State for projectToDeletePermanently is removed

  const [authorDetails, setAuthorDetails] = useState<Map<string, AuthorDetail>>(new Map());
  const [authorLoading, setAuthorLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setAuthorDetails(new Map());
    try {
      const fetchedProjects = await getAllProjectsForAdmin();
      setProjects(fetchedProjects);
    } catch (err) {
      console.error("Error fetching projects for admin:", err);
      setError("No se pudieron cargar los proyectos.");
      toast({ title: "Error", description: "No se pudieron cargar los proyectos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length > 0) {
      const fetchAuthors = async () => {
        setAuthorLoading(true);
        const allAuthorIds = new Set<string>();
        projects.forEach(project => {
          if (project.idsAutores) {
            project.idsAutores.forEach(id => allAuthorIds.add(id));
          }
        });

        if (allAuthorIds.size > 0) {
          try {
            const personas = await getPersonasByIds(Array.from(allAuthorIds));
            const detailsMap = new Map<string, AuthorDetail>();
            personas.forEach(persona => {
              if (persona.id) {
                detailsMap.set(persona.id, { nombre: persona.nombre, apellido: persona.apellido });
              }
            });
            setAuthorDetails(detailsMap);
          } catch (err) {
            console.error("Error fetching author details:", err);
            toast({ title: "Error", description: "No se pudieron cargar los detalles de algunos autores.", variant: "destructive" });
          }
        }
        setAuthorLoading(false);
      };
      fetchAuthors();
    }
  }, [projects, toast]);

  const handleLogicalDelete = async (projectId: string) => {
    if (!user) return;
    try {
      await logicalDeleteProject(projectId, user.uid);
      toast({ title: "Éxito", description: "Proyecto eliminado lógicamente." });
      fetchProjects();
    } catch (error) {
      console.error("Error logically deleting project:", error);
      toast({ title: "Error", description: "No se pudo eliminar lógicamente el proyecto.", variant: "destructive" });
    }
  };

  const handleRestoreProject = async (projectId: string) => {
    if (!user) return;
    try {
      await restoreProject(projectId, user.uid);
      toast({ title: "Éxito", description: "Proyecto restaurado." });
      fetchProjects();
    } catch (error) {
      console.error("Error restoring project:", error);
      toast({ title: "Error", description: "No se pudo restaurar el proyecto.", variant: "destructive" });
    }
  };

  // openPermanentDeleteDialog and handlePermanentDelete functions are removed

  const formatDateSafe = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      try {
        return format(timestamp.toDate(), 'P p', { locale: es });
      } catch (e) { return "Fecha inválida"; }
    }
    return 'No especificada';
  };

  const getDisplayAuthors = (idsAutores: string[] | undefined | null) => {
    if (authorLoading) return "Cargando autores...";
    if (!idsAutores || idsAutores.length === 0) return "N/A";
    return idsAutores.map(id => {
      const author = authorDetails.get(id);
      return author ? `${author.nombre} ${author.apellido}` : id; 
    }).join(', ');
  };

  const filteredProjects = projects.filter(p => showDeleted ? p.estaEliminado : !p.estaEliminado);

  if (loading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3">Cargando proyectos...</p></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 flex items-center justify-center gap-2"><AlertTriangle /> {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowDeleted(!showDeleted)} variant="outline">
          {showDeleted ? "Mostrar Activos" : "Mostrar Eliminados"}
        </Button>
        <Button asChild>
          <Link href="/proyectos/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Proyecto
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{showDeleted ? "Proyectos Eliminados Lógicamente" : "Proyectos Activos"}</CardTitle>
          <CardDescription>
            {showDeleted
              ? "Lista de proyectos que han sido marcados como eliminados."
              : "Lista de todos los proyectos activos en la plataforma."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay proyectos para mostrar en esta vista.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="flex items-center gap-1"><Users className="h-4 w-4"/>Autores</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Eliminado</TableHead>
                  <TableHead>Actualizado En</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className={project.estaEliminado ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{project.titulo}</TableCell>
                    <TableCell className="text-xs">{getDisplayAuthors(project.idsAutores)}</TableCell>
                    <TableCell>{project.anoProyecto}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{project.estadoActual?.replace('_', ' ') || 'N/A'}</Badge></TableCell>
                    <TableCell>
                      {project.estaEliminado ?
                        <Badge variant="destructive" className="items-center gap-1"><XCircle className="h-3 w-3" /> Sí</Badge> :
                        <Badge variant="secondary" className="items-center gap-1 text-green-700 bg-green-100 border-green-200"><CheckCircle className="h-3 w-3" /> No</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">{formatDateSafe(project.actualizadoEn)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Ver Detalle">
                        <Link href={`/proyectos/${project.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/proyectos/editar/${project.id}?volverA=/admin/proyectos-gestion`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      {project.estaEliminado ? (
                        <Button variant="ghost" size="icon" onClick={() => handleRestoreProject(project.id!)} title="Restaurar">
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleLogicalDelete(project.id!)} title="Eliminar Lógicamente">
                          <Trash2 className="h-4 w-4 text-orange-600" />
                        </Button>
                      )}
                      {/* Permanent delete button removed */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* AlertDialog for permanent delete is removed */}
    </div>
  );
}

    