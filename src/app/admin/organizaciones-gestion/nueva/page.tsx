"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OrganizacionForm from "@/components/forms/OrganizacionForm";
import type { OrganizacionFormData } from "@/lib/schemas/organizacionSchema";
import { addOrganizacion } from "@/lib/supabase/services/organizacionesService";
import { convertFormDataToSupabaseOrganizacion } from "@/lib/schemas/organizacionSchema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

export default function NuevaOrganizacionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: OrganizacionFormData) => {
    if (!user) {
      toast({
        title: "Error de Autenticación",
        description: "Debes estar autenticado como administrador.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const dataForSupabase = convertFormDataToSupabaseOrganizacion(
        data,
        user.id
      );
      const orgId = await addOrganizacion(dataForSupabase, user.id);
      toast({
        title: "Éxito",
        description: "Organización creada correctamente.",
      });
      router.push("/admin/organizaciones-gestion");
    } catch (error) {
      console.error("Error creating organizacion:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la organización.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <PlusCircle className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">
          Crear Nueva Organización
        </h1>
      </header>
      <p className="text-muted-foreground">
        Completa la información a continuación para registrar una nueva
        organización.
      </p>
      <OrganizacionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
