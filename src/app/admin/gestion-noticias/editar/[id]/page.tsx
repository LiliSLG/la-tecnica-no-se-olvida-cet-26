"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Noticia } from '@/lib/types';
import { NoticiasService } from '@/lib/supabase/services/noticiasService';
import { supabase } from '@/lib/supabase/supabaseClient';
import NoticiaForm from '@/components/forms/NoticiaForm';
import type { NoticiaFormData } from '@/lib/schemas/noticiaSchema';

interface EditNoticiaPageProps {
  params: {
    id: string;
  };
}

export default function EditNoticiaPage({ params }: EditNoticiaPageProps) {
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const noticiasService = new NoticiasService(supabase);

  useEffect(() => {
    const fetchNoticia = async () => {
      if (!params.id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await noticiasService.getById(params.id);
        if (result.data) {
          setNoticia(result.data);
        } else {
          setError("Noticia no encontrada.");
          toast({ title: "Error", description: "Noticia no encontrada.", variant: "destructive" });
          router.push('/admin/gestion-noticias'); 
        }
      } catch (err) {
        console.error("Error fetching noticia:", err);
        setError("No se pudo cargar la noticia.");
        toast({ title: "Error", description: "No se pudo cargar la noticia.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchNoticia();
  }, [params.id, router, toast]);

  const handleSubmit = async (data: NoticiaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para editar una noticia.", variant: "destructive" });
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await noticiasService.update(params.id, data, user.id);
      if (result.data) {
        toast({ title: "Éxito", description: "Noticia actualizada correctamente." });
        router.push('/admin/gestion-noticias');
        return true;
      } else {
        throw new Error(result.error?.message || "Error al actualizar la noticia");
      }
    } catch (error) {
      console.error("Error updating noticia:", error);
      setError("No se pudo actualizar la noticia.");
      toast({ title: "Error", description: "No se pudo actualizar la noticia.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Cargando noticia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-4">{error}</p>
        <Button onClick={() => router.push('/admin/gestion-noticias')} variant="outline">Volver al listado</Button>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Noticia no encontrada.</p>
        <Button onClick={() => router.push('/admin/gestion-noticias')} variant="outline">Ir al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Editar Noticia</h1>
        <p className="text-muted-foreground">
          Modifica la información de "{noticia.titulo}".
        </p>
      </header>
      <NoticiaForm 
        onSubmit={handleSubmit} 
        initialData={noticia} 
        isSubmitting={loading} 
        volverAPath="/admin/gestion-noticias"
      />
    </div>
  );
}
