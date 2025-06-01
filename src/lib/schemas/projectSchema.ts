
"use client";

import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import type { Proyecto } from "@/lib/types";

export const estadoOptions = [
  "idea",
  "en_desarrollo",
  "finalizado",
  "presentado",
  "archivado",
  "cancelado",
] as const;
export type EstadoProyecto = (typeof estadoOptions)[number];

export const estadoLabels: Record<EstadoProyecto, string> = {
  idea: "Idea",
  en_desarrollo: "En Desarrollo",
  finalizado: "Finalizado",
  presentado: "Presentado",
  archivado: "Archivado",
  cancelado: "Cancelado",
};

// Zod preprocessor para convertir string separado por comas a array de strings
export const stringToArrayZod = z.preprocess((val) => {
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

// Helper function (not a Zod preprocessor) para el form, si es necesario
export const stringToArray = (
  val: string | string[] | undefined | null
): string[] => {
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
};

const AttachedFileSchema = z.object({
  nombre: z.string().min(1, "El nombre del archivo es requerido."),
  url: z
    .string()
    .url("Debe ser una URL válida.")
    .min(1, "La URL del archivo es requerida."),
  tipo: z.string().optional().nullable(),
  descripcion: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  descripcionGeneral: z
    .string()
    .min(10, "La descripción general debe tener al menos 10 caracteres."),
  resumenEjecutivo: z.string().optional().nullable(),

  idsTemas: z.array(z.string()).min(1, "Debe seleccionar al menos un tema."),
  palabrasClave: stringToArrayZod.refine((value) => value.length > 0, {
    message: "Debe ingresar al menos una palabra clave.",
  }),
  idsOrganizacionesTutoria: stringToArrayZod.optional().default([]), // Changed to use stringToArrayZod for comma-separated string input

  anoProyecto: z.coerce
    .number()
    .min(1900, "El año debe ser válido.")
    .max(new Date().getFullYear() + 5, "El año no puede ser tan futuro."),

  estadoActual: z.enum(estadoOptions, {
    required_error: "El estado actual es requerido.",
  }),

  fechaInicio: z.date().nullable().optional(),
  fechaFinalizacionEstimada: z.date().nullable().optional(),
  fechaFinalizacionReal: z.date().nullable().optional(),
  fechaPresentacion: z.date().nullable().optional(),

  idsAutores: z.array(z.string()).min(1, "Debe seleccionar al menos un autor."),
  idsTutoresPersonas: z.array(z.string()).optional().default([]),
  // idsOrganizacionesTutoria: z.array(z.string()).optional().default([]), // Reverted this to stringToArrayZod
  idsColaboradores: z.array(z.string()).optional().default([]),

  archivoPrincipalURL: z
    .string()
    .url("Debe ser una URL válida.")
    .or(z.literal(""))
    .optional()
    .nullable(),
  nombreArchivoPrincipal: z.string().optional().nullable(),

  archivosAdjuntos: z.array(AttachedFileSchema).optional().default([]),
  estaEliminado: z.boolean().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const convertFormDataForFirestore = (
  data: ProjectFormData
): Record<string, any> => {
  const firestoreData: { [key: string]: any } = { ...data };

  const arrayIdKeys: (keyof Pick<
    ProjectFormData,
    | "idsTemas"
    | "idsAutores"
    | "idsTutoresPersonas"
    | "idsColaboradores"
    | "idsOrganizacionesTutoria"
    | "palabrasClave"
  >)[] = [
    "idsTemas",
    "idsAutores",
    "idsTutoresPersonas",
    "idsColaboradores",
    "idsOrganizacionesTutoria",
    "palabrasClave",
  ];
  arrayIdKeys.forEach((key) => {
    if (Array.isArray(firestoreData[key]) && firestoreData[key].length === 0) {
      firestoreData[key] = null;
    } else if (firestoreData[key] === undefined) {
      firestoreData[key] = null;
    }
  });

  const optionalStringKeys: (keyof Pick<
    ProjectFormData,
    "resumenEjecutivo" | "archivoPrincipalURL" | "nombreArchivoPrincipal"
  >)[] = ["resumenEjecutivo", "archivoPrincipalURL", "nombreArchivoPrincipal"];
  optionalStringKeys.forEach((key) => {
    if (firestoreData[key] === "" || firestoreData[key] === undefined) {
      firestoreData[key] = null;
    }
  });

  if (
    firestoreData.archivosAdjuntos &&
    Array.isArray(firestoreData.archivosAdjuntos)
  ) {
    firestoreData.archivosAdjuntos = firestoreData.archivosAdjuntos.map(
      (adjunto: any) => {
        const newAdjunto = { ...adjunto };
        newAdjunto.tipo = adjunto.tipo || null;
        newAdjunto.descripcion = adjunto.descripcion || null;
        return newAdjunto;
      }
    );
    if (firestoreData.archivosAdjuntos.length === 0)
      firestoreData.archivosAdjuntos = null;
  } else {
    firestoreData.archivosAdjuntos = null;
  }

  firestoreData.fechaInicio = data.fechaInicio
    ? Timestamp.fromDate(data.fechaInicio)
    : null;
  firestoreData.fechaFinalizacionEstimada = data.fechaFinalizacionEstimada
    ? Timestamp.fromDate(data.fechaFinalizacionEstimada)
    : null;
  firestoreData.fechaFinalizacionReal = data.fechaFinalizacionReal
    ? Timestamp.fromDate(data.fechaFinalizacionReal)
    : null;
  firestoreData.fechaPresentacion = data.fechaPresentacion
    ? Timestamp.fromDate(data.fechaPresentacion)
    : null;

  return firestoreData;
};

export const convertFirestoreDataToForm = (
  projectData: Partial<Proyecto>
): ProjectFormData => {
  const convertTimestampToDate = (timestamp: any): Date | null =>
    timestamp && typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : null;

  const formValues: { [key: string]: any } = { ...projectData };

  formValues.fechaInicio = convertTimestampToDate(projectData.fechaInicio);
  formValues.fechaFinalizacionEstimada = convertTimestampToDate(
    projectData.fechaFinalizacionEstimada
  );
  formValues.fechaFinalizacionReal = convertTimestampToDate(
    projectData.fechaFinalizacionReal
  );
  formValues.fechaPresentacion = convertTimestampToDate(
    projectData.fechaPresentacion
  );

  const arrayFieldToArray = (fieldValue: any): string[] => {
    if (Array.isArray(fieldValue)) return fieldValue;
    return [];
  };

  formValues.idsTemas = arrayFieldToArray(projectData.idsTemas);
  formValues.palabrasClave = arrayFieldToArray(projectData.palabrasClave);
  formValues.idsAutores = arrayFieldToArray(projectData.idsAutores);
  formValues.idsTutoresPersonas = arrayFieldToArray(
    projectData.idsTutoresPersonas
  );
  formValues.idsOrganizacionesTutoria = arrayFieldToArray(
    projectData.idsOrganizacionesTutoria
  );
  formValues.idsColaboradores = arrayFieldToArray(projectData.idsColaboradores);

  formValues.archivosAdjuntos = Array.isArray(projectData.archivosAdjuntos)
    ? projectData.archivosAdjuntos.map((adjunto: any) => ({
        nombre: adjunto.nombre || "",
        url: adjunto.url || "",
        tipo: adjunto.tipo || "",
        descripcion: adjunto.descripcion || "",
      }))
    : [];

  formValues.resumenEjecutivo = projectData.resumenEjecutivo || "";
  formValues.archivoPrincipalURL = projectData.archivoPrincipalURL || "";
  formValues.nombreArchivoPrincipal = projectData.nombreArchivoPrincipal || "";

  formValues.estaEliminado = projectData.estaEliminado ?? false;
  formValues.anoProyecto = projectData.anoProyecto || new Date().getFullYear();
  formValues.estadoActual = projectData.estadoActual || "idea";

  // The following line was causing the error when initialData.idsTemas was []
  // return projectSchema.parse(formValues);

  // Directly return the transformed values. Validation will be handled by the form resolver.
  // Ensure all fields expected by ProjectFormData are present with defaults if necessary.
  return {
    titulo: formValues.titulo || "",
    descripcionGeneral: formValues.descripcionGeneral || "",
    resumenEjecutivo: formValues.resumenEjecutivo || null,
    idsTemas: formValues.idsTemas || [],
    palabrasClave: formValues.palabrasClave || [],
    idsOrganizacionesTutoria: formValues.idsOrganizacionesTutoria || [],
    anoProyecto: formValues.anoProyecto || new Date().getFullYear(),
    estadoActual: formValues.estadoActual || "idea",
    fechaInicio: formValues.fechaInicio || null,
    fechaFinalizacionEstimada: formValues.fechaFinalizacionEstimada || null,
    fechaFinalizacionReal: formValues.fechaFinalizacionReal || null,
    fechaPresentacion: formValues.fechaPresentacion || null,
    idsAutores: formValues.idsAutores || [],
    idsTutoresPersonas: formValues.idsTutoresPersonas || [],
    idsColaboradores: formValues.idsColaboradores || [],
    archivoPrincipalURL: formValues.archivoPrincipalURL || null,
    nombreArchivoPrincipal: formValues.nombreArchivoPrincipal || null,
    archivosAdjuntos: formValues.archivosAdjuntos || [],
    estaEliminado: formValues.estaEliminado ?? false,
  } as ProjectFormData; // Cast to ensure type compliance after manual construction
};
