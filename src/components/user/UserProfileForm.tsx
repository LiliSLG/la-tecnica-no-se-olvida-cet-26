// src/components/user/UserProfileForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  personasService,
  type PersonaRow,
  type UpdatePersonaData,
} from "@/lib/supabase/services/personasService";


// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/lib/supabase/types/database.types";
// Icons
import {
  User,
  MapPin,
  Phone,
  Building2,
  GraduationCap,
  Briefcase,
  Save,
  Upload,
  X,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";

interface UserProfileFormProps {
  initialData: PersonaRow;
  onSuccess?: () => void;
}

export function UserProfileForm({
  initialData,
  onSuccess,
}: UserProfileFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basico");
  const [selectedFotoFile, setSelectedFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    initialData.foto_url || null
  );

  // Inicializar formulario con datos existentes
  const form = useForm({
    defaultValues: {
      nombre: initialData.nombre || "",
      apellido: initialData.apellido || "",
      descripcion_personal_o_profesional:
        initialData.descripcion_personal_o_profesional || "",
      areas_de_interes_o_expertise:
        initialData.areas_de_interes_o_expertise || [],
      foto_url: initialData.foto_url || "",
      disponible_para_proyectos: initialData.disponible_para_proyectos || false,
      visibilidad_perfil: initialData.visibilidad_perfil || "privado",
      telefono_contacto: initialData.telefono_contacto || "",
      activo: initialData.activo,
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (data: any) => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let finalFotoUrl = data.foto_url;

      // Upload de foto si hay archivo seleccionado
      if (selectedFotoFile) {
        toast({
          title: "Subiendo foto...",
          description: "Por favor espera mientras se sube la foto",
        });

        try {
          const { uploadFileToAnyBucket } = await import(
            "@/lib/supabase/supabaseStorage"
          );
          finalFotoUrl = await uploadFileToAnyBucket(
            selectedFotoFile,
            "personas",
            "fotos"
          );
        } catch (uploadError) {
          toast({
            title: "Error subiendo foto",
            description: "No se pudo subir la foto. Intenta de nuevo.",
            variant: "destructive",
          });
          return;
        }
      }

      const updateData: UpdatePersonaData = {
        ...data,
        foto_url: finalFotoUrl,
        updated_at: new Date().toISOString(),
        visibilidad_perfil:
          data.visibilidad_perfil as Database["public"]["Enums"]["visibilidad_perfil_enum"],
      };

      const result = await personasService.update(user.id, updateData);

      if (result.success) {
        toast({
          title: "Perfil actualizado",
          description: "Tu información se guardó correctamente",
        });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Error actualizando perfil",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Error inesperado al guardar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar áreas de interés
  const addArea = (newArea: string) => {
    if (!newArea.trim()) return;
    const currentAreas = form.getValues("areas_de_interes_o_expertise") || [];
    if (!currentAreas.includes(newArea.trim())) {
      form.setValue("areas_de_interes_o_expertise", [
        ...currentAreas,
        newArea.trim(),
      ]);
    }
  };

  const removeArea = (areaToRemove: string) => {
    const currentAreas = form.getValues("areas_de_interes_o_expertise") || [];
    form.setValue(
      "areas_de_interes_o_expertise",
      currentAreas.filter((area) => area !== areaToRemove)
    );
  };

  // Manejar upload de foto
  const handleFotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "La foto debe ser menor a 5MB",
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

    const reader = new FileReader();
    reader.onload = (e) => {
      setFotoPreview(e.target?.result as string);
      setSelectedFotoFile(file);
      form.setValue("foto_url", "");
    };
    reader.readAsDataURL(file);
  };
  // Determinar si mostrar tabs específicos
  const isEstudianteOrExAlumno =
    initialData.categoria_principal === "estudiante_cet" ||
    initialData.categoria_principal === "ex_alumno_cet";

  const esProfesionalOTecnico =
    initialData.categoria_principal === "docente_cet" ||
    initialData.categoria_principal === "comunidad_activa";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basico" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Básico</span>
            </TabsTrigger>
            <TabsTrigger value="ubicacion" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Ubicación</span>
            </TabsTrigger>
            <TabsTrigger value="contacto" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Contacto</span>
            </TabsTrigger>
            <TabsTrigger
              value="organizaciones"
              className="flex items-center gap-2"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organizaciones</span>
            </TabsTrigger>
            {isEstudianteOrExAlumno && (
              <TabsTrigger value="cet" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">CET</span>
              </TabsTrigger>
            )}
            {esProfesionalOTecnico && (
              <TabsTrigger
                value="profesional"
                className="flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Profesional</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* TAB 1: Información Básica */}
          <TabsContent value="basico">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Foto de perfil */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={fotoPreview || form.watch("foto_url") || undefined}
                      alt="Foto de perfil"
                    />               
                    <AvatarFallback className="text-xl">
                      {initialData.nombre?.[0] || ""}
                      {initialData.apellido?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4">
                    {/* Preview y botón eliminar */}
                    {fotoPreview && (
                      <div className="relative w-32 h-32">
                        <img
                          src={fotoPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => {
                            setFotoPreview(null);
                            setSelectedFotoFile(null);
                            form.setValue("foto_url", "");
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {selectedFotoFile && (
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            📁 Se subirá al guardar
                          </div>
                        )}
                      </div>
                    )}

                    {/* Input de archivo */}
                    <div>
                      <label htmlFor="foto-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {selectedFotoFile
                              ? `Archivo seleccionado: ${selectedFotoFile.name}`
                              : "Haz clic para subir foto"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, WebP, GIF. Máximo 5MB.
                          </p>
                        </div>
                        <input
                          id="foto-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFotoSelect}
                          disabled={loading}
                        />
                      </label>
                    </div>

                    {/* Campo URL alternativo */}
                    <FormField
                      control={form.control}
                      name="foto_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>O ingresa URL de foto</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="https://..."
                            />
                          </FormControl>
                          <FormDescription>
                            Podés subir un archivo o pegar la URL de una imagen
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Nombre y apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Tu nombre" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Tu apellido"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email (solo lectura) */}
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input value={user?.email || ""} disabled />
                  </FormControl>
                  <FormDescription>
                    El email no se puede modificar. Contacta al administrador si
                    necesitas cambiarlo.
                  </FormDescription>
                </FormItem>

                {/* Categoría (solo lectura) */}
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input
                      value={(() => {
                        const categorias: Record<string, string> = {
                          estudiante_cet: "Estudiante CET",
                          ex_alumno_cet: "Ex-Alumno CET",
                          docente_cet: "Docente CET",
                          comunidad_activa: "Comunidad Activa",
                          comunidad_general: "Comunidad General",
                        };
                        return (
                          categorias[initialData.categoria_principal || ""] ||
                          initialData.categoria_principal ||
                          ""
                        );
                      })()}
                      disabled
                    />
                  </FormControl>
                  <FormDescription>
                    La categoría la gestiona el administrador. Si necesitas
                    cambiarla, usa el botón de arriba.
                  </FormDescription>
                </FormItem>

                {/* Descripción */}
                <FormField
                  control={form.control}
                  name="descripcion_personal_o_profesional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción personal o profesional</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Contanos sobre vos, tu trabajo, intereses, logros..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Esta descripción aparecerá en tu perfil público si
                        elegís hacerlo visible.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Áreas de interés */}
                <FormField
                  control={form.control}
                  name="areas_de_interes_o_expertise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Áreas de interés o expertise</FormLabel>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {(field.value || []).map((area, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {area}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeArea(area)}
                              />
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregá un área de interés"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addArea(e.currentTarget.value);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              addArea(input.value);
                              input.value = "";
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <FormDescription>
                        Agregá palabras clave sobre tus intereses, habilidades o
                        áreas de expertise.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Configuraciones de visibilidad */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Configuraciones de Privacidad</h4>

                  <FormField
                    control={form.control}
                    name="visibilidad_perfil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          {field.value === "publico" ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                          Visibilidad del perfil
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="publico">
                              🌐 Público - Visible para todos
                            </SelectItem>
                            <SelectItem value="privado">
                              🔒 Privado - Solo visible para administradores
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Si es público, tu perfil aparecerá en la sección de
                          comunidad.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disponible_para_proyectos"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Disponible para proyectos
                          </FormLabel>
                          <FormDescription>
                            Permite que otros te contacten para colaboraciones
                            en proyectos.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Ubicación */}
          <TabsContent value="ubicacion">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    Esta información es opcional y te ayuda a conectar con
                    personas de tu zona.
                  </AlertDescription>
                </Alert>

                {/* Campos de ubicación - simplificados para usuario */}
                <div className="space-y-4">
                  <FormItem>
                    <FormLabel>Provincia</FormLabel>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rio-negro">Río Negro</SelectItem>
                        <SelectItem value="neuquen">Neuquén</SelectItem>
                        <SelectItem value="chubut">Chubut</SelectItem>
                        <SelectItem value="otra">Otra provincia</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Localidad</FormLabel>
                    <Input placeholder="Ej: Ingeniero Jacobacci" />
                  </FormItem>

                  <FormItem>
                    <FormLabel>Dirección (opcional)</FormLabel>
                    <Input placeholder="Solo se muestra si el perfil es público" />
                    <FormDescription>
                      Esta información solo aparece si tu perfil es público.
                    </FormDescription>
                  </FormItem>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Contacto */}
          <TabsContent value="contacto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="telefono_contacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono personal</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Ej: +54 9 2940 123456"
                        />
                      </FormControl>
                      <FormDescription>
                        Este teléfono no se muestra públicamente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Links profesionales */}
                <div className="space-y-4">
                  <h4 className="font-medium">Links Profesionales</h4>
                  <p className="text-sm text-muted-foreground">
                    Estos enlaces aparecen en tu perfil público si elegís
                    hacerlo visible.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Sitio web</FormLabel>
                      <Input placeholder="https://tu-sitio.com" />
                    </FormItem>
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <Input placeholder="https://linkedin.com/in/tu-perfil" />
                    </FormItem>
                    <FormItem>
                      <FormLabel>GitHub</FormLabel>
                      <Input placeholder="https://github.com/tu-usuario" />
                    </FormItem>
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <Input placeholder="https://instagram.com/tu-usuario" />
                    </FormItem>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Organizaciones */}
          <TabsContent value="organizaciones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organizaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    Pronto podrás gestionar las organizaciones donde trabajas o
                    participas.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: CET (solo para estudiantes/ex-alumnos) */}
          {isEstudianteOrExAlumno && (
            <TabsContent value="cet">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Información CET
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <GraduationCap className="h-4 w-4" />
                    <AlertDescription>
                      Pronto podrás gestionar tu información profesional
                      detallada.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
