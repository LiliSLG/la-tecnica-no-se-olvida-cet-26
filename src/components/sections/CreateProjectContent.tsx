"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/forms/ProjectForm';
import type { ProjectFormData } from '@/lib/schemas/projectSchema';
import { addProject } from '@/lib/supabase/services/proyectosService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { convertFormDataToSupabaseProject } from "@/lib/schemas/projectSchema";
import { PlusCircle } from 'lucide-react';
import type { Proyecto } from "@/lib/types";
import { ProyectosService } from '@/lib/supabase/services/proyectosService';

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

    try {
      setIsSubmitting(true);
      const proyectosService = new ProyectosService(supabase);
      
      const partial: Partial<Proyecto> = convertFormDataToSupabaseProject(data);
      
      // 2. Hacemos el "cast" para que encaje en lo que addProject espera
      const dataForSupabase = partial as Omit<
        Proyecto,
        'id' | 'created_at' | 'updated_at' | 'eliminado_por_uid' | 'eliminado_en'
      >;

      const result = await proyectosService.addProject(
        dataForSupabase,
        data.temas,
        data.personas,
        data.organizaciones
      );

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Proyecto creado',
        description: 'El proyecto se ha creado correctamente.',
      });

      router.push('/admin/gestion-proyectos');
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error al crear el proyecto.',
        variant: 'destructive',
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
