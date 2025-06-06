// /src/lib/constants/persona.ts

export const CATEGORIAS_PRINCIPALES = [
  "docente_cet",
  "estudiante_cet",
  "ex_alumno_cet",
  "productor_rural",
  "profesional_externo",
  "investigador",
  "comunidad_general",
  "otro",
  "ninguno_asignado",
  "tutor_invitado",
  "colaborador_invitado",
  "autor_invitado",
] as const;

export const ESTADOS_SITUACION_LABORAL = [
  "buscando_empleo",
  "empleado",
  "emprendedor",
  "independiente",
  "estudiante",
  "jubilado",
  "otro",
  "no_especificado",
] as const;

export const PAISES = [
  "Argentina",
  "Chile",
  "Uruguay",
  "Brasil",
  "Paraguay",
  "Bolivia",
  "Perú",
  "Otros",
] as const;

export const PROVINCIAS = [
  { value: "rio_negro", label: "Río Negro" },
  { value: "neuquen", label: "Neuquén" },
  { value: "chubut", label: "Chubut" },
  { value: "santa_cruz", label: "Santa Cruz" },
  { value: "tierra_del_fuego", label: "Tierra del Fuego" },
] as const;

export const CAPACIDADES_PLATAFORMA = [
  { value: "tutor", label: "Tutor" },
  { value: "colaborador", label: "Colaborador" },
  { value: "autor", label: "Autor" },
  { value: "revisor", label: "Revisor" },
  { value: "mentor", label: "Mentor" },
] as const;

export const VISIBILIDAD_PERFIL = [
  { value: "publico", label: "Público" },
  { value: "solo_registrados_plataforma", label: "Solo registrados en la plataforma" },
  { value: "privado", label: "Privado" },
  { value: "solo_admins_y_propio", label: "Solo administradores y propio" },
] as const;

export const AREAS_DE_INTERES = [
  "agricultura_regenerativa",
  "ganaderia_regenerativa",
  "tecnologia_aplicada_al_campo",
  "educacion_rural",
  "turismo_rural",
  "desarrollo_local",
  "conservacion_de_la_naturaleza",
  "ciencia_ciudadana",
  "divulgacion_cientifica",
  "innovacion_social",
  "otro",
] as const;

export const PLATAFORMAS_PROFESIONALES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "researchgate", label: "ResearchGate" },
  { value: "academia_edu", label: "Academia.edu" },
  { value: "portfolio_personal", label: "Portfolio personal" },
  { value: "sitio_web_profesional", label: "Sitio web profesional" },
  { value: "otro", label: "Otro" },
] as const;


export const TIPOS_COLABORACION = [
  "mentoria",
  "consultoria",
  "desarrollo_proyectos",
  "investigacion",
  "docencia",
  "charlas_presentaciones",
  "voluntariado",
  "otro",
] as const;
