
"use client";

import { z } from "zod";
import type { Persona } from "@/lib/types"; // solo importamos 'Persona'; los demás los definimos abajo

/**
 * ————————————————————————————————————————————————————————————————
 * Constantes y tipos locales “duplicados” que
 * ya no vienen de @/lib/types porque los definimos aquí
 */

// Categorías que un admin puede seleccionar directamente en el formulario
export const adminSelectableCategoriasPrincipalesPersona = [
  "docente_cet",
  "estudiante_cet",
  "ex_alumno_cet",
  "productor_rural",
  "profesional_externo",
  "investigador",
  "comunidad_general",
  "otro",
  "ninguno_asignado",
] as const;
export type CategoriaPrincipalPersona =
  (typeof adminSelectableCategoriasPrincipalesPersona)[number];

// Todas las categorías posibles (incluye invitados)
export const allCategoriasPrincipalesPersona = [
  ...adminSelectableCategoriasPrincipalesPersona,
  "tutor_invitado",
  "colaborador_invitado",
  "autor_invitado",
] as const;


export const categoriasPrincipalesPersonaLabels: Record<
  (typeof allCategoriasPrincipalesPersona)[number],
  string
> = {
  docente_cet: "Docente CET",
  estudiante_cet: "Estudiante CET",
  ex_alumno_cet: "Ex-alumno CET",
  productor_rural: "Productor Rural",
  profesional_externo: "Profesional Externo",
  investigador: "Investigador/Académico",
  comunidad_general: "Comunidad General",
  otro: "Otro",
  ninguno_asignado: "Ninguno Asignado",
  tutor_invitado: "Tutor Invitado (Placeholder)",
  colaborador_invitado: "Colaborador Invitado (Placeholder)",
  autor_invitado: "Autor Invitado (Placeholder)",
};



// Capacidades en la plataforma
export const allCapacidadesPlataformaOptions = [
  "es_autor",
  "es_tutor",
  "es_colaborador",
  "es_evaluador",
  "es_entrevistado",
  "es_entrevistador",
  "es_admin_contenido",
  "es_admin_sistema",
  "es_admin_noticias",
  "es_admin_entrevistas",
  "es_autor_invitado",
  "es_tutor_invitado",
  "es_colaborador_invitado",
] as const;
export type CapacidadPlataforma =
  (typeof allCapacidadesPlataformaOptions)[number];

export const capacidadesPlataformaLabels: Record<CapacidadPlataforma, string> =
  {
    es_autor: "Autor de Proyectos",
    es_tutor: "Tutor de Proyectos",
    es_colaborador: "Colaborador en Proyectos",
    es_evaluador: "Evaluador de Proyectos",
    es_entrevistado: "Entrevistado (Historia Oral)",
    es_entrevistador: "Entrevistador (Historia Oral)",
    es_admin_contenido: "Admin de Contenido",
    es_admin_sistema: "Admin de Sistema (Global)",
    es_admin_noticias: "Admin de Noticias",
    es_admin_entrevistas: "Admin de Entrevistas",
    es_autor_invitado: "Autor Invitado (Placeholder)",
    es_tutor_invitado: "Tutor Invitado (Placeholder)",
    es_colaborador_invitado: "Colaborador Invitado (Placeholder)",
  };

// Capacidades que un admin puede gestionar directamente
export const adminManageableCapacidades = [
  "es_evaluador",
  "es_entrevistado",
  "es_entrevistador",
  "es_admin_contenido",
  "es_admin_sistema",
  "es_admin_noticias",
  "es_admin_entrevistas",
] as const;

// Visibilidad de perfil
export const visibilidadPerfilOptions = [
  "publico",
  "solo_registrados_plataforma",
  "privado",
  "solo_admins_y_propio",
] as const;
export type VisibilidadPerfil = (typeof visibilidadPerfilOptions)[number];
export const visibilidadPerfilLabels: Record<VisibilidadPerfil, string> = {
  publico: "Público (Visible para todos)",
  solo_registrados_plataforma: "Solo Usuarios Registrados",
  privado: "Privado (Solo yo)",
  solo_admins_y_propio: "Solo Administradores y Yo",
};

// Estado de situación laboral
export const estadoSituacionLaboralOptions = [
  "buscando_empleo",
  "empleado",
  "emprendedor",
  "estudiante",
  "no_especificado",
  "jubilado",
  "otro",
] as const;
export type EstadoSituacionLaboral =
  (typeof estadoSituacionLaboralOptions)[number];
