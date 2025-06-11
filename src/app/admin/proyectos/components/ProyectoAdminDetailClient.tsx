'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AnalisisSatelitalForm } from './AnalisisSatelitalForm';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { analisisSatelitalesService } from '@/lib/supabase/services/analisisSatelitalesService';
import { useAuth } from '@/providers/AuthProvider';

interface ProyectoAdminDetailClientProps {
  proyecto: {
    id: string;
    titulo: string;
  };
}

export function ProyectoAdminDetailClient({ proyecto }: ProyectoAdminDetailClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (data: {
    titulo: string;
    resumen: string;
    imagen_grafico_url: string;
    datos_tabla: string;
  }) => {
    try {
      const parsedData = {
        ...data,
        proyecto_id: proyecto.id,
        creado_por_uid: user?.id,
        tipo_analisis: 'NDVI', // Default for now
        datos_tabla: JSON.parse(data.datos_tabla),
        parametros_gee: {} // Empty for now
      };

      const { error } = await analisisSatelitalesService.create(parsedData);

      if (error) throw error;

      toast({
        title: 'Análisis creado',
        description: 'El análisis satelital se ha creado correctamente.',
      });

      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un error al crear el análisis satelital.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">{proyecto.titulo}</h1>

      <div className="space-y-6">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Análisis Satelitales</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Añadir Nuevo Análisis</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Nuevo Análisis Satelital</DialogTitle>
                </DialogHeader>
                <AnalisisSatelitalForm
                  onSubmit={handleSubmit}
                  projectId={proyecto.id}
                />
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </div>
    </div>
  );
} 