"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Tema } from '@/lib/types';
import { TemasService } from '@/lib/supabase/services/temasService';
import { supabase } from '@/lib/supabase/supabaseClient';
import TemaForm from '@/components/forms/TemaForm';
import type { TemaFormData } from '@/lib/schemas/temaSchema';

interface EditTemaPageProps {
  params: {
    id: string;
  };
}

export default function EditTemaPage({ params }: EditTemaPageProps) {
  const [tema, setTema] = useState<Tema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const temasService = new TemasService(supabase);

  useEffect(() => {
    const fetchTema = async () => {
      if (!params.id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await temasService.getById(params.id);
        if (result.data) {
          setTema(result.data);
        } else {
          setError("Tema no encontrado.");
          toast({ title: "Error", description: "Tema no encontrado.", variant: "destructive" });
          router.push('/admin/gestion-temas'); 
        }
      } catch (err) {
        console.error("Error fetching tema:", err);
        setError("No se pudo cargar el tema.");
        toast({ title: "Error", description: "No se pudo cargar el tema.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchTema();
  }, [params.id, router, toast]);

  const handleSubmit = async (data: TemaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para editar un tema.", variant: "destructive" });
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await temasService.update(params.id, data, user.id);
      if (result.data) {
        toast({ title: "Éxito", description: "Tema actualizado correctamente." });
        router.push('/admin/gestion-temas');
        return true;
      } else {
        throw new Error(result.error?.message || "Error al actualizar el tema");
      }
    } catch (error) {
      console.error("Error updating tema:", error);
      setError("No se pudo actualizar el tema.");
      toast({ title: "Error", description: "No se pudo actualizar el tema.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Cargando tema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-4">{error}</p>
        <Button onClick={() => router.push('/admin/gestion-temas')} variant="outline">Volver al listado</Button>
      </div>
    );
  }

  if (!tema) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Tema no encontrado.</p>
        <Button onClick={() => router.push('/admin/gestion-temas')} variant="outline">Ir al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Editar Tema</h1>
        <p className="text-muted-foreground">
          Modifica la información de "{tema.nombre}".
        </p>
      </header>
      <TemaForm 
        onSubmit={handleSubmit} 
        initialData={tema} 
        isSubmitting={loading} 
        volverAPath="/admin/gestion-temas"
      />
    </div>
  );
}
