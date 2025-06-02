export type EstadoProyecto =
  | "idea"
  | "en_desarrollo"
  | "finalizado"
  | "presentado"
  | "archivado"
  | "cancelado";

export type CategoriaPrincipalPersona =
  | "docente_cet"
  | "estudiante_cet"
  | "ex_alumno_cet"
  | "productor_rural"
  | "profesional_externo"
  | "investigador"
  | "comunidad_general"
  | "otro"
  | "ninguno_asignado"
  | "tutor_invitado"
  | "colaborador_invitado"
  | "autor_invitado";

export type CapacidadPlataforma =
  | "es_autor"
  | "es_tutor"
  | "es_colaborador"
  | "es_evaluador"
  | "es_entrevistado"
  | "es_entrevistador"
  | "es_admin_contenido"
  | "es_admin_sistema"
  | "es_admin_noticias"
  | "es_admin_entrevistas"
  | "es_autor_invitado"
  | "es_tutor_invitado"
  | "es_colaborador_invitado";

export type EstadoSituacionLaboral =
  | "buscando_empleo"
  | "empleado"
  | "emprendedor"
  | "estudiante"
  | "no_especificado"
  | "jubilado"
  | "otro";

export type VisibilidadPerfil =
  | "publico"
  | "solo_registrados_plataforma"
  | "privado"
  | "solo_admins_y_propio";

export type TemaCategoria =
  | "agropecuario"
  | "tecnologico"
  | "social"
  | "ambiental"
  | "educativo"
  | "produccion_animal"
  | "sanidad"
  | "energia"
  | "recursos_naturales"
  | "manejo_suelo"
  | "gastronomia"
  | "otro";

export type TipoOrganizacion =
  | "empresa"
  | "institucion_educativa"
  | "ONG"
  | "estancia_productiva"
  | "organismo_gubernamental"
  | "otro";

export type TipoContenidoEntrevista = "video_propio" | "enlace_video_externo";

export interface TemaOption {
  id: string;
  nombre: string;
}

export type PlataformaVideo =
  | "firebase_storage"
  | "youtube_propio"
  | "youtube"
  | "facebook"
  | "vimeo"
  | "otro";

export interface Proyecto {
  id: string; // ahora siempre UUID generado por Postgres (antes era optional string)

  titulo: string;
  descripcionGeneral: string;
  resumenEjecutivo?: string | null;

  // CAMBIO: antes idsTemas: string[] → ahora temas: Tema[]
  temas?: Tema[];

  palabrasClave?: string[]; // igual que antes
  anoProyecto: number;

  estadoActual: EstadoProyecto; // mismo enum que ya tenías

  // CAMBIO: Timestamp → string (ISO 8601)
  fechaInicio?: string | null;
  fechaFinalizacionEstimada?: string | null;
  fechaFinalizacionReal?: string | null;
  fechaPresentacion?: string | null;

  creadoPorUid: string;
  creadoEn: string; // string ISO
  actualizadoPorUid: string;
  actualizadoEn: string;

  // CAMBIO: arrays de objetos en lugar de ids
  autores?: Persona[];
  tutores?: Persona[];
  organizacionesTutoria?: Organizacion[];
  colaboradores?: Persona[];
  entrevistasRelacionadas?: Entrevista[];

  archivoPrincipalURL?: string | null;
  nombreArchivoPrincipal?: string | null;

  archivosAdjuntos?: ProyectoArchivo[]; // nuevo: corresponde a tabla `proyecto_archivo`

  nivelEducativoRecomendado?: string | null;
  aplicabilidadActual?: string | null;

  imagenPortadaURL?: string | null;

  estaEliminado: boolean;
  eliminadoEn?: string | null;
  eliminadoPorUid?: string | null;
}

// Nuevo type para tabla `proyecto_archivo`:
export interface ProyectoArchivo {
  id: string;
  proyecto_id: string;
  nombre: string;
  url: string;
  tipo?: string | null;
  descripcion?: string | null;
  subidoEn: string;
}

export interface Persona {
  id: string;

  nombre: string;
  apellido: string;
  email: string;
  fotoURL?: string | null;

  categoriaPrincipal: CategoriaPrincipalPersona;
  capacidadesPlataforma?: CapacidadPlataforma[] | null;

