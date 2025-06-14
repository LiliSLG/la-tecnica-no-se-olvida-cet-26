"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnalisisSatelitalForm } from "./AnalisisSatelitalForm";
import { useToast } from "@/components/ui/use-toast";
import { analisisSatelitalesService } from "@/lib/supabase/services/analisisSatelitalesService";
import { useAuth } from "@/providers/AuthProvider";
import { Database } from "@/lib/supabase/types/database.types";

type Proyecto = Database["public"]["Tables"]["proyectos"]["Row"];

interface Props {
  proyecto: Proyecto;
}

export function ProyectoDetailPage({ proyecto }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Loading guard for authentication state
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando datos de usuario...</p>
      </div>
    );
  }

  // Data guard for proyecto prop
  if (!proyecto) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        <p>Error: No se encontraron los datos del proyecto.</p>
      </div>
    );
  }

  // User guard for authentication
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        <p>Error: Usuario no autenticado.</p>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    try {
      const parsedData = {
        ...data,
        datos_tabla: JSON.parse(data.datos_tabla),
        proyecto_id: proyecto.id,
        created_by_uid: user.id,
      };

      await analisisSatelitalesService.create(parsedData);

      toast({
        title: "Análisis creado",
        description: "El análisis satelital se ha creado correctamente.",
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating analysis:", error);
      toast({
        title: "Error",
        description:
          "Hubo un error al crear el análisis. Por favor, verifica los datos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{proyecto.titulo}</h1>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Análisis Satelitales</h2>
          <Button onClick={() => setIsDialogOpen(true)}>Añadir Análisis</Button>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
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
  );
}
