"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";

import { personaSchema, type PersonaFormData } from "@/lib/validations/persona";
import { PersonasService } from "@/lib/supabase/services/personasService";
import { PersonaTemaService } from "@/lib/supabase/services/personaTemaService";
import { ProyectosService } from "@/lib/supabase/services/proyectosService";
import { TemasService } from "@/lib/supabase/services/temasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Database } from "@/lib/supabase/types/database.types";
import { PROVINCIAS } from "@/lib/constants/persona";
import { AREAS_DE_INTERES, TIPOS_COLABORACION, CAPACIDADES_PLATAFORMA } from "@/lib/constants/persona";
import { cn } from "@/lib/utils";
import { MappedTema } from "@/lib/supabase/services/temasService";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl
} from '@/components/ui/form';

const personasService = new PersonasService(supabase);
const personaTemaService = new PersonaTemaService(supabase);
const proyectosService = new ProyectosService(supabase);
const temasService = new TemasService(supabase);

type Persona = Database['public']['Tables']['personas']['Row'];
type Provincia = typeof PROVINCIAS[number]['value'];

interface PersonaFormProps {
  initialData?: Persona;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
}

export default function PersonaForm({ initialData, onSubmit, submitLabel = "Guardar" }: PersonaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.foto_url || null);
  const [selectedProyectoFinal, setSelectedProyectoFinal] = useState<string | null>(null);
  const [linksProfesionales, setLinksProfesionales] = useState<Array<{ plataforma: string; url: string }>>([]);
  const [currentlyOpenDropdown, setCurrentlyOpenDropdown] = useState<string | null>(null);
  const [temas, setTemas] = useState<MappedTema[]>([]);
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [isLoadingTemas, setIsLoadingTemas] = useState(false);
  const [temaError, setTemaError] = useState<string | null>(null);

  const methods = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: initialData ? {
      nombre: initialData.nombre,
      apellido: initialData.apellido || "",
      email: initialData.email,
      activo: initialData.activo,
      tituloProfesional: initialData.titulo_profesional,
      descripcionPersonalOProfesional: initialData.descripcion_personal_o_profesional,
      situacionLaboral: initialData.estado_situacion_laboral || "no_especificado",
      ubicacionResidencial: initialData.ubicacion_residencial ? {
        direccion: (initialData.ubicacion_residencial as any)?.direccion || undefined,
        provincia: (initialData.ubicacion_residencial as any)?.provincia || undefined,
        localidad: (initialData.ubicacion_residencial as any)?.localidad || undefined,
        codigo_postal: (initialData.ubicacion_residencial as any)?.codigo_postal || undefined,
        lat: (initialData.ubicacion_residencial as any)?.lat || undefined,
        lng: (initialData.ubicacion_residencial as any)?.lng || undefined,
      } : undefined,
      proyectoFinalCETId: initialData.proyecto_final_cet_id,
      linksProfesionales: (initialData.links_profesionales as any)?.map((link: any) => ({
        plataforma: link.platform || "",
        url: link.url || "",
      })) || [],
      areasDeInteresOExpertise: initialData.areas_de_interes_o_expertise || [],
      ofreceColaboracionComo: initialData.ofrece_colaboracion_como || [],
      capacidadesPlataforma: initialData.capacidades_plataforma || [],
      esAdmin: initialData.es_admin || false,
      disponibleParaProyectos: initialData.disponible_para_proyectos || false,
      anoCursadaActualCET: initialData.ano_cursada_actual_cet,
      anoEgresoCET: initialData.ano_egreso_cet,
      titulacionObtenidaCET: initialData.titulacion_obtenida_cet,
      buscandoOportunidades: initialData.buscando_oportunidades || false,
      historiaDeExitoOResumenTrayectoria: initialData.historia_de_exito_o_resumen_trayectoria,
      empresaOInstitucionActual: initialData.empresa_o_institucion_actual,
      cargoActual: initialData.cargo_actual,
      telefonoContacto: initialData.telefono_contacto,
      visibilidadPerfil: initialData.visibilidad_perfil || "publico",
      estaEliminada: initialData.esta_eliminada || false,
      eliminadoPorUid: initialData.eliminado_por_uid,
      eliminadoEn: initialData.eliminado_en,
    } : {
      nombre: "",
      apellido: "",
      email: null,
      activo: true,
      tituloProfesional: null,
      descripcionPersonalOProfesional: null,
      situacionLaboral: "no_especificado",
      ubicacionResidencial: undefined,
      proyectoFinalCETId: null,
      linksProfesionales: [],
      areasDeInteresOExpertise: [],
      ofreceColaboracionComo: [],
      capacidadesPlataforma: [],
      esAdmin: false,
      disponibleParaProyectos: false,
      anoCursadaActualCET: null,
      anoEgresoCET: null,
      titulacionObtenidaCET: null,
      buscandoOportunidades: false,
      historiaDeExitoOResumenTrayectoria: null,
      empresaOInstitucionActual: null,
      cargoActual: null,
      telefonoContacto: null,
      visibilidadPerfil: "publico",
      estaEliminada: false,
      eliminadoPorUid: null,
      eliminadoEn: null,
    },
  });

  // Fetch temas on component mount
  useEffect(() => {
    const fetchTemas = async () => {
      try {
        setIsLoadingTemas(true);
        setTemaError(null);
        const result = await temasService.getPublicMapped();
        if (!result.success) {
          throw new Error(result.error?.message || "Error al cargar los temas");
        }
        setTemas(result.data || []);
      } catch (error) {
        console.error("Error fetching temas:", error);
        setTemaError(error instanceof Error ? error.message : "Error al cargar los temas");
        toast.error("Error al cargar los temas");
      } finally {
        setIsLoadingTemas(false);
      }
    };
    fetchTemas();
  }, []);

  // Fetch selected temas for edit mode
  useEffect(() => {
    const fetchSelectedTemas = async () => {
      if (!initialData?.id) return;
      
      try {
        setIsLoadingTemas(true);
        setTemaError(null);
        const result = await temasService.getByPersona(initialData.id);
        if (!result.success) {
          throw new Error(result.error?.message || "Error al cargar los temas seleccionados");
        }
        const temaIds = result.data?.map(tema => tema.id) || [];
        setSelectedTemas(temaIds);
        // Update form field value
        methods.setValue('temas', temaIds);
      } catch (error) {
        console.error("Error fetching selected temas:", error);
        setTemaError(error instanceof Error ? error.message : "Error al cargar los temas seleccionados");
        toast.error("Error al cargar los temas seleccionados");
        // Set empty array as fallback
        setSelectedTemas([]);
        methods.setValue('temas', []);
      } finally {
        setIsLoadingTemas(false);
      }
    };
    fetchSelectedTemas();
  }, [initialData?.id, methods.setValue]);

  // Add error logging
  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      if (methods.formState.errors.ubicacionResidencial) {
        console.error('UbicacionResidencial validation errors:', methods.formState.errors.ubicacionResidencial);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods.watch, methods.formState.errors]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const uploadProfilePhoto = async (personaId: string): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filename = `persona-${personaId}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('personas')
        .upload(filename, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('personas')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Error al subir la imagen');
      return null;
    }
  };

  const onSubmitForm = async (data: PersonaFormData) => {
    try {
      setIsLoading(true);
      console.log('Form data before submit:', data); // Debug log

      // Check for validation errors
      if (Object.keys(methods.formState.errors).length > 0) {
        console.error('Form validation errors:', methods.formState.errors);
        toast.error('Hay errores de validación en el formulario');
        return;
      }

      const backendData: Omit<Persona, 'id'> = {
        // Basic information
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email ?? null,
        activo: data.activo,
        es_admin: data.esAdmin,

        // Professional information
        titulo_profesional: data.tituloProfesional ?? null,
        descripcion_personal_o_profesional: data.descripcionPersonalOProfesional ?? null,
        empresa_o_institucion_actual: data.empresaOInstitucionActual ?? null,
        cargo_actual: data.cargoActual ?? null,
        telefono_contacto: data.telefonoContacto ?? null,

        // CET information
        ano_cursada_actual_cet: data.anoCursadaActualCET ?? null,
        ano_egreso_cet: data.anoEgresoCET ?? null,
        titulacion_obtenida_cet: data.titulacionObtenidaCET ?? null,
        proyecto_final_cet_id: data.proyectoFinalCETId ?? null,
        estado_situacion_laboral: data.situacionLaboral ?? "no_especificado",

        // Profile settings
        visibilidad_perfil: data.visibilidadPerfil as Database['public']['Enums']['visibilidad_perfil_enum'],
        disponible_para_proyectos: data.disponibleParaProyectos,
        buscando_oportunidades: data.buscandoOportunidades,

        // Content
        biografia: data.historiaDeExitoOResumenTrayectoria ?? null,
        historia_de_exito_o_resumen_trayectoria: data.historiaDeExitoOResumenTrayectoria ?? null,
        foto_url: initialData?.foto_url ?? null,

        // Location - only include if at least one field is filled
        ubicacion_residencial: data.ubicacionResidencial && 
          (data.ubicacionResidencial.direccion || 
           data.ubicacionResidencial.provincia || 
           data.ubicacionResidencial.localidad || 
           data.ubicacionResidencial.codigo_postal ||
           data.ubicacionResidencial.lat ||
           data.ubicacionResidencial.lng) ? {
          direccion: data.ubicacionResidencial.direccion || null,
          provincia: data.ubicacionResidencial.provincia || null,
          localidad: data.ubicacionResidencial.localidad || null,
          codigo_postal: data.ubicacionResidencial.codigo_postal || null,
          lat: data.ubicacionResidencial.lat || null,
          lng: data.ubicacionResidencial.lng || null,
        } : null,

        // Arrays and collections
        links_profesionales: data.linksProfesionales?.map((link: any) => ({
          platform: link.plataforma,
          url: link.url,
        })) ?? [],

        areas_de_interes_o_expertise: data.areasDeInteresOExpertise ?? [],
        ofrece_colaboracion_como: data.ofreceColaboracionComo ?? [],
        capacidades_plataforma: data.capacidadesPlataforma ?? [],

        // System managed fields
        categoria_principal: initialData?.categoria_principal ?? "ninguno_asignado",
        es_ex_alumno_cet: initialData?.es_ex_alumno_cet ?? false,

        // Metadata
        created_at: initialData?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        eliminado_en: initialData?.eliminado_en ?? null,
        eliminado_por_uid: initialData?.eliminado_por_uid ?? null,
        esta_eliminada: initialData?.esta_eliminada ?? false,
      };

      console.log('Backend data:', backendData); // Debug log

      // Handle persona creation/update
      let personaId: string;
      if (initialData?.id) {
        const updateResult = await personasService.update(initialData.id, backendData);
        if (!updateResult.success) {
          throw new Error(updateResult.error?.message || "Error al actualizar la persona");
        }
        personaId = initialData.id;
      } else {
        const createResult = await personasService.create(backendData);
        if (!createResult.success || !createResult.data) {
          throw new Error(createResult.error?.message || "Error al crear la persona");
        }
        personaId = createResult.data.id;
      }

      // Handle tema relationships
      if (personaId) {
        // Get current temas
        const currentTemasResult = await personaTemaService.getTemasByPersona(personaId);
        const currentTemas = currentTemasResult.success ? currentTemasResult.data?.map(pt => pt.tema_id) || [] : [];

        // Remove temas that are no longer selected
        for (const temaId of currentTemas) {
          if (!selectedTemas.includes(temaId)) {
            await personaTemaService.removeTemaFromPersona(personaId, temaId);
          }
        }

        // Add new temas
        for (const temaId of selectedTemas) {
          if (!currentTemas.includes(temaId)) {
            await personaTemaService.addTemaToPersona(personaId, temaId);
          }
        }
      }

      await onSubmit(data);

      // If there's a selected file, try to upload it
      if (selectedFile && initialData) {
        const photoUrl = await uploadProfilePhoto(initialData.id);
        if (photoUrl) {
          // Update persona with photo URL
          await personasService.update(initialData.id, {
            foto_url: photoUrl
          });
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Error al guardar la persona');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitForm)} className="mx-auto max-w-screen-md px-4 py-6 space-y-8">
        <div className="border-b pb-4">
          <Tabs defaultValue="basica" className="w-full overflow-x-visible overflow-y-visible" onValueChange={() => setCurrentlyOpenDropdown(null)}
          >
            {/*<TabsList className="grid w-full grid-cols-5">*/}
            <TabsList className="overflow-x-auto whitespace-nowrap flex gap-2 px-2">

              <TabsTrigger value="basica">Información Básica</TabsTrigger>
              <TabsTrigger value="actividad">Actividad y Trayectoria</TabsTrigger>
              <TabsTrigger value="red">Unirme a la red</TabsTrigger>
              <TabsTrigger value="cet">Información CET</TabsTrigger>
              <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
            </TabsList>
            <TabsContent value="basica" className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold">Información Básica</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" {...methods.register("nombre")} className="w-full" />
                    {methods.formState.errors.nombre && <p className="text-sm text-red-500 mt-1" role="alert">{methods.formState.errors.nombre.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" {...methods.register("apellido")} className="w-full" />
                    {methods.formState.errors.apellido && <p className="text-sm text-red-500 mt-1" role="alert">{methods.formState.errors.apellido.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...methods.register("email")} className="w-full" />
                    {methods.formState.errors.email && <p className="text-sm text-red-500 mt-1" role="alert">{methods.formState.errors.email.message}</p>}
                  </div>
                </div>
                <div className="col-span-full">
                  <div className="space-y-2">
                    <Label htmlFor="historiaDeExitoOResumenTrayectoria">Biografía</Label>
                    <Textarea id="historiaDeExitoOResumenTrayectoria" {...methods.register("historiaDeExitoOResumenTrayectoria")} className="w-full min-h-[100px]" />
                    {methods.formState.errors.historiaDeExitoOResumenTrayectoria && (
                      <p id="biografia-error" className="text-sm text-red-500 mt-1" role="alert">
                        {methods.formState.errors.historiaDeExitoOResumenTrayectoria.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-2 lg:col-span-3">
                  <div className="space-y-2">
                    <Label htmlFor="fotoPerfil">Foto de Perfil</Label>
                    <div className="flex items-center gap-4">
                      {previewUrl && (
                        <Image src={previewUrl} alt="Preview" width={80} height={80} className="object-cover rounded-full" />
                      )}
                      <div>
                        <Input
                          id="fotoPerfil"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="w-full file:text-primary file:bg-primary/10 file:border-none file:hover:bg-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="activo"
                      control={methods.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="activo">Activo</Label>
                    {methods.formState.errors.activo && <p className="text-red-500">{methods.formState.errors.activo.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="esAdmin"
                      control={methods.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="esAdmin">Es Administrador</Label>
                    {methods.formState.errors.esAdmin && <p className="text-red-500">{methods.formState.errors.esAdmin.message}</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Actividad y Trayectoria */}
            <TabsContent value="actividad" className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold">Actividad y Trayectoria</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="tituloProfesional">Título Profesional</Label>
                    <Input id="tituloProfesional" {...methods.register("tituloProfesional")} className="w-full" />
                    {methods.formState.errors.tituloProfesional && <p className="text-red-500">{methods.formState.errors.tituloProfesional.message}</p>}
                  </div>
                </div>
                <div className="col-span-full">
                  <div className="space-y-2">
                    <Label htmlFor="descripcionPersonalOProfesional">Descripción Personal o Profesional</Label>
                    <Textarea id="descripcionPersonalOProfesional" {...methods.register("descripcionPersonalOProfesional")} className="w-full resize-y" rows={3} />
                    {methods.formState.errors.descripcionPersonalOProfesional && <p className="text-red-500">{methods.formState.errors.descripcionPersonalOProfesional.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="empresaOInstitucionActual">Empresa o Institución Actual</Label>
                    <Input id="empresaOInstitucionActual" {...methods.register("empresaOInstitucionActual")} className="w-full" />
                    {methods.formState.errors.empresaOInstitucionActual && <p className="text-red-500">{methods.formState.errors.empresaOInstitucionActual.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="cargoActual">Cargo Actual</Label>
                    <Input id="cargoActual" {...methods.register("cargoActual")} className="w-full" />
                    {methods.formState.errors.cargoActual && <p className="text-red-500">{methods.formState.errors.cargoActual.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="telefonoContacto">Teléfono de Contacto</Label>
                    <Input id="telefonoContacto" {...methods.register("telefonoContacto")} className="w-full" />
                    {methods.formState.errors.telefonoContacto && <p className="text-red-500">{methods.formState.errors.telefonoContacto.message}</p>}
                  </div>
                </div>
                <div className="col-span-full">
                  <div className="space-y-2">
                    <Label>Links Profesionales</Label>
                    {linksProfesionales.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Plataforma (Ej: LinkedIn)"
                          value={link.plataforma}
                          onChange={(e) => {
                            const newLinks = [...linksProfesionales];
                            newLinks[index].plataforma = e.target.value;
                            setLinksProfesionales(newLinks);
                            methods.setValue("linksProfesionales", newLinks);
                          }}
                          className="w-full"
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...linksProfesionales];
                            newLinks[index].url = e.target.value;
                            setLinksProfesionales(newLinks);
                            methods.setValue("linksProfesionales", newLinks);
                          }}
                          className="w-full"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          const newLinks = linksProfesionales.filter((_, i) => i !== index);
                          setLinksProfesionales(newLinks);
                          methods.setValue("linksProfesionales", newLinks);
                        }}>
                          Remover
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => setLinksProfesionales([...linksProfesionales, { plataforma: "", url: "" }])}>
                      Agregar Link
                    </Button>
                    <p className="text-sm text-gray-500">
                      Agrega tus perfiles profesionales (LinkedIn, GitHub, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Unirme a la red */}
            <TabsContent
              value="red"
              className="space-y-6 pt-4"
              style={{
                overflowX: currentlyOpenDropdown ? 'visible' : undefined,
                overflowY: currentlyOpenDropdown ? 'visible' : undefined,
                zIndex: 0,  // 🚀 ESTA LÍNEA
              }}
            >
              <h2 className="text-xl font-semibold">Unirme a la red</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full">
                  <div className="space-y-2">
                    <Label>Áreas de Interés o Expertise</Label>

                    <MultiSelect
                      selected={methods.watch("areasDeInteresOExpertise") || []}
                      onChange={(values: string[]) => methods.setValue("areasDeInteresOExpertise", values)}
                      open={currentlyOpenDropdown === "areasInteres"}
                      onOpenChange={(open) => {
                        setCurrentlyOpenDropdown(open ? "areasInteres" : null);
                      }}
                      options={AREAS_DE_INTERES.map((item) => ({ value: item, label: item }))}
                      placeholder="Seleccionar áreas de interés"
                    />


                    {methods.formState.errors.areasDeInteresOExpertise && <p className="text-red-500">{methods.formState.errors.areasDeInteresOExpertise.message}</p>}
                  </div>
                </div>
                <div className="col-span-full">
                  <div className="space-y-2">
                    <Label>Ofrece Colaboración Como</Label>

                    <MultiSelect
                      selected={methods.watch("ofreceColaboracionComo") || []}
                      onChange={(values: string[]) => methods.setValue("ofreceColaboracionComo", values)}
                      open={currentlyOpenDropdown === "colaboracion"}
                      onOpenChange={(open) => {
                        setCurrentlyOpenDropdown(open ? "colaboracion" : null);
                      }}
                      options={TIPOS_COLABORACION.map(tipo => ({ value: tipo, label: tipo.replace(/_/g, ' ').replace(/\\b\\w/g, (char) => char.toUpperCase()) }))}
                      placeholder="Seleccionar roles de colaboración"
                    />

                    {methods.formState.errors.ofreceColaboracionComo && <p className="text-red-500">{methods.formState.errors.ofreceColaboracionComo.message}</p>}
                  </div>
                </div>
                <div className="col-span-full">
                  <div className="space-y-2">
                    <Label>Capacidades de Plataforma</Label>

                    <MultiSelect
                      selected={methods.watch("capacidadesPlataforma") || []}
                      onChange={(values: string[]) => methods.setValue("capacidadesPlataforma", values)}
                      open={currentlyOpenDropdown === "capacidades"}
                      onOpenChange={(open) => {
                        setCurrentlyOpenDropdown(open ? "capacidades" : null);
                      }}
                      options={CAPACIDADES_PLATAFORMA}
                      placeholder="Seleccionar capacidades de plataforma"
                    />


                    {methods.formState.errors.capacidadesPlataforma && <p className="text-red-500">{methods.formState.errors.capacidadesPlataforma.message}</p>}
                  </div>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="disponibleParaProyectos"
                      control={methods.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="disponibleParaProyectos">Disponible para Proyectos</Label>
                    {methods.formState.errors.disponibleParaProyectos && <p className="text-red-500">{methods.formState.errors.disponibleParaProyectos.message}</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Información CET */}
            <TabsContent value="cet" className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold">Información CET</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="anoCursadaActualCET">Año de Cursada Actual</Label>
                    <Input id="anoCursadaActualCET" {...methods.register("anoCursadaActualCET", { valueAsNumber: true })} type="number" className="w-full" />
                    {methods.formState.errors.anoCursadaActualCET && <p className="text-red-500">{methods.formState.errors.anoCursadaActualCET.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="anoEgresoCET">Año de Egreso</Label>
                    <Input id="anoEgresoCET" {...methods.register("anoEgresoCET", { valueAsNumber: true })} type="number" className="w-full" />
                    {methods.formState.errors.anoEgresoCET && <p className="text-red-500">{methods.formState.errors.anoEgresoCET.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="titulacionObtenidaCET">Titulación Obtenida</Label>
                    <Input id="titulacionObtenidaCET" {...methods.register("titulacionObtenidaCET")} className="w-full" />
                    {methods.formState.errors.titulacionObtenidaCET && <p className="text-red-500">{methods.formState.errors.titulacionObtenidaCET.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="proyectoFinalCETId">Proyecto Final CET</Label>
                    <Select
                      value={methods.watch("proyectoFinalCETId") ?? ""}
                      onValueChange={(value) => methods.setValue("proyectoFinalCETId", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Cuando tengas los proyectos, los mapeas aquí */}
                        {/* {proyectos.map((proyecto) => (
      <SelectItem key={proyecto.id} value={proyecto.id}>
        {proyecto.nombre}
      </SelectItem>
    ))} */}
                      </SelectContent>
                    </Select>

                    {methods.formState.errors.proyectoFinalCETId && <p className="text-red-500">{methods.formState.errors.proyectoFinalCETId.message}</p>}
                  </div>
                </div>

                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="situacionLaboral">Situación Laboral</Label>
                    <Select
                      onValueChange={(value) => methods.setValue("situacionLaboral", value as PersonaFormData["situacionLaboral"])}
                      defaultValue={methods.watch("situacionLaboral")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar situación laboral" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="bg-white">
                        <SelectItem value="no_especificado">No especificado</SelectItem>
                        <SelectItem value="empleado">Empleado</SelectItem>
                        <SelectItem value="buscando">Buscando empleo</SelectItem>
                        <SelectItem value="independiente">Independiente</SelectItem>
                        <SelectItem value="estudiante">Estudiante</SelectItem>
                      </SelectContent>
                    </Select>
                    {methods.formState.errors.situacionLaboral && <p className="text-red-500">{methods.formState.errors.situacionLaboral.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="space-y-2">
                    <Label htmlFor="visibilidadPerfil">Visibilidad del Perfil</Label>
                    {/*<Select
                      onValueChange={(value) => setValue("visibilidadPerfil", value as PersonaFormData["visibilidadPerfil"])}
                      defaultValue={watch("visibilidadPerfil")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar visibilidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publico">Público</SelectItem>
                        <SelectItem value="privado">Privado (solo administradores)</SelectItem>
                        <SelectItem value="solo_cet">Solo miembros CET</SelectItem>
                      </SelectContent>
                    </Select>*/}
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={methods.watch("visibilidadPerfil") === "publico"}
                        onCheckedChange={(checked) =>
                          methods.setValue("visibilidadPerfil", checked ? "publico" : "privado")
                        }
                      />
                      <Label className="text-sm">
                        {methods.watch("visibilidadPerfil") === "publico"
                          ? "Perfil Público"
                          : "Perfil Privado"}
                      </Label>
                    </div>

                    {methods.formState.errors.visibilidadPerfil && <p className="text-red-500">{methods.formState.errors.visibilidadPerfil.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="esExAlumnoCET"
                      control={methods.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="esExAlumnoCET">Es Ex-alumno CET</Label>
                    {methods.formState.errors.esExAlumnoCET && <p className="text-red-500">{methods.formState.errors.esExAlumnoCET.message}</p>}
                  </div>
                </div>
                <div className="col-span-full sm:col-span-1">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="buscandoOportunidades"
                      control={methods.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="buscandoOportunidades">Buscando Oportunidades</Label>
                    {methods.formState.errors.buscandoOportunidades && <p className="text-red-500">{methods.formState.errors.buscandoOportunidades.message}</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Ubicación */}
            <TabsContent value="ubicacion" className="space-y-6 pt-4">
              <h2 className="text-xl font-semibold">Ubicación (Opcional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ubicacionResidencial.direccion">Dirección</Label>
                  <Input
                    id="ubicacionResidencial.direccion"
                    {...methods.register("ubicacionResidencial.direccion", { 
                      required: false,
                      setValueAs: (v) => v === "" ? undefined : v
                    })}
                    placeholder="Ingrese su dirección (opcional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacionResidencial.provincia">Provincia</Label>
                  <Controller
                    name="ubicacionResidencial.provincia"
                    control={methods.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una provincia (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCIAS.map((provincia) => (
                            <SelectItem key={provincia.value} value={provincia.value}>
                              {provincia.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacionResidencial.localidad">Localidad</Label>
                  <Input
                    id="ubicacionResidencial.localidad"
                    {...methods.register("ubicacionResidencial.localidad", { 
                      required: false,
                      setValueAs: (v) => v === "" ? undefined : v
                    })}
                    placeholder="Ingrese su localidad (opcional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacionResidencial.codigo_postal">Código Postal</Label>
                  <Input
                    id="ubicacionResidencial.codigo_postal"
                    {...methods.register("ubicacionResidencial.codigo_postal", { 
                      required: false,
                      setValueAs: (v) => v === "" ? undefined : v
                    })}
                    placeholder="Ingrese su código postal (opcional)"
                  />
                </div>
              </div>

              {/* Geographic Location Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ubicación Geográfica (Opcional)</h3>
                <p className="text-sm text-muted-foreground">
                  In the future, you'll be able to select your location from a map.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ubicacionResidencial.lat">Latitud</Label>
                    <Input
                      id="ubicacionResidencial.lat"
                      type="number"
                      step="any"
                      {...methods.register("ubicacionResidencial.lat", {
                        required: false,
                        setValueAs: (v) => v === "" ? undefined : Number(v)
                      })}
                      placeholder="Ej: -41.1335 (opcional)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ubicacionResidencial.lng">Longitud</Label>
                    <Input
                      id="ubicacionResidencial.lng"
                      type="number"
                      step="any"
                      {...methods.register("ubicacionResidencial.lng", {
                        required: false,
                        setValueAs: (v) => v === "" ? undefined : Number(v)
                      })}
                      placeholder="Ej: -71.3103 (opcional)"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <div className="space-y-2">
              <FormField
                control={methods.control}
                name="temas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temas</FormLabel>
                    <FormControl>
                      {isLoadingTemas ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Cargando temas...</span>
                        </div>
                      ) : temaError ? (
                        <div className="text-sm text-red-500">
                          {temaError}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => {
                              setTemaError(null);
                              methods.setValue('temas', []);
                            }}
                          >
                            Reintentar
                          </Button>
                        </div>
                      ) : (
                        <MultiSelect
                          options={temas.map(tema => ({ label: tema.nombre, value: tema.id }))}
                          selected={selectedTemas}
                          onChange={(values: string[]) => {
                            setTemaError(null);
                            setSelectedTemas(values);
                            methods.setValue('temas', values);
                          }}
                          placeholder="Seleccione temas"
                        />
                      )}
                    </FormControl>
                    <FormDescription>
                      Selecciona los temas relacionados con esta persona
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-8 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (methods.formState.isDirty) {
                    if (confirm("Hay cambios sin guardar. ¿Seguro que quieres cancelar?")) {
                      router.push("/admin/gestion-personas");
                    }
                  } else {
                    router.push("/admin/gestion-personas");
                  }
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>

              <Button type="submit" className="min-w-[120px]" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </Tabs>
        </div>
      </form>
    </FormProvider>
  );
} 