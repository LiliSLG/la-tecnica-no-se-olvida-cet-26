// src/lib/constants/persona.ts

// ✅ CATEGORÍAS PRINCIPALES DE PERSONAS
export const CATEGORIAS_PERSONA = [
  {
    value: "docente_cet",
    label: "Docente CET",
    icon: "👨‍🏫",
    color: "blue",
    description: "Profesores y personal educativo del CET N°26",
  },
  {
    value: "estudiante_cet",
    label: "Estudiante CET",
    icon: "🎓",
    color: "green",
    description: "Estudiantes actuales del CET N°26",
  },
  {
    value: "ex_alumno_cet",
    label: "Ex Alumno CET",
    icon: "🎓",
    color: "purple",
    description: "Graduados del CET N°26",
  },
  {
    value: "comunidad_activa",
    label: "Comunidad Activa",
    icon: "🤝",
    color: "orange",
    description: "Miembros activos que participan en proyectos",
  },
  {
    value: "comunidad_general",
    label: "Comunidad General",
    icon: "👥",
    color: "gray",
    description: "Miembros registrados sin proyectos activos",
  },
] as const;

export type CategoriaPersona = (typeof CATEGORIAS_PERSONA)[number]["value"];

// ✅ ESTADOS DE VERIFICACIÓN/INVITACIÓN
export const ESTADOS_VERIFICACION = [
  {
    value: "sin_invitacion",
    label: "Sin invitación",
    color: "gray",
    description: "Persona registrada sin invitación enviada",
  },
  {
    value: "pendiente_aprobacion",
    label: "Pendiente",
    color: "yellow",
    description: "Esperando aprobación del administrador",
  },
  {
    value: "invitacion_enviada",
    label: "Invitación enviada",
    color: "blue",
    description: "Invitación enviada, esperando respuesta",
  },
  {
    value: "verificada",
    label: "Verificada",
    color: "green",
    description: "Persona verificada y activa",
  },
  {
    value: "rechazada",
    label: "Rechazada",
    color: "red",
    description: "Invitación o solicitud rechazada",
  },
] as const;

export type EstadoVerificacion = (typeof ESTADOS_VERIFICACION)[number]["value"];

// ✅ SITUACIÓN LABORAL
export const ESTADOS_SITUACION_LABORAL = [
  { value: "empleado", label: "Empleado" },
  { value: "emprendedor", label: "Emprendedor" },
  { value: "estudiante", label: "Estudiante" },
  { value: "buscando_empleo", label: "Buscando empleo" },
  { value: "jubilado", label: "Jubilado" },
  { value: "independiente", label: "Trabajador independiente" },
  { value: "otro", label: "Otro" },
  { value: "no_especificado", label: "No especificado" },
] as const;

export type SituacionLaboral =
  (typeof ESTADOS_SITUACION_LABORAL)[number]["value"];

// ✅ VISIBILIDAD DEL PERFIL
export const VISIBILIDAD_PERFIL = [
  { value: "publico", label: "Público", description: "Visible para todos" },
  {
    value: "solo_registrados_plataforma",
    label: "Solo registrados",
    description: "Solo usuarios registrados en la plataforma",
  },
  { value: "privado", label: "Privado", description: "Solo para el usuario" },
  {
    value: "solo_admins_y_propio",
    label: "Solo admins",
    description: "Solo administradores y el propio usuario",
  },
] as const;

export type VisibilidadPerfil = (typeof VISIBILIDAD_PERFIL)[number]["value"];

// ✅ PROVINCIAS (ENFOQUE PATAGONIA)
export const PROVINCIAS = [
  { value: "rio_negro", label: "Río Negro" },
  { value: "neuquen", label: "Neuquén" },
  { value: "chubut", label: "Chubut" },
  { value: "santa_cruz", label: "Santa Cruz" },
  { value: "tierra_del_fuego", label: "Tierra del Fuego" },
  { value: "la_pampa", label: "La Pampa" },
  { value: "buenos_aires", label: "Buenos Aires" },
  { value: "otra", label: "Otra provincia" },
] as const;

export type Provincia = (typeof PROVINCIAS)[number]["value"];

// ✅ ÁREAS DE INTERÉS Y EXPERTISE
export const AREAS_INTERES = [
  "Agropecuario",
  "Ganadería",
  "Agricultura",
  "Tecnología",
  "Educación",
  "Salud",
  "Medio Ambiente",
  "Desarrollo Social",
  "Investigación",
  "Producción Animal",
  "Agricultura Sostenible",
  "Energías Renovables",
  "Innovación",
  "Capacitación",
  "Extensión Rural",
  "Desarrollo Comunitario",
  "Gastronomía",
  "Turismo Rural",
  "Biotecnología",
  "Recursos Naturales",
  "Mecánica",
  "Electrónica",
  "Informática",
  "Construcción",
  "Soldadura",
  "Carpintería",
  "Otro",
] as const;

