"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { HistoriasOralesService } from '@/lib/supabase/services/historiasOralesService';
import { supabase } from '@/lib/supabase/supabaseClient';
import EntrevistaForm from '@/components/forms/EntrevistaForm';
import type { EntrevistaFormData } from '@/lib/schemas/entrevistaSchema';

export default function NuevaEntrevistaPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const historiasOralesService = new HistoriasOralesService(supabase);

  const handleSubmit = async (data: EntrevistaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para crear una entrevista.", variant: "destructive" });
      return false;
    }

    setLoading(true);
    try {
      const result = await historiasOralesService.create(data, user.id);
      if (result.data) {
        toast({ title: "Éxito", description: "Entrevista creada correctamente." });
        router.push('/admin/gestion-entrevistas');
        return true;
      } else {
        throw new Error(result.error?.message || "Error al crear la entrevista");
      }
    } catch (error) {
      console.error("Error creating entrevista:", error);
      toast({ title: "Error", description: "No se pudo crear la entrevista.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Nueva Entrevista</h1>
        <p className="text-muted-foreground">
          Crea una nueva entrevista para el sitio.
        </p>
      </header>
      <EntrevistaForm 
        onSubmit={handleSubmit} 
        isSubmitting={loading} 
        volverAPath="/admin/gestion-entrevistas"
      />
    </div>
  );
}

    
