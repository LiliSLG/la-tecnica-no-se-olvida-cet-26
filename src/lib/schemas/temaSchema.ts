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

// Valor especial para “ninguna categoría”
const NINGUNA_CATEGORIA_VALUE = "_ninguna_categoria_";

// ————————————————————————————————————————————————————————————————
// Schema Zod para editar/crear un Tema completo
export const temaSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre del tema es requerido y debe tener al menos 2 caracteres."),
  descripcion: z.string().optional().nullable(),
  categoriaTema: z
    .enum(
      temaCategorias as unknown as [TemaCategoria, ...TemaCategoria[]],
      {
        invalid_type_error: "Categoría inválida.",
      }
    )
    .optional()
    .nullable(),
});
export type TemaFormData = z.infer<typeof temaSchema>;

// ————————————————————————————————————————————————————————————————
// Schema Zod para el modal de “Agregar Tema”
// Permite usar el valor especial "_ninguna_categoria_" para “sin categoría”
export const addTemaModalSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre del tema es requerido y debe tener al menos 2 caracteres."),
  descripcion: z.string().optional().nullable(),
  categoriaTema: z
    .enum(
      temaCategorias as unknown as [TemaCategoria, ...TemaCategoria[]],
      {
        invalid_type_error: "Categoría inválida.",
      }
    )
    .or(z.literal(NINGUNA_CATEGORIA_VALUE))
    .optional()
    .nullable(),
});
export type AddTemaModalFormData = z.infer<typeof addTemaModalSchema>;

// ————————————————————————————————————————————————————————————————
// Funciones opcionales para convertir entre formulario y Supabase/Postgres
// (ajústalas a tu lógica de guardado si es necesario)

export function convertFormDataToSupabaseTema(
  data: TemaFormData | AddTemaModalFormData,
  userId: string,
  existingTema?: { id: string }
): Record<string, any> {
  const supaData: Record<string, any> = { ...data };

  // Convertir cadenas vacías o el valor especial a null
  Object.keys(supaData).forEach((key) => {
    const val = supaData[key as keyof typeof supaData];
    if (val === "" || val === NINGUNA_CATEGORIA_VALUE) {
      supaData[key] = null;
    }
  });

  if (!existingTema?.id) {
    supaData.ingresadoPorUid = userId;
    // En Supabase/Postgres definimos `DEFAULT NOW()` para creadoEn, por eso no lo ponemos aquí
    supaData.estaEliminada = false;
  }
  supaData.modificadoPorUid = userId;
  // Para `actualizadoEn` también usamos DEFAULT NOW() en la tabla, así que no asignamos nada aquí

  return supaData;
}

export function convertSupabaseDataToFormTema(
  temaData: Record<string, any>
): TemaFormData {
  const formData: Record<string, any> = { ...temaData };

  // Si viene null, convertir a "" para el formulario
  if (formData.nombre === null) formData.nombre = "";
  if (formData.descripcion === null) formData.descripcion = "";
  // Si la categoría no está en el array original, o es null, dejarla como null
  if (!temaCategorias.includes(formData.categoriaTema)) {
    formData.categoriaTema = null;
  }

  // Zod validará y completará defaults
  return temaSchema.parse({
    nombre: formData.nombre || "",
    descripcion: formData.descripcion || null,
    categoriaTema: formData.categoriaTema || null,
  });
}