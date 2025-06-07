"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

const personasService = new PersonasService(supabase);
const personaTemaService = new PersonaTemaService(supabase);
const proyectosService = new ProyectosService(supabase);

export default function NuevaPersonaPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
    const [selectedProyectoFinal, setSelectedProyectoFinal] = useState<string | null>(null);
    const [linksProfesionales, setLinksProfesionales] = useState<Array<{ platform: string; url: string }>>([]);

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
            categoria: undefined,
            proyectoFinalCETId: null,
            situacionLaboral: undefined,
            pais: undefined,
            ciudad: undefined,
            provincia: undefined,
            direccion: undefined,
            codigoPostal: undefined,
            fotoPerfil: null,
            linksProfesionales: [],
            areasDeInteresOExpertise: [],
            ofreceColaboracionComo: [],
            capacidadesPlataforma: [],
            esAdmin: false,
            disponibleParaProyectos: false,
            esExAlumnoCET: false,
            anoCursadaActualCET: null,
            anoEgresoCET: null,
            titulacionObtenidaCET: null,
            buscandoOportunidades: false,
            historiaDeExitoOResumenTrayectoria: null,
            empresaOInstitucionActual: null,
            cargoActual: null,
            telefonoContacto: null,
            visibilidadPerfil: "public",
            estaEliminada: false,
            eliminadoPorUid: null,
            eliminadoEn: null,
        },
    });

    const onSubmit = async (data: PersonaFormData) => {
        try {
            setIsLoading(true);

            // Map all camelCase form data to snake_case backend fields
            const backendData = {
                nombre: data.nombre,
                apellido: data.apellido,
                email: data.email,
                activo: data.activo,
                es_admin: data.esAdmin,
                disponible_para_proyectos: data.disponibleParaProyectos,
                es_ex_alumno_cet: data.esExAlumnoCET,
                buscando_oportunidades: data.buscandoOportunidades,
                visibilidad_perfil: data.visibilidadPerfil,
                links_profesionales: data.linksProfesionales?.map(link => ({
                    platform: link.plataforma ?? link.plataforma ?? "",
                    url: link.url ?? "",
                })) ?? [],

                areas_de_interes_o_expertise: data.areasDeInteresOExpertise,
                ofrece_colaboracion_como: data.ofreceColaboracionComo,
                capacidades_plataforma: data.capacidadesPlataforma,
                biografia: data.historiaDeExitoOResumenTrayectoria, // If biografia is a different field, adjust accordingly
                foto_url: data.fotoPerfil,
                categoria_principal: data.categoria ?? "ninguno_asignado",
                eliminado_en: data.eliminadoEn,
                proyecto_final_cet_id: data.proyectoFinalCETId,
                estado_situacion_laboral: data.situacionLaboral ?? "no_especificado",
                ano_cursada_actual_cet: data.anoCursadaActualCET,
                ano_egreso_cet: data.anoEgresoCET,
                titulacion_obtenida_cet: data.titulacionObtenidaCET,
                empresa_o_institucion_actual: data.empresaOInstitucionActual,
                cargo_actual: data.cargoActual,
                telefono_contacto: data.telefonoContacto,
                esta_eliminada: data.estaEliminada,
                eliminado_por_uid: data.eliminadoPorUid,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                descripcion_personal_o_profesional: data.descripcionPersonalOProfesional,
                titulo_profesional: data.tituloProfesional,
                historia_de_exito_o_resumen_trayectoria: data.historiaDeExitoOResumenTrayectoria,
                ubicacion_residencial: {
                    ciudad: data.ciudad ?? "",
                    provincia: data.provincia ?? ""
                },
            };

            // Create persona
            const result = await personasService.create(backendData);
            if (!result.success || !result.data) {
                throw new Error(result.error?.message || "Error al crear la persona");
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

            <form onSubmit={handleSubmit(onSubmit)}>
                <Tabs defaultValue="basica" className="w-full">
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="basica">Información Básica</TabsTrigger>
                        <TabsTrigger value="profesional">Información Profesional</TabsTrigger>
                        <TabsTrigger value="cet">Información CET</TabsTrigger>
                        <TabsTrigger value="laboral">Situación Laboral</TabsTrigger>
                        <TabsTrigger value="ubicacion">Ubicación y Contacto</TabsTrigger>
                        <TabsTrigger value="perfil">Perfil</TabsTrigger>
                        <TabsTrigger value="comunidad">Relación con la comunidad</TabsTrigger>
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
                                    <label htmlFor="categoria">Categoría Principal</label>
                                    <Select onValueChange={(value) => setValue("categoria", value)} defaultValue={watch("categoria")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="docente_cet">Docente CET</SelectItem>
                                            <SelectItem value="estudiante_cet">Estudiante CET</SelectItem>
                                            <SelectItem value="ex_alumno_cet">Ex Alumno CET</SelectItem>
                                            <SelectItem value="productor_rural">Productor Rural</SelectItem>
                                            <SelectItem value="profesional_externo">Profesional Externo</SelectItem>
                                            <SelectItem value="investigador">Investigador</SelectItem>
                                            <SelectItem value="comunidad_general">Comunidad General</SelectItem>
                                            <SelectItem value="otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.categoria && <p className="text-red-500">{errors.categoria.message}</p>}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Información Profesional */}
                    <TabsContent value="profesional">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Información Profesional</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="tituloProfesional">Título Profesional</label>
                                    <Input id="tituloProfesional" {...register("tituloProfesional")} />
                                    {errors.tituloProfesional && <p className="text-red-500">{errors.tituloProfesional.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="descripcionPersonalOProfesional">Descripción Personal/Profesional</label>
                                    <Textarea id="descripcionPersonalOProfesional" {...register("descripcionPersonalOProfesional")} />
                                    {errors.descripcionPersonalOProfesional && <p className="text-red-500">{errors.descripcionPersonalOProfesional.message}</p>}
                                </div>
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
                            </div>
                        </div>
                    </TabsContent>

                    {/* Información CET */}
                    <TabsContent value="cet">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Información CET</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register("esExAlumnoCET")} className="rounded border-gray-300" />
                                        <span>Es Ex Alumno CET</span>
                                    </label>
                                </div>
                                {watch("esExAlumnoCET") && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
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
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="titulacionObtenidaCET">Titulación Obtenida</label>
                                            <Input id="titulacionObtenidaCET" {...register("titulacionObtenidaCET")} />
                                            {errors.titulacionObtenidaCET && <p className="text-red-500">{errors.titulacionObtenidaCET.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="proyectoFinalCETId">Proyecto Final</label>
                                            <Select value={selectedProyectoFinal || ""} onValueChange={(value) => { setSelectedProyectoFinal(value); setValue("proyectoFinalCETId", value); }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar proyecto" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {/* TODO: Load projects from proyectosService */}
                                                </SelectContent>
                                            </Select>
                                            {errors.proyectoFinalCETId && <p className="text-red-500">{errors.proyectoFinalCETId.message}</p>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Situación Laboral */}
                    <TabsContent value="laboral">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Situación Laboral</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="situacionLaboral">Estado Laboral</label>
                                    <Select onValueChange={(value) => setValue("situacionLaboral", value)} defaultValue={watch("situacionLaboral")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="buscando_empleo">Buscando Empleo</SelectItem>
                                            <SelectItem value="empleado">Empleado</SelectItem>
                                            <SelectItem value="emprendedor">Emprendedor</SelectItem>
                                            <SelectItem value="estudiante">Estudiante</SelectItem>
                                            <SelectItem value="jubilado">Jubilado</SelectItem>
                                            <SelectItem value="otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.situacionLaboral && <p className="text-red-500">{errors.situacionLaboral.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="empresaOInstitucionActual">Empresa/Institución Actual</label>
                                    <Input id="empresaOInstitucionActual" {...register("empresaOInstitucionActual")} />
                                    {errors.empresaOInstitucionActual && <p className="text-red-500">{errors.empresaOInstitucionActual.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cargoActual">Cargo Actual</label>
                                    <Input id="cargoActual" {...register("cargoActual")} />
                                    {errors.cargoActual && <p className="text-red-500">{errors.cargoActual.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register("buscandoOportunidades")} className="rounded border-gray-300" />
                                        <span>Buscando Oportunidades</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Ubicación y Contacto */}
                    <TabsContent value="ubicacion">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Ubicación y Contacto</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="ciudad">Ciudad</label>
                                        <Input id="ciudad" {...register("ciudad")} />
                                        {errors.ciudad && <p className="text-red-500">{errors.ciudad.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="provincia">Provincia</label>
                                        <Input id="provincia" {...register("provincia")} />
                                        {errors.provincia && <p className="text-red-500">{errors.provincia.message}</p>}
                                    </div>
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
                                <div className="space-y-2">
                                    <label htmlFor="telefonoContacto">Teléfono de Contacto</label>
                                    <Input id="telefonoContacto" {...register("telefonoContacto")} />
                                    {errors.telefonoContacto && <p className="text-red-500">{errors.telefonoContacto.message}</p>}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Perfil */}
                    <TabsContent value="perfil">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Perfil</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="historiaDeExitoOResumenTrayectoria">Historia de Éxito/Resumen de Trayectoria</label>
                                    <Textarea id="historiaDeExitoOResumenTrayectoria" {...register("historiaDeExitoOResumenTrayectoria")} />
                                    {errors.historiaDeExitoOResumenTrayectoria && <p className="text-red-500">{errors.historiaDeExitoOResumenTrayectoria.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label>Links Profesionales</label>
                                    {/* TODO: Implement dynamic links array */}
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

                    {/* Relación con la comunidad */}
                    <TabsContent value="comunidad">
                        <div className="p-4 border rounded-md">
                            <h2 className="text-xl font-bold mb-4">Relación con la comunidad</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" {...register("disponibleParaProyectos")} className="rounded border-gray-300" />
                                        <span>Disponible para Proyectos</span>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <label>Ofrece Colaboración Como</label>
                                    <MultiSelect
                                        selected={watch("ofreceColaboracionComo")}
                                        onChange={(value) => setValue("ofreceColaboracionComo", value)}
                                        options={[
                                            { label: "Tutor", value: "tutor" },
                                            { label: "Mentor", value: "mentor" },
                                            { label: "Consultor", value: "consultor" },
                                            { label: "Investigador", value: "investigador" },
                                            { label: "Colaborador", value: "colaborador" },
                                            { label: "Otro", value: "otro" },
                                        ]}
                                    />
                                    {errors.ofreceColaboracionComo && <p className="text-red-500">{errors.ofreceColaboracionComo.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label>Temas de Interés</label>
                                    <MultiSelect
                                        selected={selectedTemas}
                                        onChange={setSelectedTemas}
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
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </form>
        </div>
    );
} 