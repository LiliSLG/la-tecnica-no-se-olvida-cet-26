import { supabase } from "./supabaseClient";
import { toast } from "@/hooks/use-toast";

// Storage configuration
const STORAGE_CONFIG = {
  buckets: {
    public: {
      name: "public",
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"] as const,
      folders: {
        profilePictures: "profile-pictures",
        organizationLogos: "organization-logos",
        projectFiles: "project-files",
        interviews: "interviews"
      }
    }
  }
} as const;

type BucketName = keyof typeof STORAGE_CONFIG.buckets;
type FolderName = typeof STORAGE_CONFIG.buckets.public.folders[keyof typeof STORAGE_CONFIG.buckets.public.folders];
type AllowedFileType = typeof STORAGE_CONFIG.buckets.public.allowedTypes[number];

/**
 * Validates a file before upload
 */
function validateFile(file: File, bucketName: BucketName): void {
  const config = STORAGE_CONFIG.buckets[bucketName];
  
  if (file.size > config.maxFileSize) {
    throw new Error(`File size exceeds limit of ${config.maxFileSize / 1024 / 1024}MB`);
  }
  
  if (!config.allowedTypes.includes(file.type as AllowedFileType)) {
    throw new Error(`File type ${file.type} not allowed. Allowed types: ${config.allowedTypes.join(", ")}`);
  }
}

/**
 * Sube un archivo a un bucket de Supabase y devuelve la URL pública.
 * @param file      – El File (imagen, PDF, etc.) que quieras subir.
 * @param folder    – Carpeta dentro del bucket donde guardarlo.
 * @param onProgress? – Callback opcional que recibe un número [0..100] indicando el progreso aproximado.
 * @returns La URL pública (string) del archivo subido.
 */
export async function uploadFile(
  file: File,
  folder: FolderName,
  onProgress?: (percent: number) => void
): Promise<string> {
  const bucketName: BucketName = "public";
  
  try {
    // Validate file before upload
    validateFile(file, bucketName);
    
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "_");
    const filename = `${timestamp}_${safeName}`;

    let uploadResponse;
    try {
      uploadResponse = await supabase.storage
        .from(bucketName)
        .upload(filename, file, {
          cacheControl: "3600",
          upsert: false,
        });
    } catch (err: any) {
      toast({
        title: `Error subiendo archivo`,
        description: err.message || "Ocurrió un error en Supabase Storage.",
        variant: "destructive",
      });
      throw err;
    }

    if (uploadResponse.error) {
      toast({
        title: `Error subiendo archivo`,
        description: uploadResponse.error.message,
        variant: "destructive",
      });
      throw uploadResponse.error;
    }

    onProgress?.(100);

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
  } catch (error) {
    console.error("Error in uploadFile:", error);
    throw error;
  }
}

/**
 * Elimina un archivo dentro de un bucket de Supabase Storage.
 * @param filePath – La ruta completa dentro del bucket
 */
export async function deleteFile(filePath: string): Promise<void> {
  const bucketName: BucketName = "public";
  
  try {
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    if (error) {
      toast({
        title: "Error eliminando archivo",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteFile:", error);
    throw error;
  }
}

/**
 * Obtiene la URL pública de un archivo ya subido.
 * @param filePath – Ruta completa dentro del bucket
 * @returns La URL pública (string) o null si no existe.
 */
export function getPublicUrl(filePath: string): string | null {
  const bucketName: BucketName = "public";
  
  try {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    if (!data?.publicUrl) {
      console.error("No se pudo obtener la URL pública.");
      return null;
    }
    return data.publicUrl;
  } catch (error) {
    console.error("Error in getPublicUrl:", error);
    return null;
  }
}

// Export configuration for use in other files
export const storageConfig = STORAGE_CONFIG;

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