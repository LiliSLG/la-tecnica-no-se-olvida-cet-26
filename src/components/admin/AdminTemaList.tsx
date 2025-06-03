
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTemasForAdmin, logicalDeleteTema, restoreTema } from '@/lib/supabase/temasService';
import type { Tema } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, RotateCcw, PlusCircle, AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { temaCategoriaLabels, type TemaCategoria } from '@/lib/schemas/temaSchema';

export default function AdminTemaList() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [temaToDelete, setTemaToDelete] = useState<Tema | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTemas = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedTemas = await getAllTemasForAdmin();
      setTemas(fetchedTemas);
    } catch (err) {
      console.error("Error fetching temas for admin:", err);
      setError("No se pudieron cargar los temas.");
      toast({ title: "Error", description: "No se pudieron cargar los temas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTemas();
  }, [fetchTemas]);

  const openConfirmDeleteDialog = (tema: Tema) => {
    setTemaToDelete(tema);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleLogicalDelete = async () => {
    if (!temaToDelete || !temaToDelete.id || !user) return;
    try {
      await logicalDeleteTema(temaToDelete.id, user.id);
      toast({ title: "Éxito", description: "Tema eliminado lógicamente." });
      fetchTemas();
    } catch (error) {
      console.error("Error logically deleting tema:", error);
      toast({ title: "Error", description: "No se pudo eliminar lógicamente el tema.", variant: "destructive" });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setTemaToDelete(null);
    }
  };

  const handleRestore = async (temaId: string) => {
    if (!user) return;
    try {
      await restoreTema(temaId, user.id);
      toast({ title: "Éxito", description: "Tema restaurado." });
      fetchTemas();
    } catch (error) {
      console.error("Error restoring tema:", error);
      toast({ title: "Error", description: "No se pudo restaurar el tema.", variant: "destructive" });
    }
  };
  
  const formatDateSafe = (timestamp: any) => {
    if (timestamp && timestamp.toDate) {
      try {
        return format(timestamp.toDate(), 'P p', { locale: es });
      } catch (e) { return "Fecha inválida"; }
    }
    return 'No especificada';
  };

  const filteredTemas = temas.filter(t => showDeleted ? t.estaEliminada : !t.estaEliminada);

  if (loading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3">Cargando temas...</p></div>;
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
          <Link href="/admin/gestion-temas/nueva">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Tema
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{showDeleted ? "Temas Eliminados Lógicamente" : "Temas Activos"}</CardTitle>
          <CardDescription>
            {showDeleted
              ? "Lista de temas que han sido marcados como eliminados."
              : "Lista de todos los temas activos en la plataforma."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTemas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay temas para mostrar en esta vista.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción (extracto)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemas.map((tema) => (
                  <TableRow key={tema.id} className={tema.estaEliminada ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{tema.nombre}</TableCell>
                    <TableCell>
                      {tema.categoriaTema ? 
                        <Badge variant="outline">{temaCategoriaLabels[tema.categoriaTema as TemaCategoria] || tema.categoriaTema}</Badge> 
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-xs max-w-xs truncate">
                      {tema.descripcion ? tema.descripcion.substring(0, 100) + (tema.descripcion.length > 100 ? '...' : '') : 'N/A'}
                    </TableCell>
                     <TableCell>
                      {tema.estaEliminada ?
                        <Badge variant="destructive" className="items-center gap-1"><XCircle className="h-3 w-3" /> Eliminado</Badge> :
                        <Badge variant="secondary" className="items-center gap-1 text-green-700 bg-green-100 border-green-200"><CheckCircle className="h-3 w-3" /> Activo</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">{formatDateSafe(tema.actualizadoEn)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/admin/gestion-temas/editar/${tema.id}?volverA=/admin/gestion-temas`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      {tema.estaEliminada ? (
                        <Button variant="ghost" size="icon" onClick={() => handleRestore(tema.id!)} title="Restaurar">
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => openConfirmDeleteDialog(tema)} title="Eliminar Lógicamente">
                          <Trash2 className="h-4 w-4 text-orange-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar Eliminación Lógica?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar lógicamente el tema "{temaToDelete?.nombre}". 
              Podrás restaurarlo más tarde si es necesario. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemaToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogicalDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar Lógicamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
