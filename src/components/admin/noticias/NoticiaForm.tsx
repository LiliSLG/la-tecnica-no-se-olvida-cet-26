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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { temasService } from "@/lib/supabase/services/temasService";
import { noticiaTemasService } from "@/lib/supabase/services/noticiaTemasService";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];
type Tema = Database["public"]["Tables"]["temas"]["Row"];

interface NoticiaFormProps {
  initialData?: Noticia;
  initialTemas?: string[]; // IDs de temas iniciales
}
// ✅ CORREGIDO: Esquema con valores correctos del enum de BD
const formSchema = z.object({
  tipo: z.enum(["articulo_propio", "enlace_externo"], {
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
  imagen_url: z.string().optional(),
  es_destacada: z.boolean().default(false),
  esta_publicada: z.boolean().default(false),
});

export function NoticiaForm({ initialData, initialTemas }: NoticiaFormProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetchingOgData, setFetchingOgData] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imagen_url || null
  );

  // ✅ NUEVO: Estado para manejar temas
  const [availableTemas, setAvailableTemas] = useState<Tema[]>([]);
  const [selectedTemas, setSelectedTemas] = useState<string[]>(
    initialTemas || []
  );
  const [loadingTemas, setLoadingTemas] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function loadTemas() {
      try {
        const result = await temasService.getAll(false); // Solo temas activos
        if (result.success && result.data) {
          setAvailableTemas(result.data);
        }
      } catch (error) {
        console.error("Error loading temas:", error);
      } finally {
        setLoadingTemas(false);
      }
    }
    loadTemas();
  }, []);

  // ✅ NUEVO: Funciones para manejar temas
  const addTema = (temaId: string) => {
    if (!selectedTemas.includes(temaId)) {
      setSelectedTemas([...selectedTemas, temaId]);
    }
  };

  const removeTema = (temaId: string) => {
    setSelectedTemas(selectedTemas.filter((id) => id !== temaId));
  };

  const getTemaById = (id: string) => {
    return availableTemas.find((tema) => tema.id === id);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // ✅ CORREGIDO: Usar valores correctos del enum BD
      tipo: initialData?.tipo || "articulo_propio", // ← Era "articulo"
      titulo: initialData?.titulo || "",
      subtitulo: initialData?.subtitulo || "",
      contenido: initialData?.contenido || "",
      url_externa: initialData?.url_externa || "",
      fuente_externa: initialData?.fuente_externa || "",
      resumen_o_contexto_interno: initialData?.resumen_o_contexto_interno || "",
      autor_noticia:
        initialData?.autor_noticia ||
        (initialData?.tipo === "articulo_propio" ? user?.email || "" : ""),
      fecha_publicacion:
        initialData?.fecha_publicacion ||
        new Date().toISOString().split("T")[0],
      imagen_url: initialData?.imagen_url || "",
      es_destacada: initialData?.es_destacada || false,
      esta_publicada: initialData?.esta_publicada ?? true, // ✅ Por defecto TRUE
    },
  });

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

  // ✅ NUEVA FUNCIÓN: Auto-fetch de imagen desde URL (mejorada)
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

        // ✅ Mejorar fuente_externa con siteName
        if (siteName && !form.getValues("fuente_externa")) {
          form.setValue("fuente_externa", siteName);
        }

        if (description && !form.getValues("resumen_o_contexto_interno")) {
          // Para videos de YouTube, crear un contexto más descriptivo
          const contextText =
            siteName === "YouTube"
              ? `Video de ${siteName}: ${title}. ${
                  description || "Video educativo del canal"
                }. Contenido relevante para la comunidad educativa de CET N°26.`
              : `Artículo de ${
                  siteName || "sitio web"
                }: ${title}. ${description}`;

          form.setValue("resumen_o_contexto_interno", contextText);
        }

        // ✅ NUEVO: Si no hay descripción, crear contexto básico más informativo
        if (!form.getValues("resumen_o_contexto_interno") && title) {
          const basicContext =
            siteName === "YouTube"
              ? `Video de YouTube: ${title}. Contenido audiovisual relevante para la comunidad educativa. Canal: ${
                  new URL(url).searchParams.get("v") || "YouTube"
                }.`
              : `Enlace externo de ${
                  siteName || "sitio web"
                }: ${title}. Contenido relevante para la comunidad educativa del CET N°26.`;
          form.setValue("resumen_o_contexto_interno", basicContext);
        }

        if (image && !form.getValues("imagen_url")) {
          form.setValue("imagen_url", image);
          setImagePreview(image);
        }

        // ✅ NUEVO: Para YouTube, intentar extraer información del canal
        if (siteName === "YouTube" && !form.getValues("autor_noticia")) {
          // Extraer el ID del video para potencialmente obtener más info
          const videoId = new URL(url).searchParams.get("v");
          if (videoId) {
            // Por ahora, usar un placeholder. Podrías implementar YouTube API después
            form.setValue(
              "autor_noticia",
              "Canal de YouTube (ver video para más detalles)"
            );
          }
        }

        toast({
          title: "Datos obtenidos automáticamente",
          description: `Se han cargado datos desde ${
            siteName || "el sitio web"
          }`,
        });
      } else {
        // ✅ NUEVO: Si no hay datos OG, intentar extraer info básica de la URL
        const urlObj = new URL(url);
        const isYoutube =
          urlObj.hostname.includes("youtube.com") ||
          urlObj.hostname.includes("youtu.be");

        if (isYoutube && !form.getValues("fuente_externa")) {
          form.setValue("fuente_externa", "YouTube");

          if (!form.getValues("resumen_o_contexto_interno")) {
            form.setValue(
              "resumen_o_contexto_interno",
              "Video de YouTube compartido para la comunidad educativa. Revisar contenido para agregar descripción más detallada."
            );
          }
        }

        toast({
          title: "Datos limitados obtenidos",
          description:
            "No se encontraron metadatos completos, pero se configuró información básica",
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
          // ✅ CORREGIDO: Import dinámico directo
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
        selectedTemas,
      });

      let savedNoticiaId: string;

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

        savedNoticiaId = initialData.id;

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

        savedNoticiaId = result.data!.id;

        toast({
          title: "Éxito",
          description: "Noticia creada correctamente.",
        });
      }

      // ✅ NUEVO: Actualizar relaciones de temas
      if (selectedTemas.length > 0) {
        const temasResult = await noticiaTemasService.updateTemasForNoticia(
          savedNoticiaId,
          selectedTemas
        );

        if (!temasResult.success) {
          console.error("Error updating temas:", temasResult.error);
          toast({
            title: "Advertencia",
            description:
              "La noticia se guardó pero hubo un error con los temas.",
            variant: "destructive",
          });
          // No return aquí, la noticia ya se guardó
        }
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
    <Form {...form}>
      <form
        onSubmit={(e) => {
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
                      <RadioGroupItem value="articulo_propio" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Artículo Propio
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="enlace_externo" />
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
        {tipoContenido === "articulo_propio" && (
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
            {/* ✅ Campo Autor para artículos propios */}
            <FormField
              control={form.control}
              name="autor_noticia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor del Artículo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={user?.email || "Tu nombre"}
                      value={field.value || user?.email || ""}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    💡 Por defecto se usará tu email. Puedes cambiarlo por tu
                    nombre completo.
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Campos Condicionales para ENLACE EXTERNO */}
        {tipoContenido === "enlace_externo" && (
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

            {/* ✅ Campo fuente/autor para enlaces externos */}
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

            <FormField
              control={form.control}
              name="autor_noticia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor Original (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nombre del autor del contenido externo"
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    💡 Si conoces el autor del artículo/video original, puedes
                    agregarlo aquí.
                  </div>
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
        {/* 🆕 NUEVA SECCIÓN: Gestión de Temas */}
        <div className="space-y-4">
          <FormLabel className="text-base font-semibold">
            Temáticas Relacionadas
          </FormLabel>

          {loadingTemas ? (
            <div className="text-sm text-muted-foreground">
              Cargando temas...
            </div>
          ) : (
            <>
              {/* Selector de temas */}
              <Select onValueChange={addTema}>
                <SelectTrigger>
                  <SelectValue placeholder="Agregar temática..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTemas
                    .filter((tema) => !selectedTemas.includes(tema.id))
                    .map((tema) => (
                      <SelectItem key={tema.id} value={tema.id}>
                        {tema.nombre}
                        {tema.categoria_tema && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({tema.categoria_tema})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Temas seleccionados */}
              {selectedTemas.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    Temáticas seleccionadas:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemas.map((temaId) => {
                      const tema = getTemaById(temaId);
                      return tema ? (
                        <Badge
                          key={temaId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tema.nombre}
                          {tema.categoria_tema && (
                            <span className="text-xs text-muted-foreground">
                              ({tema.categoria_tema})
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeTema(temaId)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                💡 Selecciona las temáticas que mejor describan esta noticia.
                Esto ayudará a los usuarios a encontrar contenido relacionado.
              </div>
            </>
          )}
        </div>

        {/* Estados de la Noticia (sección existente) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ... código existente de checkboxes ... */}
        </div>
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
                    {field.value
                      ? "✅ La noticia será visible para todos los usuarios"
                      : "📝 La noticia se guardará como borrador"}
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
                resumen del contenido ya que la IA no puede acceder directamente
                a la URL.
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          onClick={() => {
            console.log("🖱️ Submit button clicked");
            console.log("🔍 Button state:", {
              isSubmitting: form.formState.isSubmitting,
              isValid: form.formState.isValid,
              errors: form.formState.errors,
              isDirty: form.formState.isDirty,
              dirtyFields: form.formState.dirtyFields,
              touchedFields: form.formState.touchedFields,
            });
            console.log("🔍 Form values:", form.getValues());

            // Forzar validación manual antes del submit
            form.trigger().then((isValid) => {
              console.log("🔍 Manual validation result:", isValid);
              if (!isValid) {
                console.log(
                  "❌ Form validation failed:",
                  form.formState.errors
                );
              }
            });
          }}
        >
          {form.formState.isSubmitting ? "Guardando..." : "Guardar Noticia"}
        </Button>
      </form>
    </Form>
  );
}
