// src/lib/schemas/temaSchema.ts

import { z } from "zod";
import type { Tema } from "@/lib/types";

// --- Definiciones de categorías ---
export const temaCategorias = [
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
] as const;
export type TemaCategoria = (typeof temaCategorias)[number];

export const temaCategoriaLabels: Record<TemaCategoria, string> = {
  agropecuario: "Agropecuario",
  tecnologico: "Tecnológico",
  social: "Social",
  ambiental: "Ambiental",
  educativo: "Educativo",
  produccion_animal: "Producción Animal",
  sanidad: "Sanidad",
  energia: "Energía",
  recursos_naturales: "Recursos Naturales",
  manejo_suelo: "Manejo de Suelo",
  gastronomia: "Gastronomía",
  otro: "Otro",
};

// --- Zod-schema para el formulario de Tema ---
export const temaSchema = z.object({
  nombre: z
    .string()
    .min(
      2,
      "El nombre del tema es requerido y debe tener al menos 2 caracteres."
    ),
  descripcion: z.string().optional().nullable(),
  categoriaTema: z.enum(temaCategorias).optional().nullable(),
});
export type TemaFormData = z.infer<typeof temaSchema>;

// -----------------------------------------------------------------------------
// Convierte un row de Supabase (Tema) a TemaFormData.
// Aquí recibimos el objeto completo que vino de la tabla “temas”.
// -----------------------------------------------------------------------------
export function convertSupabaseDataToFormTema(temaData: Tema): TemaFormData {
  // 1) Normalizar strings que puedan venir null a ''
  const nombre = temaData.nombre;
  const descripcion = temaData.descripcion ?? "";
  const categoriaTema = temaData.categoriaTema ?? "";

  try {
    // 2) Parsear con el esquema para validar
    const parsed = temaSchema.parse({
      nombre,
      descripcion,
      categoriaTema: categoriaTema || undefined,
    });

    // 3) Devolver, asegurando que categoría sea null si quedó cadena vacía
    return {
      nombre: parsed.nombre,
      descripcion: parsed.descripcion ?? null,
      categoriaTema: parsed.categoriaTema ?? null,
    } as TemaFormData;
  } catch (e) {
    console.error("Error al parsear temaData en FormTema:", e, temaData);
    // En caso de falla, devolvemos valores mínimos
    return {
      nombre: temaData.nombre,
      descripcion: temaData.descripcion ?? null,
      categoriaTema: temaData.categoriaTema ?? null,
    } as TemaFormData;
  }
}

// -----------------------------------------------------------------------------
// Convierte TemaFormData (lo que sale del form) a Partial<Tema> para insertar/actualizar.
// Recibe userId para llenar ingresadoPorUid y modificadoPorUid.
// Si existingTema.id existe, se trata de un update; de lo contrario, es un insert.
// -----------------------------------------------------------------------------
export function convertFormDataToSupabaseTema(
  data: TemaFormData,
  userId: string,
  existingTema?: Tema
): Partial<Tema> {
  // 1) Empezamos clonando campos de form y mapeando '' a null
  const nombre = data.nombre.trim();
  const descripcion =
    data.descripcion && data.descripcion.trim() !== ""
      ? data.descripcion.trim()
      : null;
  const categoriaTema =
    data.categoriaTema && data.categoriaTema.trim() !== ""
      ? (data.categoriaTema as TemaCategoria)
      : null;

  const temaPayload: Partial<Tema> = {
    nombre,
    descripcion,
    categoriaTema,
    modificadoPorUid: userId,
  };

  // 2) Si no existe existingTema.id, es insert: agregar ingresadoPorUid y estaEliminada=false
  if (!existingTema?.id) {
    temaPayload.ingresadoPorUid = userId;
    temaPayload.estaEliminada = false;
    // Los timestamps (creadoEn/actualizadoEn) los maneja la tabla con DEFAULT NOW()
  }

  return temaPayload;
}
