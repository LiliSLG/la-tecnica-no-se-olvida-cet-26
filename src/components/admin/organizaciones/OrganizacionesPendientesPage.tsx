// src/components/admin/organizaciones/OrganizacionesPendientesPage.tsx
"use client";

import { useState } from "react";
import { OrganizacionRow } from "@/lib/supabase/services/organizacionesService";
import { AprobacionInvitacionCard } from "./AprobacionInvitacionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, CheckCircle, XCircle, Info } from "lucide-react";

interface OrganizacionesPendientesPageProps {
  organizacionesPendientes: OrganizacionRow[];
  onApprovalChange: () => void;
}

export function OrganizacionesPendientesPage({
  organizacionesPendientes,
  onApprovalChange,
}: OrganizacionesPendientesPageProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Separar por estado
  const sinInvitacion = organizacionesPendientes.filter(
    (org) => org.estado_verificacion === "sin_invitacion"
  );

  const pendientesAprobacion = organizacionesPendientes.filter(
    (org) => org.estado_verificacion === "pendiente_aprobacion"
  );

  const handleApprovalChange = (organizacionId: string) => {
    setProcessingId(organizacionId);
    // Llamar al callback después de un breve delay
    setTimeout(() => {
      onApprovalChange();
      setProcessingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Gestión de Organizaciones Pendientes
        </h1>
        <p className="text-muted-foreground">
          Administra las invitaciones y aprobaciones de organizaciones
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sin Invitación
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sinInvitacion.length}</div>
            <p className="text-xs text-muted-foreground">
              Organizaciones creadas sin email
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendientesAprobacion.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Esperando aprobación admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <XCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizacionesPendientes.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Organizaciones por revisar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta informativa */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>¿Cómo funciona el proceso?</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>
              <strong>Sin invitación:</strong> Organizaciones creadas sin email
              de contacto
            </li>
            <li>
              <strong>Pendiente aprobación:</strong> Organizaciones que
              solicitaron verificación
            </li>
            <li>
              <strong>Acciones:</strong> Puedes aprobar, rechazar o enviar
              invitaciones
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Lista vacía */}
      {organizacionesPendientes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">¡Todo al día!</h3>
            <p className="text-muted-foreground text-center">
              No hay organizaciones pendientes de aprobación
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sección: Pendientes de Aprobación */}
      {pendientesAprobacion.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Pendientes de Aprobación</h2>
            <Badge variant="destructive">{pendientesAprobacion.length}</Badge>
          </div>

          <div className="grid gap-4">
            {pendientesAprobacion.map((organizacion) => (
              <AprobacionInvitacionCard
                key={organizacion.id}
                organizacion={organizacion}
                onApprovalChange={() => handleApprovalChange(organizacion.id)}
                isProcessing={processingId === organizacion.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sección: Sin Invitación */}
      {sinInvitacion.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Sin Invitación</h2>
            <Badge variant="secondary">{sinInvitacion.length}</Badge>
          </div>

          <div className="grid gap-4">
            {sinInvitacion.map((organizacion) => (
              <AprobacionInvitacionCard
                key={organizacion.id}
                organizacion={organizacion}
                onApprovalChange={() => handleApprovalChange(organizacion.id)}
                isProcessing={processingId === organizacion.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

