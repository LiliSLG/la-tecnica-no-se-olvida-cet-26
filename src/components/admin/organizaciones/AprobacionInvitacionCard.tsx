// src/components/admin/organizaciones/AprobacionInvitacionCard.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { getTipoInfo, getEstadoInfo } from "@/lib/schemas/organizacionSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Mail,
  Eye,
  Edit,
  Clock,
  Globe,
  Phone,
  Building,
  Users,
  AlertTriangle,
} from "lucide-react";
// ✅ AGREGAR este componente al inicio del archivo, antes de AprobacionInvitacionCard
interface QuickEmailInputProps {
  organizacion: OrganizacionRow;
  onEmailAdded: () => void;
  disabled?: boolean;
}

function QuickEmailInput({
  organizacion,
  onEmailAdded,
  disabled,
}: QuickEmailInputProps) {
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddEmailAndSend = async () => {
    if (!user || !email.trim()) return;

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const updateData = {
        email_contacto: email.trim(),
        estado_verificacion: "invitacion_enviada" as const,
        fecha_ultima_invitacion: new Date().toISOString(),
        updated_by_uid: user.id,
        updated_at: new Date().toISOString(),
      };

      const result = await organizacionesService.update(
        organizacion.id,
        updateData
      );

      if (result.success) {
        toast({
          title: "Email agregado e invitación enviada",
          description: `Se envió una invitación a ${email}`,
        });
        onEmailAdded();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Error al agregar email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding email:", error);
      toast({
        title: "Error",
        description: "Error inesperado al agregar email",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex gap-2 flex-1">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@organizacion.com"
        className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={disabled || isAdding}
      />
      <Button
        onClick={handleAddEmailAndSend}
        disabled={disabled || isAdding || !email.trim()}
        size="sm"
      >
        <Mail className="w-4 h-4 mr-1" />
        {isAdding ? "Enviando..." : "Agregar y Enviar"}
      </Button>
    </div>
  );
}

interface AprobacionInvitacionCardProps {
  organizacion: OrganizacionRow;
  onApprovalChange: () => void;
  isProcessing?: boolean;
}

export function AprobacionInvitacionCard({
  organizacion,
  onApprovalChange,
  isProcessing = false,
}: AprobacionInvitacionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const tipoInfo = getTipoInfo(organizacion.tipo);
  const estadoInfo = getEstadoInfo(organizacion.estado_verificacion);

  const handleApprove = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        estado_verificacion: "verificada" as const,
        fecha_aprobacion_admin: new Date().toISOString(),
        aprobada_por_admin_uid: user.id,
        updated_by_uid: user.id,
        updated_at: new Date().toISOString(),
      };

      const result = await organizacionesService.update(
        organizacion.id,
        updateData
      );

      if (result.success) {
        toast({
          title: "Organización Aprobada",
          description: `${organizacion.nombre_oficial} ha sido verificada correctamente.`,
        });
        onApprovalChange();
      } else {
        toast({
          title: "Error",
          description:
            result.error?.message || "Error al aprobar la organización",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving organization:", error);
      toast({
        title: "Error",
        description: "Error inesperado al aprobar la organización",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        estado_verificacion: "rechazada" as const,
        aprobada_por_admin_uid: user.id,
        updated_by_uid: user.id,
        updated_at: new Date().toISOString(),
      };

      const result = await organizacionesService.update(
        organizacion.id,
        updateData
      );

      if (result.success) {
        toast({
          title: "Organización Rechazada",
          description: `${organizacion.nombre_oficial} ha sido rechazada.`,
        });
        onApprovalChange();
      } else {
        toast({
          title: "Error",
          description:
            result.error?.message || "Error al rechazar la organización",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting organization:", error);
      toast({
        title: "Error",
        description: "Error inesperado al rechazar la organización",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!user || !organizacion.email_contacto) return;

    setLoading(true);
    try {
      // Usar el nuevo método integrado
      const result = await organizacionesService.generarTokenYEnviarInvitacion(
        organizacion.id,
        user.id,
        user.nombre && user.apellido
          ? `${user.nombre} ${user.apellido}`
          : undefined
      );

      if (result.success) {
        toast({
          title: "Invitación Enviada",
          description: `Se envió una invitación a ${organizacion.email_contacto}`,
        });
        onApprovalChange();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Error al enviar la invitación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Error inesperado al enviar la invitación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        isProcessing ? "opacity-50" : "hover:shadow-md"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Logo/Avatar */}
            <div className="flex-shrink-0">
              {organizacion.logo_url ? (
                <img
                  src={organizacion.logo_url}
                  alt={`Logo de ${organizacion.nombre_oficial}`}
                  className="w-12 h-12 object-contain rounded-full border bg-transparent"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
                  {tipoInfo?.icon || "🏢"}
                </div>
              )}
            </div>

            {/* Información principal */}
            <div className="flex-1">
              <CardTitle className="text-lg">
                {organizacion.nombre_oficial}
              </CardTitle>
              {organizacion.nombre_fantasia && (
                <p className="text-sm text-muted-foreground mt-1">
                  {organizacion.nombre_fantasia}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {tipoInfo?.icon} {tipoInfo?.label}
                </Badge>
                <Badge
                  className={
                    estadoInfo?.color === "yellow"
                      ? "bg-yellow-100 text-yellow-800"
                      : estadoInfo?.color === "gray"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {estadoInfo?.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `/admin/organizaciones/${organizacion.id}`,
                  "_blank"
                )
              }
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `/admin/organizaciones/${organizacion.id}/edit`,
                  "_blank"
                )
              }
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizacion.email_contacto && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{organizacion.email_contacto}</span>
            </div>
          )}

          {organizacion.telefono_contacto && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{organizacion.telefono_contacto}</span>
            </div>
          )}

          {organizacion.sitio_web && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <a
                href={organizacion.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Sitio web
              </a>
            </div>
          )}

          {organizacion.abierta_a_colaboraciones && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Abierta a colaboraciones</span>
            </div>
          )}
        </div>

        {/* Descripción */}
        {organizacion.descripcion && (
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-2">{organizacion.descripcion}</p>
          </div>
        )}

        {/* Áreas de interés */}
        {organizacion.areas_de_interes &&
          organizacion.areas_de_interes.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Áreas de interés:</div>
              <div className="flex flex-wrap gap-1">
                {organizacion.areas_de_interes.slice(0, 4).map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
                {organizacion.areas_de_interes.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{organizacion.areas_de_interes.length - 4} más
                  </Badge>
                )}
              </div>
            </div>
          )}

        {/* Alertas específicas por estado */}
        {organizacion.estado_verificacion === "sin_invitacion" &&
          !organizacion.email_contacto && (
            <Alert>
              <AlertDescription>
                <strong>Sin email de contacto:</strong> Esta organización fue
                creada sin email. Puedes editarla para agregar un email y luego
                enviar una invitación.
              </AlertDescription>
            </Alert>
          )}

        {/* Acciones de aprobación */}
        <div className="flex gap-2 pt-2 border-t">
          {/* CASO 1: Pendientes de aprobación del admin */}
          {organizacion.estado_verificacion === "pendiente_aprobacion" && (
            <>
              <Button
                onClick={handleApprove}
                disabled={loading || isProcessing}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? "Aprobando y enviando..." : "Aprobar y Enviar Email"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={loading || isProcessing}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {loading ? "Rechazando..." : "Rechazar"}
              </Button>
            </>
          )}

          {/* CASO 2: Sin invitación y CON email */}
          {organizacion.estado_verificacion === "sin_invitacion" &&
            organizacion.email_contacto && (
              <Button
                onClick={handleSendInvitation}
                disabled={loading || isProcessing}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? "Enviando..." : "Enviar Invitación"}
              </Button>
            )}

          {/* CASO 3: Sin invitación y SIN email */}
          {organizacion.estado_verificacion === "sin_invitacion" &&
            !organizacion.email_contacto && (
              <QuickEmailInput
                organizacion={organizacion}
                onEmailAdded={() => onApprovalChange()}
                disabled={loading || isProcessing}
              />
            )}

          {/* CASO 4: Invitación enviada (reenviar) */}
          {organizacion.estado_verificacion === "invitacion_enviada" && (
            <>
              <Button
                onClick={handleSendInvitation}
                disabled={loading || isProcessing}
                variant="outline"
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? "Reenviando..." : "Reenviar Invitación"}
              </Button>
              <div className="flex-1 text-sm text-muted-foreground">
                Enviada el{" "}
                {organizacion.fecha_ultima_invitacion
                  ? new Date(
                      organizacion.fecha_ultima_invitacion
                    ).toLocaleDateString()
                  : "fecha desconocida"}
              </div>
            </>
          )}

          {/* CASO 5: Ya verificada */}
          {organizacion.estado_verificacion === "verificada" && (
            <div className="flex items-center gap-2 text-green-600 flex-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Verificada{" "}
                {organizacion.fecha_reclamacion
                  ? `el ${new Date(
                      organizacion.fecha_reclamacion
                    ).toLocaleDateString()}`
                  : ""}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
