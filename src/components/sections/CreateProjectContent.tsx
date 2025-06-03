
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/forms/ProjectForm';
import type { ProjectFormData } from '@/lib/schemas/projectSchema';
import { addProject } from '@/lib/supabase/proyectosService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { convertFormDataToSupabaseProject } from "@/lib/schemas/projectSchema";
import { PlusCircle } from 'lucide-react';
import type { Proyecto } from "@/lib/types";

export default function CreateProjectContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: ProjectFormData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear un proyecto.",
        variant: "destructive",
      });
      return false;
    }

    setIsSubmitting(true);
    try {
      // 1. Convertimos el form a Partial<Proyecto>
      const partial: Partial<Proyecto> = convertFormDataToSupabaseProject(data);

      // 2. Hacemos el “cast” para que encaje en lo que addProject espera
      const dataForSupabase = partial as Omit<
        Proyecto,
        | "id"
        | "estaEliminado"
        | "creadoPorUid"
        | "creadoEn"
        | "actualizadoPorUid"
        | "actualizadoEn"
      >;

      // 3. Insertamos en Supabase
      await addProject(dataForSupabase, user.id);

      toast({ title: "Éxito", description: "Proyecto creado correctamente." });
      router.push(`/proyectos`);
      return true;
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <PlusCircle className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Crear Nuevo Proyecto</h1>
      </header>
      <p className="text-muted-foreground">
        Completa la información a continuación para registrar un nuevo proyecto técnico.
      </p>
      <ProjectForm onSubmit={handleSubmit} isSubmitting={isSubmitting} volverAPath="/proyectos" />
    </div>
  );
}
