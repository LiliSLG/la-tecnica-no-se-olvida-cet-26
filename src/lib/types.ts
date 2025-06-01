
import type { Timestamp, GeoPoint } from 'firebase/firestore';

// ... (otras interfaces como Organizacion, Tema, etc. permanecen igual)
export interface Proyecto {
  id?: string;
  titulo: string;
  descripcionGeneral: string;
  resumenEjecutivo?: string | null;

  idsTemas: string[];
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
  // Roles de invitado (generalmente asignados programáticamente)
  | 'tutor_invitado'
  | 'colaborador_invitado'
  | 'autor_invitado';

export type CapacidadPlataforma =
  | 'es_autor' // Gestionado por Cloud Functions basado en proyectos
  | 'es_tutor' // Gestionado por Cloud Functions basado en proyectos
  | 'es_colaborador' // Gestionado por Cloud Functions basado en proyectos
  | 'es_evaluador'
  | 'es_entrevistado'
  | 'es_entrevistador'
  | 'es_admin_contenido'
  | 'es_admin_sistema' // Sincronizado con el booleano esAdmin
  | 'es_admin_noticias'
  | 'es_admin_entrevistas' // Nueva capacidad para gestión de entrevistas
  // Roles de invitado (placeholders)
  | 'es_autor_invitado'
  | 'es_tutor_invitado'
  | 'es_colaborador_invitado';

export type VisibilidadPerfil =
  | 'publico'
  | 'solo_registrados_plataforma'
  | 'privado'
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
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  fotoURL?: string | null;
  categoriaPrincipal: CategoriaPrincipalPersona;
  capacidadesPlataforma?: CapacidadPlataforma[] | null;
  activo: boolean;
  esAdmin: boolean; // Derivado de capacidadesPlataforma si incluye 'es_admin_sistema'

  // Info Profesional / de Tutor
  tituloProfesional?: string | null;
  descripcionPersonalOProfesional?: string | null;
  areasDeInteresOExpertise?: string[] | null;
  idsTemasDeInteres?: string[] | null;
  disponibleParaProyectos?: boolean | null;

  // Info CET N°26
  esExAlumnoCET?: boolean | null;
  anoCursadaActualCET?: number | null;
  anoEgresoCET?: number | null;
  titulacionObtenidaCET?: string | null;
  proyectoFinalCETId?: string | null;

  // Info Laboral / Oportunidades
  buscandoOportunidades?: boolean | null;
  estadoSituacionLaboral?: EstadoSituacionLaboral | null;
  historiaDeExitoOResumenTrayectoria?: string | null;
  empresaOInstitucionActual?: string | null;
  cargoActual?: string | null;
  ofreceColaboracionComo?: string[] | null;

  // Contacto Adicional
  telefonoContacto?: string | null;
  linksProfesionales?: Array<{ tipo: string | null; url: string | null }> | null;

  // Ubicación
  ubicacionResidencial?: {
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
  } | null;

  visibilidadPerfil?: VisibilidadPerfil | null;

  // Auditoría
  ingresadoPor: string;
  creadoEn: Timestamp;
  modificadoPor: string;
  actualizadoEn: Timestamp;
  estaEliminada?: boolean | null;
  eliminadoEn?: Timestamp | null;
  eliminadoPorUid?: string | null;
}

// --- FormAuthor: Used for selection in ProjectForm ---
export interface FormAuthor {
  id: string;
  nombre: string;
  apellido: string;
  email?: string | null;
  fotoURL?: string | null;
  isNewPlaceholder?: boolean; // True if this was just created via modal
}

// --- FormOrganizacion: Used for selection in ProjectForm ---
export interface FormOrganizacion {
  id: string;
  nombreOficial: string;
  tipo: TipoOrganizacion;
  isNewPlaceholder?: boolean;
}

// --- AddPersonaModalFormData: For the modal used in ProjectForm ---
export interface AddPersonaModalFormData {
  nombre: string;
  apellido: string;
  email?: string | null;
  fotoURL?: string | null | 'PENDING_UPLOAD_MODAL';
  categoriaPrincipal: CategoriaPrincipalPersona;
  anoCursadaActualCET?: number | null;
  anoEgresoCET?: number | null;
}

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

