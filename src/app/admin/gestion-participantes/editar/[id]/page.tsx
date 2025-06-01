
"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PersonaForm from '@/components/forms/PersonaForm';
import type { PersonaFormData } from '@/lib/schemas/personaSchema';
import { getPersonaById, updatePersona } from '@/lib/firebase/personasService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Persona } from '@/lib/types';
import { Edit, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { convertFirestoreDataToFormPersona, convertFormDataForFirestorePersona } from '@/lib/schemas/personaSchema';

interface EditarPersonaPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function EditarPersonaPage({ params: paramsProp }: EditarPersonaPageProps) {
  const resolvedParams = use(paramsProp as Promise<{ id: string }>);
  const { id: personaId } = resolvedParams;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<PersonaFormData | undefined>(undefined);
  const [originalPersona, setOriginalPersona] = useState<Persona | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const volverAPath = searchParams.get('volverA') || '/admin/gestion-participantes';


  useEffect(() => {
    const fetchPersona = async () => {
      if (!personaId) return;
      setLoading(true);
      try {
        const persona = await getPersonaById(personaId);
        if (persona) {
          setOriginalPersona(persona); // Store the original Firestore data
          setInitialData(convertFirestoreDataToFormPersona(persona));
        } else {
          setError("Participante no encontrado.");
          toast({ title: "Error", description: "Participante no encontrado.", variant: "destructive" });
          router.push(volverAPath); 
        }
      } catch (err) {
        console.error("Error fetching persona for editing:", err);
        setError("No se pudo cargar el participante para editar.");
        toast({ title: "Error", description: "No se pudo cargar el participante.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPersona();
  }, [personaId, router, toast, volverAPath]);

  const handleSubmit = async (data: PersonaFormData) => {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado como administrador.", variant: "destructive" });
      return false;
    }
    if (!originalPersona || !originalPersona.id) {
      toast({ title: "Error", description: "No se pudo identificar el participante a editar.", variant: "destructive" });
      return false;
    }

    setIsSubmitting(true);
    try {
      // Pass originalPersona to preserve project-related capacities
      const dataForFirestore = convertFormDataForFirestorePersona(data, user.uid, originalPersona); 
      
      await updatePersona(originalPersona.id, dataForFirestore, user.uid);
      toast({ title: "Éxito", description: "Participante actualizado correctamente." });
      
      router.push(volverAPath);
      return true;
    } catch (error) {
      console.error("Error updating persona:", error);
      toast({ title: "Error", description: "No se pudo actualizar el participante.", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Cargando datos del participante...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-4">{error}</p>
        <Button onClick={() => router.push(volverAPath)} variant="outline">Volver</Button>
      </div>
    );
  }
  
  if (!initialData) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Participante no encontrado.</p>
        <Button onClick={() => router.push(volverAPath)} variant="outline">Ir al listado</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <Edit className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Editar Participante</h1>
      </header>
      <p className="text-muted-foreground">
        Modifica la información de {initialData.nombre} {initialData.apellido}.
      </p>
      <PersonaForm 
        onSubmit={handleSubmit} 
        initialData={initialData} 
        isSubmitting={isSubmitting} 
        volverAPath={volverAPath}
      />
    </div>
  );
}
