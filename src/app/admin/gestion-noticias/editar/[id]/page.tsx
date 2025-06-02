
"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NoticiaForm from '@/components/forms/NoticiaForm';
import type { NoticiaFormData } from '@/lib/schemas/noticiaSchema';
import { getNoticiaById, updateNoticia } from '@/lib/supabase/noticiasService';
import { convertSupabaseDataToFormNoticia } from "@/lib/schemas/noticiaSchema";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Noticia } from '@/lib/types';
import { Edit, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditarNoticiaPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function EditarNoticiaPage({ params: paramsProp }: EditarNoticiaPageProps) {
  const resolvedParams = use(paramsProp as Promise<{ id: string }>);
  const { id: noticiaId } = resolvedParams;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<NoticiaFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const volverAPath = searchParams.get('volverA') || '/admin/gestion-noticias';

  useEffect(() => {
    const fetchNoticia = async () => {
      if (!noticiaId) return;
      setLoading(true);
      try {
        const noticia = await getNoticiaById(noticiaId);
        if (noticia) {
          setInitialData(convertSupabaseDataToFormNoticia(noticia));
        } else {
          setError("Noticia no encontrada.");
          toast({ title: "Error", description: "Noticia no encontrada.", variant: "destructive" });
          router.push(volverAPath); 
        }
      } catch (err) {
        console.error("Error fetching noticia for editing:", err);
        setError("No se pudo cargar la noticia para editar.");
        toast({ title: "Error", description: "No se pudo cargar la noticia.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchNoticia();
  }, [noticiaId, router, toast, volverAPath]);

  const handleSubmit = async (data: NoticiaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado.", variant: "destructive" });
      return false;
    }
    if (!noticiaId) {
      toast({ title: "Error", description: "No se pudo identificar la noticia a editar.", variant: "destructive" });
      return false;
    }

    setIsSubmitting(true);
    try {
      await updateNoticia(noticiaId, data, user.id);
      toast({ title: "Éxito", description: "Noticia actualizada correctamente." });
      router.push(volverAPath);
      return true;
    } catch (error) {
      console.error("Error updating noticia:", error);
      toast({ title: "Error", description: "No se pudo actualizar la noticia.", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Cargando datos de la noticia...
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
        <p className="text-xl text-muted-foreground mb-4">Noticia no encontrada.</p>
        <Button onClick={() => router.push(volverAPath)} variant="outline">Ir al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <Edit className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Editar Noticia</h1>
      </header>
      <p className="text-muted-foreground">
        Modifica la información de la noticia "{initialData.titulo}".
      </p>
      <NoticiaForm 
        onSubmit={handleSubmit} 
        initialData={initialData} 
        isSubmitting={isSubmitting} 
        volverAPath={volverAPath}
      />
    </div>
  );
}
