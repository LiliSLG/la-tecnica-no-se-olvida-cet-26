// src/app/(public)/reclamar/[token]/page.tsx
import { notFound } from "next/navigation";
import { ReclamarOrganizacionForm } from "@/components/public/reclamar/ReclamarOrganizacionForm";
import { ReclamarPersonaForm } from "@/components/public/reclamar/ReclamarPersonaForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Building, User } from "lucide-react";
import { Metadata } from "next";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import {
  personasService,
  PersonaRow,
} from "@/lib/supabase/services/personasService";

interface ReclamarTokenPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: ReclamarTokenPageProps): Promise<Metadata> {
  return {
    title: "Reclamar Perfil | La Técnica no se Olvida",
    description: "Verifica y reclama tu perfil en nuestra plataforma.",
    robots: "noindex, nofollow", // No indexar páginas de tokens
  };
}

export default async function ReclamarTokenPage({
  params,
}: ReclamarTokenPageProps) {
  const { token } = await params;

  try {
    // 1. Primero intentar como organización
    const orgResult = await organizacionesService.validarToken(token);

    if (orgResult.success && orgResult.data) {
      const organizacion = orgResult.data.organizacion;
      const yaReclamada = orgResult.data.yaReclamada;

      // Si ya fue reclamada, mostrar mensaje
      if (yaReclamada) {
        return (
          <div className="container mx-auto py-12 px-4 max-w-2xl">
            <Card className="border-green-200">
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-green-700">
                  Organización Ya Verificada
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg font-semibold">
                  {organizacion.nombre_oficial}
                </p>
                <p className="text-muted-foreground">
                  Esta organización ya fue verificada y reclamada por su
                  propietario.
                </p>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Si crees que esto es un error, contacta al administrador.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Renderizar formulario de organización
      return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Building className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Verificar Organización</h1>
            <p className="text-muted-foreground">
              Completa la verificación para gestionar el perfil de tu
              organización
            </p>
          </div>

          {/* Información de la organización */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {organizacion.logo_url ? (
                  <img
                    src={organizacion.logo_url}
                    alt={`Logo de ${organizacion.nombre_oficial}`}
                    className="w-12 h-12 object-contain rounded-lg border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">
                    🏢
                  </div>
                )}
                {organizacion.nombre_oficial}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {organizacion.nombre_fantasia && (
                  <div>
                    <span className="font-medium">Nombre comercial:</span>
                    <p className="text-muted-foreground">
                      {organizacion.nombre_fantasia}
                    </p>
                  </div>
                )}

                {organizacion.tipo && (
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <p className="text-muted-foreground capitalize">
                      {organizacion.tipo.replace("_", " ")}
                    </p>
                  </div>
                )}

                {organizacion.email_contacto && (
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-muted-foreground">
                      {organizacion.email_contacto}
                    </p>
                  </div>
                )}

                {organizacion.descripcion && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Descripción:</span>
                    <p className="text-muted-foreground mt-1">
                      {organizacion.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del proceso */}
          <Alert className="mb-8">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>¿Qué sucede al verificar?</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  Confirmas que representas oficialmente a esta organización
                </li>
                <li>Obtienes acceso para editar y completar la información</li>
                <li>
                  Tu organización aparecerá como "Verificada" públicamente
                </li>
                <li>Podrás gestionar proyectos y colaboraciones</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Formulario de reclamación */}
          <ReclamarOrganizacionForm organizacion={organizacion} token={token} />
        </div>
      );
    }

    // 2. Si no es organización, intentar como persona
    const personaResult = await personasService.validarToken(token);

    if (personaResult.success && personaResult.data) {
      const persona = personaResult.data.persona;
      const yaReclamada = personaResult.data.yaReclamada;

      // Si ya fue reclamada, mostrar mensaje
      if (yaReclamada) {
        return (
          <div className="container mx-auto py-12 px-4 max-w-2xl">
            <Card className="border-green-200">
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-green-700">
                  Perfil Ya Verificado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg font-semibold">
                  {persona.nombre} {persona.apellido}
                </p>
                <p className="text-muted-foreground">
                  Este perfil ya fue reclamado y verificado exitosamente.
                </p>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Si es tu perfil, puedes acceder desde tu dashboard personal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Renderizar formulario de persona
      return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
          <div className="text-center mb-8">
            <User className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              Reclamar Perfil Personal
            </h1>
            <p className="text-muted-foreground">
              Verifica tu identidad y activa tu perfil en la plataforma
            </p>
          </div>

          <ReclamarPersonaForm persona={persona} token={token} />
        </div>
      );
    }

    // 3. Si no es ninguno, mostrar error genérico
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Token Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              El enlace de verificación no es válido, ha expirado o ya fue
              utilizado.
            </p>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Si necesitas ayuda, contacta al equipo de La Técnica no se
                Olvida.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("❌ Error en página de reclamación:", error);
    notFound();
  }
}
