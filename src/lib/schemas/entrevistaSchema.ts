
"use client";

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import type { Entrevista, TipoContenidoEntrevista, PlataformaVideo } from '@/lib/types';
import { stringToArrayZod } from '@/lib/schemas/projectSchema'; // Importar desde projectSchema

export const tipoContenidoEntrevistaOptions: TipoContenidoEntrevista[] = ['video_propio', 'enlace_video_externo'];
export const plataformaVideoPropioOptions: PlataformaVideo[] = ['firebase_storage', 'youtube_propio'];
export const plataformaVideoExternoOptions: PlataformaVideo[] = ['youtube', 'facebook', 'vimeo', 'otro'];

export const entrevistaSchema = z.object({
  tipoContenido: z.enum(tipoContenidoEntrevistaOptions, {
    required_error: "El tipo de contenido es requerido."
  }),
  tituloSaber: z.string().min(5, "El título del saber/entrevista debe tener al menos 5 caracteres."),
  descripcionSaber: z.string().min(10, "La descripción/resumen debe tener al menos 10 caracteres."),

  videoPropioURL: z.string().url("Debe ser una URL válida.").or(z.literal('')).optional().nullable(),
  plataformaVideoPropio: z.enum(plataformaVideoPropioOptions as [PlataformaVideo, ...PlataformaVideo[]]).optional().nullable(),

  urlVideoExterno: z.string().url("Debe ser una URL válida.").or(z.literal('')).optional().nullable(),
  plataformaVideoExterno: z.enum(plataformaVideoExternoOptions as [PlataformaVideo, ...PlataformaVideo[]]).optional().nullable(),
  fuenteVideoExterno: z.string().optional().nullable(),

  fechaGrabacionORecopilacion: z.date({
    required_error: "La fecha de grabación/recopilación es requerida.",
    invalid_type_error: "Debe ser una fecha válida.",
  }),
  ambitoSaber: z.string().optional().nullable(),
  idsTemasSaber: z.array(z.string()).optional().nullable().default([]), // Manejará IDs de temas
  palabrasClaveSaber: stringToArrayZod.optional().nullable().default([]),
  fuentesInformacion: stringToArrayZod.refine(val => val && val.length > 0, {
    message: "Debe ingresar al menos un nombre de entrevistado/fuente."
  }),
  recopiladoPorUids: stringToArrayZod.optional().nullable().default([]),

  transcripcionTextoCompleto: z.string().optional().nullable(),
  transcripcionFileURL: z.string().url("Debe ser una URL válida.").or(z.literal('')).or(z.literal('PENDING_UPLOAD_TRANSCRIPCION')).optional().nullable(),

  imagenMiniaturaURL: z.string().url("Debe ser una URL válida.").or(z.literal('')).or(z.literal('PENDING_UPLOAD_MINIATURA')).optional().nullable(),
  duracionMediaMinutos: z.coerce.number().int().min(0).optional().nullable(),

  estaPublicada: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.tipoContenido === 'video_propio') {
    if (!data.videoPropioURL || data.videoPropioURL.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La URL del video propio es requerida.",
        path: ['videoPropioURL'],
      });
    }
  } else if (data.tipoContenido === 'enlace_video_externo') {
    if (!data.urlVideoExterno || data.urlVideoExterno.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La URL del video externo es requerida.",
        path: ['urlVideoExterno'],
      });
    }
  }
});

export type EntrevistaFormData = z.infer<typeof entrevistaSchema>;

