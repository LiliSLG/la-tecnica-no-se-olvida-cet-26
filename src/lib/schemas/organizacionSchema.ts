
"use client";

import { z } from 'zod';
import { Timestamp, GeoPoint } from 'firebase/firestore';
import type { TipoOrganizacion, Organizacion } from '@/lib/types'; // Added Organizacion to avoid potential issues

export const organizacionTipos: TipoOrganizacion[] = [
  'empresa', 'institucion_educativa', 'ONG', 'estancia_productiva', 'organismo_gubernamental', 'otro'
];

export const organizacionTipoLabels: Record<TipoOrganizacion, string> = {
  empresa: 'Empresa',
  institucion_educativa: 'Institución Educativa',
  ONG: 'ONG',
  estancia_productiva: 'Estancia Productiva',
  organismo_gubernamental: 'Organismo Gubernamental',
  otro: 'Otro',
};

const UbicacionSchema = z.object({
  latitud: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitud: z.coerce.number().min(-180).max(180).optional().nullable(),
  direccionTextoCompleto: z.string().optional().nullable(),
  calleYNumero: z.string().optional().nullable(),
  localidad: z.string().optional().nullable(),
  parajeORural: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),
  referenciasAdicionales: z.string().optional().nullable(),
  mapaLink: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')).nullable(),
}).optional().nullable();


export const organizacionSchema = z.object({
  nombreOficial: z.string().min(2, "El nombre oficial es requerido y debe tener al menos 2 caracteres."),
  nombreFantasia: z.string().optional().nullable(),
  tipo: z.enum(organizacionTipos as [string, ...string[]], { required_error: "El tipo de organización es requerido." }),
  descripcion: z.string().optional().nullable(),
  logoURL: z.string().url("Debe ser una URL válida.").or(z.literal('')).or(z.literal('PENDING_UPLOAD')).optional().nullable(),
  sitioWeb: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')).nullable(),
  emailContacto: z.string().email("Debe ser un correo electrónico válido.").optional().or(z.literal('')).nullable(),
  telefonoContacto: z.string().optional().nullable(),
  areasDeInteres: z.array(z.string()).optional().nullable(),
  abiertaAColaboraciones: z.boolean().optional().nullable(),
  ubicacion: UbicacionSchema,
  estaEliminada: z.boolean().optional().default(false),
});

export type OrganizacionFormData = z.infer<typeof organizacionSchema>;

// Schema for the AddOrganizacionModal
export const addOrganizacionModalSchema = z.object({
  nombreOficial: z.string().min(2, "El nombre oficial es requerido."),
  tipo: z.enum(organizacionTipos as [string, ...string[]], { required_error: "El tipo es requerido." }),
  nombreFantasia: z.string().optional().nullable(),
  emailContacto: z.string().email("Email inválido.").optional().or(z.literal('')),
  sitioWeb: z.string().url("URL de sitio web inválida.").optional().or(z.literal('')),
});
export type AddOrganizacionModalFormData = z.infer<typeof addOrganizacionModalSchema>;


export function convertFormDataForFirestoreOrganizacion(data: OrganizacionFormData): Record<string, any> {
  const firestoreData: Record<string, any> = { ...data };

  (Object.keys(firestoreData) as Array<keyof OrganizacionFormData>).forEach(key => {
    if (firestoreData[key] === '' && key !== 'nombreOficial' && key !== 'tipo') {
      firestoreData[key] = null;
    }
  });
  
  if (firestoreData.logoURL === 'PENDING_UPLOAD' || firestoreData.logoURL === '') {
    firestoreData.logoURL = null;
  }
  
  if (firestoreData.ubicacion) {
    (Object.keys(firestoreData.ubicacion) as Array<keyof NonNullable<OrganizacionFormData['ubicacion']>>).forEach(key => {
       if (firestoreData.ubicacion![key] === '') {
         firestoreData.ubicacion![key] = null;
       }
    });
    if (typeof firestoreData.ubicacion.latitud === 'number' && typeof firestoreData.ubicacion.longitud === 'number') {
      firestoreData.ubicacion.coordenadas = new GeoPoint(firestoreData.ubicacion.latitud, firestoreData.ubicacion.longitud);
    } else {
      firestoreData.ubicacion.coordenadas = null;
    }
    delete firestoreData.ubicacion.latitud;
    delete firestoreData.ubicacion.longitud;

    if (Object.values(firestoreData.ubicacion).every(v => v === null || v === undefined)) {
        firestoreData.ubicacion = null;
    }
  } else if ('ubicacion' in firestoreData) { // Ensure ubicacion field is nulled if it's empty
    firestoreData.ubicacion = null;
  }

  return firestoreData;
}

export function convertFirestoreDataToFormOrganizacion(orgData: any): OrganizacionFormData {
  const formData: { [key: string]: any } = { ...orgData };

  if (orgData.ubicacion) {
    formData.ubicacion = { ...orgData.ubicacion };
    if (orgData.ubicacion.coordenadas instanceof GeoPoint) {
      formData.ubicacion.latitud = orgData.ubicacion.coordenadas.latitude;
      formData.ubicacion.longitud = orgData.ubicacion.coordenadas.longitude;
    } else {
        formData.ubicacion.latitud = undefined;
        formData.ubicacion.longitud = undefined;
    }
    delete formData.ubicacion.coordenadas;
  } else {
    formData.ubicacion = {}; 
  }

  (Object.keys(formData) as Array<keyof OrganizacionFormData>).forEach(key => {
    if (formData[key] === null && key !== 'ubicacion' && key !== 'abiertaAColaboraciones' && key !== 'estaEliminada') {
      formData[key] = '';
    }
  });
  if (formData.ubicacion) {
    (Object.keys(formData.ubicacion) as Array<keyof NonNullable<OrganizacionFormData['ubicacion']>>).forEach(key => {
       if (formData.ubicacion![key] === null || formData.ubicacion![key] === undefined) {
         if (key !== 'latitud' && key !== 'longitud') { // keep numbers as undefined if null
            formData.ubicacion![key] = '';
         }
       }
    });
  }
  
  formData.logoURL = orgData.logoURL || '';
  formData.estaEliminada = orgData.estaEliminada ?? false;
  formData.abiertaAColaboraciones = orgData.abiertaAColaboraciones ?? null; // Allow null for tristate or default
  formData.logoURL = orgData.logoURL || '';
  formData.areasDeInteres = Array.isArray(orgData.areasDeInteres) ? orgData.areasDeInteres : [];


  return formData as OrganizacionFormData;
}
