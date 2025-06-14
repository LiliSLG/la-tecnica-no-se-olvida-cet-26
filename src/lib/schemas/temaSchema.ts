import { z } from "zod";
import { Database } from "../supabase/types/database.types";

// Base schema that matches database structure
export const temaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().nullable(),
  categoriaTema: z.enum(
    [
      "agropecuario",
      "tecnologico",
      "social",
      "ambiental",
      "educativo",
      "produccion_animal",
      "sanidad",
      "energia",
      "recursos_naturales",
      "manejo_suelo",
      "gastronomia",
      "otro",
    ] as const,
    {
      required_error: "La categoría es requerida",
    }
  ),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_deleted: z.boolean().default(false),
  deleted_by_uid: z.string().nullable(),
  deleted_at: z.string().nullable(),
});

// Form-specific schema with camelCase fields
export const temaFormSchema = temaSchema
  .extend({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    is_deleted: z.boolean().default(false),
    deleted_by_uid: z.string().nullable(),
    deleted_at: z.string().nullable(),
  })
  .transform((data) => ({
    // Transform to MappedTema format
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    categoriaTema: data.categoriaTema,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    is_deleted: data.is_deleted || data.is_deleted,
    deleted_by_uid: data.deleted_by_uid || data.deleted_by_uid,
    deleted_at: data.deleted_at || data.deleted_at,
  }));

export type TemaFormData = z.infer<typeof temaFormSchema>;
