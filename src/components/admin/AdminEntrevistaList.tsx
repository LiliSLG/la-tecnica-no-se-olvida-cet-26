
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getAllEntrevistasForAdmin, logicalDeleteEntrevista, restoreEntrevista } from '@/lib/supabase/entrevistasService';
import type { Entrevista } from '@/lib/types';
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
import { Edit, Trash2, RotateCcw, PlusCircle, AlertTriangle, Loader2, CheckCircle, XCircle, Eye, MessageSquare, Video, LinkIcon as ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminEntrevistaList() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Entrevista | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEntrevistas = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedEntrevistas = await getAllEntrevistasForAdmin({ filters: { estaEliminada: showDeleted } });
      setEntrevistas(fetchedEntrevistas);
    } catch (err) {
      console.error("Error fetching entrevistas for admin:", err);
      setError("No se pudieron cargar las entrevistas.");
      toast({ title: "Error", description: "No se pudieron cargar las entrevistas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast, showDeleted]);

  useEffect(() => {
    fetchEntrevistas();
  }, [fetchEntrevistas]);

  const openConfirmDeleteDialog = (entrevista: Entrevista) => {
    setItemToDelete(entrevista);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleLogicalDelete = async () => {
    if (!itemToDelete || !itemToDelete.id || !user) return;
    try {
      await logicalDeleteEntrevista(itemToDelete.id, user.id);
      toast({ title: "Éxito", description: "Entrevista eliminada lógicamente." });
      fetchEntrevistas(); 
    } catch (error) {
      console.error("Error logically deleting entrevista:", error);
      toast({ title: "Error", description: "No se pudo eliminar lógicamente la entrevista.", variant: "destructive" });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleRestore = async (entrevistaId: string) => {
    if (!user) return;
    try {
      await restoreEntrevista(entrevistaId, user.id);
      toast({ title: "Éxito", description: "Entrevista restaurada." });
      fetchEntrevistas();
    } catch (error) {
      console.error("Error restoring entrevista:", error);
      toast({ title: "Error", description: "No se pudo restaurar la entrevista.", variant: "destructive" });
    }
  };
  
  const formatDateSafe = (timestamp: any) => {
    if (!timestamp) return 'No especificada';
    try {
      const date = new Date(timestamp);
      
      return format(date, 'P p', { locale: es });
    } catch (e) { return "Fecha inválida"; }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3">Cargando entrevistas...</p></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 flex items-center justify-center gap-2"><AlertTriangle /> {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => {setShowDeleted(prev => !prev); fetchEntrevistas();}} variant="outline">
          {showDeleted ? "Mostrar Activas/No Publicadas" : "Mostrar Eliminadas"}
        </Button>
        <Button asChild>
          <Link href="/admin/gestion-entrevistas/nueva">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nueva Entrevista
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            {showDeleted ? "Entrevistas Eliminadas" : "Entrevistas"}
          </CardTitle>
          <CardDescription>
            {showDeleted
              ? "Lista de entrevistas que han sido marcadas como eliminadas."
              : "Lista de todas las entrevistas y saberes en la plataforma."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entrevistas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay entrevistas para mostrar en esta vista.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título del Saber</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Recopilación</TableHead>
                  <TableHead>Publicada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrevistas.map((entrevista) => (
                  <TableRow key={entrevista.id} className={entrevista.estaEliminada ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{entrevista.tituloSaber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {entrevista.tipoContenido === 'video_propio' ? <Video className="mr-1 h-3 w-3"/> : <ExternalLinkIcon className="mr-1 h-3 w-3"/>}
                        {entrevista.tipoContenido.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDateSafe(entrevista.fechaGrabacionORecopilacion)}</TableCell>
                    <TableCell>
                      {entrevista.estaPublicada ?
                        <Badge variant="secondary" className="items-center gap-1 text-green-700 bg-green-100 border-green-200"><CheckCircle className="h-3 w-3" /> Sí</Badge> :
                        <Badge variant="outline" className="items-center gap-1 text-orange-600 border-orange-200"><XCircle className="h-3 w-3" /> No</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" asChild title="Ver Detalle (Público)">
                           <Link href={`/explorar/historia-oral/${entrevista.id}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                        </Button>
                       {!entrevista.estaEliminada && (
                        <Button variant="ghost" size="icon" asChild title="Editar">
                            <Link href={`/admin/gestion-entrevistas/editar/${entrevista.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                       )}
                      {entrevista.estaEliminada ? (
                        <Button variant="ghost" size="icon" onClick={() => handleRestore(entrevista.id!)} title="Restaurar">
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => openConfirmDeleteDialog(entrevista)} title="Eliminar Lógicamente">
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
              Estás a punto de eliminar lógicamente la entrevista "{itemToDelete?.tituloSaber}". 
              Se despublicará y podrás restaurarla más tarde si es necesario. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogicalDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar Lógicamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    