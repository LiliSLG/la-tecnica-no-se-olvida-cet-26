import { z } from "zod";

// Base schema that matches database structure
export const personaSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").nullable(),
  foto_url: z.string().url("URL inválida").nullable(),
  biografia: z.string().nullable(),
  categoria_principal: z.string().nullable(),
  capacidades_plataforma: z.array(z.string()).nullable(),
  es_admin: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  esta_eliminada: z.boolean().default(false),
  eliminado_por_uid: z.string().nullable(),
  eliminado_en: z.string().nullable(),
});

// Form-specific schema with camelCase fields
export const personaFormSchema = personaSchema.extend({
  fotoUrl: z.string().url("URL inválida").nullable(),
  categoriaPrincipal: z.string().nullable(),
  capacidadesPlataforma: z.array(z.string()).nullable(),
  esAdmin: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  estaEliminada: z.boolean().default(false),
  eliminadoPorUid: z.string().nullable(),
  eliminadoEn: z.string().nullable(),
}).transform(data => ({
  // Transform to MappedPersona format
  id: data.id,
  nombre: data.nombre,
  email: data.email,
  fotoUrl: data.foto_url || data.fotoUrl,
  biografia: data.biografia,
  categoriaPrincipal: data.categoria_principal || data.categoriaPrincipal,
  capacidadesPlataforma: data.capacidades_plataforma || data.capacidadesPlataforma,
  esAdmin: data.es_admin || data.esAdmin,
  createdAt: data.created_at || data.createdAt,
  updatedAt: data.updated_at || data.updatedAt,
  estaEliminada: data.esta_eliminada || data.estaEliminada,
  eliminadoPorUid: data.eliminado_por_uid || data.eliminadoPorUid,
  eliminadoEn: data.eliminado_en || data.eliminadoEn,
}));

export type PersonaFormData = z.infer<typeof personaFormSchema>; 