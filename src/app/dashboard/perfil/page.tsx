// src/app/dashboard/perfil/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  personasService,
  PersonaRow,
} from "@/lib/supabase/services/personasService";
import { UserProfileForm } from "@/components/user/UserProfileForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCategoriaInfo } from "@/lib/constants/persona";


export default function UserProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profileData, setProfileData] = useState<PersonaRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCategoryChange, setPendingCategoryChange] = useState(false);

  // Cargar datos del perfil
  useEffect(() => {
    async function loadProfile() {
      if (authLoading || !user?.id) return;

      try {
        setLoading(true);
        const result = await personasService.getById(user.id);

        if (result.success && result.data) {
          setProfileData(result.data);

          // Verificar si hay cambio de categoría pendiente
          if (result.data.estado_verificacion === "pendiente_aprobacion") {
            setPendingCategoryChange(true);
          }
        } else {
          toast({
            title: "Error",
            description: "No se pudo cargar tu perfil",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Error inesperado cargando perfil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.id, authLoading, toast]);

  // Manejar solicitud de cambio a estudiante CET
  const handleRequestStudentStatus = async () => {
    if (!user?.id) return;

    try {
      // Actualizar estado para indicar que solicita ser estudiante
      const result = await personasService.update(user.id, {
        estado_verificacion: "pendiente_aprobacion",
        // Podríamos agregar un campo como categoria_solicitada: "estudiante_cet"
      });

      if (result.success) {
        setPendingCategoryChange(true);
        toast({
          title: "Solicitud enviada",
          description:
            "Tu solicitud fue enviada al administrador para revisión",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar la solicitud",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error requesting student status:", error);
      toast({
        title: "Error",
        description: "Error enviando solicitud",
        variant: "destructive",
      });
    }
  };

  // Formatear categoría para mostrar
  const formatCategoria = (categoria: string) =>
    getCategoriaInfo(categoria).label;

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No se pudo cargar tu perfil. Intenta recargar la página.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8" />
              Mi Perfil
            </h1>
            <p className="text-muted-foreground">
              Gestiona tu información personal y preferencias
            </p>
          </div>
        </div>

        {/* Categoría actual y botón especial */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Tu categoría actual:
                </p>
                <p className="font-semibold">
                  {formatCategoria(
                    profileData.categoria_principal || "comunidad_general"
                  )}
                </p>
              </div>

              {/* Botón especial para comunidad_general */}
              {profileData.categoria_principal === "comunidad_general" &&
                !pendingCategoryChange && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-2">
                      ¿Sos estudiante o ex-alumno del CET N°26?
                    </p>
                    <Button onClick={handleRequestStudentStatus}>
                      Solicitar cambio
                    </Button>
                  </div>
                )}

              {/* Mensaje de solicitud pendiente */}
              {pendingCategoryChange && (
                <Alert className="max-w-sm">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Tu solicitud de cambio de categoría está pendiente de
                    aprobación
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulario de perfil */}
        <UserProfileForm
          initialData={profileData}
          onSuccess={() => {
            toast({
              title: "Perfil actualizado",
              description: "Tu información se guardó correctamente",
            });
          }}
        />
      </div>
    </div>
  );
}
