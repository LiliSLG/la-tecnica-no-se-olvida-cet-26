// entrevistaSchema.ts

"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TipoContenidoEntrevista, PlataformaVideo, MappedHistoriaOral } from "@/lib/supabase/types/historiaOral";
import type { MappedTema } from "@/lib/supabase/types/tema";
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
  "supabase_storage",
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


// -----------------------------------------------------------------------------
// Función para convertir un objeto HistoriaOral (visto desde Supabase) a HistoriaOralFormData
// -----------------------------------------------------------------------------
export function convertSupabaseDataToFormHistoriaOral(
  historiaOralData: MappedHistoriaOral
): HistoriaOralFormData {
  // 1) Convertir la fecha de ISO string a Date
  const dateGrab = new Date(historiaOralData.creadoEn);

  // 2) Extraer IDs de temas si existen (en HistoriaOral, el campo se llama `temas`)
  //    y devolverlos como array de strings; si no hay, dejar []
  const idsTemasSaber = Array.isArray(historiaOralData.temas)
    ? historiaOralData.temas.map((t: MappedTema) => t.id)
    : [];

  // 3) Convertir los arrays de supabase (si vienen null) a array vacío
  const palabrasClaveSaber = Array.isArray(historiaOralData.palabrasClaveSaber)
    ? historiaOralData.palabrasClaveSaber
    : [];
  const fuentesInformacion = Array.isArray(historiaOralData.fuentesInformacion)
    ? historiaOralData.fuentesInformacion
    : [];
  const recopiladoPorUids = Array.isArray(historiaOralData.recopiladoPorUids)
    ? historiaOralData.recopiladoPorUids
    : [];

  // 4) Todos los campos opcionales que en BD pueden venir null, asegurarlos como null o valor por defecto
  const obj: any = {
    tipoContenido: historiaOralData.tipoContenido,
    tituloSaber: historiaOralData.tituloSaber,
    descripcionSaber: historiaOralData.descripcionSaber,
    videoPropioURL: historiaOralData.videoPropioURL ?? "",
    plataformaVideoPropio: historiaOralData.plataformaVideoPropio ?? null,
    urlVideoExterno: historiaOralData.urlVideoExterno ?? "",
    plataformaVideoExterno: historiaOralData.plataformaVideoExterno ?? null,
    fuenteVideoExterno: historiaOralData.fuenteVideoExterno ?? "",
    fechaGrabacionORecopilacion: dateGrab,
    ambitoSaber: historiaOralData.ambitoSaber ?? "",
    idsTemasSaber: idsTemasSaber,
    palabrasClaveSaber,
    fuentesInformacion,
    recopiladoPorUids,
    transcripcionTextoCompleto: historiaOralData.transcripcionTextoCompleto ?? "",
    transcripcionFileURL: historiaOralData.transcripcionFileURL ?? "",
    imagenMiniaturaURL: historiaOralData.imagenMiniaturaURL ?? "",
    duracionMediaMinutos:
      historiaOralData.duracionMediaMinutos !== null &&
        historiaOralData.duracionMediaMinutos !== undefined
        ? historiaOralData.duracionMediaMinutos
        : undefined,
    estaPublicada: historiaOralData.estaPublicada ?? false,
  };

  // 5) Validar / parsear con el esquema zod para asegurarnos de que coincida
  return entrevistaSchema.parse(obj) as HistoriaOralFormData;
}
/**
 * TypeScript: inferimos el tipo a partir de `entrevistaSchema`.
 * Ahora `HistoriaOralFormData` incluye:
 *   - `temas: Tema[]`
 *   en lugar de `idsTemasSaber: string[]`.
 */
export type HistoriaOralFormData = z.infer<typeof entrevistaSchema>;


