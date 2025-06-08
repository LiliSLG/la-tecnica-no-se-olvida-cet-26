"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { supabase } from "@/lib/supabase/supabaseClient";
import { Database } from "@/lib/supabase/types/database.types";
import { PROVINCIAS } from "@/lib/constants/persona";
import { AREAS_DE_INTERES, TIPOS_COLABORACION, CAPACIDADES_PLATAFORMA } from "@/lib/constants/persona";

const personasService = new PersonasService(supabase);
const personaTemaService = new PersonaTemaService(supabase);
const proyectosService = new ProyectosService(supabase);

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
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [selectedProyectoFinal, setSelectedProyectoFinal] = useState<string | null>(null);
  const [linksProfesionales, setLinksProfesionales] = useState<Array<{ plataforma: string; url: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: initialData ? {
      nombre: initialData.nombre,
      apellido: initialData.apellido,
      email: initialData.email,
      activo: initialData.activo,
      tituloProfesional: initialData.titulo_profesional,
      descripcionPersonalOProfesional: initialData.descripcion_personal_o_profesional,
      situacionLaboral: initialData.estado_situacion_laboral,
      ciudad: initialData.ubicacion_residencial?.ciudad || "",
      provincia: initialData.ubicacion_residencial?.provincia || "rio_negro",
      direccion: initialData.ubicacion_residencial?.direccion || "",
      codigoPostal: initialData.ubicacion_residencial?.codigo_postal || "",
      proyectoFinalCETId: initialData.proyecto_final_cet_id,
      linksProfesionales: initialData.links_profesionales || [],
      areasDeInteresOExpertise: initialData.areas_de_interes_o_expertise || [],
      ofreceColaboracionComo: initialData.ofrece_colaboracion_como || [],
      capacidadesPlataforma: initialData.capacidades_plataforma || [],
      esAdmin: initialData.es_admin,
      disponibleParaProyectos: initialData.disponible_para_proyectos,
      anoCursadaActualCET: initialData.ano_cursada_actual_cet,
      anoEgresoCET: initialData.ano_egreso_cet,
      titulacionObtenidaCET: initialData.titulacion_obtenida_cet,
      buscandoOportunidades: initialData.buscando_oportunidades,
      historiaDeExitoOResumenTrayectoria: initialData.historia_de_exito_o_resumen_trayectoria,
      empresaOInstitucionActual: initialData.empresa_o_institucion_actual,
      cargoActual: initialData.cargo_actual,
      telefonoContacto: initialData.telefono_contacto,
      visibilidadPerfil: initialData.visibilidad_perfil,
      estaEliminada: initialData.esta_eliminada,
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
      ciudad: "",
      provincia: "rio_negro",
      direccion: "",
      codigoPostal: "",
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
      // Map all camelCase form data to snake_case backend fields
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
        visibilidad_perfil: data.visibilidadPerfil,
        disponible_para_proyectos: data.disponibleParaProyectos,
        buscando_oportunidades: data.buscandoOportunidades,

        // Content
        biografia: data.historiaDeExitoOResumenTrayectoria ?? null,
        historia_de_exito_o_resumen_trayectoria: data.historiaDeExitoOResumenTrayectoria ?? null,
        foto_url: initialData?.foto_url ?? null,

        // Location
        ubicacion_residencial: {
          ciudad: data.ciudad ?? '',
          provincia: data.provincia ?? 'rio_negro',
          direccion: data.direccion ?? '',
          codigo_postal: data.codigoPostal ?? ''
        },

        // Arrays and collections
        links_profesionales: data.linksProfesionales?.map(link => ({
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

      await onSubmit(backendData);

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
      toast.error(error instanceof Error ? error.message : "Error al guardar la persona");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="mx-auto max-w-screen-md px-4 py-6 space-y-8">
      <div className="border-b pb-4">
        <Tabs defaultValue="basica" className="w-full">
          <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto no-scrollbar pb-2">
            <TabsList className="flex flex-nowrap space-x-2 px-4 sm:px-6 lg:px-8">
              <TabsTrigger value="basica" className="min-w-max">Información Básica</TabsTrigger>
              <TabsTrigger value="actividad" className="min-w-max">Actividad y Trayectoria</TabsTrigger>
              <TabsTrigger value="red" className="min-w-max">Unirme a la red</TabsTrigger>
              <TabsTrigger value="cet" className="min-w-max">Información CET</TabsTrigger>
              <TabsTrigger value="ubicacion" className="min-w-max">Ubicación</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="basica" className="space-y-6 pt-4">
            <h2 className="text-xl font-semibold">Información Básica</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" {...register("nombre")} className="w-full" />
                  {errors.nombre && <p className="text-sm text-red-500 mt-1" role="alert">{errors.nombre.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" {...register("apellido")} className="w-full" />
                  {errors.apellido && <p className="text-sm text-red-500 mt-1" role="alert">{errors.apellido.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" {...register("email")} className="w-full" />
                  {errors.email && <p className="text-sm text-red-500 mt-1" role="alert">{errors.email.message}</p>}
                </div>
              </div>
              <div className="col-span-full">
                <div className="space-y-2">
                  <Label htmlFor="historiaDeExitoOResumenTrayectoria">Biografía</Label>
                  <Textarea id="historiaDeExitoOResumenTrayectoria" {...register("historiaDeExitoOResumenTrayectoria")} className="w-full min-h-[100px]" />
                  {errors.historiaDeExitoOResumenTrayectoria && (
                    <p id="biografia-error" className="text-sm text-red-500 mt-1" role="alert">
                      {errors.historiaDeExitoOResumenTrayectoria.message}
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
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="activo">Activo</Label>
                  {errors.activo && <p className="text-red-500">{errors.activo.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="esAdmin"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="esAdmin">Es Administrador</Label>
                  {errors.esAdmin && <p className="text-red-500">{errors.esAdmin.message}</p>}
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
                  <Input id="tituloProfesional" {...register("tituloProfesional")} className="w-full" />
                  {errors.tituloProfesional && <p className="text-red-500">{errors.tituloProfesional.message}</p>}
                </div>
              </div>
              <div className="col-span-full">
                <div className="space-y-2">
                  <Label htmlFor="descripcionPersonalOProfesional">Descripción Personal o Profesional</Label>
                  <Textarea id="descripcionPersonalOProfesional" {...register("descripcionPersonalOProfesional")} className="w-full min-h-[100px]" />
                  {errors.descripcionPersonalOProfesional && <p className="text-red-500">{errors.descripcionPersonalOProfesional.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="empresaOInstitucionActual">Empresa o Institución Actual</Label>
                  <Input id="empresaOInstitucionActual" {...register("empresaOInstitucionActual")} className="w-full" />
                  {errors.empresaOInstitucionActual && <p className="text-red-500">{errors.empresaOInstitucionActual.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="cargoActual">Cargo Actual</Label>
                  <Input id="cargoActual" {...register("cargoActual")} className="w-full" />
                  {errors.cargoActual && <p className="text-red-500">{errors.cargoActual.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="telefonoContacto">Teléfono de Contacto</Label>
                  <Input id="telefonoContacto" {...register("telefonoContacto")} className="w-full" />
                  {errors.telefonoContacto && <p className="text-red-500">{errors.telefonoContacto.message}</p>}
                </div>
              </div>
              <div className="col-span-full">
                <div className="space-y-2">
                  <Label>Links Profesionales</Label>
                  {linksProfesionales.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-end">
                      <div className="w-1/3">
                        <Label htmlFor={`plataforma-${index}`} className="sr-only">Plataforma</Label>
                        <Input
                          id={`plataforma-${index}`}
                          value={link.plataforma}
                          onChange={(e) => {
                            const newLinks = [...linksProfesionales];
                            newLinks[index].plataforma = e.target.value;
                            setLinksProfesionales(newLinks);
                            setValue(`linksProfesionales.${index}.plataforma`, e.target.value);
                          }}
                          placeholder="Plataforma (ej: LinkedIn)" className="w-full"
                        />
                      </div>
                      <div className="w-2/3">
                        <Label htmlFor={`url-${index}`} className="sr-only">URL</Label>
                        <Input
                          id={`url-${index}`}
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...linksProfesionales];
                            newLinks[index].url = e.target.value;
                            setLinksProfesionales(newLinks);
                            setValue(`linksProfesionales.${index}.url`, e.target.value);
                          }}
                          placeholder="URL" className="w-full"
                        />
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        const newLinks = linksProfesionales.filter((_, i) => i !== index);
                        setLinksProfesionales(newLinks);
                        setValue("linksProfesionales", newLinks);
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
          <TabsContent value="red" className="space-y-6 pt-4">
            <h2 className="text-xl font-semibold">Unirme a la red</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full">
                <div className="space-y-2">
                  <Label>Áreas de Interés o Expertise</Label>
                  <MultiSelect
                    selected={selectedTemas}
                    onChange={(values) => setSelectedTemas(values)}
                    options={AREAS_DE_INTERES.map(area => ({ value: area, label: area.replace(/_/g, ' ').replace(/\\b\\w/g, (char) => char.toUpperCase()) }))}
                    placeholder="Seleccionar áreas de interés"
                  />
                  {errors.areasDeInteresOExpertise && <p className="text-red-500">{errors.areasDeInteresOExpertise.message}</p>}
                </div>
              </div>
              <div className="col-span-full">
                <div className="space-y-2">
                  <Label>Ofrece Colaboración Como</Label>
                  <MultiSelect
                    selected={watch("ofreceColaboracionComo") || []}
                    onChange={(values: string[]) => setValue("ofreceColaboracionComo", values)}
                    options={TIPOS_COLABORACION.map(tipo => ({ value: tipo, label: tipo.replace(/_/g, ' ').replace(/\\b\\w/g, (char) => char.toUpperCase()) }))}
                    placeholder="Seleccionar roles de colaboración"
                  />
                  {errors.ofreceColaboracionComo && <p className="text-red-500">{errors.ofreceColaboracionComo.message}</p>}
                </div>
              </div>
              <div className="col-span-full">
                <div className="space-y-2">
                  <Label>Capacidades de Plataforma</Label>
                  <MultiSelect
                    selected={watch("capacidadesPlataforma") || []}
                    onChange={(values: string[]) => setValue("capacidadesPlataforma", values)}
                    options={CAPACIDADES_PLATAFORMA}
                    placeholder="Seleccionar capacidades de plataforma"
                  />
                  {errors.capacidadesPlataforma && <p className="text-red-500">{errors.capacidadesPlataforma.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="buscandoOportunidades"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="buscandoOportunidades">Buscando Oportunidades</Label>
                  {errors.buscandoOportunidades && <p className="text-red-500">{errors.buscandoOportunidades.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="disponibleParaProyectos"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="disponibleParaProyectos">Disponible para Proyectos</Label>
                  {errors.disponibleParaProyectos && <p className="text-red-500">{errors.disponibleParaProyectos.message}</p>}
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
                  <Input id="anoCursadaActualCET" {...register("anoCursadaActualCET", { valueAsNumber: true })} type="number" className="w-full" />
                  {errors.anoCursadaActualCET && <p className="text-red-500">{errors.anoCursadaActualCET.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="anoEgresoCET">Año de Egreso</Label>
                  <Input id="anoEgresoCET" {...register("anoEgresoCET", { valueAsNumber: true })} type="number" className="w-full" />
                  {errors.anoEgresoCET && <p className="text-red-500">{errors.anoEgresoCET.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="titulacionObtenidaCET">Titulación Obtenida</Label>
                  <Input id="titulacionObtenidaCET" {...register("titulacionObtenidaCET")} className="w-full" />
                  {errors.titulacionObtenidaCET && <p className="text-red-500">{errors.titulacionObtenidaCET.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="proyectoFinalCETId">Proyecto Final CET</Label>
                  <Select
                    onValueChange={(value) => setValue("proyectoFinalCETId", value)}
                    defaultValue={watch("proyectoFinalCETId") || ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add options dynamically from projectsService.getAll() */}
                      <SelectItem value="">Ninguno</SelectItem>
                      {/* Example: */}
                      {/* {proyectos.map((proyecto) => (
                        <SelectItem key={proyecto.id} value={proyecto.id}>
                          {proyecto.nombre}
                        </SelectItem>
                      ))} */}
                    </SelectContent>
                  </Select>
                  {errors.proyectoFinalCETId && <p className="text-red-500">{errors.proyectoFinalCETId.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="situacionLaboral">Situación Laboral</Label>
                  <Select
                    onValueChange={(value) => setValue("situacionLaboral", value as PersonaFormData["situacionLaboral"])}
                    defaultValue={watch("situacionLaboral")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar situación laboral" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_especificado">No especificado</SelectItem>
                      <SelectItem value="empleado">Empleado</SelectItem>
                      <SelectItem value="buscando">Buscando empleo</SelectItem>
                      <SelectItem value="independiente">Independiente</SelectItem>
                      <SelectItem value="estudiante">Estudiante</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.situacionLaboral && <p className="text-red-500">{errors.situacionLaboral.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="visibilidadPerfil">Visibilidad del Perfil</Label>
                  <Select
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
                  </Select>
                  {errors.visibilidadPerfil && <p className="text-red-500">{errors.visibilidadPerfil.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="esExAlumnoCET"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="esExAlumnoCET">Es Ex-alumno CET</Label>
                  {errors.esExAlumnoCET && <p className="text-red-500">{errors.esExAlumnoCET.message}</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Ubicación */}
          <TabsContent value="ubicacion" className="space-y-6 pt-4">
            <h2 className="text-xl font-semibold">Ubicación</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2 w-full">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input id="ciudad" {...register("ciudad")} className="w-full" />
                  {errors.ciudad && <p className="text-red-500">{errors.ciudad.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2 w-full">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Select onValueChange={(value) => setValue("provincia", value as Provincia)} defaultValue={watch("provincia")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCIAS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.provincia && <p className="text-red-500">{errors.provincia.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2 w-full">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" {...register("direccion")} className="w-full" />
                  {errors.direccion && <p className="text-red-500">{errors.direccion.message}</p>}
                </div>
              </div>
              <div className="col-span-full sm:col-span-1">
                <div className="space-y-2 w-full">
                  <Label htmlFor="codigoPostal">Código Postal</Label>
                  <Input id="codigoPostal" {...register("codigoPostal")} className="w-full" />
                  {errors.codigoPostal && <p className="text-red-500">{errors.codigoPostal.message}</p>}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
} 