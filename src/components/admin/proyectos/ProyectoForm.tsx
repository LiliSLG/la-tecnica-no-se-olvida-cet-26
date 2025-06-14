// /src/components/admin/proyectos/ProyectoForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { useRouter } from "next/navigation";
import { proyectosService } from "@/lib/supabase/services/proyectosService";
import { useAuth } from "@/providers/AuthProvider";
import { Database } from "@/lib/supabase/types/database.types";
import { useEffect } from "react";

// Definimos los tipos que usará nuestro formulario
type Proyecto = Database["public"]["Tables"]["proyectos"]["Row"];
type CreateProyecto = Database["public"]["Tables"]["proyectos"]["Insert"];
type UpdateProyecto = Database["public"]["Tables"]["proyectos"]["Update"];

// Definimos el esquema de validación con Zod
const formSchema = z.object({
  titulo: z
    .string()
    .min(5, { message: "El título debe tener al menos 5 caracteres." }),
  descripcion_general: z.string().optional(),
  ano_proyecto: z.coerce
    .number()
    .int("El año debe ser un número entero.")
    .min(1980, { message: "El año no parece válido." })
    .max(new Date().getFullYear() + 1, {
      message: "El año no puede ser tan a futuro.",
    }),
  estado_actual: z.enum(
    [
      "idea",
      "en_desarrollo",
      "finalizado",
      "presentado",
      "archivado",
      "cancelado",
    ],
    {
      required_error: "Debes seleccionar un estado.",
    }
  ),
});

// Definimos las props que recibirá nuestro componente
interface ProyectoFormProps {
  initialData?: Proyecto;
}

export function ProyectoForm({ initialData }: ProyectoFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  // 1. Definimos el formulario con react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: initialData?.titulo || "",
      descripcion_general: initialData?.descripcion_general || "",
      ano_proyecto: initialData?.ano_proyecto || new Date().getFullYear(),
      estado_actual: initialData?.estado_actual || "idea",
    },
  });

  // Esto es útil si los datos iniciales tardan en llegar, para resetear el form
  useEffect(() => {
    if (initialData) {
      form.reset({
        titulo: initialData.titulo || "",
        descripcion_general: initialData.descripcion_general || "",
        ano_proyecto: initialData.ano_proyecto || new Date().getFullYear(),
        estado_actual: initialData.estado_actual || "idea",
      });
    }
  }, [initialData, form]);

  // 2. Definimos la función que se ejecuta al enviar el formulario
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para realizar esta acción.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (initialData) {
        // Estamos en modo EDICIÓN
        const dataToUpdate: UpdateProyecto = {
          ...values,
          updated_by_uid: user.id,
        };
        await proyectosService.update(initialData.id, dataToUpdate);
        toast({
          title: "Éxito",
          description: "Proyecto actualizado correctamente.",
        });
      } else {
        // Estamos en modo CREACIÓN
        const dataToCreate: CreateProyecto = {
          ...values,
          created_by_uid: user.id,
        };
        await proyectosService.create(dataToCreate);
        toast({
          title: "Éxito",
          description: "Proyecto creado correctamente.",
        });
      }

      // Redirigimos a la lista de proyectos y refrescamos los datos del servidor
      router.push("/admin/proyectos");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      toast({
        title: "Error en el servidor",
        description: "No se pudo guardar el proyecto. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Proyecto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Invernadero Automatizado con Arduino"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion_general"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción General</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe brevemente el objetivo y alcance del proyecto."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="ano_proyecto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año de Realización</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estado_actual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado del Proyecto</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="en_desarrollo">En Desarrollo</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="presentado">Presentado</SelectItem>
                    <SelectItem value="archivado">Archivado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Guardando..."
            : initialData
            ? "Guardar Cambios"
            : "Crear Proyecto"}
        </Button>
      </form>
    </Form>
  );
}
