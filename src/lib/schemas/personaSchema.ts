
"use client";

import { z } from 'zod';
import { Timestamp, GeoPoint, serverTimestamp } from 'firebase/firestore';
import type { Persona, CategoriaPrincipalPersona, CapacidadPlataforma, VisibilidadPerfil, EstadoSituacionLaboral } from '@/lib/types';

// Categorías que un admin puede seleccionar directamente en el formulario de gestión de participantes
export const adminSelectableCategoriasPrincipalesPersona: CategoriaPrincipalPersona[] = [
  'docente_cet', 'estudiante_cet', 'ex_alumno_cet', 'productor_rural', 'profesional_externo',
  'investigador', 'comunidad_general', 'otro', 'ninguno_asignado'
];

// Todas las categorías posibles (incluye las de invitado que se asignan programáticamente)
export const allCategoriasPrincipalesPersona: CategoriaPrincipalPersona[] = [
  ...adminSelectableCategoriasPrincipalesPersona,
  'tutor_invitado', 'colaborador_invitado', 'autor_invitado'
];

export const categoriasPrincipalesPersonaLabels: Record<CategoriaPrincipalPersona, string> = {
  docente_cet: 'Docente CET',
  estudiante_cet: 'Estudiante CET',
  ex_alumno_cet: 'Ex-alumno CET',
  productor_rural: 'Productor Rural',
  profesional_externo: 'Profesional Externo',
  investigador: 'Investigador/Académico',
  comunidad_general: 'Comunidad General',
  otro: 'Otro',
  ninguno_asignado: 'Ninguno Asignado',
  tutor_invitado: 'Tutor Invitado (Placeholder)',
  colaborador_invitado: 'Colaborador Invitado (Placeholder)',
  autor_invitado: 'Autor Invitado (Placeholder)',
};

export const allCapacidadesPlataformaOptions: CapacidadPlataforma[] = [
  'es_autor', 'es_tutor', 'es_colaborador', 'es_evaluador',
  'es_entrevistado', 'es_entrevistador',
  'es_admin_contenido', 'es_admin_sistema', 'es_admin_noticias', 'es_admin_entrevistas',
  'es_autor_invitado', 'es_tutor_invitado', 'es_colaborador_invitado'
];

export const capacidadesPlataformaLabels: Record<CapacidadPlataforma, string> = {
  es_autor: 'Autor de Proyectos',
  es_tutor: 'Tutor de Proyectos',
  es_colaborador: 'Colaborador en Proyectos',
  es_evaluador: 'Evaluador de Proyectos',
  es_entrevistado: 'Entrevistado (Historia Oral)',
  es_entrevistador: 'Entrevistador (Historia Oral)',
  es_admin_contenido: 'Admin de Contenido',
  es_admin_sistema: 'Admin de Sistema (Global)',
  es_admin_noticias: 'Admin de Noticias',
  es_admin_entrevistas: 'Admin de Entrevistas',
  es_autor_invitado: 'Autor Invitado (Placeholder)',
  es_tutor_invitado: 'Tutor Invitado (Placeholder)',
  es_colaborador_invitado: 'Colaborador Invitado (Placeholder)',
};

// Capacidades que un administrador puede gestionar directamente en el formulario
export const adminManageableCapacidades: CapacidadPlataforma[] = [
  'es_evaluador', 'es_entrevistado', 'es_entrevistador',
  'es_admin_contenido', 'es_admin_sistema', 'es_admin_noticias', 'es_admin_entrevistas'
];

export const visibilidadPerfilOptions: VisibilidadPerfil[] = [
  'publico', 'solo_registrados_plataforma', 'privado', 'solo_admins_y_propio'
];
export const visibilidadPerfilLabels: Record<VisibilidadPerfil, string> = {
  publico: 'Público (Visible para todos)',
  solo_registrados_plataforma: 'Solo Usuarios Registrados en la Plataforma',
  privado: 'Privado (Solo yo)',
  solo_admins_y_propio: 'Solo Administradores y Yo',
};

export const estadoSituacionLaboralOptions: EstadoSituacionLaboral[] = [
  'buscando_empleo', 'empleado', 'emprendedor', 'estudiante', 'no_especificado', 'jubilado', 'otro'
];
export const estadoSituacionLaboralLabels: Record<EstadoSituacionLaboral, string> = {
  buscando_empleo: 'Buscando Empleo',
  empleado: 'Empleado/a',
  emprendedor: 'Emprendedor/a',
  estudiante: 'Estudiante (Universitario/Terciario)',
  no_especificado: 'No Especificado',
  jubilado: 'Jubilado/a',
  otro: 'Otro',
};

