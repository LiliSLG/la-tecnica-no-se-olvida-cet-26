// src/lib/schemas/organizacionSchema.ts

import { z } from "zod";
import type { Organizacion, TipoOrganizacion} from "@/lib/types";


//  Construimos el arreglo con las mismas literales en el mismo orden que el type:
export const organizacionTipos = [
  "empresa",
  "institucion_educativa",
  "ONG",
  "estancia_productiva",
  "organismo_gubernamental",
  "otro",
] as const;


export const organizacionTipoLabels: Record<TipoOrganizacion, string> = {
  empresa: "Empresa",
  institucion_educativa: "Institución Educativa",
  ONG: "ONG",
  estancia_productiva: "Estancia Productiva",
  organismo_gubernamental: "Organismo Gubernamental",
  otro: "Otro",
};

// --- Subschema para el campo “ubicacion” ---
const UbicacionSchema = z
  .object({
    latitud: z.coerce.number().min(-90).max(90).optional().nullable(),
    longitud: z.coerce.number().min(-180).max(180).optional().nullable(),
    direccionTextoCompleto: z.string().optional().nullable(),
    calleYNumero: z.string().optional().nullable(),
    localidad: z.string().optional().nullable(),
    parajeORural: z.string().optional().nullable(),
    provincia: z.string().optional().nullable(),
    pais: z.string().optional().nullable(),
    referenciasAdicionales: z.string().optional().nullable(),
    mapaLink: z.string().url("Debe ser una URL válida.").optional().nullable(),
  })
  .optional()
  .nullable();

// --- Esquema principal para el formulario de Organización ---
export const organizacionSchema = z.object({
  nombreOficial: z
    .string()
    .min(
      2,
      "El nombre oficial es requerido y debe tener al menos 2 caracteres."
    ),
  nombreFantasia: z.string().optional().nullable(),
  tipo: z.enum(organizacionTipos as unknown as [string, ...string[]], {
    required_error: "El tipo de organización es requerido.",
  }),
  descripcion: z.string().optional().nullable(),
  logoURL: z
    .string()
    .url("Debe ser una URL válida.")
    .optional()
    .or(z.literal("PENDING_UPLOAD"))
    .or(z.literal(""))
    .optional()
    .nullable(),
  sitioWeb: z
    .string()
    .url("Debe ser una URL válida.")
    .optional()
    .or(z.literal(""))
    .nullable(),
  emailContacto: z
    .string()
    .email("Debe ser un correo electrónico válido.")
    .optional()
    .or(z.literal(""))
    .nullable(),
  telefonoContacto: z.string().optional().nullable(),
  areasDeInteres: z.array(z.string()).optional().nullable(),
  abiertaAColaboraciones: z.boolean().optional().nullable(),
  ubicacion: UbicacionSchema,
  estaEliminada: z.boolean().optional().default(false),
});
export type OrganizacionFormData = z.infer<typeof organizacionSchema>;

