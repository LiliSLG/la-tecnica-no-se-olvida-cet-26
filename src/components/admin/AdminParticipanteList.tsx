
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Image import might not be used directly here if Avatar handles it
import { useAuth } from '@/contexts/AuthContext';
import { getAllPersonasForAdmin, logicalDeletePersona, restorePersona } from '@/lib/firebase/personasService'; // Removed permanentlyDeletePersona
import type { Persona } from '@/lib/types';
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
import { Edit, Trash2, RotateCcw, PlusCircle, AlertTriangle, Loader2, CheckCircle, XCircle, Users, UserCheck, UserX, ShieldCheck, ShieldOff } from 'lucide-react'; // Removed ShieldAlert
import { Badge } from '@/components/ui/badge';
// format and es locale import are not directly used in this component anymore for dates
import { categoriasPrincipalesPersonaLabels, capacidadesPlataformaLabels } from '@/lib/schemas/personaSchema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminParticipanteList() {
  const [participantes, setParticipantes] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  // State for participanteToDeletePermanently is removed

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchParticipantes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedParticipantes = await getAllPersonasForAdmin();
      setParticipantes(fetchedParticipantes);
    } catch (err) {
      console.error("Error fetching participantes for admin:", err);
      setError("No se pudieron cargar los participantes.");
      toast({ title: "Error", description: "No se pudieron cargar los participantes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchParticipantes();
  }, [fetchParticipantes]);

  const handleLogicalDelete = async (participanteId: string) => {
    if (!user || !participanteId) return;
    try {
      await logicalDeletePersona(participanteId, user.uid);
      toast({ title: "Éxito", description: "Participante eliminado lógicamente." });
      fetchParticipantes();
    } catch (error) {
      console.error("Error logically deleting participante:", error);
      toast({ title: "Error", description: "No se pudo eliminar lógicamente el participante.", variant: "destructive" });
    }
  };

  const handleRestore = async (participanteId: string) => {
    if (!user || !participanteId) return;
    try {
      await restorePersona(participanteId, user.uid);
      toast({ title: "Éxito", description: "Participante restaurado." });
      fetchParticipantes();
    } catch (error) {
      console.error("Error restoring participante:", error);
      toast({ title: "Error", description: "No se pudo restaurar el participante.", variant: "destructive" });
    }
  };

  // openPermanentDeleteDialog and handlePermanentDelete functions are removed
  
  const getInitials = (nombre?: string, apellido?: string) => {
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    return `${n}${a}`.toUpperCase() || '?';
  };

  const filteredParticipantes = participantes.filter(p => showDeleted ? p.estaEliminada : !p.estaEliminada);

  if (loading) {
    return <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-3">Cargando participantes...</p></div>;
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
          <Link href="/admin/gestion-participantes/nueva">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Participante
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{showDeleted ? "Participantes Eliminados Lógicamente" : "Participantes Activos"}</CardTitle>
          <CardDescription>
            {showDeleted
              ? "Lista de participantes que han sido marcados como eliminados."
              : "Lista de todos los participantes activos en la plataforma."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredParticipantes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay participantes para mostrar en esta vista.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Capacidades</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipantes.map((p) => (
                  <TableRow key={p.id} className={p.estaEliminada ? "opacity-60" : ""}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={p.fotoURL || undefined} alt={`${p.nombre} ${p.apellido}`} />
                        <AvatarFallback>{getInitials(p.nombre, p.apellido)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{p.nombre} {p.apellido}</TableCell>
                    <TableCell className="text-xs">{p.email}</TableCell>
                    <TableCell><Badge variant="outline">{categoriasPrincipalesPersonaLabels[p.categoriaPrincipal] || p.categoriaPrincipal}</Badge></TableCell>
                    <TableCell className="text-xs max-w-xs truncate">
                      {p.capacidadesPlataforma && p.capacidadesPlataforma.length > 0 
                        ? p.capacidadesPlataforma.map(cap => capacidadesPlataformaLabels[cap] || cap).join(', ') 
                        : 'N/A'}
                    </TableCell>
                     <TableCell>
                      {p.activo ? 
                        <Badge variant="secondary" className="items-center gap-1 text-green-600"><UserCheck className="h-3 w-3" /> Sí</Badge> :
                        <Badge variant="outline" className="items-center gap-1 text-red-600"><UserX className="h-3 w-3" /> No</Badge>}
                    </TableCell>
                    <TableCell>
                      {p.esAdmin ? 
                        <Badge variant="default" className="items-center gap-1 bg-primary/80"><ShieldCheck className="h-3 w-3" /> Sí</Badge> :
                        <Badge variant="outline" className="items-center gap-1"><ShieldOff className="h-3 w-3" /> No</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/admin/gestion-participantes/editar/${p.id}?volverA=/admin/gestion-participantes`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      {p.estaEliminada ? (
                        <Button variant="ghost" size="icon" onClick={() => handleRestore(p.id!)} title="Restaurar">
                          <RotateCcw className="h-4 w-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => handleLogicalDelete(p.id!)} title="Eliminar Lógicamente">
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

    