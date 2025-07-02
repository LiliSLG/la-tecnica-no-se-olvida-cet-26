// src/lib/schemas/organizacionSchema.ts
import { z } from "zod";

// 🆕 DEFINICIÓN DE TIPOS DE ORGANIZACIÓN CON ICONOS
export const TIPOS_ORGANIZACION = [
  {
    value: "empresa",
    label: "Empresa",
    icon: "🏢",
    description: "Empresas privadas y corporaciones",
  },
  {
    value: "institucion_educativa",
    label: "Institución Educativa",
    icon: "🎓",
    description: "Universidades, escuelas, centros de formación",
  },
  {
    value: "ONG",
    label: "ONG",
    icon: "🤝",
    description: "Organizaciones no gubernamentales",
  },
  {
    value: "establecimiento_ganadero",
    label: "Establecimiento Ganadero",
    icon: "🐄",
    description: "Establecimientos de producción ganadera y agropecuaria",
  },
  {
    value: "organismo_gubernamental",
    label: "Organismo Gubernamental",
    icon: "🏛️",
    description: "Entidades públicas y gubernamentales",
  },
  {
    value: "cooperativa",
    label: "Cooperativa",
    icon: "👥",
    description: "Cooperativas y organizaciones asociativas",
  },
  {
    value: "otro",
    label: "Otro",
    icon: "📋",
    description: "Otros tipos de organización",
  },
] as const;

// 🆕 DEFINICIÓN DE ESTADOS DE VERIFICACIÓN CON COLORES
export const ESTADOS_VERIFICACION = [
  {
    value: "sin_invitacion",
    label: "Sin invitación",
    color: "gray",
    description: "Organización creada por admin, sin invitación enviada",
  },
  {
    value: "pendiente_aprobacion",
    label: "Pendiente aprobación",
    color: "yellow",
    description: "Esperando aprobación del administrador",
  },
  {
    value: "invitacion_enviada",
    label: "Invitación enviada",
    color: "blue",
    description: "Invitación enviada, esperando respuesta",
  },
  {
    value: "verificada",
    label: "Verificada",
    color: "green",
    description: "Organización verificada y activa",
  },
  {
    value: "rechazada",
    label: "Rechazada",
    color: "red",
    description: "Invitación o verificación rechazada",
  },
] as const;

// 🆕 ENUM TYPES para TypeScript
export type TipoOrganizacion = (typeof TIPOS_ORGANIZACION)[number]["value"];
export type EstadoVerificacion = (typeof ESTADOS_VERIFICACION)[number]["value"];

// Schema base que coincide con la estructura de la BD
export const organizacionSchema = z.object({
  id: z.string().optional(),
  nombre_oficial: z
    .string()
    .min(2, "El nombre oficial debe tener al menos 2 caracteres"),
  nombre_fantasia: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .optional(),
  tipo: z
    .enum([
      "empresa",
      "institucion_educativa",
      "ONG",
      "establecimiento_ganadero",
      "organismo_gubernamental",
      "cooperativa",
      "otro",
    ])
    .nullable()
    .optional(),
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),

  // Información de contacto
  logo_url: z.string().url("URL del logo inválida").nullable().optional(),
  ubicacion: z.any().nullable().optional(), // JSONB

  email_contacto: z.string().optional().nullable(),
  telefono_contacto: z.string().optional().nullable(),
  sitio_web: z.string().optional().nullable(),

  // Áreas de trabajo y colaboración
  areas_de_interes: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un área de interés"),
  abierta_a_colaboraciones: z.boolean().default(true),

  // 🆕 Campos de verificación/reclamación
  estado_verificacion: z
    .enum([
      "sin_invitacion",
      "pendiente_aprobacion",
      "invitacion_enviada",
      "verificada",
      "rechazada",
    ])
    .default("sin_invitacion"),
  reclamada_por_uid: z.string().nullable().optional(),
  fecha_reclamacion: z.string().nullable().optional(),
  token_reclamacion: z.string().nullable().optional(),
  fecha_aprobacion_admin: z.string().nullable().optional(),
  aprobada_por_admin_uid: z.string().nullable().optional(),
  fecha_ultima_invitacion: z.string().nullable().optional(),

  // Metadatos estándar
  created_at: z.string().optional(),
  created_by_uid: z.string().nullable().optional(),
  updated_at: z.string().optional(),
  updated_by_uid: z.string().nullable().optional(),
  deleted_at: z.string().nullable().optional(),
  deleted_by_uid: z.string().nullable().optional(),
  is_deleted: z.boolean().default(false),
});

