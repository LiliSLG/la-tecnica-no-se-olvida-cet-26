"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrganizacionForm from '@/components/forms/OrganizacionForm';
import type { OrganizacionFormData } from '@/lib/schemas/organizacionSchema';
import { getOrganizacionById, updateOrganizacion } from '@/lib/supabase/services/organizacionesService';
import { convertFormDataToSupabaseOrganizacion } from "@/lib/schemas/organizacionSchema";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Organizacion } from '@/lib/types';
import { Edit, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Added missing import

interface EditarOrganizacionPageProps {
  params: Promise<{ id: string }> | { id: string }; // Updated to reflect params can be a Promise
}

export default function EditarOrganizacionPage({ params: paramsProp }: EditarOrganizacionPageProps) {
  const resolvedParams = use(paramsProp as Promise<{ id: string }>); // Use React.use and assert type if it's a promise
  const { id: organizacionId } = resolvedParams;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<Organizacion> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizacion = async () => {
      if (!organizacionId) return;
      setLoading(true);
      try {
        const organizacion = await getOrganizacionById(organizacionId);
        if (organizacion) {
          setInitialData(organizacion);
        } else {
          setError("Organización no encontrada.");
          toast({ title: "Error", description: "Organización no encontrada.", variant: "destructive" });
          router.push('/admin/organizaciones-gestion'); 
        }
      } catch (err) {
        console.error("Error fetching organizacion for editing:", err);
        setError("No se pudo cargar la organización para editar.");
        toast({ title: "Error", description: "No se pudo cargar la organización.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizacion();
  }, [organizacionId, router, toast]);

  const handleSubmit = async (data: OrganizacionFormData) => {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado como administrador.", variant: "destructive" });
      return;
    }
    if (!initialData || !initialData.id) {
      toast({ title: "Error", description: "No se pudo identificar la organización a editar.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const dataForSupabase = convertFormDataToSupabaseOrganizacion(
        data,
        user.id)
      await updateOrganizacion(initialData.id, dataForSupabase, user.id);
      toast({ title: "Éxito", description: "Organización actualizada correctamente." });
      
      const volverAPath = searchParams.get('volverA');
      if (volverAPath) {
        router.push(volverAPath);
      } else {
        router.push('/admin/organizaciones-gestion'); 
      }
    } catch (error) {
      console.error("Error updating organizacion:", error);
      toast({ title: "Error", description: "No se pudo actualizar la organización.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Cargando datos de la organización...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">Volver</Button>
      </div>
    );
  }
  
  if (!initialData) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Organización no encontrada.</p>
        <Button onClick={() => router.push('/admin/organizaciones-gestion')} variant="outline">Ir al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <Edit className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Editar Organización</h1>
      </header>
      <p className="text-muted-foreground">
        Modifica la información de la organización "{initialData.nombreOficial}".
      </p>
      <OrganizacionForm onSubmit={handleSubmit} initialData={initialData} isSubmitting={isSubmitting} />
    </div>
  );
}
