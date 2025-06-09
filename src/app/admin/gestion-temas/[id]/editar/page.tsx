"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemasService, MappedTema } from "@/lib/supabase/services/temasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/lib/supabase/types/database.types";

const temasService = new TemasService(supabase);

const CATEGORIAS_TEMA = [
  { value: "agropecuario", label: "Agropecuario" },
  { value: "tecnologico", label: "Tecnológico" },
  { value: "social", label: "Social" },
  { value: "ambiental", label: "Ambiental" },
  { value: "educativo", label: "Educativo" },
  { value: "produccion_animal", label: "Producción Animal" },
  { value: "sanidad", label: "Sanidad" },
  { value: "energia", label: "Energía" },
  { value: "recursos_naturales", label: "Recursos Naturales" },
  { value: "manejo_suelo", label: "Manejo de Suelo" },
  { value: "gastronomia", label: "Gastronomía" },
  { value: "otro", label: "Otro" },
] as const;

export default function EditarTemaPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [tema, setTema] = useState<MappedTema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = params.id as string;

  useEffect(() => {
    const fetchTema = async () => {
      try {
        const result = await temasService.getByIdMapped(id);
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || "Tema no encontrado");
        }
        setTema(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el tema");
        toast({
          title: "Error",
          description: "No se pudo cargar el tema",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTema();
    }
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tema || !params.id || Array.isArray(params.id)) return;
    
    setIsLoading(true);

    try {
      const result = await temasService.update(params.id, {
        nombre: tema.nombre,
        descripcion: tema.descripcion,
        categoriaTema: tema.categoriaTema,
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Error al actualizar el tema");
      }

      toast({
        title: "Éxito",
        description: "Tema actualizado correctamente",
      });
      router.push("/admin/gestion-temas");
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el tema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (!tema) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-lg text-muted-foreground">Tema no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/admin/gestion-temas/${id}`)}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-2xl font-bold">Editar Tema</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={tema.nombre}
              onChange={(e) => setTema({ ...tema, nombre: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoriaTema">Categoría</Label>
            <Select
              value={tema.categoriaTema}
              onValueChange={(value) => setTema({
                ...tema,
                categoriaTema: value as Database['public']['Enums']['tema_categoria_enum']
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-white dark:bg-zinc-900  z-50">
                {CATEGORIAS_TEMA.map((categoria) => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={tema.descripcion || ""}
              onChange={(e) => setTema({ ...tema, descripcion: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/gestion-temas/${id}`)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
} 