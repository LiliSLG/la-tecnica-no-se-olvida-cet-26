import { z } from "zod";

// Base schema that matches database structure
export const organizacionSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().nullable(),
  logo_url: z.string().url("URL inválida").nullable(),
  sitio_web: z.string().url("URL inválida").nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_deleted: z.boolean().default(false),
  deleted_by_uid: z.string().nullable(),
  deleted_at: z.string().nullable(),
});

// Form-specific schema with camelCase fields
export const organizacionFormSchema = organizacionSchema
  .extend({
    logoUrl: z.string().url("URL inválida").nullable(),
    sitioWeb: z.string().url("URL inválida").nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    is_deleted: z.boolean().default(false),
    deleted_by_uid: z.string().nullable(),
    deleted_at: z.string().nullable(),
  })
  .transform((data) => ({
    // Transform to MappedOrganizacion format
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    logoUrl: data.logo_url || data.logoUrl,
    sitioWeb: data.sitio_web || data.sitioWeb,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    is_deleted: data.is_deleted || data.is_deleted,
    deleted_by_uid: data.deleted_by_uid || data.deleted_by_uid,
    deleted_at: data.deleted_at || data.deleted_at,
  }));

export type OrganizacionFormData = z.infer<typeof organizacionFormSchema>;
