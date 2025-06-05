"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TemasService } from '@/lib/supabase/services/temasService';
import { supabase } from '@/lib/supabase/supabaseClient';
import TemaForm from '@/components/forms/TemaForm';
import type { TemaFormData } from '@/lib/schemas/temaSchema';

export default function NuevaTemaPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const temasService = new TemasService(supabase);

  const handleSubmit = async (data: TemaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para crear un tema.", variant: "destructive" });
      return false;
    }

    setLoading(true);
    try {
      const result = await temasService.create(data, user.id);
      if (result.data) {
        toast({ title: "Éxito", description: "Tema creado correctamente." });
        router.push('/admin/gestion-temas');
        return true;
      } else {
        throw new Error(result.error?.message || "Error al crear el tema");
      }
    } catch (error) {
      console.error("Error creating tema:", error);
      toast({ title: "Error", description: "No se pudo crear el tema.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Nuevo Tema</h1>
        <p className="text-muted-foreground">
          Crea un nuevo tema para el sitio.
        </p>
      </header>
      <TemaForm 
        onSubmit={handleSubmit} 
        isSubmitting={loading} 
        volverAPath="/admin/gestion-temas"
      />
    </div>
  );
}
