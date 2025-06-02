import { supabase } from "./supabaseClient";
import { toast } from "@/hooks/use-toast";

/**
 * Sube un archivo a un bucket de Supabase y devuelve la URL pública.
 * @param file      – El File (imagen, PDF, etc.) que quieras subir.
 * @param folder    – Carpeta dentro del bucket donde guardarlo (p. ej. "miniaturas" o "transcripciones").
 * @param onProgress? – Callback opcional que recibe un número [0..100] indicando el progreso aproximado.
 * @returns La URL pública (string) del archivo subido.
 */
export async function uploadFile(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/\s+/g, "_");
  const fullPath = `entrevistas/${folder}/${timestamp}_${safeName}`;
  const bucketName = "public";

  let uploadResponse;
  try {
    uploadResponse = await supabase.storage
      .from(bucketName)
      .upload(fullPath, file, {
        cacheControl: "3600",
        upsert: false,
        // Si tu versión de supabase-js soporta onUploadProgress:
        // onUploadProgress: (evt) => {
        //   const percent = Math.round((evt.loaded / evt.total) * 100);
        //   onProgress?.(percent);
        // },
      });
  } catch (err: any) {
    toast({
      title: `Error subiendo (${folder})`,
      description: err.message || "Ocurrió un error en Supabase Storage.",
      variant: "destructive",
    });
    throw err;
  }

  if (uploadResponse.error) {
    toast({
      title: `Error subiendo (${folder})`,
      description: uploadResponse.error.message,
      variant: "destructive",
    });
    throw uploadResponse.error;
  }

  // Si no hubo progreso granular, notificamos 100% al terminar:
  onProgress?.(100);

  // Obtener la URL pública (sin destructurar `error`, porque ya no existe)
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(uploadResponse.data.path);

  if (!data?.publicUrl) {
    toast({
      title: `Error obteniendo URL pública`,
      description: "No se pudo obtener la URL del archivo.",
      variant: "destructive",
    });
    throw new Error("No se retornó publicUrl");
  }

  return data.publicUrl;
}

/**
 * Elimina un archivo dentro de un bucket de Supabase Storage.
 * @param filePath – La ruta completa dentro del bucket
 *                   (por ej. "entrevistas/miniaturas/1685792345678_miarchivo.png").
 */
export async function deleteFile(filePath: string): Promise<void> {
  const bucketName = "public";
  const { error } = await supabase.storage.from(bucketName).remove([filePath]);
  if (error) {
    toast({
      title: "Error eliminando archivo",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }
}

/**
 * Obtiene la URL pública de un archivo ya subido.
 * @param filePath – Ruta completa dentro del bucket
 *                   (por ej. "entrevistas/miniaturas/1685792345678_miarchivo.png").
 * @returns La URL pública (string) o null si no existe.
 */
export function getPublicUrl(filePath: string): string | null {
  const bucketName = "public";
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    console.error("No se pudo obtener la URL pública.");
    return null;
  }
  return data.publicUrl;
}



/*import {
  uploadFile,
  deleteFile,
  getPublicUrl,
} from "@/lib/supabaseStorage";

// y luego:
const url = await uploadFile(miArchivo, "miniaturas", (p) => setProgress(p));
await deleteFile("entrevistas/miniaturas/168579234.jpg");
const publicUrl = getPublicUrl("entrevistas/miniaturas/168579234.jpg");
 */