export function convertFormDataForFirestoreEntrevista(data: EntrevistaFormData, adminUid: string, existingId?: string): Partial<Entrevista> {
  const firestoreData: { [key: string]: any } = { ...data };

  firestoreData.fechaGrabacionORecopilacion = Timestamp.fromDate(data.fechaGrabacionORecopilacion);

  const optionalStringFields: (keyof EntrevistaFormData)[] = [
    'videoPropioURL', 'plataformaVideoPropio', 'urlVideoExterno', 'plataformaVideoExterno',
    'fuenteVideoExterno', 'ambitoSaber', 'transcripcionTextoCompleto',
    'transcripcionFileURL', 'imagenMiniaturaURL'
  ];
  optionalStringFields.forEach(key => {
    if (firestoreData[key] === '' || firestoreData[key] === undefined) {
      firestoreData[key] = null;
    }
  });

  if (firestoreData.transcripcionFileURL === 'PENDING_UPLOAD_TRANSCRIPCION') firestoreData.transcripcionFileURL = null;
  if (firestoreData.imagenMiniaturaURL === 'PENDING_UPLOAD_MINIATURA') firestoreData.imagenMiniaturaURL = null;

  const arrayFieldsToStrings: (keyof EntrevistaFormData)[] = ['palabrasClaveSaber', 'fuentesInformacion', 'recopiladoPorUids'];
  arrayFieldsToStrings.forEach(key => {
    firestoreData[key] = (Array.isArray(data[key]) && (data[key] as string[]).length > 0)
      ? (data[key] as string[]).filter(Boolean)
      : null;
  });

  firestoreData.idsTemasSaber = (Array.isArray(data.idsTemasSaber) && data.idsTemasSaber.length > 0)
    ? data.idsTemasSaber.filter(Boolean)
    : null;

  firestoreData.duracionMediaMinutos = data.duracionMediaMinutos === undefined || data.duracionMediaMinutos === null || isNaN(Number(data.duracionMediaMinutos)) ? null : Number(data.duracionMediaMinutos);

  if (!existingId) {
    firestoreData.creadoPorUid = adminUid;
    firestoreData.creadoEn = Timestamp.now(); // serverTimestamp() is better handled in service
    firestoreData.estaEliminada = false;
  }
  firestoreData.modificadoPorUid = adminUid;
  firestoreData.actualizadoEn = Timestamp.now(); // serverTimestamp()

  return firestoreData as Partial<Entrevista>;
}

export function convertFirestoreDataToFormEntrevista(entrevistaData: Entrevista): EntrevistaFormData {
  const formData: { [key: string]: any } = { ...entrevistaData };

  formData.fechaGrabacionORecopilacion = entrevistaData.fechaGrabacionORecopilacion instanceof Timestamp
    ? entrevistaData.fechaGrabacionORecopilacion.toDate()
    : new Date();

  formData.idsTemasSaber = Array.isArray(entrevistaData.idsTemasSaber) ? entrevistaData.idsTemasSaber : [];
  formData.palabrasClaveSaber = Array.isArray(entrevistaData.palabrasClaveSaber) ? entrevistaData.palabrasClaveSaber : [];
  formData.fuentesInformacion = Array.isArray(entrevistaData.fuentesInformacion) ? entrevistaData.fuentesInformacion : [];
  formData.recopiladoPorUids = Array.isArray(entrevistaData.recopiladoPorUids) ? entrevistaData.recopiladoPorUids : [];

  const optionalFieldsToNull: (keyof Entrevista)[] = [
    'videoPropioURL', 'plataformaVideoPropio', 'urlVideoExterno', 'plataformaVideoExterno',
    'fuenteVideoExterno', 'ambitoSaber', 'transcripcionTextoCompleto',
    'transcripcionFileURL', 'imagenMiniaturaURL'
  ];
  optionalFieldsToNull.forEach(key => {
    formData[key] = entrevistaData[key] ?? null; // Ensure null if undefined for form consistency
  });

  formData.duracionMediaMinutos = entrevistaData.duracionMediaMinutos === undefined || entrevistaData.duracionMediaMinutos === null ? undefined : Number(entrevistaData.duracionMediaMinutos);
  formData.estaPublicada = entrevistaData.estaPublicada ?? false;

  const validatedData = entrevistaSchema.parse({
    tipoContenido: formData.tipoContenido || 'video_propio',
    tituloSaber: formData.tituloSaber || '',
    descripcionSaber: formData.descripcionSaber || '',
    videoPropioURL: formData.videoPropioURL, // Keep as null if it is
    plataformaVideoPropio: formData.plataformaVideoPropio,
    urlVideoExterno: formData.urlVideoExterno,
    plataformaVideoExterno: formData.plataformaVideoExterno,
    fuenteVideoExterno: formData.fuenteVideoExterno,
    fechaGrabacionORecopilacion: formData.fechaGrabacionORecopilacion || new Date(),
    ambitoSaber: formData.ambitoSaber,
    idsTemasSaber: formData.idsTemasSaber || [],
    palabrasClaveSaber: formData.palabrasClaveSaber || [],
    fuentesInformacion: formData.fuentesInformacion || [],
    recopiladoPorUids: formData.recopiladoPorUids || [],
    transcripcionTextoCompleto: formData.transcripcionTextoCompleto,
    transcripcionFileURL: formData.transcripcionFileURL,
    imagenMiniaturaURL: formData.imagenMiniaturaURL,
    duracionMediaMinutos: formData.duracionMediaMinutos,
    estaPublicada: formData.estaPublicada ?? false,
  });

  return validatedData as EntrevistaFormData;
}
    