  activo: boolean;
  esAdmin: boolean;

  tituloProfesional?: string | null;
  descripcionPersonalOProfesional?: string | null;
  areasDeInteresOExpertise?: string[] | null;

  // CAMBIO: idsTemasDeInteres desaparece → ahora temasDeInteres?: Tema[]
  temasDeInteres?: Tema[];

  disponibleParaProyectos?: boolean | null;

  esExAlumnoCET?: boolean | null;
  anoCursadaActualCET?: number | null;
  anoEgresoCET?: number | null;
  titulacionObtenidaCET?: string | null;
  proyectoFinalCETId?: string | null; // esta relación todavía sería manual

  buscandoOportunidades?: boolean;
  estadoSituacionLaboral?: EstadoSituacionLaboral | null;
  historiaDeExitoOResumenTrayectoria?: string | null;
  empresaOInstitucionActual?: string | null;
  cargoActual?: string | null;
  ofreceColaboracionComo?: string[] | null;

  telefonoContacto?: string | null;
  linksProfesionales?: Array<{
    tipo: string | null;
    url: string | null;
  }> | null;

  // jsonb → misma estructura que ya tenías
  ubicacionResidencial?: {
    coordenadas?: { latitude: number; longitude: number } | null;
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

  ingresadoPor: string;
  creadoEn: string;
  modificadoPor: string;
  actualizadoEn: string;
  estaEliminada: boolean;
  eliminadoEn?: string | null;
  eliminadoPorUid?: string | null;
}

export interface Tema {
  id: string;
  nombre: string;
  descripcion?: string | null;
  categoriaTema?: TemaCategoria | null;

  ingresadoPorUid?: string | null;
  creadoEn: string;
  actualizadoEn: string;
  modificadoPorUid?: string | null;
  estaEliminada: boolean;
  eliminadoEn?: string | null;
  eliminadoPorUid?: string | null;
}

export interface Organizacion {
  id: string;

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

  // jsonb → igual que antes
  ubicacion?: {
    coordenadas?: { latitude: number; longitude: number } | null;
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
  creadoEn: string;
  modificadoPorUid?: string | null;
  actualizadoEn: string;
  estaEliminada: boolean;
  eliminadaEn?: string | null;
  eliminadoPorUid?: string | null;
}

export interface Noticia {
  id: string;
  tipoContenido: "articulo_propio" | "enlace_externo";
  titulo: string;
  subtitulo?: string | null;
  contenido?: string | null;
  urlExterna?: string | null;
  fuenteExterna?: string | null;
  resumenOContextoInterno?: string | null;
  fechaPublicacion: string;
  autorNoticia?: string | null;
  creadoPorUid?: string | null;
  actualizadoEn: string;
  modificadoPorUid?: string | null;
  imagenPrincipalURL?: string | null;

  // CAMBIO: idsTemas → temas
  temas?: Tema[];

  esDestacada: boolean;
  estaPublicada: boolean;
  estaEliminada: boolean;
  eliminadoEn?: string | null;
  eliminadoPorUid?: string | null;
}

export interface Entrevista {
  id: string;
  tipoContenido: TipoContenidoEntrevista;
  tituloSaber: string;
  descripcionSaber: string;
  videoPropioURL?: string | null;
  plataformaVideoPropio?: PlataformaVideo | null;
  urlVideoExterno?: string | null;
  plataformaVideoExterno?: PlataformaVideo | null;
  fuenteVideoExterno?: string | null;
  fechaGrabacionORecopilacion: string;
  ambitoSaber?: string | null;

  // CAMBIO: idsTemasSaber → temas
  temas?: Tema[];

  palabrasClaveSaber?: string[] | null;
  fuentesInformacion?: string[] | null;
  recopiladoPorUids?: string[] | null;
  transcripcionTextoCompleto?: string | null;
  transcripcionFileURL?: string | null;
  imagenMiniaturaURL?: string | null;
  duracionMediaMinutos?: number | null;

  creadoPorUid: string;
  creadoEn: string;
  modificadoPorUid: string;
  actualizadoEn: string;
  estaPublicada: boolean;
  estaEliminada: boolean;
  eliminadoEn?: string | null;
  eliminadoPorUid?: string | null;
}
