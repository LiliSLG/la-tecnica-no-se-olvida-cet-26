// src/components/public/reclamar/ReclamarOrganizacionForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
// Volver al import original:
import { organizacionesService, OrganizacionRow } from "@/lib/supabase/services/organizacionesService";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, User, LogIn, AlertTriangle } from "lucide-react";

interface ReclamarOrganizacionFormProps {
  organizacion: OrganizacionRow; // ← Volver a OrganizacionRow
  token: string;
}

export function ReclamarOrganizacionForm({
  organizacion,
  token,
}: ReclamarOrganizacionFormProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [reclamando, setReclamando] = useState(false);
  const [reclamacionExitosa, setReclamacionExitosa] = useState(false);

  const handleReclamar = async () => {
    if (!user) {
      toast({
        title: "Debes iniciar sesión",
        description: "Inicia sesión para poder reclamar esta organización",
        variant: "destructive",
      });
      return;
    }

    setReclamando(true);
    try {
      const result = await organizacionesService.reclamarConToken(
        token,
        user.id
      );

      if (result.success) {
        setReclamacionExitosa(true);
        toast({
          title: "¡Organización Verificada!",
          description: `${organizacion.nombre_oficial} ha sido verificada correctamente.`,
        });

        // Redirect después de 3 segundos
        setTimeout(() => {
          router.push("/organizaciones");
        }, 3000);
      } else {
        toast({
          title: "Error en la verificación",
          description:
            result.error?.message || "No se pudo completar la verificación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reclamando organización:", error);
      toast({
        title: "Error inesperado",
        description: "Hubo un problema al procesar la verificación",
        variant: "destructive",
      });
    } finally {
      setReclamando(false);
    }
  };

  // Estado de éxito
  if (reclamacionExitosa) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              ¡Verificación Completada!
            </h3>
            <p className="text-green-600 mb-4">
              {organizacion.nombre_oficial} ha sido verificada correctamente.
            </p>
            <p className="text-sm text-muted-foreground">
              Serás redirigido en unos segundos...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no está logueado
  if (!authLoading && !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Inicia Sesión para Continuar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para verificar esta organización, necesitas tener una cuenta en La
              Técnica no se Olvida.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => router.push("/login")}>
              <LogIn className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/register")}
            >
              <User className="h-4 w-4 mr-2" />
              Crear Cuenta
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Una vez que inicies sesión, podrás completar la verificación de la
            organización.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  // Formulario principal
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Confirmar Verificación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del usuario actual */}
        <Alert>
          <User className="h-4 w-4" />
          <AlertDescription>
            <strong>Verificando como:</strong>{" "}
            {user?.nombre && user?.apellido
              ? `${user.nombre} ${user.apellido}`
              : user?.email || "Usuario"}
          </AlertDescription>
        </Alert>

        {/* Información importante */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Al hacer clic en "Verificar Organización":</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Confirmas que tienes autoridad para representar a{" "}
              {organizacion.nombre_oficial}
            </li>
            <li>
              La organización aparecerá como "Verificada" en el directorio
              público
            </li>
            <li>Podrás editar la información y gestionar proyectos</li>
            <li>Esta acción no se puede deshacer</li>
          </ul>
        </div>

        {/* Botón de acción */}
        <Button
          onClick={handleReclamar}
          disabled={reclamando}
          className="w-full"
          size="lg"
        >
          {reclamando ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verificar Organización
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
