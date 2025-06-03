// src/lib/schemas/projectSchema.ts
"use client";

import { z } from "zod";
import type { Proyecto } from "@/lib/types";

// ————————————————————————————————————————————————————————————————
// Opciones y tipos para “estadoActual”
export const estadoOptions = [
  "idea",
  "en_desarrollo",
  "finalizado",
  "presentado",
  "archivado",
  "cancelado",
] as const;
export type EstadoProyecto = (typeof estadoOptions)[number];

export const estadoLabels: Record<EstadoProyecto, string> = {
  idea: "Idea",
  en_desarrollo: "En Desarrollo",
  finalizado: "Finalizado",
  presentado: "Presentado",
  archivado: "Archivado",
  cancelado: "Cancelado",
};

// ————————————————————————————————————————————————————————————————
// Preprocesador Zod para convertir “a,b,c” en ["a","b","c"]
export const stringToArrayZod = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() !== "") {
    return val
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (Array.isArray(val)) {
    return val
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  return [];
}, z.array(z.string()));

export const stringToArray = (
  val: string | string[] | undefined | null
): string[] => {
  if (typeof val === "string" && val.trim() !== "") {
    return val
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (Array.isArray(val)) {
    return val
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

// ————————————————————————————————————————————————————————————————
// Schema para archivos adjuntos dentro de un proyecto
const AttachedFileSchema = z.object({
  nombre: z.string().min(1, "El nombre del archivo es requerido."),
  url: z
    .string()
    .url("Debe ser una URL válida.")
    .min(1, "La URL del archivo es requerida."),
  tipo: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
});

// ————————————————————————————————————————————————————————————————
// Schema principal de formulario de proyecto (ProjectFormData)
export const projectSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  descripcionGeneral: z
    .string()
    .min(10, "La descripción general debe tener al menos 10 caracteres."),
  resumenEjecutivo: z.string().optional().nullable(),

  idsTemas: z.array(z.string()).min(1, "Debe seleccionar al menos un tema."),
  palabrasClave: stringToArrayZod.refine((arr) => arr.length > 0, {
    message: "Debe ingresar al menos una palabra clave.",
  }),
  idsOrganizacionesTutoria: stringToArrayZod.optional().default([]),

  anoProyecto: z.coerce
    .number()
    .min(1900, "El año debe ser válido.")
    .max(new Date().getFullYear() + 5, "El año no puede ser tan futuro."),

  estadoActual: z.enum(estadoOptions, {
    required_error: "El estado actual es requerido.",
  }),

  // Fechas en JavaScript (opcional / puede ser null)
  fechaInicio: z.date().nullable().optional(),
  fechaFinalizacionEstimada: z.date().nullable().optional(),
  fechaFinalizacionReal: z.date().nullable().optional(),
  fechaPresentacion: z.date().nullable().optional(),

  idsAutores: z.array(z.string()).min(1, "Debe seleccionar al menos un autor."),
  idsTutoresPersonas: z.array(z.string()).optional().default([]),
  idsColaboradores: z.array(z.string()).optional().default([]),

  archivoPrincipalURL: z
    .string()
    .url("Debe ser una URL válida.")
    .or(z.literal(""))
    .optional()
    .nullable(),
  nombreArchivoPrincipal: z.string().optional().nullable(),

  archivosAdjuntos: z.array(AttachedFileSchema).optional().default([]),
  estaEliminado: z.boolean().optional().default(false),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// ————————————————————————————————————————————————————————————————
// Convierten entre ProjectFormData ↔ “lo que venga de Supabase”
//
// Observación: en la tabla `proyectos` no existen columnas arrays para
// “idsTemas” ni “idsAutores” directamente.  Esas relaciones se manejan
// mediante tablas pivote (proyecto_tema, proyecto_autor, etc.).
// Por simplicidad aquí asumimos que, al hacer un JOIN desde Supabase,
// el objeto resultante (que recibimos como `projectData`) sí trae propiedades
// como `idsTemas: string[]`, `idsAutores: string[]`, etc. Si no las trae
// en bruto, tu consulta a Supabase debe usar `.select('*, proyecto_tema(idsTemas), ...')`
// o lo que corresponda.
//
// Dado que TS no sabe de antemano si vendrán esos campos, en la firma usamos
// `projectData: Record<string, any>`, para que no dé error de “propiedad no existe”.
// Si todavía quieres tiparlo más estrictamente, puedes crear un tipo intermedio
// que incluya esas propiedades extra.

/**
 * Convertir datos de formulario (ProjectFormData) a un objeto
 * listo para enviar a Supabase (Postgres).
 * - Las fechas (`Date`) se convierten a string ISO con `.toISOString()`.
 * - Los arrays vacíos se transforman en `null` para columnas array NULLABLE.
 * - Los strings vacíos pasan a `null`.
 */
export function convertFormDataToSupabaseProject(
  data: ProjectFormData
): Partial<Proyecto> {
  const supaData: { [key: string]: any } = { ...data };

  // Campos de arreglo que, si quedan vacíos, pasan a `null`.
  const arrayFields: (keyof Pick<
    ProjectFormData,
    | "idsTemas"
    | "idsAutores"
    | "idsTutoresPersonas"
    | "idsColaboradores"
    | "idsOrganizacionesTutoria"
    | "palabrasClave"
  >)[] = [
    "idsTemas",
    "idsAutores",
    "idsTutoresPersonas",
    "idsColaboradores",
    "idsOrganizacionesTutoria",
    "palabrasClave",
  ];
  arrayFields.forEach((key) => {
    if (
      !Array.isArray(supaData[key]) ||
      (Array.isArray(supaData[key]) && supaData[key].length === 0)
    ) {
      supaData[key] = null;
    }
  });

  // Campos string opcionales que, si están vacíos, pasan a `null`.
  const optionalStringFields: (keyof Pick<
    ProjectFormData,
    "resumenEjecutivo" | "archivoPrincipalURL" | "nombreArchivoPrincipal"
  >)[] = ["resumenEjecutivo", "archivoPrincipalURL", "nombreArchivoPrincipal"];
  optionalStringFields.forEach((key) => {
    if (supaData[key] === "" || supaData[key] === undefined) {
      supaData[key] = null;
    }
  });

  // Convertir fechas JS `Date` → ISO string. Si no hay fecha, queda `null`.
  supaData.fechaInicio = data.fechaInicio
    ? data.fechaInicio.toISOString()
    : null;
  supaData.fechaFinalizacionEstimada = data.fechaFinalizacionEstimada
    ? data.fechaFinalizacionEstimada.toISOString()
    : null;
  supaData.fechaFinalizacionReal = data.fechaFinalizacionReal
    ? data.fechaFinalizacionReal.toISOString()
    : null;
  supaData.fechaPresentacion = data.fechaPresentacion
    ? data.fechaPresentacion.toISOString()
    : null;

  // `estaEliminado` ya viene como boolean o undefined; si es undefined, queda `false`.
  supaData.estaEliminado = data.estaEliminado ?? false;

  return supaData as Partial<Proyecto>;
}

/**
 * Convertir datos crudos que vienen de Supabase (filas de `proyectos`) a
 * valores pre-poblados en el formulario (ProjectFormData).
 * - Las fechas pueden llegar como string ISO o `Date`; las parsea con `new Date(...)`.
 * - Los arrays de columna Postgres (por ej. `string[]` o `null`) se normalizan a `string[]`.
 * - Los archivos adjuntos llegan como array de objetos con `{nombre,url,tipo,descripcion}`
 */
export function convertSupabaseDataToFormProject(
  projectData: Record<string, any>
): ProjectFormData {
  // Helper: parsear string ISO o Date → Date | null
  const parseDate = (val: any): Date | null => {
    if (!val) return null;
    if (val instanceof Date) return val;
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Helper: asegurarse de que un campo sea `string[]`
  const parseArray = (val: any): string[] => {
    if (Array.isArray(val)) return val as string[];
    return [];
  };

  // Construimos un objeto intermedio con defaults mínimos
  const formValues: { [key: string]: any } = {
    titulo: projectData.titulo ?? "",
    descripcionGeneral: projectData.descripcionGeneral ?? "",
    resumenEjecutivo: projectData.resumenEjecutivo ?? null,

    idsTemas: parseArray(projectData.idsTemas),
    palabrasClave: parseArray(projectData.palabrasClave),
    idsOrganizacionesTutoria: parseArray(projectData.idsOrganizacionesTutoria),

    anoProyecto: projectData.anoProyecto ?? new Date().getFullYear(),
    estadoActual: (projectData.estadoActual as EstadoProyecto) ?? "idea",

    fechaInicio: parseDate(projectData.fechaInicio),
    fechaFinalizacionEstimada: parseDate(projectData.fechaFinalizacionEstimada),
    fechaFinalizacionReal: parseDate(projectData.fechaFinalizacionReal),
    fechaPresentacion: parseDate(projectData.fechaPresentacion),

    idsAutores: parseArray(projectData.idsAutores),
    idsTutoresPersonas: parseArray(projectData.idsTutoresPersonas),
    idsColaboradores: parseArray(projectData.idsColaboradores),

    archivoPrincipalURL: projectData.archivoPrincipalURL ?? null,
    nombreArchivoPrincipal: projectData.nombreArchivoPrincipal ?? null,

    archivosAdjuntos: Array.isArray(projectData.archivosAdjuntos)
      ? (projectData.archivosAdjuntos as any[]).map((adj: any) => ({
          nombre: adj.nombre ?? "",
          url: adj.url ?? "",
          tipo: adj.tipo ?? null,
          descripcion: adj.descripcion ?? null,
        }))
      : [],

    estaEliminado: projectData.estaEliminado ?? false,
  };

  // Finalmente devolvemos en la forma exacta que exige nuestro `ProjectFormData`.
  return formValues as ProjectFormData;
}
