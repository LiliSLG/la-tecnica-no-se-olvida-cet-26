
"use client";

import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore';

// Example categories for Temas, adjust as needed
export const temaCategorias = [
  'agropecuario', 
  'tecnologico', 
  'social', 
  'ambiental', 
  'educativo', 
  'produccion_animal', 
  'sanidad', 
  'energia',
  'recursos_naturales',
  'manejo_suelo',
  'gastronomia', // Added gastronomia
  'otro'
] as const;
export type TemaCategoria = typeof temaCategorias[number];

export const temaCategoriaLabels: Record<TemaCategoria, string> = {
  agropecuario: 'Agropecuario',
  tecnologico: 'Tecnológico',
  social: 'Social',
  ambiental: 'Ambiental',
  educativo: 'Educativo',
  produccion_animal: 'Producción Animal',
  sanidad: 'Sanidad',
  energia: 'Energía',
  recursos_naturales: 'Recursos Naturales',
  manejo_suelo: 'Manejo de Suelo',
  gastronomia: 'Gastronomía', // Added label for gastronomia
  otro: 'Otro',
};

const NINGUNA_CATEGORIA_VALUE = "_ninguna_categoria_"; // Special value for "Ninguna"

export const temaSchema = z.object({
  nombre: z.string().min(2, "El nombre del tema es requerido y debe tener al menos 2 caracteres."),
  descripcion: z.string().optional().nullable(),
  categoriaTema: z.enum(temaCategorias).optional().nullable(),
});
export type TemaFormData = z.infer<typeof temaSchema>;


// Schema for the AddTemaModal
export const addTemaModalSchema = z.object({
  nombre: z.string().min(2, "El nombre del tema es requerido."),
  descripcion: z.string().optional().nullable(),
  categoriaTema: z.enum(temaCategorias).or(z.literal(NINGUNA_CATEGORIA_VALUE)).optional().nullable(),
});
export type AddTemaModalFormData = z.infer<typeof addTemaModalSchema>;


export function convertFormDataForFirestoreTema(
  data: TemaFormData | AddTemaModalFormData, // Can be from either form
  userId: string,
  existingTema?: any
): Record<string, any> {
  const firestoreData: Record<string, any> = { ...data };

  (Object.keys(firestoreData) as Array<keyof (TemaFormData | AddTemaModalFormData)>).forEach(key => {
    if (firestoreData[key] === '' || firestoreData[key] === NINGUNA_CATEGORIA_VALUE) {
      firestoreData[key] = null;
    }
  });
  
  if (!existingTema?.id) { 
    firestoreData.ingresadoPorUid = userId;
    firestoreData.creadoEn = undefined; 
    firestoreData.estaEliminada = false;
  }
  firestoreData.modificadoPorUid = userId;
  firestoreData.actualizadoEn = undefined;

  return firestoreData;
}

export function convertFirestoreDataToFormTema(temaData: any): TemaFormData {
  const formData: { [key: string]: any } = { ...temaData };

  (Object.keys(formData) as Array<keyof TemaFormData>).forEach(key => {
    if (formData[key] === null) {
      formData[key] = '';
    }
  });
  
  if (temaData.categoriaTema && !temaCategorias.includes(temaData.categoriaTema)) {
    formData.categoriaTema = '';
  } else {
    formData.categoriaTema = temaData.categoriaTema || '';
  }
  
  try {
    const parsingSchema = temaSchema.extend({
      categoriaTema: z.enum(temaCategorias).optional().nullable(),
    });
    const parsedData = parsingSchema.parse(formData);
    return {
      ...parsedData,
      categoriaTema: parsedData.categoriaTema || null, 
    } as TemaFormData;

  } catch (e) {
    console.error("Zod parsing error in convertFirestoreDataToFormTema:", e, "Data:", formData);
    return {
      nombre: formData.nombre || '',
      descripcion: formData.descripcion || '',
      categoriaTema: formData.categoriaTema || null,
    } as TemaFormData;
  }
}
