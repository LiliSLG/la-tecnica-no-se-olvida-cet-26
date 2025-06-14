import { z } from "zod";

const estadoProyectoEnum = z.enum(["borrador", "publicado", "archivado"]);

// Base schema that matches database structure
export const proyectoSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().nullable(),
  archivo_principal_url: z.string().url("URL inválida").nullable(),
  status: estadoProyectoEnum,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_deleted: z.boolean().default(false),
  deleted_by_uid: z.string().nullable(),
  deleted_at: z.string().nullable(),
});

// Form-specific schema with camelCase fields
export const proyectoFormSchema = proyectoSchema
  .extend({
    archivoPrincipalUrl: z.string().url("URL inválida").nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    is_deleted: z.boolean().default(false),
    deleted_by_uid: z.string().nullable(),
    deleted_at: z.string().nullable(),
  })
  .transform((data) => ({
    // Transform to MappedProyecto format
    id: data.id,
    titulo: data.titulo,
    descripcion: data.descripcion,
    archivoPrincipalUrl: data.archivo_principal_url || data.archivoPrincipalUrl,
    status: data.status,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    is_deleted: data.is_deleted || data.is_deleted,
    deleted_by_uid: data.deleted_by_uid || data.deleted_by_uid,
    deleted_at: data.deleted_at || data.deleted_at,
  }));

export type ProyectoFormData = z.infer<typeof proyectoFormSchema>;
