import { z } from "zod";
import {
  CATEGORIAS_PRINCIPALES,
  ESTADOS_SITUACION_LABORAL,
  VISIBILIDAD_PERFIL,
  PLATAFORMAS_PROFESIONALES,
  CAPACIDADES_PLATAFORMA,
  PROVINCIAS,
} from "@/lib/constants/persona";

// Schema for professional links
const linkProfesionalSchema = z.object({
  platform: z.enum(PLATAFORMAS_PROFESIONALES.map(p => p.value) as [string, ...string[]]),
  url: z.string().url("URL inválida"),
});

// Schema for residential location
const ubicacionResidencialSchema = z.object({
  ciudad: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
  provincia: z.enum(PROVINCIAS.map(p => p.value) as [string, ...string[]]),
  direccion: z.string().optional(),
  codigoPostal: z.string().optional(),
});

// Base schema that matches database structure
export const personaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").nullable(),
  fotoUrl: z.string().url("URL inválida").nullable(),
  categoriaPrincipal: z.enum(CATEGORIAS_PRINCIPALES),
  capacidadesPlataforma: z.array(z.string()).default([]),
  activo: z.boolean().default(true),
  esAdmin: z.boolean().default(false),
  tituloProfesional: z.string().nullable(),
  descripcionPersonalOProfesional: z.string().nullable(),
  areasDeInteresOExpertise: z.array(z.string()),
  disponibleParaProyectos: z.boolean().default(false),
  esExAlumnoCET: z.boolean().default(false),
  anoCursadaActualCET: z.number().int().min(1).max(6).nullable(),
  anoEgresoCET: z.number().int().min(1900).max(new Date().getFullYear()).nullable(),
  titulacionObtenidaCET: z.string().nullable(),
  proyectoFinalCETId: z.string().nullable(),
  buscandoOportunidades: z.boolean().default(false),
  estadoSituacionLaboral: z.enum(ESTADOS_SITUACION_LABORAL),
  historiaDeExitoOResumenTrayectoria: z.string().nullable(),
  empresaOInstitucionActual: z.string().nullable(),
  cargoActual: z.string().nullable(),
  ofreceColaboracionComo: z.array(z.string()),
  telefonoContacto: z.string().nullable(),
  linksProfesionales: z.array(linkProfesionalSchema),
  ubicacionResidencial: ubicacionResidencialSchema,
  visibilidadPerfil: z.enum(VISIBILIDAD_PERFIL.map(v => v.value) as [string, ...string[]]),
  estaEliminada: z.boolean().default(false),
  eliminadoEn: z.string().nullable(),
  eliminadoPorUid: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Form-specific schema with additional validations
export const personaFormSchema = personaSchema.extend({
  temas: z.array(z.string().uuid(), {
    required_error: "Debe seleccionar al menos un tema",
  }),
}).transform(data => ({
  ...data,
  // Transform arrays to match database format
  capacidadesPlataforma: data.capacidadesPlataforma || [],
  areasDeInteresOExpertise: data.areasDeInteresOExpertise || [],
  ofreceColaboracionComo: data.ofreceColaboracionComo || [],
  linksProfesionales: data.linksProfesionales || [],
}));

export type PersonaFormData = z.infer<typeof personaFormSchema>; 