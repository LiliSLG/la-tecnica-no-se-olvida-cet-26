// src/components/admin/organizaciones/OrganizacionForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import {
  organizacionFormSchema,
  TIPOS_ORGANIZACION,
  AREAS_INTERES_ORGANIZACION,
} from "@/lib/schemas/organizacionSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Info, Mail, Globe, MapPin, Users, Building } from "lucide-react";

interface OrganizacionFormProps {
  initialData?: OrganizacionRow;
  redirectPath?: string;
}

// Schema del formulario - Hacemos campos opcionales
const formSchema = organizacionFormSchema.extend({
  sitio_web: z
    .string()
    .url("URL del sitio web inválida")
    .optional()
    .or(z.literal("")),
  email_contacto: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  nombre_fantasia: z.string().optional().or(z.literal("")),
  telefono_contacto: z.string().optional().or(z.literal("")),
});

export function OrganizacionForm({
  initialData,
  redirectPath = "/admin/organizaciones",
}: OrganizacionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logo_url || null
  );
  // Estados para áreas de interés
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    initialData?.areas_de_interes || []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_oficial: initialData?.nombre_oficial || "",
      nombre_fantasia: initialData?.nombre_fantasia || "", // ✅ String vacío en lugar de undefined
      tipo: initialData?.tipo || "empresa",
      descripcion: initialData?.descripcion || "",
      email_contacto: initialData?.email_contacto || "", // ✅ String vacío
      telefono_contacto: initialData?.telefono_contacto || "", // ✅ String vacío
      sitio_web: initialData?.sitio_web || "", // ✅ String vacío
      areas_de_interes: initialData?.areas_de_interes || [],
      abierta_a_colaboraciones: initialData?.abierta_a_colaboraciones ?? true,
    },
  });
  // Agregar esta función (basada en handleImageSelect de noticias):
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];

    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El logo debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes: JPG, PNG, WebP, GIF, SVG",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
      setSelectedLogoFile(file);
      form.setValue("logo_url", "");
    };
    reader.readAsDataURL(file);
  };

  // Sincronizar áreas de interés con el formulario
  useEffect(() => {
    form.setValue("areas_de_interes", selectedAreas);
  }, [selectedAreas, form]);

  // Funciones para manejar áreas de interés
  const addArea = (area: string) => {
    if (!selectedAreas.includes(area)) {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const removeArea = (area: string) => {
    setSelectedAreas(selectedAreas.filter((a) => a !== area));
  };

  // Envío del formulario
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      return toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
    }

    setLoading(true);

    try {
      let finalLogoUrl = values.logo_url;

      // Upload de logo si hay archivo seleccionado
      if (selectedLogoFile) {
        toast({
          title: "Subiendo logo...",
          description: "Por favor espera mientras se sube el logo",
        });

        try {
          const { uploadOrganizacionLogo } = await import(
            "@/lib/supabase/supabaseStorage"
          );
          finalLogoUrl = await uploadOrganizacionLogo(selectedLogoFile);
          console.log("✅ Logo uploaded:", finalLogoUrl);
        } catch (uploadError) {
          console.error("❌ Logo upload failed:", uploadError);
          toast({
            title: "Error subiendo logo",
            description: "No se pudo subir el logo. Intenta de nuevo.",
            variant: "destructive",
          });
          return;
        }
      }

      // ✅ PROCESAR DATOS: Convertir strings vacíos a null
      const processedValues = {
        ...values,
        logo_url: finalLogoUrl,
        areas_de_interes: selectedAreas,
        // ✅ Convertir strings vacíos a null para que pasen los constraints
        email_contacto:
          values.email_contacto?.trim() === "" ? null : values.email_contacto,
        telefono_contacto:
          values.telefono_contacto?.trim() === ""
            ? null
            : values.telefono_contacto,
        sitio_web: values.sitio_web?.trim() === "" ? null : values.sitio_web,
        nombre_fantasia:
          values.nombre_fantasia?.trim() === "" ? null : values.nombre_fantasia,
      };

      console.log(
        "🔥 Submitting organización with processed data:",
        processedValues
      );

      // Resto del código igual...
      if (initialData) {
        const updateData = {
          ...processedValues,
          updated_by_uid: user.id,
          updated_at: new Date().toISOString(),
        };
        const result = await organizacionesService.update(
          initialData.id,
          updateData
        );

        if (!result.success) {
          toast({
            title: "Error",
            description:
              result.error?.message || "Error al actualizar la organización",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Éxito",
          description: "Organización actualizada correctamente.",
        });
      } else {
        const createData = {
          ...processedValues,
          created_by_uid: user.id,
          estado_verificacion: "sin_invitacion" as const,
        };

        const result = await organizacionesService.create(createData);

        if (!result.success) {
          toast({
            title: "Error",
            description:
              result.error?.message || "Error al crear la organización",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Éxito",
          description: "Organización creada correctamente.",
        });
      }

      router.push(redirectPath);
    } catch (error) {
      // ...
    } finally {
      setLoading(false);
    }
  }

  const emailContacto = form.watch("email_contacto");
  const tipoSeleccionado = form.watch("tipo");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {initialData ? "Editar Organización" : "Nueva Organización"}
        </h1>
        <p className="text-muted-foreground">
          {initialData
            ? "Modifica los datos de la organización"
            : "Agrega una nueva organización colaboradora"}
        </p>
      </div>

      {/* Alerta sobre invitaciones */}
      {!initialData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>¿Cómo funciona el proceso de verificación?</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              1. <strong>Crear organización:</strong> Completa los datos básicos
              de la organización
            </p>
            <p>
              2. <strong>Invitación automática:</strong> Si cargas un email, se
              enviará una invitación para que puedan reclamar su perfil
            </p>
            <p>
              3. <strong>Verificación:</strong> La organización podrá agregar
              información adicional y gestionar su contenido
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nombre_oficial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Oficial *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="INTA EEA Bariloche" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nombre_fantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Fantasía</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Instituto Nacional de Tecnología"
                        />
                      </FormControl>
                      <FormDescription>
                        Nombre comercial o conocido (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Organización *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_ORGANIZACION.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className="flex items-center gap-2">
                              <span>{tipo.icon}</span>
                              <span>{tipo.label}</span>
                            </div>
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
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe brevemente la organización, sus objetivos y actividades principales..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Mínimo 10 caracteres. Será visible públicamente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/*Logo de la Organización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Logo de la Organización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Preview del logo */}
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 object-contain rounded border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => {
                        setLogoPreview(null);
                        setSelectedLogoFile(null);
                        form.setValue("logo_url", "");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Input de archivo */}
                <div className="flex-1">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                      <Building className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {selectedLogoFile
                          ? `Archivo seleccionado: ${selectedLogoFile.name}`
                          : "Haz clic para subir logo"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, WebP, GIF o SVG. Máximo 5MB.
                      </p>
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoSelect}
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email_contacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Contacto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="contacto@organizacion.com"
                        />
                      </FormControl>
                      <FormDescription>
                        📧 Se enviará invitación a este email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono_contacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="+54 294 123-4567"
                          type="tel"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sitio_web"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://www.organizacion.com"
                        type="url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alerta de invitación */}
              {emailContacto && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">
                    Invitación automática
                  </AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Al guardar esta organización, se enviará automáticamente una
                    invitación a <strong>{emailContacto}</strong> para que
                    puedan reclamar su perfil y agregar información adicional.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Áreas de Interés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Áreas de Interés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selector de áreas */}
              <div>
                <FormLabel>Seleccionar Áreas *</FormLabel>
                <div className="mt-2">
                  <Select onValueChange={addArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Agregar área de interés" />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS_INTERES_ORGANIZACION.filter(
                        (area) => !selectedAreas.includes(area)
                      ).map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Áreas seleccionadas */}
              {selectedAreas.length > 0 && (
                <div>
                  <FormLabel>
                    Áreas Seleccionadas ({selectedAreas.length})
                  </FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedAreas.map((area) => (
                      <Badge
                        key={area}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {area}
                        <button
                          type="button"
                          onClick={() => removeArea(area)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAreas.length === 0 && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                  💡 Selecciona al menos un área de interés para continuar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="abierta_a_colaboraciones"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Abierta a Colaboraciones</FormLabel>
                      <FormDescription>
                        {field.value
                          ? "✅ Esta organización estará disponible para colaborar en proyectos"
                          : "❌ Esta organización no aparecerá en búsquedas de colaboradores"}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(redirectPath)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedAreas.length === 0}
            >
              {loading
                ? "Guardando..."
                : initialData
                ? "Actualizar Organización"
                : "Crear Organización"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
