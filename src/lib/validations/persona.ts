import { z } from "zod";
import { VISIBILIDAD_PERFIL, PROVINCIAS } from "@/lib/constants/persona";

// Schema for residential location
const ubicacionResidencialSchema = z
  .object({
    direccion: z.string().optional().nullable(),
    provincia: z
      .enum(PROVINCIAS.map((p) => p.value) as [string, ...string[]])
      .optional()
      .nullable(),
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
  ubicacionResidencial: ubicacionResidencialSchema
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return undefined;
      const { direccion, provincia, localidad, codigo_postal } = val;
      if (!direccion && !provincia && !localidad && !codigo_postal)
        return undefined;
      return val;
    }),
  linksProfesionales: z
    .array(
      z.object({
        plataforma: z.string(),
        url: z.string().url("URL inválida"),
      })
    )
    .default([]),
  areasDeInteresOExpertise: z.array(z.string()).default([]),
  ofreceColaboracionComo: z.array(z.string()).default([]),
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
  visibilidadPerfil: z
    .enum(VISIBILIDAD_PERFIL.map((v) => v.value) as [string, ...string[]])
    .default("publico"),
  is_deleted: z.boolean().default(false),
  deleted_by_uid: z.string().nullable(),
  deleted_at: z.string().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  temas: z.array(z.string().uuid()).default([]),
});

export type PersonaFormData = z.infer<typeof personaSchema>;
