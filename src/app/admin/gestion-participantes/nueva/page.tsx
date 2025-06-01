
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PersonaForm from '@/components/forms/PersonaForm';
import type { PersonaFormData } from '@/lib/schemas/personaSchema';
import { addPersona } from '@/lib/firebase/personasService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { convertFormDataForFirestorePersona } from '@/lib/schemas/personaSchema';

export default function NuevaPersonaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: PersonaFormData) => {
    console.log("Data received in NuevaPersonaPage handleSubmit:", JSON.stringify(data, null, 2));
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado como administrador.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Ensure `esAdmin` is explicitly set based on capacities or a direct form field
      // This logic is now primarily handled by convertFormDataForFirestorePersona
      const dataForFirestore = convertFormDataForFirestorePersona(data, user.uid);
      
      const personaId = await addPersona(dataForFirestore, user.uid);
      toast({ title: "Éxito", description: "Participante creado correctamente." });
      router.push('/admin/gestion-participantes'); 
    } catch (error) {
      console.error("Error creating persona:", error);
      toast({ title: "Error", description: "No se pudo crear el participante.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <PlusCircle className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Añadir Nuevo Participante</h1>
      </header>
      <p className="text-muted-foreground">
        Completa la información a continuación para registrar un nuevo participante.
      </p>
      <PersonaForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}

    