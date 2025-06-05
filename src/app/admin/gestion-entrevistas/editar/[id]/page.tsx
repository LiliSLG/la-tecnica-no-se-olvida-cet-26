"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Entrevista } from '@/lib/types';
import { HistoriasOralesService } from '@/lib/supabase/services/historiasOralesService';
import { supabase } from '@/lib/supabase/supabaseClient';
import EntrevistaForm from '@/components/forms/EntrevistaForm';
import type { EntrevistaFormData } from '@/lib/schemas/entrevistaSchema';

interface EditEntrevistaPageProps {
  params: {
    id: string;
  };
}

export default function EditEntrevistaPage({ params }: EditEntrevistaPageProps) {
  const [entrevista, setEntrevista] = useState<Entrevista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const historiasOralesService = new HistoriasOralesService(supabase);

  useEffect(() => {
    const fetchEntrevista = async () => {
      if (!params.id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await historiasOralesService.getById(params.id);
        if (result.data) {
          setEntrevista(result.data);
        } else {
          setError("Entrevista no encontrada.");
          toast({ title: "Error", description: "Entrevista no encontrada.", variant: "destructive" });
          router.push('/admin/gestion-entrevistas'); 
        }
      } catch (err) {
        console.error("Error fetching entrevista:", err);
        setError("No se pudo cargar la entrevista.");
        toast({ title: "Error", description: "No se pudo cargar la entrevista.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchEntrevista();
  }, [params.id, router, toast]);

  const handleSubmit = async (data: EntrevistaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para editar una entrevista.", variant: "destructive" });
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await historiasOralesService.update(params.id, data, user.id);
      if (result.data) {
        toast({ title: "Éxito", description: "Entrevista actualizada correctamente." });
        router.push('/admin/gestion-entrevistas');
        return true;
      } else {
        throw new Error(result.error?.message || "Error al actualizar la entrevista");
      }
    } catch (error) {
      console.error("Error updating entrevista:", error);
      setError("No se pudo actualizar la entrevista.");
      toast({ title: "Error", description: "No se pudo actualizar la entrevista.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Cargando entrevista...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-4">{error}</p>
        <Button onClick={() => router.push('/admin/gestion-entrevistas')} variant="outline">Volver al listado</Button>
      </div>
    );
  }

  if (!entrevista) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Entrevista no encontrada.</p>
        <Button onClick={() => router.push('/admin/gestion-entrevistas')} variant="outline">Ir al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Editar Entrevista</h1>
        <p className="text-muted-foreground">
          Modifica la información de "{entrevista.tituloSaber}".
        </p>
      </header>
      <EntrevistaForm 
        onSubmit={handleSubmit} 
        initialData={entrevista} 
        isSubmitting={loading} 
        volverAPath="/admin/gestion-entrevistas"
      />
    </div>
  );
}