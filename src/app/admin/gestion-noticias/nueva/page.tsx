"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { NoticiasService } from '@/lib/supabase/services/noticiasService';
import { supabase } from '@/lib/supabase/supabaseClient';
import NoticiaForm from '@/components/forms/NoticiaForm';
import type { NoticiaFormData } from '@/lib/schemas/noticiaSchema';

export default function NuevaNoticiaPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const noticiasService = new NoticiasService(supabase);

  const handleSubmit = async (data: NoticiaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para crear una noticia.", variant: "destructive" });
      return false;
    }

    setLoading(true);
    try {
      const result = await noticiasService.create(data, user.id);
      if (result.data) {
        toast({ title: "Éxito", description: "Noticia creada correctamente." });
        router.push('/admin/gestion-noticias');
        return true;
      } else {
        throw new Error(result.error?.message || "Error al crear la noticia");
      }
    } catch (error) {
      console.error("Error creating noticia:", error);
      toast({ title: "Error", description: "No se pudo crear la noticia.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Nueva Noticia</h1>
        <p className="text-muted-foreground">
          Crea una nueva noticia para el sitio.
        </p>
      </header>
      <NoticiaForm 
        onSubmit={handleSubmit} 
        isSubmitting={loading} 
        volverAPath="/admin/gestion-noticias"
      />
    </div>
  );
}
