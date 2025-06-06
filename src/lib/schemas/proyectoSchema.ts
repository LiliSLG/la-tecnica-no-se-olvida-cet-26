import { z } from "zod";

const estadoProyectoEnum = z.enum(['draft', 'published', 'archived']);

// Base schema that matches database structure
export const proyectoSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().nullable(),
  archivo_principal_url: z.string().url("URL inválida").nullable(),
  status: estadoProyectoEnum,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  esta_eliminado: z.boolean().default(false),
  eliminado_por_uid: z.string().nullable(),
  eliminado_en: z.string().nullable(),
});

// Form-specific schema with camelCase fields
export const proyectoFormSchema = proyectoSchema.extend({
  archivoPrincipalUrl: z.string().url("URL inválida").nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  estaEliminado: z.boolean().default(false),
  eliminadoPorUid: z.string().nullable(),
  eliminadoEn: z.string().nullable(),
}).transform(data => ({
  // Transform to MappedProyecto format
  id: data.id,
  titulo: data.titulo,
  descripcion: data.descripcion,
  archivoPrincipalUrl: data.archivo_principal_url || data.archivoPrincipalUrl,
  status: data.status,
  createdAt: data.created_at || data.createdAt,
  updatedAt: data.updated_at || data.updatedAt,
  estaEliminado: data.esta_eliminado || data.estaEliminado,
  eliminadoPorUid: data.eliminado_por_uid || data.eliminadoPorUid,
  eliminadoEn: data.eliminado_en || data.eliminadoEn,
}));

export type ProyectoFormData = z.infer<typeof proyectoFormSchema>; 