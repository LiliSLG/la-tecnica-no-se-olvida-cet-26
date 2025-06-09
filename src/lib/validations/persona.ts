import { z } from "zod";
import { VISIBILIDAD_PERFIL, PROVINCIAS } from "@/lib/constants/persona";

// Schema for residential location
const ubicacionResidencialSchema = z.object({
  direccion: z.string().min(1, "La dirección es requerida"),
  provincia: z.enum(PROVINCIAS.map(p => p.value) as [string, ...string[]], {
    required_error: "La provincia es requerida"
  }),
  localidad: z.string().min(1, "La localidad es requerida"),
  codigo_postal: z.string().min(1, "El código postal es requerido"),
  lat: z.union([
    z.number(),
    z.string().transform((val) => val === "" ? undefined : Number(val)),
    z.undefined(),
    z.null()
  ]).optional(),
  lng: z.union([
    z.number(),
    z.string().transform((val) => val === "" ? undefined : Number(val)),
    z.undefined(),
    z.null()
  ]).optional(),
});

export const personaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido").nullable(),
  activo: z.boolean().default(true),
  tituloProfesional: z.string().nullable(),
  descripcionPersonalOProfesional: z.string().nullable(),
  categoria: z.string().optional(),
  proyectoFinalCETId: z.string().nullable(),
  situacionLaboral: z.string().optional(),
  ubicacionResidencial: ubicacionResidencialSchema,
  linksProfesionales: z.array(z.object({
    plataforma: z.string(),
    url: z.string().url("URL inválida")
  })).default([]),
  areasDeInteresOExpertise: z.array(z.string()).default([]),
  ofreceColaboracionComo: z.array(z.string()).default([]),
  capacidadesPlataforma: z.array(z.string()).default([]),
  esAdmin: z.boolean().default(false),
  disponibleParaProyectos: z.boolean().default(false),
  esExAlumnoCET: z.boolean().default(false),
  anoCursadaActualCET: z.number().nullable(),
  anoEgresoCET: z.number().nullable(),
  titulacionObtenidaCET: z.string().nullable(),
  buscandoOportunidades: z.boolean().default(false),
  historiaDeExitoOResumenTrayectoria: z.string().nullable(),
  empresaOInstitucionActual: z.string().nullable(),
  cargoActual: z.string().nullable(),
  telefonoContacto: z.string().nullable(),
  visibilidadPerfil: z.enum(VISIBILIDAD_PERFIL.map(v => v.value) as [string, ...string[]]).default("publico"),
  estaEliminada: z.boolean().default(false),
  eliminadoPorUid: z.string().nullable(),
  eliminadoEn: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type PersonaFormData = z.infer<typeof personaSchema>; 