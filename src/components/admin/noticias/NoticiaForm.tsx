// /src/components/admin/noticias/NoticiaForm.tsx
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { useAuth } from "@/providers/AuthProvider";
import { Database } from "@/lib/supabase/types/database.types";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

// Esquema de validación con lógica condicional
const formSchema = z
  .object({
    tipo: z.enum(["articulo", "link"], {
      required_error: "Debes seleccionar un tipo.",
    }),
    titulo: z.string().min(5, "El título es demasiado corto."),
    subtitulo: z.string().optional(),
    contenido: z.string().optional(),
    url_externa: z.string().url("Debe ser una URL válida.").optional(),
    fuente_externa: z.string().optional(),
    resumen_o_contexto_interno: z.string().optional(),
    // Añadimos más campos que podrían ser comunes
    autor_noticia: z.string().optional(),
    fecha_publicacion: z.string().optional(), // Podríamos usar un DatePicker aquí en el futuro
  })
  .refine(
    (data) => {
      // Si es un artículo propio, el contenido es obligatorio
      if (data.tipo === "articulo") {
        return !!data.contenido;
      }
      return true;
    },
    {
      message: "El contenido es obligatorio para los artículos propios.",
      path: ["contenido"],
    }
  )
  .refine(
    (data) => {
      // Si es un enlace externo, la URL es obligatoria
      if (data.tipo === "link") {
        return !!data.url_externa;
      }
      return true;
    },
    {
      message: "La URL externa es obligatoria para los enlaces.",
      path: ["url_externa"],
    }
  );

interface NoticiaFormProps {
  initialData?: Noticia;
}

export function NoticiaForm({ initialData }: NoticiaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: initialData?.tipo || "articulo",
      titulo: initialData?.titulo || "",
      subtitulo: initialData?.subtitulo || "",
      contenido: initialData?.contenido || "",
      url_externa: initialData?.url_externa || "",
      fuente_externa: initialData?.fuente_externa || "",
      resumen_o_contexto_interno: initialData?.resumen_o_contexto_interno || "",
      autor_noticia: initialData?.autor_noticia || "",
      fecha_publicacion:
        initialData?.fecha_publicacion ||
        new Date().toISOString().split("T")[0],
    },
  });

  // Observamos el valor del tipo de contenido para mostrar/ocultar campos
  const tipoContenido = form.watch("tipo");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user)
      return toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });

    try {
      if (initialData) {
        await noticiasService.update(initialData.id, {
          ...values,
          updated_by_uid: user.id,
        });
        toast({ title: "Éxito", description: "Noticia actualizada." });
      } else {
        await noticiasService.create({ ...values, created_by_uid: user.id });
        toast({ title: "Éxito", description: "Noticia creada." });
      }
      router.push("/admin/noticias");
      router.refresh();
    } catch (error) {
      console.error("Error guardando la noticia:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la noticia.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Contenido</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="articulo" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Artículo Propio
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="link" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Enlace Externo
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos Condicionales para ARTÍCULO PROPIO */}
        {tipoContenido === "articulo" && (
          <>
            <FormField
              control={form.control}
              name="subtitulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contenido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido del Artículo</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[200px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Campos Condicionales para ENLACE EXTERNO */}
        {tipoContenido === "link" && (
          <>
            <FormField
              control={form.control}
              name="url_externa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Noticia</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fuente_externa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuente (Ej: Río Negro, INTA)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
          control={form.control}
          name="resumen_o_contexto_interno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resumen / Contexto (para la IA)</FormLabel>
              <FormControl>
                <Textarea className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Guardando..." : "Guardar Noticia"}
        </Button>
      </form>
    </Form>
  );
}
