"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProjectForm from '@/components/forms/ProjectForm';
import type { ProjectFormData } from '@/lib/schemas/projectSchema';
import { getProjectById, updateProject } from '@/lib/supabase/services/proyectosService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Proyecto } from '@/lib/types';
import {
  convertFormDataToSupabaseProject,
  convertSupabaseDataToFormProject,
} from "@/lib/schemas/projectSchema";
import { Edit, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Corrected import for Button
import { ProyectosService } from '@/lib/supabase/services/proyectosService';
import { supabase } from '@/lib/supabase/client';

interface EditProjectContentProps {
  projectId: string;
}

export default function EditProjectContent({ projectId }: EditProjectContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<ProjectFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const project = await getProjectById(projectId);
        if (project) {
          // Convert Firestore data to form-compatible data before setting initialData
          setInitialData(convertSupabaseDataToFormProject(project));
        } else {
          setError("Proyecto no encontrado.");
          toast({ title: "Error", description: "Proyecto no encontrado.", variant: "destructive" });
          router.push('/proyectos'); 
        }
      } catch (err) {
        console.error("Error fetching project for editing:", err);
        setError("No se pudo cargar el proyecto para editar.");
        toast({ title: "Error", description: "No se pudo cargar el proyecto.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, router, toast]);

  const handleSubmit = async (data: ProjectFormData): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      const proyectosService = new ProyectosService(supabase);
      
      const partial: Partial<Proyecto> = convertFormDataToSupabaseProject(data);
      
      const result = await proyectosService.update(projectId, partial);

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Proyecto actualizado',
        description: 'El proyecto se ha actualizado correctamente.',
      });

      const volverAPath = searchParams.get("volverA");
      if (volverAPath) {
        router.push(volverAPath);
      } else {
        router.push("/admin/gestion-proyectos");
      }
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error al actualizar el proyecto.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Cargando datos del proyecto...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">Volver</Button>
      </div>
    );
  }
  
  if (!initialData) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Proyecto no encontrado o datos no pudieron ser cargados.</p>
        <Button onClick={() => router.push('/proyectos')} variant="outline">Ir a Proyectos</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <Edit className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Editar Proyecto</h1>
      </header>
      <p className="text-muted-foreground">
        Modifica la información del proyecto "
        {initialData.titulo || " proyecto sin título"}".
      </p>
      <ProjectForm
        onSubmit={handleSubmit}
        initialData={initialData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
