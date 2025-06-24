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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { storageService } from "@/lib/supabase/services/storageService";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

// Esquema de validación con lógica condicional
const formSchema = z.object({
  tipo: z.enum(["articulo", "link"], {
    required_error: "Debes seleccionar un tipo.",
  }),
  titulo: z.string().min(5, "El título es demasiado corto."),
  subtitulo: z.string().optional(),
  contenido: z.string().optional(),
  url_externa: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Debe ser una URL válida",
      }
    ),
  fuente_externa: z.string().optional(),
  resumen_o_contexto_interno: z
    .string()
    .min(
      20,
      "El contexto para IA debe tener al menos 20 caracteres para ser útil."
    ),
  autor_noticia: z.string().optional(),
  fecha_publicacion: z.string().optional(),
  // ✅ NUEVOS CAMPOS
  imagen_url: z.string().optional(),
  es_destacada: z.boolean().default(false),
  esta_publicada: z.boolean().default(false),
});
interface NoticiaFormProps {
  initialData?: Noticia;
}

export function NoticiaForm({ initialData }: NoticiaFormProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingOgData, setFetchingOgData] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imagen_url || null
  );
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
      // ✅ NUEVOS VALORES POR DEFECTO
      imagen_url: initialData?.imagen_url || "",
      es_destacada: initialData?.es_destacada || false,
      esta_publicada: initialData?.esta_publicada || false,
    },
  });

  // En NoticiaForm.tsx - Reemplazar handleImageUpload
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen debe ser menor a 10MB",
        variant: "destructive",
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes: JPG, PNG, WebP, GIF",
        variant: "destructive",
      });
      return;
    }

    // Crear preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setSelectedFile(file);
      // Limpiar URL manual si había una
      form.setValue("imagen_url", "");
    };
    reader.readAsDataURL(file);
  };

  // En NoticiaForm.tsx - Reemplazar handleImageUpload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // ✅ Usar la nueva función
      const { uploadFileToAnyBucket } = await import(
        "@/lib/supabase/supabaseStorage"
      );

      const imageUrl = await uploadFileToAnyBucket(
        file,
        "noticias",
        "images", // carpeta dentro del bucket
        (progress) => console.log(`Upload progress: ${progress}%`)
      );

      form.setValue("imagen_url", imageUrl);
      setImagePreview(imageUrl);
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Auto-fetch de imagen desde URL
  const fetchOgData = async (url: string) => {
    setFetchingOgData(true);
    try {
      console.log("🔍 Fetching OG data for:", url);

      const response = await fetch(
        `/api/get-og-data?url=${encodeURIComponent(url)}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const { title, description, image, siteName } = result.data;

        // Auto-completar campos si están vacíos
        if (title && !form.getValues("titulo")) {
          form.setValue("titulo", title);
        }

        if (description && !form.getValues("resumen_o_contexto_interno")) {
          // Para videos de YouTube, crear un contexto más descriptivo
          const contextText =
            siteName === "YouTube"
              ? `Video de ${siteName}: ${title}. ${description}. Contenido educativo del canal de la escuela.`
              : `Artículo de ${
                  siteName || "sitio web"
                }: ${title}. ${description}`;

          form.setValue("resumen_o_contexto_interno", contextText);
        }

        if (image && !form.getValues("imagen_url")) {
          form.setValue("imagen_url", image);
          setImagePreview(image);
        }

        toast({
          title: "Datos obtenidos automáticamente",
          description: `Se han cargado datos desde ${
            siteName || "el sitio web"
          }`,
        });
      } else {
        toast({
          title: "No se pudieron obtener datos",
          description: "No se encontraron metadatos en el enlace",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching OG data:", error);
      toast({
        title: "Error",
        description: "No se pudieron obtener los datos del enlace",
        variant: "destructive",
      });
    } finally {
      setFetchingOgData(false);
    }
  };

  // Observamos el valor del tipo de contenido para mostrar/ocultar campos
  const tipoContenido = form.watch("tipo");

  // ✅ AGREGAR ESTOS LOGS DE DEBUG
  const formValues = form.watch();
  const formErrors = form.formState.errors;
  const isValid = form.formState.isValid;

  // ✅ Mostrar estado del formulario en tiempo real
  console.log("📋 Form state:", {
    tipo: tipoContenido,
    values: formValues,
    errors: formErrors,
    isValid: isValid,
    hasContent: !!formValues.contenido,
    contentLength: formValues.contenido?.length || 0,
    hasContexto: !!formValues.resumen_o_contexto_interno,
    contextoLength: formValues.resumen_o_contexto_interno?.length || 0,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      return toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
    }

    try {
      let finalImageUrl = values.imagen_url;

      // ✅ Si hay archivo seleccionado, subirlo ahora
      if (selectedFile) {
        toast({
          title: "Subiendo imagen...",
          description: "Por favor espera mientras se sube la imagen",
        });

        try {
          const { uploadFileToAnyBucket } = await import(
            "@/lib/supabase/supabaseStorage"
          );

          finalImageUrl = await uploadFileToAnyBucket(
            selectedFile,
            "noticias",
            "images"
          );

          console.log("✅ Image uploaded:", finalImageUrl);
        } catch (uploadError) {
          console.error("❌ Upload failed:", uploadError);
          toast({
            title: "Error subiendo imagen",
            description: "No se pudo subir la imagen. Intenta de nuevo.",
            variant: "destructive",
          });
          return; // No continuar si falla el upload
        }
      }

      console.log("🔥 Submitting noticia with final data:", {
        ...values,
        imagen_url: finalImageUrl,
      });

      if (initialData) {
        // EDITAR
        const updateData = {
          ...values,
          imagen_url: finalImageUrl,
          updated_by_uid: user.id,
          updated_at: new Date().toISOString(),
        };

        const result = await noticiasService.update(initialData.id, updateData);

        if (!result.success) {
          toast({
            title: "Error",
            description:
              result.error?.message || "Error al actualizar la noticia",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Éxito",
          description: "Noticia actualizada correctamente.",
        });
      } else {
        // CREAR
        const createData = {
          ...values,
          imagen_url: finalImageUrl,
          created_by_uid: user.id,
          created_at: new Date().toISOString(),
        };

        const result = await noticiasService.create(createData);

        if (!result.success) {
          toast({
            title: "Error",
            description: result.error?.message || "Error al crear la noticia",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Éxito",
          description: "Noticia creada correctamente.",
        });
      }

      // Redirigir solo si todo salió bien
      router.push("/admin/noticias");
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      toast({
        title: "Error",
        description: "Error inesperado al guardar la noticia.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      {/* 🚨 DEBUG BOX - TEMPORAL */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
        <h3 className="font-bold text-red-800">🔍 DEBUG - Eliminar después</h3>
        <div className="text-sm space-y-1">
          <p>
            <strong>Tipo:</strong> {formValues.tipo}
          </p>
          <p>
            <strong>Form válido:</strong>{" "}
            {form.formState.isValid ? "✅ SÍ" : "❌ NO"}
          </p>
          <p>
            <strong>Título:</strong> {formValues.titulo?.length || 0} chars
          </p>
          <p>
            <strong>Contenido:</strong> {formValues.contenido?.length || 0}{" "}
            chars
          </p>
          <p>
            <strong>Contexto IA:</strong>{" "}
            {formValues.resumen_o_contexto_interno?.length || 0} chars
          </p>

          {Object.keys(formErrors).length > 0 && (
            <div className="mt-2">
              <strong className="text-red-600">❌ ERRORES:</strong>
              <ul className="list-disc ml-4">
                {Object.entries(formErrors).map(([field, error]) => (
                  <li key={field} className="text-red-600">
                    <strong>{field}:</strong> {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            console.log("🎯 Form submit attempted");
            console.log("🔍 Final validation state:", form.formState.errors);
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-8"
        >
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
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="https://youtube.com/watch?v=..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Limpiar datos anteriores cuando cambia la URL
                            if (!e.target.value) {
                              setImagePreview(null);
                              form.setValue("imagen_url", "");
                            }
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!field.value || fetchingOgData}
                        onClick={() => field.value && fetchOgData(field.value)}
                      >
                        {fetchingOgData ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            Obteniendo...
                          </>
                        ) : (
                          <>🔍 Auto-completar</>
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      💡 <strong>Tip:</strong> Pega la URL y haz clic en
                      "Auto-completar" para obtener título, imagen y descripción
                      automáticamente
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campo fuente se auto-completa, pero se puede editar */}
              <FormField
                control={form.control}
                name="fuente_externa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuente (Ej: YouTube, Río Negro, INTA)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Se completa automáticamente"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {/* Campo de Imagen */}
          <FormField
            control={form.control}
            name="imagen_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen de la Noticia</FormLabel>
                <div className="space-y-3">
                  {/* Preview de imagen */}
                  {imagePreview && (
                    <div className="relative w-full max-w-md">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedFile(null);
                          form.setValue("imagen_url", "");
                        }}
                      >
                        ✕
                      </Button>
                      {selectedFile && (
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          📁 Se subirá al guardar
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input de archivo */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <div>
                          <div className="text-gray-600">
                            Haz clic para seleccionar una imagen
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            PNG, JPG, WebP, GIF hasta 10MB
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            💡 Se subirá cuando guardes la noticia
                          </div>
                        </div>
                      </div>
                    </Label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Input manual de URL (alternativo) */}
                  <div className="text-sm text-gray-600">
                    O ingresa una URL de imagen:
                  </div>
                  <FormControl>
                    <Input
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={field.value || ""}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                          setSelectedFile(null); // Limpiar archivo si pone URL
                        }
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estados de la Noticia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="esta_publicada"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Publicar Noticia</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      La noticia será visible para todos los usuarios
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="es_destacada"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Noticia Destacada</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Aparecerá en la sección de noticias destacadas
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="resumen_o_contexto_interno"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Resumen / Contexto Interno
                  <span className="text-red-500 ml-1">*</span>
                  <span className="text-blue-600 ml-1">🤖 IA</span>
                </FormLabel>
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>⚠️ Campo muy importante:</strong> La IA usará este
                    contenido para búsquedas y recomendaciones. Incluye palabras
                    clave, resumen del contenido, transcripciones o cualquier
                    información relevante que ayude a la IA a entender y
                    categorizar esta noticia.
                  </p>
                </div>
                <FormControl>
                  <Textarea
                    className="min-h-[120px]"
                    placeholder="Ejemplo: Artículo sobre nuevas técnicas de riego por goteo en zonas áridas. Incluye datos sobre ahorro de agua del 40%, testimonios de productores de Río Negro, y comparación con métodos tradicionales. Palabras clave: riego, sustentabilidad, agricultura, sequía..."
                    {...field}
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground mt-1">
                  💡 <strong>Tip:</strong> Para enlaces externos, agrega un
                  resumen del contenido ya que la IA no puede acceder
                  directamente a la URL.
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isValid}
            onClick={() => {
              console.log("🖱️ Submit button clicked");
              console.log("🔍 Button state:", {
                isSubmitting: form.formState.isSubmitting,
                isValid: form.formState.isValid,
                errors: form.formState.errors,
              });
            }}
          >
            {form.formState.isSubmitting ? "Guardando..." : "Guardar Noticia"}
          </Button>
        </form>
      </Form>
      );
    </>
  );
}
