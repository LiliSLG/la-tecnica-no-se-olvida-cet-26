# Data Schemas (TypeScript Interfaces)

This document outlines the core data structures (TypeScript interfaces) used for Firestore collections in the "La técnica no se olvida" application. The AI must always refer to these schemas when generating or modifying code that interacts with Firestore to ensure data consistency.

## `Persona` Interface

Represents individuals in the platform (students, alumni, teachers, tutors, collaborators, etc.).

```typescript
// src/lib/types.ts

export type CategoriaPrincipalPersona =
  | 'docente_cet'
  | 'estudiante_cet'
  | 'ex_alumno_cet'
  | 'productor_rural'
  | 'profesional_externo'
  | 'investigador'
  | 'comunidad_general'
  | 'otro'
  | 'ninguno_asignado'
  // Guest roles (usually assigned programmatically)
  | 'tutor_invitado'
  | 'colaborador_invitado'
  | 'autor_invitado';

export type CapacidadPlataforma =
  | 'es_autor'       // Managed by Cloud Functions based on projects
  | 'es_tutor'       // Managed by Cloud Functions based on projects
  | 'es_colaborador' // Managed by Cloud Functions based on projects
  | 'es_evaluador'
  | 'es_entrevistado'
  | 'es_entrevistador'
  | 'es_admin_contenido'
  | 'es_admin_sistema' // Synced with the esAdmin boolean
  | 'es_admin_noticias'
  | 'es_admin_entrevistas'
  // Guest/placeholder roles
  | 'es_autor_invitado'
  | 'es_tutor_invitado'
  | 'es_colaborador_invitado';

export type VisibilidadPerfil =
  | 'publico'
  | 'solo_registrados_plataforma'
  | 'privado' // Note: 'privado' usually implies only self + admins. Let's clarify if this is different from 'solo_admins_y_propio'
  | 'solo_admins_y_propio';

export type EstadoSituacionLaboral =
  | 'buscando_empleo'
  | 'empleado'
  | 'emprendedor'
  | 'estudiante'
  | 'no_especificado'
  | 'jubilado'
  | 'otro';

export interface Persona {
  id?: string; // Firestore document ID (usually Firebase Auth UID)
  nombre: string;
  apellido: string;
  email: string; // Unique identifier for login and linking placeholders
  fotoURL?: string | null;
  
  categoriaPrincipal: CategoriaPrincipalPersona;
  capacidadesPlataforma?: CapacidadPlataforma[] | null;
  
  activo: boolean; // Is the platform account active?
  esAdmin: boolean; // Should be derived from/synced with 'es_admin_sistema' in capacidadesPlataforma

  // Professional / Tutor Info
  tituloProfesional?: string | null;
  descripcionPersonalOProfesional?: string | null;
  areasDeInteresOExpertise?: string[] | null; // Free-form strings for now
  idsTemasDeInteres?: string[] | null; // Preferred: Links to 'temas' collection
  disponibleParaProyectos?: boolean | null; // General availability for new CET projects

  // CET N°26 Specific Info
  esExAlumnoCET?: boolean | null;
  anoCursadaActualCET?: number | null;
  anoEgresoCET?: number | null;
  titulacionObtenidaCET?: string | null; // Should be "Técnico Agropecuario" for CET 26 alumni
  proyectoFinalCETId?: string | null; // ID of their final project

  // Employment / Opportunities Info
  buscandoOportunidades?: boolean | null;
  estadoSituacionLaboral?: EstadoSituacionLaboral | null;
  historiaDeExitoOResumenTrayectoria?: string | null;
  empresaOInstitucionActual?: string | null;
  cargoActual?: string | null;
  ofreceColaboracionComo?: string[] | null; // How they are willing to collaborate

  // Additional Contact
  telefonoContacto?: string | null;
  linksProfesionales?: Array<{ tipo: string | null; url: string | null }> | null;

  // Location
  ubicacionResidencial?: { // Consider renaming to 'ubicacion' if it's not strictly residential
    coordenadas?: GeoPoint | null;
    latitud?: number | null;    // For form binding if GeoPoint is not directly bindable
    longitud?: number | null;   // For form binding
    direccionTextoCompleto?: string | null;
    calleYNumero?: string | null;
    localidad?: string | null;
    parajeORural?: string | null;
    provincia?: string | null;
    pais?: string | null;
    referenciasAdicionales?: string | null;
  } | null;

  visibilidadPerfil?: VisibilidadPerfil | null;

  // Audit fields
  ingresadoPor: string; // UID of user who created/inputted this profile (could be self or admin)
  creadoEn: Timestamp;
  modificadoPor: string; // UID of user who last modified
  actualizadoEn: Timestamp;
  estaEliminada?: boolean | null; // For logical delete
  eliminadoEn?: Timestamp | null;
  eliminadoPorUid?: string | null;
}

## Proyecto Interface
Represents technical projects developed by students.

// src/lib/types.ts
export interface Proyecto {
  id?: string;
  titulo: string;
  descripcionGeneral: string;
  resumenEjecutivo?: string | null;

  idsTemas: string[]; // Links to 'temas' collection
  palabrasClave: string[];
  anoProyecto: number;

  estadoActual:
    | "idea"
    | "en_desarrollo"
    | "finalizado"
    | "presentado"
    | "archivado"
    | "cancelado";
  fechaInicio?: Timestamp | null;
  fechaFinalizacionEstimada?: Timestamp | null;
  fechaFinalizacionReal?: Timestamp | null;
  fechaPresentacion?: Timestamp | null;

  creadoPorUid: string;
  creadoEn: Timestamp;
  actualizadoPorUid: string;
  actualizadoEn: Timestamp;

  idsAutores: string[];
  idsTutoresPersonas?: string[] | null;
  idsOrganizacionesTutoria?: string[] | null;
  idsColaboradores?: string[] | null;
  idsEntrevistasRelacionadas?: string[] | null;

  archivoPrincipalURL?: string | null;
  nombreArchivoPrincipal?: string | null;

  archivosAdjuntos?: Array<{
    nombre: string;
    url: string;
    tipo?: string | null;
    subidoEn?: Timestamp | null;
    descripcion?: string | null;
  }> | null;

  nivelEducativoRecomendado?: string | null;
  aplicabilidadActual?:
    | "alta"
    | "media"
    | "baja_historico"
    | "conceptual"
    | null;

  imagenPortadaURL?: string | null;

  estaEliminado?: boolean | null;
  eliminadoEn?: Timestamp | null;
  eliminadoPorUid?: string | null;
}

Organizacion Interface
Represents collaborating organizations, companies, institutions, etc.

// src/lib/types.ts
export type TipoOrganizacion = 'empresa' | 'institucion_educativa' | 'ONG' | 'estancia_productiva' | 'organismo_gubernamental' | 'otro';

export interface Organizacion {
  id?: string;
  nombreOficial: string;
  nombreFantasia?: string | null;
  tipo: TipoOrganizacion;
  descripcion?: string | null;
  logoURL?: string | null;
  sitioWeb?: string | null;
  emailContacto?: string | null;
  telefonoContacto?: string | null;
  areasDeInteres?: string[] | null;
  abiertaAColaboraciones?: boolean | null;
  idsTemasDeInteres?: string[] | null;
  ubicacion?: {
    coordenadas?: GeoPoint | null;
    latitud?: number | null;
    longitud?: number | null;
    direccionTextoCompleto?: string | null;
    calleYNumero?: string | null;
    localidad?: string | null;
    parajeORural?: string | null;
    provincia?: string | null;
    pais?: string | null;
    referenciasAdicionales?: string | null;
    mapaLink?: string | null;
  } | null;
  ingresadoPorUid?: string | null;
  creadoEn: Timestamp;
  modificadoPorUid?: string | null;
  actualizadoEn: Timestamp;

  estaEliminada?: boolean | null;
  eliminadaEn?: Timestamp | null;
  eliminadaPorUid?: string | null;
}

Tema Interface
Represents a topic category for projects, expertise, etc.

// src/lib/types.ts
export type TemaCategoria =
  | 'agropecuario'
  // ... (all other TemaCategoria options) ...
  | 'otro';

export interface Tema {
  id?: string;
  nombre: string;
  descripcion?: string | null;
  categoriaTema?: TemaCategoria | null;
  ingresadoPorUid?: string | null;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
  modificadoPorUid?: string | null;
  estaEliminada?: boolean | null;
  eliminadoEn?: Timestamp | null;
  eliminadoPorUid?: string | null;
}

Noticia Interface
Represents news articles, either original content or links to external news.

// src/lib/types.ts
export interface Noticia {
  id?: string;
  tipoContenido: 'articulo_propio' | 'enlace_externo';
  titulo: string;
  subtitulo?: string | null;
  contenido?: string | null; // Solo para 'articulo_propio'
  urlExterna?: string | null; // Solo para 'enlace_externo'
  fuenteExterna?: string | null; // Para 'enlace_externo'
  resumenOContextoInterno?: string | null; // Para 'enlace_externo' (para IA)
  fechaPublicacion: Timestamp;
  autorNoticia?: string | null;
  creadoPorUid?: string | null;
  actualizadoEn?: Timestamp;
  modificadoPorUid?: string | null; // Quién modificó por última vez
  imagenPrincipalURL?: string | null;
  idsTemas?: string[] | null; // Changed from categoriasNoticia for consistency
  estaEliminada?: boolean | null;
  eliminadoEn?: Timestamp | null;
  eliminadoPorUid?: string | null;
}

Entrevista Interface
Represents oral history interviews and traditional knowledge records.

// src/lib/types.ts
export type TipoContenidoEntrevista = 'video_propio' | 'enlace_video_externo';
export type PlataformaVideo = 'firebase_storage' | 'youtube_propio' | 'youtube' | 'facebook' | 'vimeo' | 'otro';

export interface Entrevista {
  id?: string;
  tipoContenido: TipoContenidoEntrevista;
  tituloSaber: string;
  // ... (all other Entrevista fields as you provided) ...
  estaEliminada?: boolean | null;
  eliminadoEn?: Timestamp | null;
  eliminadoPorUid?: string | null;
}

