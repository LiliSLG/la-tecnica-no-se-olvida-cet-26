import { z } from "zod";

const tipoContenidoEnum = z.enum(["video", "audio", "texto"]);
const estadoEnum = z.enum(["scheduled", "completed", "cancelled"]);

// Base schema that matches database structure
export const historiaOralSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().nullable(),
  tipo_contenido: tipoContenidoEnum,
  plataforma_video: z.string().nullable(),
  archivo_principal_url: z.string().url("URL inválida").nullable(),
  estado: estadoEnum,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_deleted: z.boolean().default(false),
  deleted_by_uid: z.string().nullable(),
  deleted_at: z.string().nullable(),
});

// Form-specific schema with camelCase fields and additional form fields
export const historiaOralFormSchema = historiaOralSchema
  .extend({
    tipoContenido: tipoContenidoEnum,
    plataformaVideo: z.string().nullable(),
    archivoPrincipalURL: z.string().url("URL inválida").nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    is_deleted: z.boolean().default(false),
    deleted_by_uid: z.string().nullable(),
    deleted_at: z.string().nullable(),
    // Additional form fields
    temas: z
      .array(
        z.object({
          id: z.string(),
          nombre: z.string(),
        })
      )
      .optional(),
    palabrasClaveSaber: z.array(z.string()).optional(),
    fuentesInformacion: z.array(z.string()).optional(),
    recopiladoPorUids: z.array(z.string()).optional(),
    videoPropioURL: z.string().url("URL inválida").optional(),
    plataformaVideoPropio: z.string().optional(),
    urlVideoExterno: z.string().url("URL inválida").optional(),
    plataformaVideoExterno: z.string().optional(),
    fuenteVideoExterno: z.string().optional(),
    ambitoSaber: z.string().optional(),
    transcripcionTextoCompleto: z.string().optional(),
    transcripcionFileURL: z.string().url("URL inválida").optional(),
    imagenMiniaturaURL: z.string().url("URL inválida").optional(),
    duracionMediaMinutos: z.number().int().min(0).optional(),
    estaPublicada: z.boolean().default(false),
  })
  .transform((data) => ({
    // Transform to MappedHistoriaOral format
    id: data.id,
    titulo: data.titulo,
    descripcion: data.descripcion,
    tipoContenido: data.tipo_contenido || data.tipoContenido,
    plataformaVideo: data.plataforma_video || data.plataformaVideo,
    archivoPrincipalURL: data.archivo_principal_url || data.archivoPrincipalURL,
    estado: data.estado,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    is_deleted: data.is_deleted || data.is_deleted,
    deleted_by_uid: data.deleted_by_uid || data.deleted_by_uid,
    deleted_at: data.deleted_at || data.deleted_at,
    // Additional fields
    temas: data.temas,
    palabrasClaveSaber: data.palabrasClaveSaber,
    fuentesInformacion: data.fuentesInformacion,
    recopiladoPorUids: data.recopiladoPorUids,
    videoPropioURL: data.videoPropioURL,
    plataformaVideoPropio: data.plataformaVideoPropio,
    urlVideoExterno: data.urlVideoExterno,
    plataformaVideoExterno: data.plataformaVideoExterno,
    fuenteVideoExterno: data.fuenteVideoExterno,
    ambitoSaber: data.ambitoSaber,
    transcripcionTextoCompleto: data.transcripcionTextoCompleto,
    transcripcionFileURL: data.transcripcionFileURL,
    imagenMiniaturaURL: data.imagenMiniaturaURL,
    duracionMediaMinutos: data.duracionMediaMinutos,
    estaPublicada: data.estaPublicada,
  }));

export type HistoriaOralFormData = z.infer<typeof historiaOralFormSchema>;
