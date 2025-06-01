
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProjectForm from '@/components/forms/ProjectForm';
import type { ProjectFormData } from '@/lib/schemas/projectSchema';
import { addProject } from '@/lib/firebase/projectsService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { convertFormDataForFirestore } from '@/lib/schemas/projectSchema';
import { PlusCircle } from 'lucide-react';

export default function CreateProjectContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: ProjectFormData) => {
    if (!user) {
      toast({ title: "Error", description: "Debes estar autenticado para crear un proyecto.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // 'data' ya contiene idsAutores, idsTutoresPersonas, idsColaboradores como arrays de UIDs
      // procesados por ProjectForm (incluyendo placeholders creados).
      const dataForFirestore = convertFormDataForFirestore(data);
      const projectId = await addProject(dataForFirestore, user.uid);
      toast({ title: "Éxito", description: "Proyecto creado correctamente." });
      router.push(`/proyectos`); 
    } catch (error) {
      console.error("Error creating project:", error);
      toast({ title: "Error", description: "No se pudo crear el proyecto.", variant: "destructive" });
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
      <ProjectForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