const stringToArray = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() !== '') {
    return val.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }
  if (Array.isArray(val)) {
    return val.map(item => String(item).trim()).filter(item => item.length > 0);
  }
  return [];
}, z.array(z.string()));


const LinkProfesionalSchema = z.object({
  tipo: z.string().optional().nullable().default(''),
  url: z.string().url("Debe ser una URL válida.").or(z.literal('')).optional().nullable().default(''),
}).default({ tipo: '', url: ''});


const UbicacionPersonaSchema = z.object({
  latitud: z.preprocess(
    (val) => (String(val).trim() === "" || val === undefined || val === null || isNaN(parseFloat(String(val))) ? undefined : parseFloat(String(val))),
    z.number().min(-90, "Latitud inválida (-90 a 90)").max(90, "Latitud inválida (-90 a 90)").optional().nullable()
  ),
  longitud: z.preprocess(
    (val) => (String(val).trim() === "" || val === undefined || val === null || isNaN(parseFloat(String(val))) ? undefined : parseFloat(String(val))),
    z.number().min(-180, "Longitud inválida (-180 a 180)").max(180, "Longitud inválida (-180 a 180)").optional().nullable()
  ),
  direccionTextoCompleto: z.string().optional().nullable(),
  calleYNumero: z.string().optional().nullable(),
  localidad: z.string().optional().nullable(),
  parajeORural: z.string().optional().nullable(),
  provincia: z.string().optional().nullable(),
  pais: z.string().optional().nullable(),
  referenciasAdicionales: z.string().optional().nullable(),
}).optional().nullable();

export const personaSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido y debe tener al menos 2 caracteres."),
  apellido: z.string().min(2, "El apellido es requerido y debe tener al menos 2 caracteres."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  fotoURL: z.string().url("URL de foto inválida.")
              .or(z.literal(''))
              .or(z.literal('PENDING_UPLOAD')) // Marker for form handling
              .optional()
              .nullable(),

  categoriaPrincipal: z.enum(adminSelectableCategoriasPrincipalesPersona as [string, ...string[]], { 
     required_error: "La categoría principal es requerida."
  }).default('ninguno_asignado'),
  
  capacidadesPlataforma: z.array(z.enum(allCapacidadesPlataformaOptions as [string, ...string[]])).optional().default([]),

  activo: z.boolean().default(true),
  esAdmin: z.boolean().default(false), // Sincronizado con capacidadesPlataforma

  tituloProfesional: z.string().optional().nullable(),
  descripcionPersonalOProfesional: z.string().optional().nullable(),
  areasDeInteresOExpertise: stringToArray.optional(),
  idsTemasDeInteres: z.array(z.string()).optional().nullable(),
  disponibleParaProyectos: z.boolean().optional().nullable().default(true),
  
  esExAlumnoCET: z.boolean().optional().nullable(),
  anoCursadaActualCET: z.number().int("Debe ser un número entero.").min(1, "Año inválido.").max(7, "Año inválido.").optional().nullable(),
  anoEgresoCET: z.number().int("Debe ser un número entero.").min(1900, "Año inválido.").max(new Date().getFullYear() + 10, "Año futuro inválido.").optional().nullable(),
  titulacionObtenidaCET: z.string().optional().nullable(),
  proyectoFinalCETId: z.string().optional().nullable(),

  buscandoOportunidades: z.boolean().optional().nullable(),
  estadoSituacionLaboral: z.enum(estadoSituacionLaboralOptions as [string, ...string[]]).optional().nullable(),
  historiaDeExitoOResumenTrayectoria: z.string().optional().nullable(),
  empresaOInstitucionActual: z.string().optional().nullable(),
  cargoActual: z.string().optional().nullable(),
  ofreceColaboracionComo: stringToArray.optional(),

  telefonoContacto: z.string().optional().nullable(),
  linksProfesionales: z.array(LinkProfesionalSchema).optional().default([{ tipo: '', url: '' }]),

  ubicacion: UbicacionPersonaSchema,
  
  visibilidadPerfil: z.enum(visibilidadPerfilOptions as [string, ...string[]]).optional().nullable().default('solo_registrados_plataforma'),

  estaEliminada: z.boolean().optional().default(false),
  creadoEn: z.any().optional(), 
  actualizadoEn: z.any().optional(),
});

export type PersonaFormData = z.infer<typeof personaSchema>;

