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
  direccion: z.string().optional().nullable(),
  provincia: z.enum(PROVINCIAS.map(p => p.value) as [string, ...string[]]).optional().nullable(),
  localidad: z.string().optional().nullable(),
  codigo_postal: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
})
.transform((data) => {
  const isEmpty =
    !data?.direccion &&
    !data?.provincia &&
    !data?.localidad &&
    !data?.codigo_postal &&
    !data?.lat &&
    !data?.lng;
  return isEmpty ? undefined : data;
})
.optional()
.nullable();

// Base schema sin transform
const personaSchemaRaw = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválida").nullable(),
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

// Schema transformado para uso general (guardar)
export const personaSchema = personaSchemaRaw.transform(
  (data: z.infer<typeof personaSchemaRaw>) => ({
    ...data,
    capacidadesPlataforma: data.capacidadesPlataforma || [],
    areasDeInteresOExpertise: data.areasDeInteresOExpertise || [],
    ofreceColaboracionComo: data.ofreceColaboracionComo || [],
    linksProfesionales: data.linksProfesionales || [],
    ubicacionResidencial: data.ubicacionResidencial,
  })
);

// Schema extendido para formularios (agrega temas)
export const personaFormSchema = personaSchemaRaw.extend({
  temas: z.array(z.string().uuid(), {
    required_error: "Debe seleccionar al menos un tema",
  }),
});

export type PersonaFormData = z.infer<typeof personaFormSchema>;
