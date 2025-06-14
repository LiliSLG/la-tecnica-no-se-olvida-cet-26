import { z } from "zod";

const tipoNoticiaEnum = z.enum(["article", "link"]);

// Base schema that matches database structure
export const noticiaSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  contenido: z.string().nullable(),
  tipo: tipoNoticiaEnum,
  imagen_url: z.string().url("URL inválida").nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_deleted: z.boolean().default(false),
  deleted_by_uid: z.string().nullable(),
  deleted_at: z.string().nullable(),
});

// Form-specific schema with camelCase fields
export const noticiaFormSchema = noticiaSchema
  .extend({
    imagenUrl: z.string().url("URL inválida").nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    is_deleted: z.boolean().default(false),
    deleted_by_uid: z.string().nullable(),
    deleted_at: z.string().nullable(),
  })
  .transform((data) => ({
    // Transform to MappedNoticia format
    id: data.id,
    titulo: data.titulo,
    contenido: data.contenido,
    tipo: data.tipo,
    imagenUrl: data.imagen_url || data.imagenUrl,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    is_deleted: data.is_deleted || data.is_deleted,
    deleted_by_uid: data.deleted_by_uid || data.deleted_by_uid,
    deleted_at: data.deleted_at || data.deleted_at,
  }));

export type NoticiaFormData = z.infer<typeof noticiaFormSchema>;
