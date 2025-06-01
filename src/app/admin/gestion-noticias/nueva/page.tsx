
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NoticiaForm from '@/components/forms/NoticiaForm';
import type { NoticiaFormData } from '@/lib/schemas/noticiaSchema';
import { addNoticia } from '@/lib/firebase/noticiasService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

export default function NuevaNoticiaPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: NoticiaFormData): Promise<boolean> => {
    if (!user) {
      toast({ title: "Error de Autenticación", description: "Debes estar autenticado.", variant: "destructive" });
      return false;
    }
    setIsSubmitting(true);
    try {
      await addNoticia(data, user.uid);
      toast({ title: "Éxito", description: "Noticia creada correctamente." });
      router.push('/admin/gestion-noticias'); 
      return true;
    } catch (error) {
      console.error("Error creating noticia:", error);
      toast({ title: "Error", description: "No se pudo crear la noticia.", variant: "destructive" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-10">
      <header className="flex items-center gap-3">
        <PlusCircle className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Crear Nueva Noticia</h1>
      </header>
      <p className="text-muted-foreground">
        Completa la información a continuación para registrar una nueva noticia o artículo.
      </p>
      <NoticiaForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        volverAPath="/admin/gestion-noticias"
      />
    </div>
  );
}
