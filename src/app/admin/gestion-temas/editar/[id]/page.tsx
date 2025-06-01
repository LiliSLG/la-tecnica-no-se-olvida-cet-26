
"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TemaForm from '@/components/forms/TemaForm';
import type { TemaFormData } from '@/lib/schemas/temaSchema';
import { getTemaById, updateTema } from '@/lib/firebase/temasService';
import { convertFirestoreDataToFormTema, convertFormDataForFirestoreTema } from '@/lib/schemas/temaSchema';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tema } from '@/lib/types';
import { Edit, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditarTemaPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function EditarTemaPage({ params: paramsProp }: EditarTemaPageProps) {
  const resolvedParams = use(paramsProp as Promise<{ id: string }>);
  const { id: temaId } = resolvedParams;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<TemaFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const volverAPath = searchParams.get('volverA') || '/admin/gestion-temas';

  useEffect(() => {
    const fetchTema = async () => {
      if (!temaId) return;
      setLoading(true);
      try {
        const tema = await getTemaById(temaId);
        if (tema) {
          setInitialData(convertFirestoreDataToFormTema(tema));
        } else {
          setError("Tema no encontrado.");
          toast({ title: "Error", description: "Tema no encontrado.", variant: "destructive" });
          router.push(volverAPath); 
        }
      } catch (err) {
        console.error("Error fetching tema for editing:", err);
        setError("No se pudo cargar el tema para editar.");
        toast({ title: "Error", description: "No se pudo cargar el tema.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchTema();
  }, [temaId, router, toast, volverAPath]);

  const handleSubmit = async (data: TemaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado como administrador.", variant: "destructive" });
      return false;
    }
    if (!temaId) {
      toast({ title: "Error", description: "No se pudo identificar el tema a editar.", variant: "destructive" });
      return false;
    }

    setIsSubmitting(true);
    try {
      const dataForFirestore = convertFormDataForFirestoreTema(data, user.uid, initialData);
      await updateTema(temaId, dataForFirestore as TemaFormData, user.uid); // Cast if service expects more complete data
      toast({ title: "Éxito", description: "Tema actualizado correctamente." });
      router.push(volverAPath);
      return true;
    } catch (error) {
      console.error("Error updating tema:", error);
      toast({ title: "Error", description: "No se pudo actualizar el tema.", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Cargando datos del tema...
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
        <p className="text-xl text-muted-foreground mb-4">Tema no encontrado.</p>
        <Button onClick={() => router.push(volverAPath)} variant="outline">Ir al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <Edit className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Editar Tema</h1>
      </header>
      <p className="text-muted-foreground">
        Modifica la información del tema "{initialData.nombre}".
      </p>
      <TemaForm 
        onSubmit={handleSubmit} 
        initialData={initialData} 
        isSubmitting={isSubmitting} 
        volverAPath={volverAPath}
      />
    </div>
  );
}
