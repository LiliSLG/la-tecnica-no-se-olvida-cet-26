
"use client";

import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import type { Noticia } from '@/lib/types';
import { stringToArrayZod } from '@/lib/schemas/projectSchema'; // Importar desde projectSchema

export const tipoContenidoNoticia = ['articulo_propio', 'enlace_externo'] as const;
export type TipoContenidoNoticia = typeof tipoContenidoNoticia[number];

export const tipoContenidoNoticiaLabels: Record<TipoContenidoNoticia, string> = {
  articulo_propio: 'Artículo Propio',
  enlace_externo: 'Enlace a Noticia Externa',
};

export const noticiaSchema = z.object({
  tipoContenido: z.enum(tipoContenidoNoticia, {
    required_error: "El tipo de contenido es requerido."
  }),
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  subtitulo: z.string().optional().nullable(),

  contenido: z.string().optional().nullable(),
  urlExterna: z.string().url("Debe ser una URL válida.").or(z.literal('')).optional().nullable(),
  fuenteExterna: z.string().optional().nullable(),
  resumenOContextoInterno: z.string().optional().nullable(),

  fechaPublicacion: z.date({
    required_error: "La fecha de publicación es requerida.",
    invalid_type_error: "Debe ser una fecha válida.",
  }),
  autorNoticia: z.string().optional().nullable(),

  imagenPrincipalURL: z.string().url("Debe ser una URL válida.").or(z.literal('')).or(z.literal('PENDING_UPLOAD')).optional().nullable(),

  idsTemas: z.array(z.string()).optional().nullable().default([]), // Manejará IDs de temas

  esDestacada: z.boolean().default(false),
  estaPublicada: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.tipoContenido === 'articulo_propio') {
    if (!data.contenido || data.contenido.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El contenido es requerido para artículos propios y debe tener al menos 10 caracteres.",
        path: ['contenido'],
      });
    }
  } else if (data.tipoContenido === 'enlace_externo') {
    if (!data.urlExterna || data.urlExterna.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La URL externa es requerida para enlaces externos.",
        path: ['urlExterna'],
      });
    }
    if (!data.resumenOContextoInterno || data.resumenOContextoInterno.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El resumen interno es requerido para enlaces externos y debe tener al menos 10 caracteres (para la IA).",
        path: ['resumenOContextoInterno'],
      });
    }
  }
});

export type NoticiaFormData = z.infer<typeof noticiaSchema>;

export function convertFormDataForFirestoreNoticia(data: NoticiaFormData): Partial<Noticia> {
  const firestoreData: { [key: string]: any } = { ...data };

  firestoreData.fechaPublicacion = Timestamp.fromDate(data.fechaPublicacion);

  firestoreData.esDestacada = data.esDestacada ?? false;
  firestoreData.estaPublicada = data.estaPublicada ?? false;

  const optionalFields: (keyof NoticiaFormData)[] = [
    'subtitulo', 'contenido', 'urlExterna', 'fuenteExterna',
    'resumenOContextoInterno', 'autorNoticia', 'imagenPrincipalURL'
  ];
  optionalFields.forEach(key => {
    if (firestoreData[key] === '' || firestoreData[key] === undefined) {
      firestoreData[key] = null;
    }
  });

  if (firestoreData.imagenPrincipalURL === 'PENDING_UPLOAD') {
    firestoreData.imagenPrincipalURL = null;
  }

  firestoreData.idsTemas = (Array.isArray(data.idsTemas) && data.idsTemas.length > 0)
    ? data.idsTemas.filter(Boolean)
    : null;

  return firestoreData as Partial<Noticia>;
}

export function convertFirestoreDataToFormNoticia(noticiaData: Noticia): NoticiaFormData {
  const formData: { [key: string]: any } = { ...noticiaData };

  formData.fechaPublicacion = noticiaData.fechaPublicacion instanceof Timestamp
    ? noticiaData.fechaPublicacion.toDate()
    : new Date();

  // idsTemas ya es un array de IDs, no necesita conversión de string a array.
  formData.idsTemas = Array.isArray(noticiaData.idsTemas)
    ? noticiaData.idsTemas
    : [];

  const optionalStringFields: (keyof NoticiaFormData)[] = [
    'subtitulo', 'contenido', 'urlExterna', 'fuenteExterna',
    'resumenOContextoInterno', 'autorNoticia', 'imagenPrincipalURL'
  ];
  optionalStringFields.forEach(key => {
    formData[key] = noticiaData[key as keyof Noticia] || '';
  });

  formData.esDestacada = noticiaData.esDestacada ?? false;
  formData.estaPublicada = noticiaData.estaPublicada ?? false;

  return noticiaSchema.parse(formData) as NoticiaFormData;
}
    