// -----------------------------------------------------------------------------
// Convierte un objeto “Organizacion” (desde Supabase) a OrganizacionFormData
// -----------------------------------------------------------------------------
export function convertSupabaseDataToFormOrganizacion(
  orgData: Partial<Organizacion> // ahora aceptará incluso objetos donde 'id' sea opcional
): OrganizacionFormData {
  // Dado que recibimos un Partial, debemos protegernos contra campos undefined.
  // Por ejemplo:
  const nombreOficial = orgData.nombreOficial ?? "";
  const nombreFantasia = orgData.nombreFantasia ?? "";
  const tipo = orgData.tipo ?? "empresa"; // o el default que corresponda
  const descripcion = orgData.descripcion ?? "";
  const logoURL = orgData.logoURL ?? "";
  const sitioWeb = orgData.sitioWeb ?? "";
  const emailContacto = orgData.emailContacto ?? "";
  const telefonoContacto = orgData.telefonoContacto ?? "";
  const areasDeInteres = Array.isArray(orgData.areasDeInteres)
    ? orgData.areasDeInteres
    : [];
  const abiertaAColaboraciones = orgData.abiertaAColaboraciones ?? null;
  const estaEliminada = orgData.estaEliminada ?? false;

  // 2) Ubicación: si existe JSON en DB, mapear campos
  let ubicacion: Exclude<OrganizacionFormData["ubicacion"], undefined | null> =
    {
      latitud: null,
      longitud: null,
      direccionTextoCompleto: null,
      calleYNumero: null,
      localidad: null,
      parajeORural: null,
      provincia: null,
      pais: null,
      referenciasAdicionales: null,
      mapaLink: null,
    };

  if (orgData.ubicacion) {
    const u = orgData.ubicacion as Record<string, any>;
    ubicacion = {
      latitud: typeof u.latitud === "number" ? u.latitud : null,
      longitud: typeof u.longitud === "number" ? u.longitud : null,
      direccionTextoCompleto: u.direccionTextoCompleto ?? null,
      calleYNumero: u.calleYNumero ?? null,
      localidad: u.localidad ?? null,
      parajeORural: u.parajeORural ?? null,
      provincia: u.provincia ?? null,
      pais: u.pais ?? null,
      referenciasAdicionales: u.referenciasAdicionales ?? null,
      mapaLink: u.mapaLink ?? null,
    };
  }

  // Finalmente, validamos con Zod:
  try {
    const parsed = organizacionSchema.parse({
      nombreOficial,
      nombreFantasia,
      tipo,
      descripcion,
      logoURL,
      sitioWeb,
      emailContacto,
      telefonoContacto,
      areasDeInteres,
      abiertaAColaboraciones,
      ubicacion,
      estaEliminada,
    });

    return {
      nombreOficial: parsed.nombreOficial,
      nombreFantasia: parsed.nombreFantasia ?? null,
      tipo: parsed.tipo,
      descripcion: parsed.descripcion ?? null,
      logoURL: parsed.logoURL ?? null,
      sitioWeb: parsed.sitioWeb ?? null,
      emailContacto: parsed.emailContacto ?? null,
      telefonoContacto: parsed.telefonoContacto ?? null,
      areasDeInteres: parsed.areasDeInteres ?? [],
      abiertaAColaboraciones: parsed.abiertaAColaboraciones ?? null,
      ubicacion: {
        latitud: parsed.ubicacion?.latitud ?? null,
        longitud: parsed.ubicacion?.longitud ?? null,
        direccionTextoCompleto:
          parsed.ubicacion?.direccionTextoCompleto ?? null,
        calleYNumero: parsed.ubicacion?.calleYNumero ?? null,
        localidad: parsed.ubicacion?.localidad ?? null,
        parajeORural: parsed.ubicacion?.parajeORural ?? null,
        provincia: parsed.ubicacion?.provincia ?? null,
        pais: parsed.ubicacion?.pais ?? null,
        referenciasAdicionales:
          parsed.ubicacion?.referenciasAdicionales ?? null,
        mapaLink: parsed.ubicacion?.mapaLink ?? null,
      },
      estaEliminada: parsed.estaEliminada ?? false,
    };
  } catch (e) {
    console.error("Error al parsear orgData en FormOrganizacion:", e, orgData);
    // Devolvemos un objeto por defecto para que el form no rompa.
    return {
      nombreOficial,
      nombreFantasia: nombreFantasia || null,
      tipo: (tipo as TipoOrganizacion) || "empresa",
      descripcion: descripcion || null,
      logoURL: logoURL || null,
      sitioWeb: sitioWeb || null,
      emailContacto: emailContacto || null,
      telefonoContacto: telefonoContacto || null,
      areasDeInteres,
      abiertaAColaboraciones,
      ubicacion,
      estaEliminada,
    };
  }
}