export const addPersonaModalSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido."),
  apellido: z.string().min(2, "El apellido es requerido."),
  email: z.string().email("Email inválido.").optional().or(z.literal('')),
  fotoURL: z.string().url("URL de foto inválida.")
             .or(z.literal('')) 
             .or(z.literal('PENDING_UPLOAD_MODAL')) 
             .optional()
             .nullable(),
  categoriaPrincipal: z.enum(allCategoriasPrincipalesPersona as [string, ...string[]], { 
    required_error: "La categoría principal es requerida."
  }),
  anoCursadaActualCET: z.number().int().min(1).max(7).optional().nullable(),
  anoEgresoCET: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional().nullable(),
});
export type AddPersonaModalFormData = z.infer<typeof addPersonaModalSchema>;


export function convertFormDataForFirestorePersona(
  data: PersonaFormData,
  userId: string,
  existingPersonaData?: Partial<Persona> // Used to preserve non-editable fields on update
): Partial<Persona> {
  const firestoreData: Partial<Persona> & { [key: string]: any } = { ...data };

  const projectRelatedCapacities: CapacidadPlataforma[] = ['es_autor', 'es_tutor', 'es_colaborador'];
  let finalCapacidades: CapacidadPlataforma[] = data.capacidadesPlataforma?.filter(cap => !projectRelatedCapacities.includes(cap)) || [];
  
  if (existingPersonaData?.capacidadesPlataforma) {
    const existingProjectCaps = existingPersonaData.capacidadesPlataforma.filter(cap => projectRelatedCapacities.includes(cap));
    finalCapacidades = [...new Set([...finalCapacidades, ...existingProjectCaps])];
  }

  firestoreData.capacidadesPlataforma = finalCapacidades.length > 0 ? finalCapacidades : null;
  firestoreData.esAdmin = firestoreData.capacidadesPlataforma?.includes('es_admin_sistema') ?? false;


  const optionalStringKeys: (keyof PersonaFormData)[] = [
    'tituloProfesional', 'descripcionPersonalOProfesional', 
    'titulacionObtenidaCET', 'proyectoFinalCETId', 
    'estadoSituacionLaboral', 'historiaDeExitoOResumenTrayectoria', 
    'empresaOInstitucionActual', 'cargoActual', 'telefonoContacto', 'visibilidadPerfil'
  ];
  optionalStringKeys.forEach(key => {
    if (firestoreData[key] === '' || firestoreData[key] === undefined) {
      firestoreData[key] = null;
    }
  });
  
  if (firestoreData.fotoURL === 'PENDING_UPLOAD' || firestoreData.fotoURL === '' || firestoreData.fotoURL === undefined) {
    firestoreData.fotoURL = null;
  }

  const arrayStringKeys: (keyof PersonaFormData)[] = ['areasDeInteresOExpertise', 'ofreceColaboracionComo'];
  arrayStringKeys.forEach(key => {
    firestoreData[key] = (Array.isArray(data[key]) && (data[key] as string[]).length > 0)
      ? (data[key] as string[]).filter(Boolean) 
      : null;
  });

  firestoreData.idsTemasDeInteres = (Array.isArray(data.idsTemasDeInteres) && data.idsTemasDeInteres.length > 0)
    ? data.idsTemasDeInteres.filter(Boolean)
    : null;

  firestoreData.linksProfesionales = (data.linksProfesionales && data.linksProfesionales.length > 0)
    ? data.linksProfesionales.filter(link => link && (link.url || link.tipo) && !(link.url === '' && link.tipo === '')) 
    : null;
  if(firestoreData.linksProfesionales && firestoreData.linksProfesionales.length === 0) firestoreData.linksProfesionales = null;

  if (data.ubicacion) {
    const ubicacionForm = data.ubicacion;
    const ubicacionFirestore: Partial<NonNullable<Persona['ubicacionResidencial']>> = {};
    let hasUbicacionData = false;

    (Object.keys(ubicacionForm) as Array<keyof typeof ubicacionForm>).forEach(key => {
      if (key === 'latitud' || key === 'longitud') return; 
      if (ubicacionForm[key] !== '' && ubicacionForm[key] !== undefined && ubicacionForm[key] !== null) {
        (ubicacionFirestore as any)[key] = ubicacionForm[key];
        hasUbicacionData = true;
      } else {
        (ubicacionFirestore as any)[key] = null;
      }
    });

    const lat = ubicacionForm.latitud; 
    const lon = ubicacionForm.longitud; 

    if (typeof lat === 'number' && !isNaN(lat) && typeof lon === 'number' && !isNaN(lon)) {
      ubicacionFirestore.coordenadas = new GeoPoint(lat, lon);
      hasUbicacionData = true;
    } else {
      ubicacionFirestore.coordenadas = null;
    }

    firestoreData.ubicacionResidencial = hasUbicacionData ? ubicacionFirestore : null;
  } else {
    firestoreData.ubicacionResidencial = null;
  }
  
  firestoreData.anoCursadaActualCET = data.anoCursadaActualCET === undefined || data.anoCursadaActualCET === null || isNaN(Number(data.anoCursadaActualCET)) ? null : Number(data.anoCursadaActualCET);
  firestoreData.anoEgresoCET = data.anoEgresoCET === undefined || data.anoEgresoCET === null || isNaN(Number(data.anoEgresoCET)) ? null : Number(data.anoEgresoCET);
  
  firestoreData.esExAlumnoCET = data.esExAlumnoCET ?? null;
  firestoreData.buscandoOportunidades = data.buscandoOportunidades ?? null;

  if (!existingPersonaData?.id) { 
    firestoreData.ingresadoPor = userId;
    firestoreData.creadoEn = serverTimestamp() as Timestamp;
    firestoreData.estaEliminada = false; 
  }
  firestoreData.modificadoPor = userId;
  firestoreData.actualizadoEn = serverTimestamp() as Timestamp;

  firestoreData.activo = data.activo ?? true;
  firestoreData.disponibleParaProyectos = data.disponibleParaProyectos ?? true;

  if (existingPersonaData?.id && data.estaEliminada === undefined) {
    firestoreData.estaEliminada = existingPersonaData.estaEliminada ?? false;
  } else {
     firestoreData.estaEliminada = data.estaEliminada ?? false;
  }

  if (existingPersonaData?.id) {
    delete firestoreData.creadoEn; 
    delete firestoreData.ingresadoPor;
  }
  
  delete firestoreData.ubicacion; // This was the form's ubicacion, not ubicacionResidencial

  return firestoreData as Partial<Persona>;
}

