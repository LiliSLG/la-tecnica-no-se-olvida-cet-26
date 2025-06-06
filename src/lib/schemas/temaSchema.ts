import { z } from "zod";

// Base schema that matches database structure
export const temaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  esta_eliminado: z.boolean().default(false),
  eliminado_por_uid: z.string().nullable(),
  eliminado_en: z.string().nullable(),
});

// Form-specific schema with camelCase fields
export const temaFormSchema = temaSchema.extend({
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  estaEliminado: z.boolean().default(false),
  eliminadoPorUid: z.string().nullable(),
  eliminadoEn: z.string().nullable(),
}).transform(data => ({
  // Transform to MappedTema format
  id: data.id,
  nombre: data.nombre,
  descripcion: data.descripcion,
  createdAt: data.created_at || data.createdAt,
  updatedAt: data.updated_at || data.updatedAt,
  estaEliminado: data.esta_eliminado || data.estaEliminado,
  eliminadoPorUid: data.eliminado_por_uid || data.eliminadoPorUid,
  eliminadoEn: data.eliminado_en || data.eliminadoEn,
}));

export type TemaFormData = z.infer<typeof temaFormSchema>; 