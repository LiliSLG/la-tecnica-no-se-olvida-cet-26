
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllOrganizacionesForAdmin, logicalDeleteOrganizacion, restoreOrganizacion } from '@/lib/firebase/organizacionesService'; // Removed permanentlyDeleteOrganizacion
import type { Organizacion } from '@/lib/types';
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
import { Eye, Edit, Trash2, RotateCcw, PlusCircle, AlertTriangle, Loader2, CheckCircle, XCircle, Building } from 'lucide-react'; // Removed ShieldAlert
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { organizacionTipoLabels } from '@/lib/schemas/organizacionSchema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminOrganizacionList() {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  // State for orgToDeletePermanently is removed

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrganizaciones = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedOrganizaciones = await getAllOrganizacionesForAdmin();
      setOrganizaciones(fetchedOrganizaciones);
    } catch (err) {
      console.error("Error fetching organizaciones for admin:", err);
      setError("No se pudieron cargar las organizaciones.");
      toast({ title: "Error", description: "No se pudieron cargar las organizaciones.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchOrganizaciones();
  }, [fetchOrganizaciones]);

  const handleLogicalDelete = async (orgId: string) => {
    if (!user) return;
    try {
      await logicalDeleteOrganizacion(orgId, user.uid);
      toast({ title: "Éxito", description: "Organización eliminada lógicamente." });
      fetchOrganizaciones();
    } catch (error) {
      console.error("Error logically deleting organizacion:", error);
      toast({ title: "Error", description: "No se pudo eliminar lógicamente la organización.", variant: "destructive" });
    }
  };

  const handleRestore = async (orgId: string) => {
    if (!user) return;
    try {
      await restoreOrganizacion(orgId, user.uid);
      toast({ title: "Éxito", description: "Organización restaurada." });
      fetchOrganizaciones();
    } catch (error) {
      console.error("Error restoring organizacion:", error);
      toast({ title: "Error", description: "No se pudo restaurar la organización.", variant: "destructive" });
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
  
  const displayName = (org: Organizacion) => org.nombreFantasia || org.nombreOficial;

  const filteredOrganizaciones = organizaciones.filter(org => showDeleted ? org.estaEliminada : !org.estaEliminada);

  if (loading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3">Cargando organizaciones...</p></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500 flex items-center justify-center gap-2"><AlertTriangle /> {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => setShowDeleted(!showDeleted)} variant="outline">
          {showDeleted ? "Mostrar Activas" : "Mostrar Eliminadas"}
        </Button>
        <Button asChild>
          <Link href="/admin/organizaciones-gestion/nueva">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Organización
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{showDeleted ? "Organizaciones Eliminadas Lógicamente" : "Organizaciones Activas"}</CardTitle>
          <CardDescription>
            {showDeleted
              ? "Lista de organizaciones que han sido marcadas como eliminadas."
              : "Lista de todas las organizaciones activas en la plataforma."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrganizaciones.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay organizaciones para mostrar en esta vista.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Localidad</TableHead>
                  <TableHead>Contacto Principal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizaciones.map((org) => (
                  <TableRow key={org.id} className={org.estaEliminada ? "opacity-60" : ""}>
                    <TableCell>
                      <Avatar className="h-10 w-10 rounded-md">
                        {org.logoURL ? (
                          <AvatarImage src={org.logoURL} alt={`Logo de ${displayName(org)}`} className="object-contain" />
                        ) : null}
                        <AvatarFallback className="rounded-md bg-muted">
                          <Building className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{displayName(org)}</TableCell>
                    <TableCell>{organizacionTipoLabels[org.tipo] || org.tipo}</TableCell>
                    <TableCell>{org.ubicacion?.localidad || 'N/A'}</TableCell>
                    <TableCell className="text-xs">{org.emailContacto || org.sitioWeb || 'N/A'}</TableCell>
                     <TableCell>
                      {org.estaEliminada ?
                        <Badge variant="destructive" className="items-center gap-1"><XCircle className="h-3 w-3" /> Eliminada</Badge> :
                        <Badge variant="secondary" className="items-center gap-1 text-green-700 bg-green-100 border-green-200"><CheckCircle className="h-3 w-3" /> Activa</Badge>}
                    </TableCell>
                    <TableCell className="text-xs">{formatDateSafe(org.actualizadoEn)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/admin/organizaciones-gestion/editar/${org.id}?volverA=/admin/organizaciones-gestion`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      {org.estaEliminada ? (
                        <Button variant="ghost" size="icon" onClick={() => handleRestore(org.id!)} title="Restaurar">
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleLogicalDelete(org.id!)} title="Eliminar Lógicamente">
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

    