export type AreaInteres = (typeof AREAS_INTERES)[number];

// ✅ PLATAFORMAS PROFESIONALES
export const PLATAFORMAS_PROFESIONALES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "researchgate", label: "ResearchGate" },
  { value: "academia_edu", label: "Academia.edu" },
  { value: "portfolio_personal", label: "Portfolio personal" },
  { value: "sitio_web_profesional", label: "Sitio web profesional" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "otro", label: "Otro" },
] as const;

export type PlataformaProfesional =
  (typeof PLATAFORMAS_PROFESIONALES)[number]["value"];

// ✅ CAPACIDADES EN LA PLATAFORMA
export const CAPACIDADES_PLATAFORMA = [
  { value: "tutor", label: "Tutor", description: "Guiar y mentor proyectos" },
  {
    value: "colaborador",
    label: "Colaborador",
    description: "Participar en proyectos",
  },
  {
    value: "autor",
    label: "Autor",
    description: "Crear contenido y proyectos",
  },
  {
    value: "revisor",
    label: "Revisor",
    description: "Revisar y validar contenido",
  },
  { value: "mentor", label: "Mentor", description: "Asesorar y acompañar" },
] as const;

export type CapacidadPlataforma =
  (typeof CAPACIDADES_PLATAFORMA)[number]["value"];

// ✅ TIPOS DE COLABORACIÓN
export const TIPOS_COLABORACION = [
  "Mentoría",
  "Consultoría",
  "Desarrollo de proyectos",
  "Investigación",
  "Docencia",
  "Charlas y presentaciones",
  "Voluntariado",
  "Capacitación técnica",
  "Asesoramiento",
  "Otro",
] as const;

export type TipoColaboracion = (typeof TIPOS_COLABORACION)[number];

// ✅ AÑOS DE CURSADA CET (1 a 6)
export const ANOS_CURSADA_CET = [
  { value: 1, label: "1er año" },
  { value: 2, label: "2do año" },
  { value: 3, label: "3er año" },
  { value: 4, label: "4to año" },
  { value: 5, label: "5to año" },
  { value: 6, label: "6to año" },
] as const;

// ✅ ESPECIALIDADES CET N°26
export const ESPECIALIDADES_CET = [
  { value: "agropecuaria", label: "Técnico Agropecuario" },
  { value: "mecanica", label: "Técnico en Mecánica" },
  { value: "electromecanica", label: "Técnico Electromecánico" },
  { value: "informatica", label: "Técnico en Informática" },
  { value: "construcciones", label: "Técnico en Construcciones" },
  { value: "otra", label: "Otra especialidad" },
] as const;

export type EspecialidadCET = (typeof ESPECIALIDADES_CET)[number]["value"];

// ✅ HELPER FUNCTIONS PARA OBTENER INFO DE CONSTANTES
export const getCategoriaInfo = (categoria: string | null) => {
  return (
    CATEGORIAS_PERSONA.find((c) => c.value === categoria) || {
      value: categoria || "comunidad_general",
      label: categoria || "Sin categoría",
      icon: "👤",
      color: "gray",
      description: "Categoría no especificada",
    }
  );
};

export const getEstadoVerificacionInfo = (estado: string | null) => {
  return (
    ESTADOS_VERIFICACION.find((e) => e.value === estado) || {
      value: estado || "sin_invitacion",
      label: estado || "Sin estado",
      color: "gray",
      description: "Estado no especificado",
    }
  );
};

export const getVisibilidadInfo = (visibilidad: string | null) => {
  return (
    VISIBILIDAD_PERFIL.find((v) => v.value === visibilidad) || {
      value: visibilidad || "publico",
      label: visibilidad || "Público",
      description: "Visibilidad no especificada",
    }
  );
};

export const getProvinciaInfo = (provincia: string | null) => {
  return (
    PROVINCIAS.find((p) => p.value === provincia) || {
      value: provincia || "otra",
      label: provincia || "Otra provincia",
    }
  );
};

export const getEspecialidadCETInfo = (especialidad: string | null) => {
  return (
    ESPECIALIDADES_CET.find((e) => e.value === especialidad) || {
      value: especialidad || "otra",
      label: especialidad || "Otra especialidad",
    }
  );
};

// ✅ HELPER FUNCTIONS PARA COLORES
export const getCategoriaColor = (categoria: string | null): string => {
  const categoriaInfo = getCategoriaInfo(categoria);
  switch (categoriaInfo.color) {
    case "green":
      return "bg-green-100 text-green-800 border-green-200";
    case "blue":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "purple":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "orange":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "gray":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getEstadoVerificacionColor = (estado: string | null): string => {
  const estadoInfo = getEstadoVerificacionInfo(estado);
  switch (estadoInfo.color) {
    case "green":
      return "bg-green-100 text-green-800 border-green-200";
    case "blue":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "yellow":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "red":
      return "bg-red-100 text-red-800 border-red-200";
    case "gray":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
