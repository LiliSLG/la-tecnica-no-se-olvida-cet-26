import { z } from "zod";
import {
  CATEGORIAS_PERSONA,
  ESTADOS_SITUACION_LABORAL,
  VISIBILIDAD_PERFIL,
  PLATAFORMAS_PROFESIONALES,
  CAPACIDADES_PLATAFORMA,
  PROVINCIAS,
  ESTADOS_VERIFICACION,
} from "@/lib/constants/persona";

// Schema for professional links
const linkProfesionalSchema = z.object({
  platform: z.enum(
    PLATAFORMAS_PROFESIONALES.map((p) => p.value) as [string, ...string[]]
  ),
  url: z.string().url("URL inválida"),
});

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

// Base schema sin transform
const personaSchemaRaw = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválida").nullable(),
  foto_url: z.string().url("URL inválida").nullable(),
  categoria_principal: z.enum(
    CATEGORIAS_PERSONA.map((c) => c.value) as [string, ...string[]]
  ),
  activo: z.boolean().default(true),
  titulo_profesional: z.string().nullable(),
  descripcion_personal_o_profesional: z.string().nullable(),
  areas_de_interes_o_expertise: z.array(z.string()),
  disponible_para_proyectos: z.boolean().default(false),
  es_ex_alumno_cet: z.boolean().default(false),
  ano_cursada_actual_cet: z.number().int().min(1).max(6).nullable(),
  ano_egreso_cet: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .nullable(),
  titulacion_obtenida_cet: z.string().nullable(),
  proyecto_final_cet_id: z.string().nullable(),
  buscando_oportunidades: z.boolean().default(false),
  estado_situacion_laboral: z.enum(
    ESTADOS_SITUACION_LABORAL.map((e) => e.value) as [string, ...string[]]
  ),
  historia_de_exito_o_resumen_trayectoria: z.string().nullable(),
  empresa_o_institucion_actual: z.string().nullable(),
  cargo_actual: z.string().nullable(),
  ofrece_colaboracion_como: z.array(z.string()),
  telefono_contacto: z.string().nullable(),
  links_profesionales: z.array(linkProfesionalSchema),
  ubicacion_residencial: ubicacionResidencialSchema,
  visibilidad_perfil: z.enum(
    VISIBILIDAD_PERFIL.map((v) => v.value) as [string, ...string[]]
  ),
  is_deleted: z.boolean().default(false),
  deleted_at: z.string().nullable(),
  deleted_by_uid: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema transformado para uso general (guardar)
export const personaSchema = personaSchemaRaw.transform(
  (data: z.infer<typeof personaSchemaRaw>) => ({
    ...data,
    areasDeInteresOExpertise: data.areas_de_interes_o_expertise || [],
    ofreceColaboracionComo: data.ofrece_colaboracion_como || [],
    linksProfesionales: data.links_profesionales || [],
    ubicacionResidencial: data.ubicacion_residencial,
    // Campos de verificación/invitación
    estado_verificacion: z
      .enum(ESTADOS_VERIFICACION.map((e) => e.value) as [string, ...string[]])
      .default("sin_invitacion"),

    token_reclamacion: z.string().nullable().optional(),
    fecha_aprobacion_admin: z.string().nullable().optional(),
    aprobada_por_admin_uid: z.string().nullable().optional(),
    fecha_ultima_invitacion: z.string().nullable().optional(),
  })
);

// Schema extendido para formularios (agrega temas)
export const personaFormSchema = personaSchemaRaw.extend({
  temas: z.array(z.string().uuid(), {
    required_error: "Debe seleccionar al menos un tema",
  }),
});

export type PersonaFormData = z.infer<typeof personaFormSchema>;

// Schema mínimo para creación por admin (solo nombre + apellido)
export const personaAdminCreateSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  categoria_principal: z.enum(
    CATEGORIAS_PERSONA.map((c) => c.value) as [string, ...string[]]
  ),

  // Todos los demás campos opcionales
  telefono_contacto: z.string().optional().or(z.literal("")),
  descripcion_personal_o_profesional: z.string().optional().or(z.literal("")),
  visibilidad_perfil: z
    .enum(VISIBILIDAD_PERFIL.map((v) => v.value) as [string, ...string[]])
    .default("publico"),
  activo: z.boolean().default(true),
  disponible_para_proyectos: z.boolean().default(false),
  es_ex_alumno_cet: z.boolean().default(false),
  buscando_oportunidades: z.boolean().default(false),
  estado_situacion_laboral: z.enum(
    ESTADOS_SITUACION_LABORAL.map((e) => e.value) as [string, ...string[]]
  ),

  // Campos CET opcionales
  ano_cursada_actual_cet: z.number().int().min(1).max(6).optional().nullable(),
  ano_egreso_cet: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .nullable(),
  titulacion_obtenida_cet: z.string().optional().or(z.literal("")),

  // Campos profesionales opcionales
  titulo_profesional: z.string().optional().or(z.literal("")),
  empresa_o_institucion_actual: z.string().optional().or(z.literal("")),
  cargo_actual: z.string().optional().or(z.literal("")),
  historia_de_exito_o_resumen_trayectoria: z
    .string()
    .optional()
    .or(z.literal("")),

  // Campos que se manejan por separado
  foto_url: z.string().url().optional().nullable(),
  proyecto_final_cet_id: z.string().optional().nullable(),
});

export type PersonaAdminCreateData = z.infer<typeof personaAdminCreateSchema>;