export function convertFirestoreDataToFormPersona(personaData: Persona): PersonaFormData {
  const formData: { [key: string]: any } = { ...personaData };

  formData.email = personaData.email || '';
  formData.fotoURL = personaData.fotoURL || '';
  formData.tituloProfesional = personaData.tituloProfesional || '';
  formData.descripcionPersonalOProfesional = personaData.descripcionPersonalOProfesional || '';
  formData.titulacionObtenidaCET = personaData.titulacionObtenidaCET || '';
  formData.proyectoFinalCETId = personaData.proyectoFinalCETId || '';
  formData.estadoSituacionLaboral = personaData.estadoSituacionLaboral || null; // For Select, null is better for placeholder
  formData.historiaDeExitoOResumenTrayectoria = personaData.historiaDeExitoOResumenTrayectoria || '';
  formData.empresaOInstitucionActual = personaData.empresaOInstitucionActual || '';
  formData.cargoActual = personaData.cargoActual || '';
  formData.telefonoContacto = personaData.telefonoContacto || '';
  formData.visibilidadPerfil = personaData.visibilidadPerfil || 'solo_registrados_plataforma';
  
  formData.anoCursadaActualCET = personaData.anoCursadaActualCET === undefined || personaData.anoCursadaActualCET === null ? undefined : Number(personaData.anoCursadaActualCET);
  formData.anoEgresoCET = personaData.anoEgresoCET === undefined || personaData.anoEgresoCET === null ? undefined : Number(personaData.anoEgresoCET);
  
  formData.esExAlumnoCET = personaData.esExAlumnoCET ?? undefined; 
  formData.buscandoOportunidades = personaData.buscandoOportunidades ?? undefined;

  formData.areasDeInteresOExpertise = Array.isArray(personaData.areasDeInteresOExpertise) ? personaData.areasDeInteresOExpertise.join(', ') : '';
  formData.idsTemasDeInteres = Array.isArray(personaData.idsTemasDeInteres) ? personaData.idsTemasDeInteres : [];
  formData.ofreceColaboracionComo = Array.isArray(personaData.ofreceColaboracionComo) ? personaData.ofreceColaboracionComo.join(', ') : '';


  formData.linksProfesionales = Array.isArray(personaData.linksProfesionales)
    ? personaData.linksProfesionales.map(link => ({ tipo: link.tipo || '', url: link.url || '' }))
    : [{ tipo: '', url: '' }];
  if (formData.linksProfesionales.length === 0) {
    formData.linksProfesionales = [{ tipo: '', url: '' }];
  }
  
  formData.capacidadesPlataforma = Array.isArray(personaData.capacidadesPlataforma) ? personaData.capacidadesPlataforma : [];
  formData.esAdmin = formData.capacidadesPlataforma.includes('es_admin_sistema');

  if (personaData.categoriaPrincipal &&
      !adminSelectableCategoriasPrincipalesPersona.includes(personaData.categoriaPrincipal as CategoriaPrincipalPersona)) {
    formData.categoriaPrincipal = 'ninguno_asignado'; 
  } else if (!personaData.categoriaPrincipal) {
    formData.categoriaPrincipal = 'ninguno_asignado'; 
  } else {
    formData.categoriaPrincipal = personaData.categoriaPrincipal;
  }

  if (personaData.ubicacionResidencial) {
    formData.ubicacion = { ...personaData.ubicacionResidencial };
    if (personaData.ubicacionResidencial.coordenadas instanceof GeoPoint) {
      formData.ubicacion.latitud = personaData.ubicacionResidencial.coordenadas.latitude;
      formData.ubicacion.longitud = personaData.ubicacionResidencial.coordenadas.longitude;
    } else {
        formData.ubicacion.latitud = undefined; 
        formData.ubicacion.longitud = undefined;
    }
    (Object.keys(formData.ubicacion) as Array<keyof NonNullable<PersonaFormData['ubicacion']>>).forEach(key => {
       if (formData.ubicacion![key] === null || formData.ubicacion![key] === undefined) {
         if (key !== 'latitud' && key !== 'longitud') { 
            formData.ubicacion![key] = '';
         }
       }
    });
    delete formData.ubicacion.coordenadas; 
  } else {
    formData.ubicacion = { 
      latitud: undefined,
      longitud: undefined,
      direccionTextoCompleto: '',
      calleYNumero: '',
      localidad: '',
      parajeORural: '',
      provincia: '',
      pais: '',
      referenciasAdicionales: ''
    };
  }

  formData.activo = personaData.activo ?? true;
  formData.disponibleParaProyectos = personaData.disponibleParaProyectos ?? true;
  formData.estaEliminada = personaData.estaEliminada ?? false;

  // Preserve original timestamps for potential use in 'reset' if needed
  formData.creadoEn = personaData.creadoEn;
  formData.actualizadoEn = personaData.actualizadoEn;
  
  const finalFormData: PersonaFormData = {
    nombre: formData.nombre || '',
    apellido: formData.apellido || '',
    email: formData.email || '',
    fotoURL: formData.fotoURL || '',
    categoriaPrincipal: formData.categoriaPrincipal || 'ninguno_asignado',
    capacidadesPlataforma: formData.capacidadesPlataforma || [],
    activo: formData.activo ?? true,
    esAdmin: formData.esAdmin ?? false,
    
    tituloProfesional: formData.tituloProfesional || '',
    descripcionPersonalOProfesional: formData.descripcionPersonalOProfesional || '',
    areasDeInteresOExpertise: formData.areasDeInteresOExpertise, // Este es un string en el form
    idsTemasDeInteres: formData.idsTemasDeInteres || [], // No editable en este form
    disponibleParaProyectos: formData.disponibleParaProyectos ?? true,
    
    esExAlumnoCET: formData.esExAlumnoCET ?? undefined,
    anoCursadaActualCET: formData.anoCursadaActualCET === null || formData.anoCursadaActualCET === undefined ? null : Number(formData.anoCursadaActualCET),
    anoEgresoCET: formData.anoEgresoCET === null || formData.anoCursadaActualCET === undefined ? null : Number(formData.anoEgresoCET),
    titulacionObtenidaCET: formData.titulacionObtenidaCET || '',
    proyectoFinalCETId: formData.proyectoFinalCETId || '',
    
    buscandoOportunidades: formData.buscandoOportunidades ?? undefined,
    estadoSituacionLaboral: formData.estadoSituacionLaboral || null,
    historiaDeExitoOResumenTrayectoria: formData.historiaDeExitoOResumenTrayectoria || '',
    empresaOInstitucionActual: formData.empresaOInstitucionActual || '',
    cargoActual: formData.cargoActual || '',
    ofreceColaboracionComo: formData.ofreceColaboracionComo, // Este es un string en el form
    
    telefonoContacto: formData.telefonoContacto || '',
    linksProfesionales: formData.linksProfesionales || [{ tipo: '', url: '' }],
    
    ubicacion: formData.ubicacion || { 
      latitud: undefined, longitud: undefined, direccionTextoCompleto: '', calleYNumero: '',
      localidad: '', parajeORural: '', provincia: '', pais: '', referenciasAdicionales: ''
    },
    visibilidadPerfil: formData.visibilidadPerfil || 'solo_registrados_plataforma',
    
    estaEliminada: formData.estaEliminada ?? false,
    creadoEn: formData.creadoEn,
    actualizadoEn: formData.actualizadoEn,
  };
  
  return finalFormData;
}


    