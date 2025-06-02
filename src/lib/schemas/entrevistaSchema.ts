// entrevistaSchema.ts

"use client";

import { z } from "zod";
import type {
  Entrevista,
  TipoContenidoEntrevista,
  PlataformaVideo,
  Tema,
} from "@/lib/types";
import { stringToArrayZod } from "@/lib/schemas/projectSchema";

/**
 * Opciones para tipo de contenido de la entrevista.
 */
export const tipoContenidoEntrevistaOptions = [
  "video_propio",
  "enlace_video_externo",
] as const;
/**
 * Opciones para plataforma de video propio.
 */
export const plataformaVideoPropioOptions = [
  "firebase_storage",
  "youtube_propio",
] as const;

/**
 * Opciones para plataforma de video externo.
 */
export const plataformaVideoExternoOptions = [
  "youtube",
  "facebook",
  "vimeo",
  "otro",
] as const;

/**
 * Esquema Zod para validar los datos del formulario de entrevista.
 *
 * - Se reemplaza `idsTemasSaber: string[]` por `temas: Tema[]`.
 * - Se quita cualquier referencia a Firebase Timestamp.
 */
export const entrevistaSchema = z
  .object({
    tipoContenido: z.enum(tipoContenidoEntrevistaOptions, {
      required_error: "El tipo de contenido es requerido.",
    }),

    tituloSaber: z
      .string()
      .min(
        5,
        "El título del saber/entrevista debe tener al menos 5 caracteres."
      ),

    descripcionSaber: z
      .string()
      .min(10, "La descripción/resumen debe tener al menos 10 caracteres."),

    videoPropioURL: z
      .string()
      .url("Debe ser una URL válida.")
      .or(z.literal(""))
      .optional()
      .nullable(),

    plataformaVideoPropio: z
      .enum(
        plataformaVideoPropioOptions
      )
      .optional()
      .nullable(),

    urlVideoExterno: z
      .string()
      .url("Debe ser una URL válida.")
      .or(z.literal(""))
      .optional()
      .nullable(),

    plataformaVideoExterno: z
      .enum(
        plataformaVideoExternoOptions 
      )
      .optional()
      .nullable(),

    fuenteVideoExterno: z.string().optional().nullable(),

    fechaGrabacionORecopilacion: z.date({
      required_error: "La fecha de grabación/recopilación es requerida.",
      invalid_type_error: "Debe ser una fecha válida.",
    }),

    ambitoSaber: z.string().optional().nullable(),

    /**
     * Ahora `temas` es un arreglo de objetos `Tema` (con al menos `{ id, nombre }`).
     * En lugar de `idsTemasSaber: string[]`.
     */
    temas: z
      .array(
        z.object({
          id: z.string(),
          nombre: z.string(),
          // Si quieres validar otros campos de Tema (por ejemplo, categoría), los puedes agregar aquí:
          // categoriaTema: z.string().optional(),
        })
      )
      .optional()
      .default([]),

    palabrasClaveSaber: stringToArrayZod.optional().nullable().default([]),

    fuentesInformacion: stringToArrayZod.refine(
      (val) => val && val.length > 0,
      {
        message: "Debe ingresar al menos un nombre de entrevistado/fuente.",
      }
    ),

    recopiladoPorUids: stringToArrayZod.optional().nullable().default([]),

    transcripcionTextoCompleto: z.string().optional().nullable(),

    transcripcionFileURL: z
      .string()
      .url("Debe ser una URL válida.")
      .or(z.literal(""))
      .or(z.literal("PENDING_UPLOAD_TRANSCRIPCION"))
      .optional()
      .nullable(),

    imagenMiniaturaURL: z
      .string()
      .url("Debe ser una URL válida.")
      .or(z.literal(""))
      .or(z.literal("PENDING_UPLOAD_MINIATURA"))
      .optional()
      .nullable(),

    duracionMediaMinutos: z.coerce
      .number()
      .int()
      .min(0, "La duración debe ser 0 o más.")
      .optional()
      .nullable(),

    estaPublicada: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // Validaciones condicionales según tipoContenido
    if (data.tipoContenido === "video_propio") {
      if (!data.videoPropioURL || data.videoPropioURL.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La URL del video propio es requerida.",
          path: ["videoPropioURL"],
        });
      }
    } else if (data.tipoContenido === "enlace_video_externo") {
      if (!data.urlVideoExterno || data.urlVideoExterno.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La URL del video externo es requerida.",
          path: ["urlVideoExterno"],
        });
      }
    }
  });

/**
 * TypeScript: inferimos el tipo a partir de `entrevistaSchema`.
 * Ahora `EntrevistaFormData` incluye:
 *   - `temas: Tema[]`
 *   en lugar de `idsTemasSaber: string[]`.
 */
export type EntrevistaFormData = z.infer<typeof entrevistaSchema>;

/*
  --------------------------------------------------------------------------
  NOTA IMPORTANTE:
  Hemos eliminado las funciones de conversión a/desde Firestore y Firebase
  (`Timestamp`) porque ahora tu backend es Supabase. Si necesitas
  funciones de conversión para Supabase, debes crearlas en un archivo distinto,
  usando la API de Supabase (p. ej. supabase.from("entrevistas").insert(...) ).
  --------------------------------------------------------------------------
*/
