// src/components/public/reclamar/ReclamarPersonaForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  personasService,
  PersonaRow,
} from "@/lib/supabase/services/personasService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Loader2,
  User,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { getCategoriaInfo } from "@/lib/constants/persona";

interface ReclamarPersonaFormProps {
  persona: PersonaRow;
  token: string;
}

export function ReclamarPersonaForm({
  persona,
  token,
}: ReclamarPersonaFormProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [procesando, setProcesando] = useState(false);
  const [verificacionExitosa, setVerificacionExitosa] = useState(false);

  // Si ya está autenticado, intentar reclamar automáticamente
  useEffect(() => {
    if (user && !procesando && !verificacionExitosa) {
      manejarReclamacion();
    }
  }, [user]);

  const nombreCompleto = `${persona.nombre} ${persona.apellido || ""}`.trim();
  const categoriaInfo = getCategoriaInfo(persona.categoria_principal);

  const manejarReclamacion = async () => {
    if (!user?.id) {
      // Redirigir a login con return URL
      router.push(`/login?returnUrl=/reclamar/${token}`);
      return;
    }

    try {
      setProcesando(true);

      const result = await personasService.reclamarConToken(token, user.id);

      if (result.success) {
        setVerificacionExitosa(true);
        toast({
          title: "¡Perfil reclamado exitosamente!",
          description: "Tu perfil ha sido verificado y activado",
        });

        setTimeout(() => {
          router.push("/dashboard/perfil");
        }, 2000);
      } else {
        toast({
          title: "Error al reclamar perfil",
          description:
            result.error?.message || "No se pudo verificar el perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en reclamación:", error);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al verificar el perfil",
        variant: "destructive",
      });
    } finally {
      setProcesando(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificando sesión...</p>
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (verificacionExitosa) {
    return (
      <Card className="border-green-200">
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              ¡Perfil Verificado!
            </h2>
            <p className="text-muted-foreground">
              Tu perfil ha sido verificado exitosamente.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Redirigiendo a tu dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información del perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={persona.foto_url || undefined}
                alt={`Foto de ${nombreCompleto}`}
              />
              <AvatarFallback className="text-lg">
                {persona.nombre?.[0]}
                {persona.apellido?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{nombreCompleto}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {persona.email}
                </span>
              </div>
              <div className="mt-2">
                <Badge variant="outline">
                  {categoriaInfo.icon} {categoriaInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {persona.descripcion_personal_o_profesional && (
            <div>
              <h3 className="font-medium mb-2">Descripción:</h3>
              <p className="text-sm text-muted-foreground">
                {persona.descripcion_personal_o_profesional}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Perfil creado:{" "}
              {persona.created_at
                ? new Date(persona.created_at).toLocaleDateString("es-AR")
                : "Fecha no disponible"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Acción de reclamación */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {!user ? (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Debes iniciar sesión para reclamar este perfil.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() =>
                    router.push(`/login?returnUrl=/reclamar/${token}`)
                  }
                  size="lg"
                  className="w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  Iniciar Sesión para Reclamar
                </Button>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold mb-2">¿Es este tu perfil?</h3>
                  <p className="text-sm text-muted-foreground">
                    Al reclamar este perfil podrás completar tu información y
                    participar activamente en la plataforma.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/")}
                    disabled={procesando}
                  >
                    No es mi perfil
                  </Button>

                  <Button
                    onClick={manejarReclamacion}
                    disabled={procesando}
                    className="min-w-32"
                  >
                    {procesando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Reclamando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Sí, reclamar perfil
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