// -----------------------------------------------------------------------------
// Convierte OrganizacionFormData (del formulario) a Partial<Organizacion> para inserción/actualización
// -----------------------------------------------------------------------------
export function convertFormDataToSupabaseOrganizacion(
  data: OrganizacionFormData,
  userId: string,
  existingOrg?: Organizacion
): Partial<Organizacion> {
  // 1) Mapear y normalizar cadenas vacías a null
  const nombreOficial = data.nombreOficial.trim();
  const nombreFantasia =
    data.nombreFantasia && data.nombreFantasia.trim() !== ""
      ? data.nombreFantasia.trim()
      : null;
  const tipo = data.tipo;
  const descripcion =
    data.descripcion && data.descripcion.trim() !== ""
      ? data.descripcion.trim()
      : null;
  const logoURL =
    data.logoURL &&
    data.logoURL !== "PENDING_UPLOAD" &&
    data.logoURL.trim() !== ""
      ? data.logoURL.trim()
      : null;
  const sitioWeb =
    data.sitioWeb && data.sitioWeb.trim() !== "" ? data.sitioWeb.trim() : null;
  const emailContacto =
    data.emailContacto && data.emailContacto.trim() !== ""
      ? data.emailContacto.trim()
      : null;
  const telefonoContacto =
    data.telefonoContacto && data.telefonoContacto.trim() !== ""
      ? data.telefonoContacto.trim()
      : null;
  const areasDeInteres =
    data.areasDeInteres && data.areasDeInteres.length > 0
      ? data.areasDeInteres
      : null;
  const abiertaAColaboraciones =
    data.abiertaAColaboraciones !== undefined
      ? data.abiertaAColaboraciones
      : null;

  // 2) Ubicación: solo incluir campos que no sean null/undefined/""
  let ubicacionPayload: Record<string, any> | null = null;
  if (data.ubicacion) {
    const u = data.ubicacion;
    const lat = u.latitud ?? null;
    const lng = u.longitud ?? null;
    const dir = u.direccionTextoCompleto ?? null;
    const calleYNro = u.calleYNumero ?? null;
    const loc = u.localidad ?? null;
    const rural = u.parajeORural ?? null;
    const prov = u.provincia ?? null;
    const pais = u.pais ?? null;
    const refAdd = u.referenciasAdicionales ?? null;
    const mapaL = u.mapaLink ?? null;

    const anyFieldNotEmpty =
      lat !== null ||
      lng !== null ||
      dir !== null ||
      calleYNro !== null ||
      loc !== null ||
      rural !== null ||
      prov !== null ||
      pais !== null ||
      refAdd !== null ||
      mapaL !== null;

    if (anyFieldNotEmpty) {
      ubicacionPayload = {
        latitud: lat,
        longitud: lng,
        direccionTextoCompleto: dir,
        calleYNumero: calleYNro,
        localidad: loc,
        parajeORural: rural,
        provincia: prov,
        pais: pais,
        referenciasAdicionales: refAdd,
        mapaLink: mapaL,
      };
    }
  }


  
  // 3) Construir el objeto parcial para insertar/actualizar
  const orgPayload: Partial<Organizacion> = {
    nombreOficial,
    nombreFantasia,
    // Hacemos cast a TipoOrganizacion para que TS no se queje:
    tipo: data.tipo as TipoOrganizacion,
    descripcion,
    logoURL,
    sitioWeb,
    emailContacto,
    telefonoContacto,
    areasDeInteres,
    abiertaAColaboraciones,
    ubicacion: ubicacionPayload,
    modificadoPorUid: userId,

  };


  // 4) Si no existe existingOrg.id, es INSERT ⇒ agregar ingresadoPorUid y estaEliminada=false
  if (!existingOrg?.id) {
    orgPayload.ingresadoPorUid = userId;
    orgPayload.estaEliminada = false;
  }

  return orgPayload;
}

export const addOrganizacionModalSchema = z.object({
  nombreOficial: z
    .string()
    .min(
      2,
      "El nombre oficial es requerido y debe tener al menos 2 caracteres."
    ),

  tipo: z.enum(
    organizacionTipos as unknown as [TipoOrganizacion, ...TipoOrganizacion[]],
    { required_error: "Debes seleccionar un tipo de organización." }
  ),

  nombreFantasia: z.string().optional().nullable(),

  emailContacto: z
    .string()
    .email("Debe ser un correo electrónico válido.")
    .optional()
    .or(z.literal("")),

  sitioWeb: z
    .string()
    .url("Debe ser una URL válida.")
    .optional()
    .or(z.literal("")),
});

export type AddOrganizacionModalFormData = z.infer<
  typeof addOrganizacionModalSchema
>;