export const estadoSituacionLaboralLabels: Record<
  EstadoSituacionLaboral,
  string
> = {
  buscando_empleo: "Buscando Empleo",
  empleado: "Empleado/a",
  emprendedor: "Emprendedor/a",
  estudiante: "Estudiante (Univ./Terciario)",
  no_especificado: "No Especificado",
  jubilado: "Jubilado/a",
  otro: "Otro",
};

/**
 * ————————————————————————————————————————————————————————————————
 * Preprocesadores Zod
 */

// Convierte cadenas separadas por comas en arreglos de strings
const stringToArray = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() !== "") {
    return val
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  if (Array.isArray(val)) {
    return val
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  return [];
}, z.array(z.string()));

/**
 * Un “link profesional” en el formulario.
 * Ej: { tipo: "LinkedIn", url: "https://..." }
 */
const LinkProfesionalSchema = z
  .object({
    tipo: z.string().optional().nullable().default(""),
    url: z
      .string()
      .url("Debe ser una URL válida.")
      .or(z.literal(""))
      .optional()
      .nullable()
      .default(""),
  })
  .default({ tipo: "", url: "" });

/**
 * Ubicación residencial en formulario:
 * latitud/longitud + campos texto.
 */
const UbicacionPersonaSchema = z
  .object({
    latitud: z.preprocess(
      (val) =>
        String(val).trim() === "" ||
        val === undefined ||
        val === null ||
        isNaN(parseFloat(String(val)))
          ? undefined
          : parseFloat(String(val)),
      z
        .number()
        .min(-90, "Latitud inválida (-90 a 90)")
        .max(90, "Latitud inválida (-90 a 90)")
        .optional()
        .nullable()
    ),
    longitud: z.preprocess(
      (val) =>
        String(val).trim() === "" ||
        val === undefined ||
        val === null ||
        isNaN(parseFloat(String(val)))
          ? undefined
          : parseFloat(String(val)),
      z
        .number()
        .min(-180, "Longitud inválida (-180 a 180)")
        .max(180, "Longitud inválida (-180 a 180)")
        .optional()
        .nullable()
    ),
    direccionTextoCompleto: z.string().optional().nullable(),
    calleYNumero: z.string().optional().nullable(),
    localidad: z.string().optional().nullable(),
    parajeORural: z.string().optional().nullable(),
    provincia: z.string().optional().nullable(),
    pais: z.string().optional().nullable(),
    referenciasAdicionales: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

/**
 * ————————————————————————————————————————————————————————————————
 * Schema principal para edición/creación de Persona
 */
export const personaSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre es requerido y debe tener al menos 2 caracteres."),
  apellido: z
    .string()
    .min(2, "El apellido es requerido y debe tener al menos 2 caracteres."),
  email: z.string().email("Debe ser un correo electrónico válido."),
  fotoURL: z
    .string()
    .url("URL de foto inválida.")
    .or(z.literal(""))
    .or(z.literal("PENDING_UPLOAD"))
    .optional()
    .nullable(),

  categoriaPrincipal: z.enum(
    adminSelectableCategoriasPrincipalesPersona as unknown as [
      CategoriaPrincipalPersona,
      ...CategoriaPrincipalPersona[]
    ],
    {
      required_error: "La categoría principal es requerida.",
    }
  ),

  capacidadesPlataforma: z
    .array(
      z.enum(
        allCapacidadesPlataformaOptions as unknown as [
          CapacidadPlataforma,
          ...CapacidadPlataforma[]
        ]
      )
    )
    .optional()
    .default([]),

  activo: z.boolean().default(true),
  esAdmin: z.boolean().default(false), // se sincronea con capacidadesPlataforma

  tituloProfesional: z.string().optional().nullable(),
  descripcionPersonalOProfesional: z.string().optional().nullable(),
  areasDeInteresOExpertise: stringToArray.optional(),
  idsTemasDeInteres: z.array(z.string()).optional().nullable(),
  disponibleParaProyectos: z.boolean().optional().nullable().default(true),

  esExAlumnoCET: z.boolean().optional().nullable(),
  anoCursadaActualCET: z
    .number()
    .int("Debe ser un número entero.")
    .min(1, "Año inválido.")
    .max(7, "Año inválido.")
    .optional()
    .nullable(),
  anoEgresoCET: z
    .number()
    .int("Debe ser un número entero.")
    .min(1900, "Año inválido.")
    .max(new Date().getFullYear() + 10, "Año futuro inválido.")
    .optional()
    .nullable(),
  titulacionObtenidaCET: z.string().optional().nullable(),
  proyectoFinalCETId: z.string().optional().nullable(),

  buscandoOportunidades: z.boolean().optional().nullable(),
  estadoSituacionLaboral: z
    .enum(
      estadoSituacionLaboralOptions as unknown as [
        EstadoSituacionLaboral,
        ...EstadoSituacionLaboral[]
      ]
    )
    .optional()
    .nullable(),
  historiaDeExitoOResumenTrayectoria: z.string().optional().nullable(),
  empresaOInstitucionActual: z.string().optional().nullable(),
  cargoActual: z.string().optional().nullable(),
  ofreceColaboracionComo: stringToArray.optional(),

  telefonoContacto: z.string().optional().nullable(),
  linksProfesionales: z
    .array(LinkProfesionalSchema)
    .optional()
    .default([{ tipo: "", url: "" }]),

  ubicacion: UbicacionPersonaSchema,

  visibilidadPerfil: z
    .enum(
      visibilidadPerfilOptions as unknown as [
        VisibilidadPerfil,
        ...VisibilidadPerfil[]
      ]
    )
    .optional()
    .nullable()
    .default("solo_registrados_plataforma"),

  estaEliminada: z.boolean().optional().default(false),
  creadoEn: z.string().optional(), // ISO timestamp o null
  actualizadoEn: z.string().optional(), // ISO timestamp o null
});

