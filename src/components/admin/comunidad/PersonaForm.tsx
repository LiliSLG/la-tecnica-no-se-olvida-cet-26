// /src/components/admin/comunidad/PersonaForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

import {
  personasService,
  type PersonaRow,
  type CreatePersonaData,
  type UpdatePersonaData,
} from "@/lib/supabase/services/personasService";
import {
  PersonaAdminCreateData,
  personaAdminCreateSchema,
} from "@/lib/schemas/personaSchema";
import type { Database } from "@/lib/supabase/types/database.types";
import type { z } from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

// Icons
import {
  User,
  MapPin,
  Phone,
  Building2,
  GraduationCap,
  Briefcase,
  Info,
  Upload,
  X,
  Plus,
} from "lucide-react";
import {
  ESTADOS_SITUACION_LABORAL,
  VISIBILIDAD_PERFIL,
  AREAS_INTERES,
  ESPECIALIDADES_CET,
  PROVINCIAS,
  PLATAFORMAS_PROFESIONALES,
  TIPOS_COLABORACION,
} from "@/lib/constants/persona";

type CategoriaPersona =
  Database["public"]["Enums"]["categoria_principal_persona_enum"];

type PersonaFormInitialData = PersonaRow & Partial<PersonaAdminCreateData>;

interface PersonaFormProps {
  tipo: "alumno" | "docente" | "activo";
  initialData?: any;
  redirectPath?: string;
}

