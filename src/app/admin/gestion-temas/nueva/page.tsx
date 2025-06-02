
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TemaForm from '@/components/forms/TemaForm';
import type { TemaFormData } from '@/lib/schemas/temaSchema';
import { addTema } from '@/lib/supabase/temasService';
import { convertFormDataToSupabaseTema } from "@/lib/schemas/temaSchema";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

export default function NuevoTemaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: TemaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado como administrador.", variant: "destructive" });
      return false;
    }
    setIsSubmitting(true);
    try {
      const dataForSupabase = convertFormDataToSupabaseTema(data, user.id);
      // addTema in service now handles setting timestamps and other audit fields
      const temaId = await addTema(dataForSupabase as TemaFormData, user.id); // Cast needed if service expects more complete data
      toast({ title: "Éxito", description: "Tema creado correctamente." });
      router.push('/admin/gestion-temas'); 
      return true;
    } catch (error) {
      console.error("Error creating tema:", error);
      toast({ title: "Error", description: "No se pudo crear el tema.", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <PlusCircle className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Crear Nuevo Tema</h1>
      </header>
      <p className="text-muted-foreground">
        Completa la información a continuación para registrar un nuevo tema.
      </p>
      <TemaForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        volverAPath="/admin/gestion-temas"
      />
    </div>
  );
}
