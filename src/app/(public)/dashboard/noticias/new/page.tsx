// /src/app/(public)/dashboard/noticias/new/page.tsx
"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { NoticiaForm } from "@/components/admin/noticias/NoticiaForm";
import { BackButton } from "@/components/shared/navigation/BackButton";
import { useAuth } from "@/providers/AuthProvider";

export default function CreateNoticiaUserPage() {
  const { user, isLoading } = useAuth();

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/login");
    }
  }, [user, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // No authenticated user
  if (!user) {
    return null; // El redirect se encargará de esto
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <BackButton href="/dashboard/noticias" label="Volver a Mis Noticias" />

        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Noticia</CardTitle>
            <CardDescription>
              Comparte una noticia, artículo o enlace de interés con la
              comunidad. Puedes publicarla inmediatamente o guardarla como
              borrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Reutilizar el mismo NoticiaForm de admin */}
            <NoticiaForm redirectPath="/dashboard/noticias" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