export function PersonaForm({
  tipo,
  initialData,
  redirectPath = "/admin/comunidad",
}: PersonaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(
    initialData?.foto_url || null
  );
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [temasDisponibles, setTemasDisponibles] = useState<
    Array<{ id: string; nombre: string }>
  >([]);

  // Determinar qué tabs mostrar según el tipo
  const shouldShowCETTab = tipo === "alumno";
  const shouldShowTrabajoTab = tipo === "alumno"; // Para ex-alumnos en búsqueda
  const shouldShowProfesionalTab = tipo !== "alumno"; // Docente y activo
  const shouldShowOrganizacionesTab = tipo !== "alumno"; // Docente y activo
  // Estados para campos múltiples
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Cargar temas disponibles
  useEffect(() => {
    async function loadTemasDisponibles() {
      try {
        const { temasService } = await import(
          "@/lib/supabase/services/temasService"
        );
        const result = await temasService.getAll(false); // Solo temas activos

        if (result.success && result.data) {
          const temas = result.data.map((tema) => ({
            id: tema.id,
            nombre: tema.nombre,
          }));
          setTemasDisponibles(temas);
        }
      } catch (error) {
        console.error("Error cargando temas disponibles:", error);
      }
    }

    loadTemasDisponibles();
  }, []);

  // Cargar temas cuando hay initialData
  useEffect(() => {
    async function loadTemas() {
      if (initialData?.id) {
        try {
          const { personaTemaService } = await import(
            "@/lib/supabase/services/personaTemaService"
          );
          const result = await personaTemaService.getTemasByPersonaId(
            initialData.id
          );

          if (result.success && result.data) {
            const temaIds = result.data.map((pt) => pt.tema_id);
            setSelectedTemas(temaIds);
          }
        } catch (error) {
          console.error("Error cargando temas:", error);
        }
      }
    }

    loadTemas();
  }, [initialData?.id]);

  // Helper functions
  const formatTipoPersona = (tipo: "alumno" | "docente" | "activo") => {
    const tipos = {
      alumno: {
        label: "Alumno CET",
        icon: "🎓",
        color: "green",
        categoria_bd: "estudiante_cet" as const,
      },
      docente: {
        label: "Docente CET",
        icon: "👨‍🏫",
        color: "blue",
        categoria_bd: "docente_cet" as const,
      },
      activo: {
        label: "Comunidad Activa",
        icon: "🤝",
        color: "orange",
        categoria_bd: "comunidad_activa" as const,
      },
    };
    return tipos[tipo];
  };

  const cleanEmail = (email: string | null | undefined): string | null => {
    if (!email || email.trim() === "") {
      return null;
    }
    return email.trim();
  };

  const tipoInfo = formatTipoPersona(tipo);

  console.log("🔍 DEBUG PersonaForm:", { tipo, tipoInfo });
  console.log("🔍 Tabs mostrar:", {
    shouldShowCETTab,
    shouldShowTrabajoTab,
    shouldShowProfesionalTab,
    shouldShowOrganizacionesTab,
  });

  if (!tipo || !tipoInfo) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Error de configuración</AlertTitle>
          <AlertDescription>
            Tipo de persona no especificado. Por favor, selecciona un tipo
            válido.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const form = useForm<PersonaAdminCreateData>({
    resolver: zodResolver(personaAdminCreateSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      apellido: initialData?.apellido || "",
      email: initialData?.email || "",
      telefono_contacto: initialData?.telefono_contacto || "",
      categoria_principal: tipoInfo.categoria_bd,
      descripcion_personal_o_profesional:
        initialData?.descripcion_personal_o_profesional || "",
      visibilidad_perfil: initialData?.visibilidad_perfil || "publico",
      activo: initialData?.activo ?? true,
      disponible_para_proyectos:
        initialData?.disponible_para_proyectos ?? false,
      buscando_oportunidades: initialData?.buscando_oportunidades ?? false,
      es_ex_alumno_cet: initialData?.es_ex_alumno_cet ?? false,
      estado_situacion_laboral:
        initialData?.estado_situacion_laboral || "no_especificado",

      // Campos opcionales
      ano_cursada_actual_cet: initialData?.ano_cursada_actual_cet || undefined,
      ano_egreso_cet: initialData?.ano_egreso_cet || undefined,
      titulacion_obtenida_cet: initialData?.titulacion_obtenida_cet || "",
      titulo_profesional: initialData?.titulo_profesional || "",
      empresa_o_institucion_actual:
        initialData?.empresa_o_institucion_actual || "",
      cargo_actual: initialData?.cargo_actual || "",
      historia_de_exito_o_resumen_trayectoria:
        initialData?.historia_de_exito_o_resumen_trayectoria || "",
    },
  });

  // Handle foto upload
  const handleFotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle areas de interés
  const addArea = (area: string) => {
    if (!selectedAreas.includes(area)) {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const removeArea = (area: string) => {
    setSelectedAreas(selectedAreas.filter((a) => a !== area));
  };

  // Handle temas
  const addTema = (temaId: string) => {
    if (!selectedTemas.includes(temaId)) {
      setSelectedTemas([...selectedTemas, temaId]);
      console.log("🔗 Tema agregado:", temaId, "Total temas:", [
        ...selectedTemas,
        temaId,
      ]);
    }
  };

  const removeTema = (temaId: string) => {
    setSelectedTemas(selectedTemas.filter((id) => id !== temaId));
    console.log(
      "🗑️ Tema removido:",
      temaId,
      "Temas restantes:",
      selectedTemas.filter((id) => id !== temaId)
    );
  };

  // Handle links profesionales
  const [linksProf, setLinksProf] = useState<{ tipo: string; url: string }[]>(
    []
  );
  const addLink = () => {
    setLinksProf([...linksProf, { tipo: "", url: "" }]);
  };

  const updateLink = (index: number, field: "tipo" | "url", value: string) => {
    const updated = [...linksProf];
    updated[index][field] = value;
    setLinksProf(updated);
  };

  const removeLink = (index: number) => {
    setLinksProf(linksProf.filter((_, i) => i !== index));
  };

  // Submit handler
  const onSubmit = async (values: PersonaAdminCreateData) => {
    console.log("🚀 onSubmit EJECUTADO con values:", values);

    if (!user?.id) {
      console.log("❌ No hay usuario autenticado:", user);
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Usuario autenticado:", user.id);
    setLoading(true);

    try {
      // Determinar categoría final
      let categoria_final: Database["public"]["Enums"]["categoria_principal_persona_enum"];
      if (tipo === "alumno") {
        categoria_final = values.es_ex_alumno_cet
          ? "ex_alumno_cet"
          : "estudiante_cet";
      } else {
        categoria_final = tipoInfo.categoria_bd;
      }
      if (initialData?.id) {
        // ✅ CAMBIO: Verificación más segura
        console.log("🔄 Actualizando miembro:", initialData.id);

        // ✅ CAST DE TIPOS para compatibilidad
        const updateData: UpdatePersonaData = {
          ...values,
          email: cleanEmail(values.email),
          areas_de_interes_o_expertise: selectedAreas,
          links_profesionales: linksProf.filter(
            (link) => link.tipo && link.url
          ),
          foto_url: fotoPreview,
          updated_by_uid: user.id,

          // Cast explícito para enums
          visibilidad_perfil:
            values.visibilidad_perfil as Database["public"]["Enums"]["visibilidad_perfil_enum"],
          estado_situacion_laboral:
            values.estado_situacion_laboral as Database["public"]["Enums"]["estado_situacion_laboral_enum"],
          categoria_principal: categoria_final,
        };

        const result = await personasService.update(initialData.id, updateData);

        if (!result.success) {
          console.error("❌ Error actualizando:", result.error);
          toast({
            title: "Error",
            description:
              result.error?.message ||
              "Error al actualizar miembro de la coomunidad",
            variant: "destructive",
          });
          return;
        }
        console.log("✅ Miembro actualizado exitosamente");

        // ✅ AGREGAR: Actualizar relaciones de temas
        if (initialData?.id) {
          try {
            const { personaTemaService } = await import(
              "@/lib/supabase/services/personaTemaService"
            );

            // Obtener temas actuales
            const currentResult = await personaTemaService.getTemasByPersonaId(
              initialData.id
            );
            const currentTemas =
              currentResult.success && currentResult.data
                ? currentResult.data.map((pt) => pt.tema_id)
                : [];

            // Agregar nuevos temas
            for (const temaId of selectedTemas) {
              if (!currentTemas.includes(temaId)) {
                await personaTemaService.addTemaToPersona(
                  initialData.id,
                  temaId
                );
              }
            }

            // Remover temas no seleccionados
            for (const currentTemaId of currentTemas) {
              if (!selectedTemas.includes(currentTemaId)) {
                await personaTemaService.removeTemaFromPersona(
                  initialData.id,
                  currentTemaId
                );
              }
            }

            console.log("✅ Temas actualizados exitosamente");
          } catch (error) {
            console.error("❌ Error actualizando temas:", error);
          }
        }

        toast({
          title: "Éxito",
          description: `${tipoInfo.label} actualizado correctamente.`,
        });
      } else {
        // ✅ DATOS MÍNIMOS para creación
        const createData: CreatePersonaData = {
          // Campos obligatorios
          nombre: values.nombre,
          apellido: values.apellido,
          categoria_principal: categoria_final,
          created_by_uid: user.id,
          estado_verificacion: "sin_invitacion" as const,

          // Campos opcionales (solo si tienen valor)
          email: cleanEmail(values.email),
          telefono_contacto: values.telefono_contacto || null,
          descripcion_personal_o_profesional:
            values.descripcion_personal_o_profesional || null,
          visibilidad_perfil:
            values.visibilidad_perfil as Database["public"]["Enums"]["visibilidad_perfil_enum"],
          estado_situacion_laboral:
            values.estado_situacion_laboral as Database["public"]["Enums"]["estado_situacion_laboral_enum"],

          // Configuración por defecto
          activo: values.activo,
          disponible_para_proyectos: values.disponible_para_proyectos,
          es_ex_alumno_cet: values.es_ex_alumno_cet,
          buscando_oportunidades: values.buscando_oportunidades,

          // Arrays vacíos por defecto (se llenan cuando reclamen)
          areas_de_interes_o_expertise: selectedAreas,
          links_profesionales: linksProf.filter(
            (link) => link.tipo && link.url
          ),
          ofrece_colaboracion_como: [],

          // Foto
          foto_url: fotoPreview,
        };

        console.log("🔍 Enviando createData:", createData);

        const result = await personasService.create(createData);

        if (!result.success) {
          console.error("❌ Error del service:", result.error);
          toast({
            title: "Error",
            description:
              result.error?.message ||
              "Error al crear miembro de la coomunidad",
            variant: "destructive",
          });
          return;
        }
        console.log("✅ Miembro creado exitosamente:", result.data);

        // Guardar relaciones de temas
        if (selectedTemas.length > 0 && result.data?.id) {
          try {
            const { personaTemaService } = await import(
              "@/lib/supabase/services/personaTemaService"
            );

            for (const temaId of selectedTemas) {
              await personaTemaService.addTemaToPersona(result.data.id, temaId);
            }
            console.log("✅ Temas vinculados exitosamente");
          } catch (error) {
            console.error("❌ Error vinculando temas:", error);
            // No mostramos error al usuario porque la persona se creó bien
          }
        }

        toast({
          title: "Éxito",
          description: `${tipoInfo.label} creado correctamente.`,
        });
        // Si tiene email, enviar invitación automáticamente
        if (cleanEmail(values.email) && result.data?.id) {
          try {
            // Actualizar tipo_solicitud para el sistema de invitaciones
            await personasService.update(result.data.id, {
              tipo_solicitud: "invitacion_admin",
              updated_by_uid: user.id,
            });

            const adminNombre =
              user.nombre && user.apellido
                ? `${user.nombre} ${user.apellido}`
                : undefined;

            const invitationResult =
              await personasService.generarTokenYEnviarInvitacion(
                result.data.id,
                user.id,
                adminNombre
              );

            if (invitationResult.success) {
              toast({
                title: "Invitación enviada automáticamente",
                description: `Se envió una invitación a ${cleanEmail(
                  values.email
                )} para completar su perfil`,
                duration: 5000, // Mostrar más tiempo para que vean ambos toasts
              });
            } else {
              console.error(
                "Error enviando invitación automática:",
                invitationResult.error
              );
              // No mostramos error al usuario porque la persona se creó correctamente
            }
          } catch (error) {
            console.error("Error en auto-invitación:", error);
            // No mostramos error al usuario porque la persona se creó correctamente
          }
        }

        router.push(redirectPath);
      }
      router.push(redirectPath);
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      toast({
        title: "Error",
        description: "Error inesperado al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <span className="text-2xl">{tipoInfo.icon}</span>
          {initialData ? "Editar" : "Crear"} {tipoInfo.label}
        </h1>
        <p className="text-muted-foreground">
          {initialData
            ? "Modifica los datos de la persona"
            : `Agrega una nuevo miembro de tipo ${tipoInfo.label}`}
        </p>
      </div>

      {/* Alerta informativa */}
      {!initialData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Sistema de invitaciones</AlertTitle>
          <AlertDescription className="mt-2 space-y-1">
            <p>
              Si agregas un email, se enviará automáticamente una invitación
              para que la persona pueda:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Completar su perfil con información adicional</li>
              <li>Gestionar su visibilidad y datos de contacto</li>
              <li>Participar activamente en la plataforma</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="basico" className="space-y-6">
            {/* ✅ SOLO TabsTrigger en TabsList */}
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-6">
              {/* TAB 1: BÁSICO */}
              <TabsTrigger value="basico" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Básico
              </TabsTrigger>
              {/* TAB 2: UBICACIÓN */}
              <TabsTrigger
                value="ubicacion"
                className="flex items-center gap-1"
              >
                <MapPin className="h-4 w-4" />
                Ubicación
              </TabsTrigger>
              {/* TAB 3: CONTACTO */}
              <TabsTrigger value="contacto" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Contacto
              </TabsTrigger>
              {/* TAB 4: CET (Condicional) */}
              {shouldShowCETTab && (
                <TabsTrigger value="cet" className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  CET
                </TabsTrigger>
              )}
              {/* TAB 5: TRABAJO (Para alumnos - búsqueda activa) */}
              {shouldShowTrabajoTab && (
                <TabsTrigger
                  value="trabajo"
                  className="flex items-center gap-1"
                >
                  <Briefcase className="h-4 w-4" />
                  Trabajo
                </TabsTrigger>
              )}
              {/* TAB 6: ORGANIZACIONES (Condicional) */}
              {shouldShowOrganizacionesTab && (
                <TabsTrigger
                  value="organizaciones"
                  className="flex items-center gap-1"
                >
                  <Building2 className="h-4 w-4" />
                  Organizaciones
                </TabsTrigger>
              )}
              {/* TAB 7: PROFESIONAL (Condicional) */}
              {shouldShowProfesionalTab && (
                <TabsTrigger
                  value="profesional"
                  className="flex items-center gap-1"
                >
                  <Briefcase className="h-4 w-4" />
                  Profesional
                </TabsTrigger>
              )}
            </TabsList>
            {/* ✅ TODOS LOS TabsContent DESPUÉS del TabsList */}
            {/* TAB 1: BÁSICO */}
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
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={fotoPreview || undefined} />
                      <AvatarFallback className="text-lg">
                        {form.watch("nombre")?.charAt(0)}
                        {form.watch("apellido")?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <label htmlFor="foto-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Cambiar foto
                          </span>
                        </Button>
                      </label>
                      <input
                        id="foto-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFotoSelect}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG hasta 5MB
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Juan" />
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
                          <FormLabel>Apellido *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Pérez" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            type="email"
                            placeholder="juan.perez@email.com"
                          />
                        </FormControl>
                        <FormDescription>
                          Se enviará una invitación a este email para completar
                          el perfil
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descripcion_personal_o_profesional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="Breve descripción personal o profesional..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Configuración de perfil */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="visibilidad_perfil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visibilidad del perfil</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {VISIBILIDAD_PERFIL.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="activo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Activo
                              </FormLabel>
                              <FormDescription>
                                La persona puede acceder a la plataforma
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

                      <FormField
                        control={form.control}
                        name="disponible_para_proyectos"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Disponible para proyectos
                              </FormLabel>
                              <FormDescription>
                                Puede participar en nuevos proyectos
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
                  </div>

                  {/* Áreas de interés */}

                  <div>
                    <FormLabel>Áreas de interés</FormLabel>
                    <div className="mt-2 space-y-3">
                      <div className="flex flex-wrap gap-2">
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
                              className="ml-1 h-3 w-3 rounded-full bg-secondary-foreground/20 flex items-center justify-center hover:bg-secondary-foreground/40"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={addArea}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Agregar área de interés..." />
                        </SelectTrigger>
                        <SelectContent>
                          {AREAS_INTERES.filter(
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
                </CardContent>
              </Card>
              {/* Temas relacionados */}
              <div>
                <FormLabel>Temas relacionados</FormLabel>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedTemas.map((temaId) => {
                      const tema = temasDisponibles.find(
                        (t) => t.id === temaId
                      );
                      return (
                        <Badge
                          key={temaId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tema?.nombre || `Tema ${temaId}`}
                          <button
                            type="button"
                            onClick={() => removeTema(temaId)}
                            className="ml-1 h-3 w-3 rounded-full bg-secondary-foreground/20 flex items-center justify-center hover:bg-secondary-foreground/40"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>

                  {temasDisponibles.length > 0 ? (
                    <Select onValueChange={addTema}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Agregar tema..." />
                      </SelectTrigger>
                      <SelectContent>
                        {temasDisponibles
                          .filter((tema) => !selectedTemas.includes(tema.id))
                          .map((tema) => (
                            <SelectItem key={tema.id} value={tema.id}>
                              {tema.nombre}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Cargando temas disponibles...
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Temas seleccionados: {selectedTemas.length}
                  </p>
                </div>
              </div>
            </TabsContent>
            {/* TAB 2: UBICACIÓN */}
            <TabsContent value="ubicacion">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ubicación Residencial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        🚧 Funcionalidad de mapas en desarrollo. Por ahora se
                        puede cargar dirección de texto.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Dirección</label>
                        <Input placeholder="Calle, número, barrio..." />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Localidad</label>
                        <Input placeholder="Ingeniero Jacobacci" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Provincia</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar provincia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rio_negro">Río Negro</SelectItem>
                            <SelectItem value="neuquen">Neuquén</SelectItem>
                            <SelectItem value="chubut">Chubut</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Código Postal
                        </label>
                        <Input placeholder="8532" />
                      </div>
                    </div>

                    {/* Mock de mapa */}
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                      <div className="text-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Mapa interactivo</p>
                        <p className="text-xs">(Próximamente)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* TAB 3: CONTACTO */}
            <TabsContent value="contacto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="telefono_contacto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="+54 2940 123456"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Links profesionales */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <FormLabel>Links Profesionales</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLink}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar link
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {linksProf.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <Select
                            value={link.tipo}
                            onValueChange={(value) =>
                              updateLink(index, "tipo", value)
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="github">GitHub</SelectItem>
                              <SelectItem value="portfolio">
                                Portfolio
                              </SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="https://..."
                            value={link.url}
                            onChange={(e) =>
                              updateLink(index, "url", e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeLink(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* TAB 4: CET (Condicional) */}
            {shouldShowCETTab && (
              <TabsContent value="cet">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Información CET N°26
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tipo === "alumno" && (
                        <FormField
                          control={form.control}
                          name="ano_cursada_actual_cet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Año que cursa actualmente</FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(parseInt(value))
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar año" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5, 6].map((year) => (
                                    <SelectItem
                                      key={year}
                                      value={year.toString()}
                                    >
                                      {year}° Año
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {tipo === "alumno" && (
                        <>
                          <FormField
                            control={form.control}
                            name="ano_egreso_cet"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Año de egreso</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value?.toString() || ""}
                                    type="number"
                                    min="2000"
                                    max={new Date().getFullYear()}
                                    placeholder="2023"
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || null
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="titulacion_obtenida_cet"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Titulación obtenida</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value?.toString() || ""}
                                    placeholder="Técnico en..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="es_ex_alumno_cet"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Ex alumno CET
                            </FormLabel>
                            <FormDescription>
                              Graduado del CET N°26
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
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            {/* TAB 5: TRABAJO (Para alumnos - búsqueda activa) */}
            {shouldShowTrabajoTab && (
              <TabsContent value="trabajo">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Situación Laboral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="estado_situacion_laboral"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Situación actual</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ESTADOS_SITUACION_LABORAL.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
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
                      name="buscando_oportunidades"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Buscando oportunidades
                            </FormLabel>
                            <FormDescription>
                              Interesado en nuevas oportunidades laborales
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
                    <FormField
                      control={form.control}
                      name="historia_de_exito_o_resumen_trayectoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Curriculum</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value?.toString() || ""}
                              placeholder="Breve resumen de logros, proyectos destacados, experiencia relevante..."
                              rows={4}
                            />
                          </FormControl>
                          <FormDescription>
                            Información que será visible en el perfil público
                            (opcional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Solo mostrar si es ex-alumno */}
                    {form.watch("es_ex_alumno_cet") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="empresa_o_institucion_actual"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Empresa/Institución actual</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  placeholder="INTA, Universidad, Empresa..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cargo_actual"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cargo actual</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  placeholder="Técnico, Asistente, etc."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            {/* TAB 6: ORGANIZACIONES (Condicional) */}
            {shouldShowOrganizacionesTab && (
              <TabsContent value="organizaciones">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Organizaciones Relacionadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        🚧 Selector de organizaciones en desarrollo. Se
                        integrará con la tabla persona_organizacion.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            {/* TAB 7: PROFESIONAL (Condicional) */}
            {shouldShowProfesionalTab && (
              <TabsContent value="profesional">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Información Profesional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="titulo_profesional"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título profesional</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value?.toString() || ""}
                                placeholder="Ingeniero Agrónomo, Licenciado en..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="empresa_o_institucion_actual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa/Institución actual</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value?.toString() || ""}
                                placeholder="INTA, Universidad, Empresa..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cargo_actual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo actual</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value?.toString() || ""}
                                placeholder="Director, Investigador, Gerente..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
          {/* 🧪 DEBUG - QUITAR DESPUÉS */}
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-bold">DEBUG INFO:</h4>
            <p>Form valid: {form.formState.isValid ? "✅" : "❌"}</p>
            <p>Form errors: {JSON.stringify(form.formState.errors)}</p>
            <p>User: {user?.id || "No user"}</p>
            <p>
              Selected temas: {selectedTemas.length} = [
              {selectedTemas.join(", ")}]
            </p>
            <p>Temas disponibles: {temasDisponibles.length}</p>
            <Button
              type="button"
              onClick={() => {
                console.log("🔍 Form values:", form.getValues());
                console.log("🔍 Selected temas:", selectedTemas);
                console.log("🔍 Temas disponibles:", temasDisponibles);
                console.log("🔍 User:", user);
              }}
            >
              Log Form State
            </Button>
          </div>
          {/* Botones de acción */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(redirectPath)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Guardando..."
                : initialData
                ? "Actualizar"
                : `Crear ${tipoInfo.label}`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
