"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { TemasService } from "@/lib/supabase/services/temasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import { temaSchema } from "@/lib/schemas/temaSchema";
import type { Database } from "@/lib/supabase/types/database.types";

type Tema = Database['public']['Tables']['temas']['Row'];

// Only use the fields needed for Insert
const temaInsertSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().nullable().optional(),
  categoriaTema: z.enum([
    "agropecuario",
    "tecnologico",
    "social",
    "ambiental",
    "educativo",
    "produccion_animal",
    "sanidad",
    "energia",
    "recursos_naturales",
    "manejo_suelo",
    "gastronomia",
    "otro"
  ] as const, {
    required_error: "La categoría es requerida",
  }),
  esta_eliminado: z.boolean().optional(),
  eliminado_por_uid: z.string().nullable().optional(),
  eliminado_en: z.string().nullable().optional(),
});

type CreateTema = z.infer<typeof temaInsertSchema>;

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

export default function NuevoTemaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateTema>({
    resolver: zodResolver(temaInsertSchema),
    defaultValues: {
      nombre: "",
      descripcion: null,
      categoriaTema: undefined,
      esta_eliminado: false,
      eliminado_por_uid: null,
      eliminado_en: null,
    },
  });

  const onSubmit = async (data: CreateTema) => {
    setIsSubmitting(true);
    try {
      const result = await temasService.create(data);
      if (!result.success) {
        throw new Error(result.error?.message || "Error al crear el tema");
      }
      toast({
        title: "Éxito",
        description: "Tema creado correctamente",
      });
      router.push("/admin/gestion-temas");
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo crear el tema",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/gestion-temas")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Tema</h1>
      </div>

      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el nombre del tema" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoriaTema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIAS_TEMA.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ingrese la descripción del tema"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/gestion-temas")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear Tema
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
} 