// Schema para crear organización (formulario)
export const createOrganizacionSchema = organizacionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  deleted_by_uid: true,
  is_deleted: true,
  // Campos de verificación manejados por el sistema
  estado_verificacion: true,
  reclamada_por_uid: true,
  fecha_reclamacion: true,
  token_reclamacion: true,
  fecha_aprobacion_admin: true,
  aprobada_por_admin_uid: true,
  fecha_ultima_invitacion: true,
});

// Schema para actualizar organización
export const updateOrganizacionSchema = createOrganizacionSchema.partial();

// ✅ SCHEMA ESPECÍFICO PARA EL FORMULARIO (campos no obligatorios excepto los críticos)
export const organizacionFormSchema = z.object({
  nombre_oficial: z
    .string()
    .min(2, "El nombre oficial debe tener al menos 2 caracteres"),
  // ✅ ARREGLADO: nombre_fantasia totalmente opcional, no valida si está vacío
  nombre_fantasia: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val)), // ✅ Convierte string vacío a null
  tipo: z.enum([
    "empresa",
    "institucion_educativa",
    "ONG",
    "establecimiento_ganadero",
    "organismo_gubernamental",
    "cooperativa",
    "otro",
  ]),
  descripcion: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  // ✅ ARREGLADO: Campos de contacto opcionales con transformación a null
  email_contacto: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Email inválido",
    })
    .transform((val) => (val === "" || !val ? null : val)), // ✅ Convierte vacío a null
  telefono_contacto: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val)), // ✅ Convierte vacío a null
  sitio_web: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "URL del sitio web inválida",
    })
    .transform((val) => (val === "" || !val ? null : val)), // ✅ Convierte vacío a null
  areas_de_interes: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un área de interés"),
  abierta_a_colaboraciones: z.boolean().default(true),
  // ✅ NUEVO: Campo para logo
  logo_url: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "URL del logo inválida",
    })
    .transform((val) => (val === "" || !val ? null : val)), // ✅ Convierte vacío a null
});

// 🆕 HELPERS para trabajar con tipos
export const getTipoInfo = (tipo: string | null) => {
  return TIPOS_ORGANIZACION.find((t) => t.value === tipo);
};

export const getEstadoInfo = (estado: string | null) => {
  return ESTADOS_VERIFICACION.find((e) => e.value === estado);
};

// 🆕 ÁREAS DE INTERÉS PREDEFINIDAS
export const AREAS_INTERES_ORGANIZACION = [
  "Agropecuario",
  "Tecnología",
  "Educación",
  "Salud",
  "Medio Ambiente",
  "Desarrollo Social",
  "Investigación",
  "Producción Animal",
  "Agricultura Sostenible",
  "Energías Renovables",
  "Innovación",
  "Capacitación",
  "Extensión Rural",
  "Desarrollo Comunitario",
  "Gastronomía",
  "Turismo Rural",
  "Biotecnología",
  "Recursos Naturales",
] as const;

// Tipos TypeScript
export type Organizacion = z.infer<typeof organizacionSchema>;
export type CreateOrganizacion = z.infer<typeof createOrganizacionSchema>;
export type UpdateOrganizacion = z.infer<typeof updateOrganizacionSchema>;
export type OrganizacionFormData = z.infer<typeof organizacionFormSchema>;
