"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EntrevistaForm from '@/components/forms/EntrevistaForm';
import type { EntrevistaFormData } from '@/lib/schemas/entrevistaSchema';
import { getEntrevistaById, updateEntrevista } from '@/lib/supabase/services/entrevistasService';
import { convertSupabaseDataToFormEntrevista } from "@/lib/schemas/entrevistaSchema";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Edit, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditarEntrevistaPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function EditarEntrevistaPage({ params: paramsProp }: EditarEntrevistaPageProps) {
  const resolvedParams = use(paramsProp as Promise<{ id: string }>);
  const { id: entrevistaId } = resolvedParams;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<EntrevistaFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const volverAPath = searchParams.get('volverA') || '/admin/entrevistas-gestion';

  useEffect(() => {
    const fetchEntrevista = async () => {
      if (!entrevistaId) return;
      setLoading(true);
      try {
        const entrevista = await getEntrevistaById(entrevistaId);
        if (entrevista) {
          setInitialData(convertSupabaseDataToFormEntrevista(entrevista));
        } else {
          setError("Entrevista no encontrada.");
          toast({ title: "Error", description: "Entrevista no encontrada.", variant: "destructive" });
          router.push(volverAPath); 
        }
      } catch (err) {
        console.error("Error fetching entrevista for editing:", err);
        setError("No se pudo cargar la entrevista para editar.");
        toast({ title: "Error", description: "No se pudo cargar la entrevista.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchEntrevista();
  }, [entrevistaId, router, toast, volverAPath]);

  const handleSubmit = async (data: EntrevistaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado.", variant: "destructive" });
      return false;
    }
    if (!entrevistaId) {
      toast({ title: "Error", description: "No se pudo identificar la entrevista a editar.", variant: "destructive" });
      return false;
    }

    setIsSubmitting(true);
    try {
      await updateEntrevista(entrevistaId, data, user.id);
      toast({ title: "Éxito", description: "Entrevista actualizada correctamente." });
      router.push(volverAPath);
      return true;
    } catch (error) {
      console.error("Error updating entrevista:", error);
      toast({ title: "Error", description: "No se pudo actualizar la entrevista.", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Cargando datos de la entrevista...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-4">{error}</p>
        <Button onClick={() => router.push(volverAPath)} variant="outline">Volver al listado</Button>
      </div>
    );
  }
  
  if (!initialData) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Entrevista no encontrada.</p>
        <Button onClick={() => router.push(volverAPath)} variant="outline">Ir al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <MessageSquare className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Editar Entrevista / Saber</h1>
      </header>
      <p className="text-muted-foreground">
        Modifica la información de "{initialData.tituloSaber}".
      </p>
      <EntrevistaForm 
        onSubmit={handleSubmit} 
        initialData={initialData} 
        isSubmitting={isSubmitting} 
        volverAPath={volverAPath}
      />
    </div>
  );
}