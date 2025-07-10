// src/components/admin/comunidad/PersonasPendientesPage.tsx
"use client";

import { useState } from "react";
import { PersonaRow } from "@/lib/supabase/services/personasService";
import { AprobacionPersonaCard } from "./AprobacionPersonaCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Users,
  ChevronUp, 
  ChevronDown,
} from "lucide-react";
import {
  CATEGORIAS_PERSONA,
  ESTADOS_VERIFICACION,
  getCategoriaInfo,
  getEstadoVerificacionInfo,
  getCategoriaColor,
  getEstadoVerificacionColor,
} from "@/lib/constants/persona";

interface PersonasPendientesPageProps {
  personasPendientes: PersonaRow[];
  onApprovalChange: () => void;
}

export function PersonasPendientesPage({
  personasPendientes,
  onApprovalChange,
}: PersonasPendientesPageProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showProcessInfo, setShowProcessInfo] = useState(false);

  // Separar por estado - enfocado en cambios de categoría
  const solicitudesCambioCategoria = personasPendientes.filter(
    (persona) =>
      persona.tipo_solicitud === "cambio_categoria" &&
      persona.estado_verificacion === "pendiente_aprobacion"
  );

  const personasSinInvitar = personasPendientes.filter(
    (persona) =>
      persona.tipo_solicitud === "invitacion_admin" &&
      persona.estado_verificacion === "sin_invitacion"
  );

  const invitacionesEnviadas = personasPendientes.filter(
    (persona) =>
      persona.tipo_solicitud === "invitacion_admin" &&
      persona.estado_verificacion === "invitacion_enviada"
  );

  // Las rechazadas pueden ser de ambos tipos
  const categoriasRechazadas = personasPendientes.filter(
    (persona) => persona.estado_verificacion === "rechazada"
  );

  // Para referencia: personas ya verificadas
  const yaVerificadas = personasPendientes.filter(
    (persona) => persona.estado_verificacion === "verificada"
  );

  const handleApprovalChange = (personaId: string) => {
    setProcessingId(personaId);
    // Llamar al callback después de un breve delay
    setTimeout(() => {
      onApprovalChange();
      setProcessingId(null);
    }, 1000);
  };

  // Formatear categoría para mostrar
  const formatCategoria = (categoria: string | null) =>
    getCategoriaInfo(categoria).label;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Gestión de Personas Pendientes
        </h1>
        <p className="text-muted-foreground">
          Gestiona las solicitudes de cambio de categoría y verifica nuevos
          miembros de la comunidad.
        </p>
      </div>
      {/* Cards de estadísticas - 5 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1: Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Personas
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {personasPendientes.length}
            </div>
            <p className="text-xs text-muted-foreground">En la plataforma</p>
          </CardContent>
        </Card>

        {/* Card 2: Cambios de categoría */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verificación Estudiantes
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {solicitudesCambioCategoria.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Estudiantes CET pendientes verificación
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Sin Invitar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Invitar</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {personasSinInvitar.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Creadas por admin, pendientes
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Invitaciones Enviadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Reclamar</CardTitle>
            <XCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {invitacionesEnviadas.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Invitaciones enviadas
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Verificadas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {yaVerificadas.length}
            </div>
            <p className="text-xs text-muted-foreground">Ya verificadas</p>
          </CardContent>
        </Card>
      </div>
      {/* Alerta informativa */}
      <Alert>
        <Info className="h-4 w-4" />
        <div className="flex items-center justify-between">
          <AlertTitle>¿Cómo funciona el proceso?</AlertTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProcessInfo(!showProcessInfo)}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            {showProcessInfo ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showProcessInfo && (
          <AlertDescription>
            <div className="mt-2 space-y-3 text-sm">
              {/* Workflow 1: Cambios de categoría */}
              <div>
                <strong className="text-orange-700">
                  🎓 Verificación de Estudiantes:
                </strong>
                <ul className="list-disc list-inside mt-1 space-y-1 ml-4">
                  <li>
                    Estudiantes CET usan el botón "¿Sos estudiante CET?" en su
                    dashboard
                  </li>
                  <li>
                    Puedes aprobar (cambiando la categoría) o rechazar la
                    solicitud
                  </li>
                  <li>
                    Categorías disponibles: Estudiante CET, Ex-Alumno CET,
                    Docente CET
                  </li>
                </ul>
              </div>

              {/* Workflow 2: Sistema de invitaciones */}
              <div>
                <strong className="text-blue-700">
                  📧 Sistema de Invitaciones:
                </strong>
                <ul className="list-disc list-inside mt-1 space-y-1 ml-4">
                  <li>
                    Personas creadas por admin sin email → Agregar email y
                    enviar invitación
                  </li>
                  <li>Invitaciones enviadas → Reenviar si es necesario</li>
                  <li>
                    Usuario reclama perfil → Completa información y se verifica
                    automáticamente
                  </li>
                </ul>
              </div>

              {/* Nota general */}
              <div className="pt-2 border-t border-gray-200">
                <strong>💡 Tip:</strong> Las personas verificadas aparecerán
                como "Verificadas" y podrán participar plenamente en la
                plataforma.
              </div>
            </div>
          </AlertDescription>
        )}
      </Alert>
      {/* Sección: Solicitudes de Cambio de Categoría */}
      {solicitudesCambioCategoria.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              Solicitudes de Cambio de Categoría
            </h2>
            <Badge variant="destructive">
              {solicitudesCambioCategoria.length}
            </Badge>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Estas personas solicitaron cambiar su categoría de "Comunidad
              General" a una categoría CET. Revisa cada solicitud y aprueba o
              rechaza según corresponda.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {solicitudesCambioCategoria.map((persona) => (
              <AprobacionPersonaCard
                key={persona.id}
                persona={persona}
                onApprovalChange={() => handleApprovalChange(persona.id)}
                isProcessing={processingId === persona.id}
              />
            ))}
          </div>
        </div>
      )}
      {/* Sección: Personas Sin Invitar (Sistema Admin) */}
      {personasSinInvitar.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Personas Sin Invitar</h2>
            <Badge variant="secondary">{personasSinInvitar.length}</Badge>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Estas personas fueron creadas por admin pero aún no han recibido
              invitación. Si tienen email, se enviará automáticamente al
              aprobar.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {personasSinInvitar.map((persona) => (
              <AprobacionPersonaCard
                key={persona.id}
                persona={persona}
                onApprovalChange={() => handleApprovalChange(persona.id)}
                isProcessing={processingId === persona.id}
              />
            ))}
          </div>
        </div>
      )}
      {/* Sección: Invitaciones Enviadas Sin Reclamar */}
      {invitacionesEnviadas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Invitaciones Sin Reclamar</h2>
            <Badge
              variant="outline"
              className="border-orange-300 text-orange-700"
            >
              {invitacionesEnviadas.length}
            </Badge>
          </div>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Estas personas ya recibieron una invitación por email pero aún no
              la han reclamado. Puedes reenviar la invitación si es necesario.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {invitacionesEnviadas.map((persona) => (
              <AprobacionPersonaCard
                key={persona.id}
                persona={persona}
                onApprovalChange={() => handleApprovalChange(persona.id)}
                isProcessing={processingId === persona.id}
              />
            ))}
          </div>
        </div>
      )}
      {/* Sección: Solicitudes Rechazadas */}
      {categoriasRechazadas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Solicitudes Rechazadas</h2>
            <Badge variant="outline" className="border-red-300 text-red-700">
              {categoriasRechazadas.length}
            </Badge>
          </div>

          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Estas solicitudes fueron rechazadas previamente. Las personas
              pueden volver a solicitar el cambio si lo consideran necesario.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {categoriasRechazadas.map((persona) => (
              <AprobacionPersonaCard
                key={persona.id}
                persona={persona}
                onApprovalChange={() => handleApprovalChange(persona.id)}
                isProcessing={processingId === persona.id}
              />
            ))}
          </div>
        </div>
      )}
      {/* Sección: Ya Verificadas (Para referencia) */}
      {yaVerificadas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Personas Verificadas</h2>
            <Badge
              variant="outline"
              className="border-green-300 text-green-700"
            >
              {yaVerificadas.length}
            </Badge>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Estas personas ya completaron el proceso de verificación
              exitosamente.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {yaVerificadas.slice(0, 5).map((persona) => (
              <AprobacionPersonaCard
                key={persona.id}
                persona={persona}
                onApprovalChange={() => handleApprovalChange(persona.id)}
                isProcessing={processingId === persona.id}
              />
            ))}
            {yaVerificadas.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                Y {yaVerificadas.length - 5} personas más...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
