// src/components/admin/comunidad/AprobacionPersonaCard.tsx
"use client";

import { useState } from "react";
import {
  PersonaRow,
  personasService,
} from "@/lib/supabase/services/personasService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  AlertTriangle,
  Users,
  GraduationCap,
} from "lucide-react";
import { Database } from "@/lib/supabase/types/database.types";
import { CategoriaPersona } from "@/lib/constants/persona";
import {
  CATEGORIAS_PERSONA,
  ESTADOS_VERIFICACION,
  getCategoriaInfo,
  getEstadoVerificacionInfo,
  getCategoriaColor,
  getEstadoVerificacionColor,
} from "@/lib/constants/persona";

interface AprobacionPersonaCardProps {
  persona: PersonaRow;
  onApprovalChange: () => void;
  isProcessing: boolean;
}

// ✅ COMPONENTE QuickEmailInput para personas
interface QuickEmailInputProps {
  persona: PersonaRow;
  onEmailAdded: () => void;
  disabled?: boolean;
}

function QuickEmailInput({
  persona,
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
      // 1. Primero actualizar la persona con el email
      const updateResult = await personasService.update(persona.id, {
        email: email.trim(),
        tipo_solicitud: "invitacion_admin",
        updated_by_uid: user.id,
        updated_at: new Date().toISOString(),
      });

      if (!updateResult.success) {
        throw new Error(updateResult.error?.message || "Error actualizando persona");
      }

      // 2. Luego generar token y enviar invitación
      const adminNombre = user.nombre && user.apellido 
        ? `${user.nombre} ${user.apellido}` 
        : undefined;

      const invitationResult = await personasService.generarTokenYEnviarInvitacion(
        persona.id,
        user.id,
        adminNombre
      );

      if (invitationResult.success) {
        toast({
          title: "Email agregado e invitación enviada",
          description: `Se envió una invitación a ${email}`,
        });
        onEmailAdded();
      } else {
        toast({
          title: "Error",
          description: invitationResult.error?.message || "Error enviando invitación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding email and sending invitation:", error);
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
        placeholder="email@persona.com"
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
export function AprobacionPersonaCard({
  persona,
  onApprovalChange,
  isProcessing,
}: AprobacionPersonaCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  // Formatear categoría para mostrar
  const formatCategoria = (categoria: string | null) =>
    getCategoriaInfo(categoria).label;

  // Obtener color de badge según estado
  const getEstadoBadge = (estado: string | null) => {
    const estadoInfo = getEstadoVerificacionInfo(estado);
    return {
      variant:
        estadoInfo.color === "yellow"
          ? ("destructive" as const)
          : ("default" as const),
      label: estadoInfo.label,
      icon: Clock,
    };
  };

  // Manejar aprobación con nueva categoría
  const handleAprobar = async () => {
    if (!selectedCategoria) {
      toast({
        title: "Selecciona una categoría",
        description: "Debes elegir la categoría a asignar antes de aprobar",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error de autenticación",
        description: "No se pudo verificar tu sesión",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);

      const result = await personasService.aprobarCambioCategoria(
        persona.id,
        selectedCategoria as CategoriaPersona,
        user.id
      );

      if (result.success) {
        toast({
          title: "Solicitud aprobada",
          description: `${persona.nombre} ahora es ${formatCategoria(
            selectedCategoria
          )}`,
        });
        onApprovalChange();
      } else {
        toast({
          title: "Error al aprobar",
          description:
            result.error?.message || "No se pudo aprobar la solicitud",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error aprobando persona:", error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Manejar rechazo
  const handleRechazar = async () => {
    if (!user?.id) {
      toast({
        title: "Error de autenticación",
        description: "No se pudo verificar tu sesión",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);

      const result = await personasService.rechazarSolicitud(
        persona.id,
        user.id
      );

      if (result.success) {
        toast({
          title: "Solicitud rechazada",
          description: `La solicitud de ${persona.nombre} fue rechazada`,
        });
        onApprovalChange();
      } else {
        toast({
          title: "Error al rechazar",
          description:
            result.error?.message || "No se pudo rechazar la solicitud",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rechazando persona:", error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Manejar envío de invitación
  const handleSendInvitation = async () => {
    if (!user?.id) {
      toast({
        title: "Error de autenticación",
        description: "No se pudo verificar tu sesión",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);

      const adminNombre =
        user.nombre && user.apellido
          ? `${user.nombre} ${user.apellido}`
          : undefined;

      const result = await personasService.generarTokenYEnviarInvitacion(
        persona.id,
        user.id,
        adminNombre
      );

      if (result.success) {
        toast({
          title: "Invitación enviada",
          description: `Se envió una invitación a ${persona.email}`,
        });
        onApprovalChange();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Error enviando invitación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al enviar la invitación",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const estadoBadge = getEstadoBadge(persona.estado_verificacion);
  const nombreCompleto = `${persona.nombre} ${persona.apellido || ""}`.trim();

  return (
    <Card
      className={`transition-all duration-200 ${
        isProcessing ? "opacity-60" : ""
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={persona.foto_url || undefined}
                alt={`Foto de ${nombreCompleto}`}
              />
              <AvatarFallback>
                {persona.nombre?.[0]}
                {persona.apellido?.[0]}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold text-lg">{nombreCompleto}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {persona.email}
              </div>
              {persona.descripcion_personal_o_profesional && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {persona.descripcion_personal_o_profesional}
                </p>
              )}
            </div>
          </div>

          <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Categoría actual:</span>
            <Badge variant="outline">
              {formatCategoria(persona.categoria_principal)}
            </Badge>
          </div>

          {persona.created_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Registrado:</span>
              <span>
                {new Date(persona.created_at).toLocaleDateString("es-AR")}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Acciones según estado y tipo */}
        <div className="space-y-4">
          {/* CASO 1: Cambio de categoría */}
          {persona.tipo_solicitud === "cambio_categoria" &&
            persona.estado_verificacion === "pendiente_aprobacion" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Asignar categoría:
                  </label>
                  <Select
                    value={selectedCategoria}
                    onValueChange={setSelectedCategoria}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la categoría correcta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="estudiante_cet">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Estudiante CET
                        </div>
                      </SelectItem>
                      <SelectItem value="ex_alumno_cet">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Ex-Alumno CET
                        </div>
                      </SelectItem>
                      <SelectItem value="docente_cet">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Docente CET
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAprobar}
                    disabled={
                      actionLoading || isProcessing || !selectedCategoria
                    }
                    className="flex-1"
                  >
                    {actionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Aprobando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar solicitud
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleRechazar}
                    disabled={actionLoading || isProcessing}
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            )}

          {/* CASO 2: Sin invitación y CON email */}
          {persona.tipo_solicitud === "invitacion_admin" &&
            persona.estado_verificacion === "sin_invitacion" &&
            persona.email && (
              <Button
                onClick={handleSendInvitation}
                disabled={actionLoading || isProcessing}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {actionLoading ? "Enviando..." : "Enviar Invitación"}
              </Button>
            )}

          {/* CASO 3: Sin invitación y SIN email */}
          {persona.tipo_solicitud === "invitacion_admin" &&
            persona.estado_verificacion === "sin_invitacion" &&
            !persona.email && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Agregar email y enviar invitación:
                </label>
                <QuickEmailInput
                  persona={persona}
                  onEmailAdded={() => onApprovalChange()}
                  disabled={actionLoading || isProcessing}
                />
              </div>
            )}

          {/* CASO 4: Invitación enviada (reenviar) */}
          {persona.tipo_solicitud === "invitacion_admin" &&
            persona.estado_verificacion === "invitacion_enviada" && (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>
                      Invitación enviada el{" "}
                      {persona.fecha_ultima_invitacion
                        ? new Date(
                            persona.fecha_ultima_invitacion
                          ).toLocaleDateString("es-AR")
                        : "fecha no disponible"}
                    </span>
                  </div>
                  <div className="text-xs mt-1">
                    La persona aún no ha reclamado su perfil
                  </div>
                </div>

                <Button
                  onClick={handleSendInvitation}
                  disabled={actionLoading || isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {actionLoading ? "Reenviando..." : "Reenviar Invitación"}
                </Button>
              </div>
            )}

          {/* CASO 5: Estado verificada o rechazada - solo info */}
          {(persona.estado_verificacion === "verificada" ||
            persona.estado_verificacion === "rechazada") && (
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                Estado: {estadoBadge.label}
              </div>
              {persona.fecha_aprobacion_admin && (
                <div className="text-muted-foreground mt-1">
                  Procesado:{" "}
                  {new Date(persona.fecha_aprobacion_admin).toLocaleDateString(
                    "es-AR"
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
