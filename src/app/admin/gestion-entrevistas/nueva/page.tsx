"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EntrevistaForm from '@/components/forms/EntrevistaForm';
import type { EntrevistaFormData } from '@/lib/schemas/entrevistaSchema';
import { addEntrevista } from '@/lib/supabase/services/entrevistasService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MessageSquare } from 'lucide-react';

export default function NuevaEntrevistaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: EntrevistaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado.", variant: "destructive" });
      return false;
    }
    setIsSubmitting(true);
    try {
      await addEntrevista(data, user.id);
      toast({ title: "Éxito", description: "Entrevista creada correctamente." });
      router.push('/admin/entrevistas-gestion'); 
      return true;
    } catch (error) {
      console.error("Error creating entrevista:", error);
      toast({ title: "Error", description: "No se pudo crear la entrevista.", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <MessageSquare className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Añadir Nueva Entrevista / Saber</h1>
      </header>
      <p className="text-muted-foreground">
        Completa la información a continuación para registrar una nueva entrada en el archivo de historia oral o saberes rurales.
      </p>
      <EntrevistaForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        volverAPath="/admin/entrevistas-gestion"
      />
    </div>
  );
}

    