export type PersonaFormData = z.infer<typeof personaSchema>;

/**
 * ————————————————————————————————————————————————————————————————
 * Schema para “Agregar Persona” en modal
 */
export const addPersonaModalSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido."),
  apellido: z.string().min(2, "El apellido es requerido."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  fotoURL: z
    .string()
    .url("URL de foto inválida.")
    .or(z.literal(""))
    .or(z.literal("PENDING_UPLOAD_MODAL"))
    .optional()
    .nullable(),
  categoriaPrincipal: z.enum(
    allCategoriasPrincipalesPersona as unknown as [
      CategoriaPrincipalPersona,
      ...CategoriaPrincipalPersona[]
    ],
    { required_error: "La categoría principal es requerida." }
  ),
  anoCursadaActualCET: z.number().int().min(1).max(7).optional().nullable(),
  anoEgresoCET: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 10)
    .optional()
    .nullable(),
});
export type AddPersonaModalFormData = z.infer<typeof addPersonaModalSchema>;

/**
 * ————————————————————————————————————————————————————————————————
 * Convierte “formulario → objeto listo para Supabase”
 */
export function convertFormDataToSupabasePersona(
  data: PersonaFormData,
  userId: string,
  existingPersonaData?: Partial<Persona>
): Partial<Persona> {
  const supaData: { [key: string]: any } = { ...data };

  // 1) Ajustar capacidadesPlataforma (sin mezclar con ej. es_autor, es_tutor, es_colaborador)
  const projectRelatedCaps: CapacidadPlataforma[] = [
    "es_autor",
    "es_tutor",
    "es_colaborador",
  ];
  let finalCaps: CapacidadPlataforma[] =
    data.capacidadesPlataforma?.filter(
      (cap) => !projectRelatedCaps.includes(cap)
    ) ?? [];

  if (existingPersonaData?.capacidadesPlataforma) {
    const existingProjectCaps =
      existingPersonaData.capacidadesPlataforma.filter((cap) =>
        projectRelatedCaps.includes(cap)
      );
    finalCaps = Array.from(new Set([...finalCaps, ...existingProjectCaps]));
  }
  supaData.capacidadesPlataforma = finalCaps.length > 0 ? finalCaps : null;
  supaData.esAdmin =
    supaData.capacidadesPlataforma?.includes("es_admin_sistema") ?? false;

  // 2) Strings opcionales → null si están vacíos
  const optionalStringKeys: (keyof PersonaFormData)[] = [
    "tituloProfesional",
    "descripcionPersonalOProfesional",
    "titulacionObtenidaCET",
    "proyectoFinalCETId",
    "estadoSituacionLaboral",
    "historiaDeExitoOResumenTrayectoria",
    "empresaOInstitucionActual",
    "cargoActual",
    "telefonoContacto",
    "visibilidadPerfil",
  ];
  optionalStringKeys.forEach((key) => {
    if (supaData[key] === "" || supaData[key] === undefined) {
      supaData[key] = null;
    }
  });

  // 3) fotoURL: marcador → null
  if (
    supaData.fotoURL === "PENDING_UPLOAD" ||
    supaData.fotoURL === "" ||
    supaData.fotoURL === undefined
  ) {
    supaData.fotoURL = null;
  }

  // 4) Arreglos de strings → null si están vacíos
  const arrayStringKeys: (keyof PersonaFormData)[] = [
    "areasDeInteresOExpertise",
    "ofreceColaboracionComo",
  ];
  arrayStringKeys.forEach((key) => {
    supaData[key] =
      Array.isArray(data[key]) && (data[key] as string[]).length > 0
        ? (data[key] as string[]).filter(Boolean)
        : null;
  });
  supaData.idsTemasDeInteres =
    Array.isArray(data.idsTemasDeInteres) && data.idsTemasDeInteres.length > 0
      ? data.idsTemasDeInteres.filter(Boolean)
      : null;

  // 5) linksProfesionales → null si no hay links válidos
  supaData.linksProfesionales =
    Array.isArray(data.linksProfesionales) && data.linksProfesionales.length > 0
      ? data.linksProfesionales.filter(
          (link) =>
            link &&
            (link.url || link.tipo) &&
            !(link.url === "" && link.tipo === "")
        )
      : null;
  if (supaData.linksProfesionales && supaData.linksProfesionales.length === 0) {
    supaData.linksProfesionales = null;
  }

  // 6) Ubicación residencial → JSON o null
  if (data.ubicacion) {
    const formUbic = data.ubicacion;
    let hasAny = false;
    const ub: Partial<NonNullable<Persona["ubicacionResidencial"]>> = {};

    (
      Object.keys(formUbic) as Array<
        keyof NonNullable<PersonaFormData["ubicacion"]>
      >
    ).forEach((key) => {
      if (key === "latitud" || key === "longitud") return;
      const val = formUbic[key];
      if (val !== "" && val !== undefined && val !== null) {
        (ub as any)[key] = val;
        hasAny = true;
      } else {
        (ub as any)[key] = null;
      }
    });

    const lat = formUbic.latitud;
    const lon = formUbic.longitud;
    if (
      typeof lat === "number" &&
      !isNaN(lat) &&
      typeof lon === "number" &&
      !isNaN(lon)
    ) {
      ub.latitud = lat;
      ub.longitud = lon;
      hasAny = true;
    } else {
      ub.latitud = null;
      ub.longitud = null;
    }

    supaData.ubicacionResidencial = hasAny ? (ub as any) : null;
  } else {
    supaData.ubicacionResidencial = null;
  }

  // 7) Números de año → null si inválidos
  supaData.anoCursadaActualCET =
    data.anoCursadaActualCET === undefined ||
    data.anoCursadaActualCET === null ||
    isNaN(Number(data.anoCursadaActualCET))
      ? null
      : Number(data.anoCursadaActualCET);
  supaData.anoEgresoCET =
    data.anoEgresoCET === undefined ||
    data.anoEgresoCET === null ||
    isNaN(Number(data.anoEgresoCET))
      ? null
      : Number(data.anoEgresoCET);

  supaData.esExAlumnoCET = data.esExAlumnoCET ?? null;
  supaData.buscandoOportunidades = data.buscandoOportunidades ?? null;

  // 8) Auditoría en creación
  if (!existingPersonaData?.id) {
    supaData.ingresadoPor = userId;
    supaData.estaEliminada = false;
  }
  supaData.modificadoPor = userId;

  // 9) Flags booleanos
  supaData.activo = data.activo ?? true;
  supaData.disponibleParaProyectos = data.disponibleParaProyectos ?? true;

  // 10) Al actualizar, no tocar creadoEn ni ingresadoPor
  if (existingPersonaData?.id) {
    delete supaData.creadoEn;
    delete supaData.ingresadoPor;
  }

  // Limpiamos la llave “ubicacion” que vino del formulario
  delete (supaData as any).ubicacion;

  return supaData;
}

