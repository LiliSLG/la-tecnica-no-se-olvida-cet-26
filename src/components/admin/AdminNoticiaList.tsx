
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllNoticiasForAdmin, logicalDeleteNoticia, restoreNoticia } from '@/lib/firebase/noticiasService';
import type { Noticia } from '@/lib/types';
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
import { Edit, Trash2, RotateCcw, PlusCircle, AlertTriangle, Loader2, CheckCircle, XCircle, Eye, Newspaper, LinkIcon as ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { tipoContenidoNoticiaLabels } from '@/lib/schemas/noticiaSchema';
import { Timestamp } from 'firebase/firestore';

export default function AdminNoticiaList() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Noticia | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const fetchNoticias = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Adjust filter based on showDeleted state
      const fetchedNoticias = await getAllNoticiasForAdmin({ filters: { estaEliminada: showDeleted } });
      setNoticias(fetchedNoticias);
    } catch (err) {
      console.error("Error fetching noticias for admin:", err);
      setError("No se pudieron cargar las noticias.");
      toast({ title: "Error", description: "No se pudieron cargar las noticias.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast, showDeleted]); // Add showDeleted as dependency

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  const openConfirmDeleteDialog = (noticia: Noticia) => {
    setItemToDelete(noticia);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleLogicalDelete = async () => {
    if (!itemToDelete || !itemToDelete.id || !user) return;
    try {
      await logicalDeleteNoticia(itemToDelete.id, user.uid);
      toast({ title: "Éxito", description: "Noticia eliminada lógicamente." });
      fetchNoticias(); // Refetch to update list
    } catch (error) {
      console.error("Error logically deleting noticia:", error);
      toast({ title: "Error", description: "No se pudo eliminar lógicamente la noticia.", variant: "destructive" });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleRestore = async (noticiaId: string) => {
    if (!user) return;
    try {
      await restoreNoticia(noticiaId, user.uid);
      toast({ title: "Éxito", description: "Noticia restaurada." });
      fetchNoticias(); // Refetch to update list
    } catch (error) {
      console.error("Error restoring noticia:", error);
      toast({ title: "Error", description: "No se pudo restaurar la noticia.", variant: "destructive" });
    }
  };
  
  const formatDateSafe = (timestamp: any) => {
    if (!timestamp) return 'No especificada';
    try {
      const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'P p', { locale: es });
    } catch (e) { 
      console.warn("Error formatting date:", timestamp, e);
      return "Fecha inválida"; 
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3">Cargando noticias...</p></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 flex items-center justify-center gap-2"><AlertTriangle /> {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => {setShowDeleted(prev => !prev); fetchNoticias();}} variant="outline">
          {showDeleted ? "Mostrar Activas/No Publicadas" : "Mostrar Eliminadas"}
        </Button>
        <Button asChild>
          <Link href="/admin/gestion-noticias/nueva">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Noticia
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            {showDeleted ? "Noticias Eliminadas" : "Noticias"}
          </CardTitle>
          <CardDescription>
            {showDeleted
              ? "Lista de noticias que han sido marcadas como eliminadas."
              : "Lista de todas las noticias y artículos en la plataforma."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {noticias.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay noticias para mostrar en esta vista.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Publicación</TableHead>
                  <TableHead>Publicada</TableHead>
                  <TableHead>Destacada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {noticias.map((noticia) => (
                  <TableRow key={noticia.id} className={noticia.estaEliminada ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{noticia.titulo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tipoContenidoNoticiaLabels[noticia.tipoContenido] || noticia.tipoContenido}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDateSafe(noticia.fechaPublicacion)}</TableCell>
                    <TableCell>
                      {noticia.estaPublicada ?
                        <Badge variant="secondary" className="items-center gap-1 text-green-700 bg-green-100 border-green-200"><CheckCircle className="h-3 w-3" /> Sí</Badge> :
                        <Badge variant="outline" className="items-center gap-1 text-orange-600 border-orange-200"><XCircle className="h-3 w-3" /> No</Badge>}
                    </TableCell>
                    <TableCell>
                      {noticia.esDestacada ?
                        <Badge variant="default" className="items-center gap-1"><CheckCircle className="h-3 w-3" /> Sí</Badge> :
                        <Badge variant="outline" className="items-center gap-1"><XCircle className="h-3 w-3" /> No</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {noticia.tipoContenido === 'articulo_propio' && (
                        <Button variant="ghost" size="icon" asChild title="Ver Detalle">
                          <Link href={`/noticias/${noticia.id}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                        </Button>
                      )}
                      {noticia.tipoContenido === 'enlace_externo' && noticia.urlExterna && (
                        <Button variant="ghost" size="icon" asChild title="Ver Enlace Externo">
                          <a href={noticia.urlExterna} target="_blank" rel="noopener noreferrer"><ExternalLinkIcon className="h-4 w-4" /></a>
                        </Button>
                      )}
                       {!noticia.estaEliminada && (
                        <Button variant="ghost" size="icon" asChild title="Editar">
                            <Link href={`/admin/gestion-noticias/editar/${noticia.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                       )}
                      {noticia.estaEliminada ? (
                        <Button variant="ghost" size="icon" onClick={() => handleRestore(noticia.id!)} title="Restaurar">
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => openConfirmDeleteDialog(noticia)} title="Eliminar Lógicamente">
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
              Estás a punto de eliminar lógicamente la noticia "{itemToDelete?.titulo}". 
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
