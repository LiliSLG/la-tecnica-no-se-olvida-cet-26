"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";

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

const personasService = new PersonasService(supabase);
const personaTemaService = new PersonaTemaService(supabase);
const proyectosService = new ProyectosService(supabase);

type Persona = Database['public']['Tables']['personas']['Row'];
type Provincia = typeof PROVINCIAS[number]['value'];

export default function NuevaPersonaPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
    const [selectedProyectoFinal, setSelectedProyectoFinal] = useState<string | null>(null);
    const [linksProfesionales, setLinksProfesionales] = useState<Array<{ plataforma: string; url: string }>>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<PersonaFormData>({
        resolver: zodResolver(personaSchema),
        defaultValues: {
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

    // Add debug logging for form state
    console.log("Form values:", watch());
    console.log("Form errors:", errors);

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
            const filePath = `personas/persona-${personaId}.${fileExt}`;

            console.log("Uploading file:", selectedFile);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('personas')
                .upload(filePath, selectedFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('personas')
                .getPublicUrl(filePath);

            console.log("Upload result:", { publicUrl, filePath });

            return publicUrl;
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            toast.error('Error al subir la imagen');
            return null;
        }
    };

    const onSubmit = async (data: PersonaFormData) => {
        console.log("onSubmit called with data:", data);
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
                foto_url: null, // Always set to null initially

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
                categoria_principal: "ninguno_asignado",
                es_ex_alumno_cet: false,

                // Metadata
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                eliminado_en: null,
                eliminado_por_uid: null,
                esta_eliminada: false,
            };

            // Create persona without photo
            console.log(backendData)
            const result = await personasService.create(backendData);
            if (!result.success || !result.data) {
                throw new Error(result.error?.message || "Error al crear la persona");
            }

            // If there's a selected file, try to upload it
            if (selectedFile) {
                const photoUrl = await uploadProfilePhoto(result.data.id);
                if (photoUrl) {
                    console.log("Updating persona with foto_url:", photoUrl);
                    // Update persona with photo URL
                    const updateResult = await personasService.update(result.data.id, {
                        foto_url: photoUrl
                    });
                    if (!updateResult.success) {
                        console.error('Error updating photo URL:', updateResult.error);
                        // Don't throw here - we still want to proceed with the success flow
                    }
                }
                // If photoUrl is null (upload failed), we keep foto_url as null
            }

            // Add temas
            for (const temaId of selectedTemas) {
                await personaTemaService.addTemaToPersona(result.data.id, temaId);
            }

            toast.success("Persona creada exitosamente");
            router.push("/admin/gestion-personas");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al crear la persona");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Nueva Persona</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basica" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="basica">Información Básica</TabsTrigger>
                        <TabsTrigger value="actividad">Actividad y Trayectoria</TabsTrigger>
                        <TabsTrigger value="red">Unirme a la red</TabsTrigger>
                        <TabsTrigger value="cet">Información CET</TabsTrigger>
                        <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
                    </TabsList>

                    {/* Información Básica */}
                    <TabsContent value="basica">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Información Básica</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="nombre">Nombre</label>
                                        <Input id="nombre" {...register("nombre")} />
                                        {errors.nombre && <p className="text-red-500">{errors.nombre.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="apellido">Apellido</label>
                                        <Input id="apellido" {...register("apellido")} />
                                        {errors.apellido && <p className="text-red-500">{errors.apellido.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email">Email</label>
                                    <Input id="email" type="email" {...register("email")} />
                                    {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="fotoPerfil">Foto de Perfil</label>
                                    <div className="flex flex-col gap-4">
                                        {previewUrl && (
                                            <div className="flex justify-center">
                                                <Image
                                                    src={previewUrl}
                                                    alt="Vista previa"
                                                    width={192}
                                                    height={192}
                                                    className="object-cover rounded-md shadow"
                                                />
                                            </div>
                                        )}
                                        <Input
                                            id="fotoPerfil"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="historiaDeExitoOResumenTrayectoria">Biografía</label>
                                    <Textarea
                                        id="historiaDeExitoOResumenTrayectoria"
                                        {...register("historiaDeExitoOResumenTrayectoria")}
                                        placeholder="Cuéntanos sobre ti..."
                                        className="min-h-[150px]"
                                    />
                                    {errors.historiaDeExitoOResumenTrayectoria && <p className="text-red-500">{errors.historiaDeExitoOResumenTrayectoria.message}</p>}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Actividad y Trayectoria */}
                    <TabsContent value="actividad">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Actividad y Trayectoria</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="tituloProfesional">Título Profesional</label>
                                    <Input id="tituloProfesional" {...register("tituloProfesional")} />
                                    {errors.tituloProfesional && <p className="text-red-500">{errors.tituloProfesional.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="descripcionPersonalOProfesional">Descripción Personal/Profesional</label>
                                    <Textarea
                                        id="descripcionPersonalOProfesional"
                                        {...register("descripcionPersonalOProfesional")}
                                        className="min-h-[100px]"
                                    />
                                    {errors.descripcionPersonalOProfesional && <p className="text-red-500">{errors.descripcionPersonalOProfesional.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="empresaOInstitucionActual">Empresa o Institución Actual</label>
                                    <Input id="empresaOInstitucionActual" {...register("empresaOInstitucionActual")} />
                                    {errors.empresaOInstitucionActual && <p className="text-red-500">{errors.empresaOInstitucionActual.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cargoActual">Cargo Actual</label>
                                    <Input id="cargoActual" {...register("cargoActual")} />
                                    {errors.cargoActual && <p className="text-red-500">{errors.cargoActual.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="telefonoContacto">Teléfono de Contacto</label>
                                    <Input id="telefonoContacto" {...register("telefonoContacto")} />
                                    {errors.telefonoContacto && <p className="text-red-500">{errors.telefonoContacto.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label>Links Profesionales</label>
                                    {/* TODO: Implement dynamic links array */}
                                    <div className="text-sm text-gray-500">
                                        Agrega tus perfiles profesionales (LinkedIn, GitHub, etc.)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Unirme a la red */}
                    <TabsContent value="red">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Unirme a la red</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label>Áreas de Interés o Expertise</label>
                                    <MultiSelect
                                        selected={watch("areasDeInteresOExpertise")}
                                        onChange={(value) => setValue("areasDeInteresOExpertise", value)}
                                        options={[
                                            { label: "Agropecuario", value: "agropecuario" },
                                            { label: "Tecnológico", value: "tecnologico" },
                                            { label: "Social", value: "social" },
                                            { label: "Ambiental", value: "ambiental" },
                                            { label: "Educativo", value: "educativo" },
                                            { label: "Producción Animal", value: "produccion_animal" },
                                            { label: "Sanidad", value: "sanidad" },
                                            { label: "Energía", value: "energia" },
                                            { label: "Recursos Naturales", value: "recursos_naturales" },
                                            { label: "Manejo Suelo", value: "manejo_suelo" },
                                            { label: "Gastronomía", value: "gastronomia" },
                                            { label: "Otro", value: "otro" },
                                        ]}
                                    />
                                    {errors.areasDeInteresOExpertise && <p className="text-red-500">{errors.areasDeInteresOExpertise.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label>Ofrece Colaboración Como</label>
                                    <MultiSelect
                                        selected={watch("ofreceColaboracionComo")}
                                        onChange={(value) => setValue("ofreceColaboracionComo", value)}
                                        options={[
                                            { label: "Mentor", value: "mentor" },
                                            { label: "Tutor", value: "tutor" },
                                            { label: "Consultor", value: "consultor" },
                                            { label: "Docente", value: "docente" },
                                            { label: "Investigador", value: "investigador" },
                                            { label: "Otro", value: "otro" },
                                        ]}
                                    />
                                    {errors.ofreceColaboracionComo && <p className="text-red-500">{errors.ofreceColaboracionComo.message}</p>}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Información CET */}
                    <TabsContent value="cet">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Información CET</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="anoCursadaActualCET">Año de Cursada Actual</label>
                                    <Input id="anoCursadaActualCET" type="number" {...register("anoCursadaActualCET")} />
                                    {errors.anoCursadaActualCET && <p className="text-red-500">{errors.anoCursadaActualCET.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="anoEgresoCET">Año de Egreso</label>
                                    <Input id="anoEgresoCET" type="number" {...register("anoEgresoCET")} />
                                    {errors.anoEgresoCET && <p className="text-red-500">{errors.anoEgresoCET.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="titulacionObtenidaCET">Titulación Obtenida</label>
                                    <Input id="titulacionObtenidaCET" {...register("titulacionObtenidaCET")} />
                                    {errors.titulacionObtenidaCET && <p className="text-red-500">{errors.titulacionObtenidaCET.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="proyectoFinalCETId">Proyecto Final CET</label>
                                    <Select onValueChange={(value) => setValue("proyectoFinalCETId", value)} defaultValue={watch("proyectoFinalCETId") ?? undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar proyecto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Add project options here */}
                                        </SelectContent>
                                    </Select>
                                    {errors.proyectoFinalCETId && <p className="text-red-500">{errors.proyectoFinalCETId.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register("buscandoOportunidades")} className="rounded border-gray-300" />
                                        <span>Buscando Oportunidades</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="situacionLaboral">Estado Situación Laboral</label>
                                    <Select onValueChange={(value) => setValue("situacionLaboral", value)} defaultValue={watch("situacionLaboral")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="empleado">Empleado</SelectItem>
                                            <SelectItem value="desempleado">Desempleado</SelectItem>
                                            <SelectItem value="independiente">Independiente</SelectItem>
                                            <SelectItem value="estudiante">Estudiante</SelectItem>
                                            <SelectItem value="jubilado">Jubilado</SelectItem>
                                            <SelectItem value="otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.situacionLaboral && <p className="text-red-500">{errors.situacionLaboral.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="visibilidadPerfil">Visibilidad del Perfil</label>
                                    <Select onValueChange={(value) => setValue("visibilidadPerfil", value)} defaultValue={watch("visibilidadPerfil")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar visibilidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="publico">Público</SelectItem>
                                            <SelectItem value="solo_registrados_plataforma">Solo Registrados</SelectItem>
                                            <SelectItem value="privado">Privado</SelectItem>
                                            <SelectItem value="solo_admins_y_propio">Solo Admins y Propio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.visibilidadPerfil && <p className="text-red-500">{errors.visibilidadPerfil.message}</p>}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Ubicación */}
                    <TabsContent value="ubicacion">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Ubicación</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="ciudad">Ciudad</label>
                                    <Input id="ciudad" {...register("ciudad")} />
                                    {errors.ciudad && <p className="text-red-500">{errors.ciudad.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="provincia">Provincia</label>
                                    <Select onValueChange={(value) => setValue("provincia", value)} defaultValue={watch("provincia")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar provincia" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rio_negro">Río Negro</SelectItem>
                                            <SelectItem value="neuquen">Neuquén</SelectItem>
                                            <SelectItem value="chubut">Chubut</SelectItem>
                                            <SelectItem value="santa_cruz">Santa Cruz</SelectItem>
                                            <SelectItem value="tierra_del_fuego">Tierra del Fuego</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.provincia && <p className="text-red-500">{errors.provincia.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="direccion">Dirección</label>
                                    <Input id="direccion" {...register("direccion")} />
                                    {errors.direccion && <p className="text-red-500">{errors.direccion.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="codigoPostal">Código Postal</label>
                                    <Input id="codigoPostal" {...register("codigoPostal")} />
                                    {errors.codigoPostal && <p className="text-red-500">{errors.codigoPostal.message}</p>}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/gestion-personas")}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creando..." : "Crear Persona"}
                    </Button>
                </div>
            </form>
        </div>
    );
} 