/**
 * ————————————————————————————————————————————————————————————————
 * Convierte “dato de Supabase” → valores para el formulario
 */
export function convertSupabaseDataToFormPersona(
  personaData: Persona
): PersonaFormData {
  const form: any = { ...personaData };

  // Strings
  form.nombre = personaData.nombre || "";
  form.apellido = personaData.apellido || "";
  form.email = personaData.email || "";
  form.fotoURL = personaData.fotoURL || "";
  form.tituloProfesional = personaData.tituloProfesional || "";
  form.descripcionPersonalOProfesional =
    personaData.descripcionPersonalOProfesional || "";
  form.titulacionObtenidaCET = personaData.titulacionObtenidaCET || "";
  form.proyectoFinalCETId = personaData.proyectoFinalCETId || "";
  form.historiaDeExitoOResumenTrayectoria =
    personaData.historiaDeExitoOResumenTrayectoria || "";
  form.empresaOInstitucionActual = personaData.empresaOInstitucionActual || "";
  form.cargoActual = personaData.cargoActual || "";
  form.telefonoContacto = personaData.telefonoContacto || "";
  form.visibilidadPerfil =
    personaData.visibilidadPerfil || "solo_registrados_plataforma";

  // Booleanos
  form.activo = personaData.activo ?? true;
  form.disponibleParaProyectos = personaData.disponibleParaProyectos ?? true;
  form.esExAlumnoCET = personaData.esExAlumnoCET ?? undefined;
  form.buscandoOportunidades = personaData.buscandoOportunidades ?? undefined;
  form.estaEliminada = personaData.estaEliminada ?? false;

  // Año/CET
  form.anoCursadaActualCET =
    personaData.anoCursadaActualCET === null ||
    personaData.anoCursadaActualCET === undefined
      ? undefined
      : Number(personaData.anoCursadaActualCET);
  form.anoEgresoCET =
    personaData.anoEgresoCET === null || personaData.anoEgresoCET === undefined
      ? undefined
      : Number(personaData.anoEgresoCET);

  // Arrays
  form.areasDeInteresOExpertise = Array.isArray(
    personaData.areasDeInteresOExpertise
  )
    ? personaData.areasDeInteresOExpertise
    : [];
  form.idsTemasDeInteres = Array.isArray(personaData.temasDeInteres)
    ? personaData.temasDeInteres
    : [];
  form.ofreceColaboracionComo = Array.isArray(
    personaData.ofreceColaboracionComo
  )
    ? personaData.ofreceColaboracionComo
    : [];

  // linksProfesionales
  form.linksProfesionales = Array.isArray(personaData.linksProfesionales)
    ? personaData.linksProfesionales.map((link) => ({
        tipo: link.tipo || "",
        url: link.url || "",
      }))
    : [{ tipo: "", url: "" }];

  // Capacidades / esAdmin
  form.capacidadesPlataforma = Array.isArray(personaData.capacidadesPlataforma)
    ? personaData.capacidadesPlataforma
    : [];
  form.esAdmin = form.capacidadesPlataforma.includes("es_admin_sistema");

  // Categoria principal
  if (
    personaData.categoriaPrincipal &&
    !adminSelectableCategoriasPrincipalesPersona.includes(
      personaData.categoriaPrincipal as CategoriaPrincipalPersona
    )
  ) {
    form.categoriaPrincipal = "ninguno_asignado";
  } else {
    form.categoriaPrincipal =
      personaData.categoriaPrincipal || "ninguno_asignado";
  }

  // Estado situacion laboral
  form.estadoSituacionLaboral = personaData.estadoSituacionLaboral || null;

  // Ubicación residencial
  if (personaData.ubicacionResidencial) {
    const ub = personaData.ubicacionResidencial;
    form.ubicacion = {
      latitud: ub.latitud ?? undefined,
      longitud: ub.longitud ?? undefined,
      direccionTextoCompleto: ub.direccionTextoCompleto || "",
      calleYNumero: ub.calleYNumero || "",
      localidad: ub.localidad || "",
      parajeORural: ub.parajeORural || "",
      provincia: ub.provincia || "",
      pais: ub.pais || "",
      referenciasAdicionales: ub.referenciasAdicionales || "",
    };
  } else {
    form.ubicacion = {
      latitud: undefined,
      longitud: undefined,
      direccionTextoCompleto: "",
      calleYNumero: "",
      localidad: "",
      parajeORural: "",
      provincia: "",
      pais: "",
      referenciasAdicionales: "",
    };
  }

  // Para que Zod valide correctamente, regresamos un PersonaFormData:
  return personaSchema.parse(form) as PersonaFormData;
}