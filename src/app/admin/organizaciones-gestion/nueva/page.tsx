"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OrganizacionesService } from '@/lib/supabase/services/organizacionesService';
import { supabase } from '@/lib/supabase/supabaseClient';
import OrganizacionForm from '@/components/forms/OrganizacionForm';
import type { OrganizacionFormData } from '@/lib/schemas/organizacionSchema';

export default function NuevaOrganizacionPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const organizacionesService = new OrganizacionesService(supabase);

  const handleSubmit = async (data: OrganizacionFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión para crear una organización.", variant: "destructive" });
      return false;
    }

    setLoading(true);
    try {
      const result = await organizacionesService.create(data, user.id);
      if (result.data) {
        toast({ title: "Éxito", description: "Organización creada correctamente." });
        router.push('/admin/organizaciones-gestion');
        return true;
      } else {
        throw new Error(result.error?.message || "Error al crear la organización");
      }
    } catch (error) {
      console.error("Error creating organizacion:", error);
      toast({ title: "Error", description: "No se pudo crear la organización.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Nueva Organización</h1>
        <p className="text-muted-foreground">
          Crea una nueva organización para el sitio.
        </p>
      </header>
      <OrganizacionForm 
        onSubmit={handleSubmit} 
        isSubmitting={loading} 
        volverAPath="/admin/organizaciones-gestion"
      />
    </div>
  );
}
