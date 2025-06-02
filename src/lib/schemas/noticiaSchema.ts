"use client";

import { z } from "zod";
import type { Noticia, Tema, TemaOption } from "@/lib/types";
import { stringToArrayZod } from "@/lib/schemas/projectSchema";

/**
 * Opciones literales para el campo tipoContenido de Noticia.
 */
export const tipoContenidoNoticia = ["articulo_propio", "enlace_externo"] as const;
export type TipoContenidoNoticia = typeof tipoContenidoNoticia[number];

/**
 * Etiquetas legibles para los tipos de contenido.
 */
export const tipoContenidoNoticiaLabels: Record<TipoContenidoNoticia, string> = {
  articulo_propio: "Artículo Propio",
  enlace_externo: "Enlace a Noticia Externa",
};

/**
 * Esquema Zod para validar los datos del formulario de Noticia.
 *
 * - Se reemplaza `idsTemas: string[]` por `temas: TemaOption[]`.
 * - Se elimina todo lo relacionado con Firebase Timestamp.
 */
export const noticiaSchema = z
  .object({
    tipoContenido: z.enum(tipoContenidoNoticia, {
      required_error: "El tipo de contenido es requerido.",
    }),

    titulo: z
      .string()
      .min(5, "El título debe tener al menos 5 caracteres."),

    subtitulo: z.string().optional().nullable(),

    contenido: z.string().optional().nullable(),

    urlExterna: z
      .string()
      .url("Debe ser una URL válida.")
      .or(z.literal(""))
      .optional()
      .nullable(),

    fuenteExterna: z.string().optional().nullable(),

    resumenOContextoInterno: z.string().optional().nullable(),

    fechaPublicacion: z.date({
      required_error: "La fecha de publicación es requerida.",
      invalid_type_error: "Debe ser una fecha válida.",
    }),

    autorNoticia: z.string().optional().nullable(),

    imagenPrincipalURL: z
      .string()
      .url("Debe ser una URL válida.")
      .or(z.literal(""))
      .or(z.literal("PENDING_UPLOAD"))
      .optional()
      .nullable(),

    /**
     * Ahora `temas` es un arreglo de objetos `TemaOption` (solo `id` y `nombre`),
     * en lugar de `idsTemas: string[]`.
     */
    temas: z
      .array(
        z.object({
          id: z.string(),
          nombre: z.string(),
          // Si en algún caso quieres validar más campos de Tema, agrégalo aquí:
          // ejemplo: categoriaTema: z.string().optional(),
        })
      )
      .optional()
      .default([]),

    esDestacada: z.boolean().default(false),

    estaPublicada: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.tipoContenido === "articulo_propio") {
      if (!data.contenido || data.contenido.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El contenido es requerido para artículos propios y debe tener al menos 10 caracteres.",
          path: ["contenido"],
        });
      }
    } else if (data.tipoContenido === "enlace_externo") {
      if (!data.urlExterna || data.urlExterna.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La URL externa es requerida para enlaces externos.",
          path: ["urlExterna"],
        });
      }
      if (
        !data.resumenOContextoInterno ||
        data.resumenOContextoInterno.trim().length < 10
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El resumen interno es requerido para enlaces externos y debe tener al menos 10 caracteres (para la IA).",
          path: ["resumenOContextoInterno"],
        });
      }
    }
  });

  // -----------------------------------------------------------------------------
// Función para convertir un objeto Noticia (visto desde Supabase) a NoticiaFormData
// -----------------------------------------------------------------------------
export function convertSupabaseDataToFormNoticia(
  noticiaData: Noticia
): NoticiaFormData {
  // 1) Convertir la fecha de ISO string a Date
  const fechaPub = new Date(noticiaData.fechaPublicacion);

  // 2) Extraer IDs de temas si existen (en Noticia, el campo se llama `temas`)
  //    y devolverlos como array de strings; si no hay, dejar []
  const idsTemas = Array.isArray(noticiaData.temas)
    ? (noticiaData.temas as TemaOption[]).map((t) => t.id)
    : [];

  // 3) Normalizar campos opcionales que pueden venir null o undefined
  const obj: any = {
    tipoContenido: noticiaData.tipoContenido,
    titulo: noticiaData.titulo,
    subtitulo: noticiaData.subtitulo ?? "",
    contenido: noticiaData.contenido ?? "",
    urlExterna: noticiaData.urlExterna ?? "",
    fuenteExterna: noticiaData.fuenteExterna ?? "",
    resumenOContextoInterno: noticiaData.resumenOContextoInterno ?? "",
    fechaPublicacion: fechaPub,
    autorNoticia: noticiaData.autorNoticia ?? "",
    imagenPrincipalURL: noticiaData.imagenPrincipalURL ?? "",
    idsTemas: idsTemas,
    esDestacada: noticiaData.esDestacada ?? false,
    estaPublicada: noticiaData.estaPublicada ?? false,
  };

  // 4) Validar/parsear con el esquema Zod para asegurar coalescencia
  return noticiaSchema.parse(obj) as NoticiaFormData;
}
/**
 * A partir del esquema, inferimos el tipo que usará React Hook Form.
 * En este tipo, `temas` es `TemaOption[]` en lugar de `idsTemas: string[]`.
 */
export type NoticiaFormData = z.infer<typeof noticiaSchema>;


