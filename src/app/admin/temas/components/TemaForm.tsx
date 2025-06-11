'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Database } from "@/lib/supabase/types/database.types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Tema = Database['public']['Tables']['temas']['Row'];

const temaFormSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  categoria_tema: z.enum([
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
  ], {
    required_error: "La categoría es requerida",
  }),
});

type TemaFormData = z.infer<typeof temaFormSchema>;

interface TemaFormProps {
  onSubmit: (data: TemaFormData) => Promise<void>;
  initialData?: Tema;
}

const categoriaLabels: Record<TemaFormData['categoria_tema'], string> = {
  agropecuario: "Agropecuario",
  tecnologico: "Tecnológico",
  social: "Social",
  ambiental: "Ambiental",
  educativo: "Educativo",
  produccion_animal: "Producción Animal",
  sanidad: "Sanidad",
  energia: "Energía",
  recursos_naturales: "Recursos Naturales",
  manejo_suelo: "Manejo de Suelo",
  gastronomia: "Gastronomía",
  otro: "Otro"
};

export function TemaForm({ onSubmit, initialData }: TemaFormProps) {
  const form = useForm<TemaFormData>({
    resolver: zodResolver(temaFormSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      descripcion: initialData?.descripcion || "",
      categoria_tema: initialData?.categoria_tema || undefined,
    },
  });

  const handleSubmit = async (data: TemaFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese una descripción (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoria_tema"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(categoriaLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit">
            {initialData ? "Guardar cambios" : "Crear tema"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 