export type TemaCategoria =
  | 'agropecuario'
  | 'tecnologico'
  | 'social'
  | 'ambiental'
  | 'educativo'
  | 'produccion_animal'
  | 'sanidad'
  | 'energia'
  | 'recursos_naturales'
  | 'manejo_suelo'
  | 'gastronomia'
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

export type TipoContratoOferta = 'jornada_completa' | 'media_jornada' | 'freelance' | 'pasantia' | 'voluntariado' | 'otro';

export interface OfertaTrabajo {
  id: string;
  titulo: string;
  publicadoPorNombre: string;
  publicadoPorId?: string | null;
  esEmpresa: boolean;
  descripcion: string;
  descripcionCorta?: string;
  ubicacionTexto: string;
  tipoContrato: TipoContratoOferta;
  idsTemasRequeridos?: string[] | null;
  categoriaOferta?: string | null;
  requisitos?: string | null;
  beneficios?: string | null;
  comoAplicar: string;
  enlaceExterno?: string | null;
  salarioEstimado?: string | null;
  fechaPublicacion: Timestamp | string;
  fechaCierre?: Timestamp | string | null;
  creadoPorUid: string;
  creadoEn: Timestamp;
  actualizadoEn: Timestamp;
  estaActiva: boolean;
  estaEliminada?: boolean | null;
}

export type NivelCurso = 'principiante' | 'intermedio' | 'avanzado' | 'todos';

export interface Curso {
  id: string;
  titulo: string;
  descripcionCorta: string;
  instructor: string;
  imagenURL: string;
  dataAiHint?: string;
  duracion: string;
  nivel: NivelCurso;
  linkMasInfo?: string;
  temas?: string[];
  fechaInicio?: string;
  modalidad?: 'online' | 'presencial' | 'hibrido';
  puntosOtorgados?: number;
}

export type TipoContenidoEntrevista = 'video_propio' | 'enlace_video_externo';
export type PlataformaVideo = 'firebase_storage' | 'youtube_propio' | 'youtube' | 'facebook' | 'vimeo' | 'otro';


export interface Entrevista {
  id?: string;
  tipoContenido: TipoContenidoEntrevista;
  tituloSaber: string;
  descripcionSaber: string; // Resumen
  videoPropioURL?: string | null; // Si es 'video_propio'
  plataformaVideoPropio?: PlataformaVideo | null; // PlataformaVideo ahora incluye 'firebase_storage' etc.
  urlVideoExterno?: string | null; // Si es 'enlace_video_externo'
  plataformaVideoExterno?: PlataformaVideo | null;
  fuenteVideoExterno?: string | null; // Nombre del canal/página si es externo
  fechaGrabacionORecopilacion: Timestamp;
  ambitoSaber?: string | null; // Ej: Gastronomía, Manejo Animal, Artesanía
  idsTemasSaber?: string[] | null; // Array de IDs de temas de la colección 'temas'
  palabrasClaveSaber?: string[] | null;
  fuentesInformacion?: string[] | null; // Nombres de entrevistados
  recopiladoPorUids?: string[] | null; // UIDs de quienes recopilaron
  transcripcionTextoCompleto?: string | null;
  transcripcionFileURL?: string | null;
  imagenMiniaturaURL?: string | null;
  duracionMediaMinutos?: number | null;

  // Auditoría y Estado
  creadoPorUid: string;
  creadoEn: Timestamp;
  modificadoPorUid: string;
  actualizadoEn: Timestamp;
  estaPublicada: boolean;
  estaEliminada?: boolean | null;
  eliminadoEn?: Timestamp | null;
  eliminadoPorUid?: string | null;
}


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
  idsTemas?: string[] | null; // Cambio de 'categoriasNoticia' a 'idsTemas'
  esDestacada?: boolean;
  estaPublicada: boolean;
  estaEliminada?: boolean | null;
  eliminadoEn?: Timestamp | null;
  eliminadoPorUid?: string | null;
}
    