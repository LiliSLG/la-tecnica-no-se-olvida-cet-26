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
  esta_eliminada: z.boolean().default(false),
  eliminado_por_uid: z.string().nullable(),
  eliminado_en: z.string().nullable(),
});

// Form-specific schema with camelCase fields
export const organizacionFormSchema = organizacionSchema.extend({
  logoUrl: z.string().url("URL inválida").nullable(),
  sitioWeb: z.string().url("URL inválida").nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  estaEliminada: z.boolean().default(false),
  eliminadoPorUid: z.string().nullable(),
  eliminadoEn: z.string().nullable(),
}).transform(data => ({
  // Transform to MappedOrganizacion format
  id: data.id,
  nombre: data.nombre,
  descripcion: data.descripcion,
  logoUrl: data.logo_url || data.logoUrl,
  sitioWeb: data.sitio_web || data.sitioWeb,
  createdAt: data.created_at || data.createdAt,
  updatedAt: data.updated_at || data.updatedAt,
  estaEliminada: data.esta_eliminada || data.estaEliminada,
  eliminadoPorUid: data.eliminado_por_uid || data.eliminadoPorUid,
  eliminadoEn: data.eliminado_en || data.eliminadoEn,
}));

export type OrganizacionFormData = z.infer<typeof organizacionFormSchema>; 