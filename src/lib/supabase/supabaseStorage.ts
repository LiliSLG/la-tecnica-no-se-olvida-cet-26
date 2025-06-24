// src/lib/supabase/supabaseStorage.ts - ACTUALIZADO
import { supabase } from "./client"; // ✅ Cambiar import
import { toast } from "@/hooks/use-toast";

// Storage configuration - ✅ EXPANDIDO
const STORAGE_CONFIG = {
  buckets: {
    public: {
      name: "public",
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
      ] as const,
      folders: {
        profilePictures: "profile-pictures",
        organizationLogos: "organization-logos",
        projectFiles: "project-files",
        interviews: "interviews",
      },
    },
    // ✅ AGREGAR BUCKET NOTICIAS
    noticias: {
      name: "noticias",
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ] as const,
      folders: {
        images: "images",
      },
    },
    // ✅ AGREGAR BUCKET PERSONAS (que ya tienes)
    personas: {
      name: "personas",
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
      folders: {
        profilePictures: "profile-pictures",
      },
    },
  },
} as const;

type BucketName = keyof typeof STORAGE_CONFIG.buckets;

// ✅ SIMPLIFICAR: Remover el tipo genérico complejo

/**
 * Validates a file before upload
 */
function validateFile<T extends BucketName>(file: File, bucketName: T): void {
  const config = STORAGE_CONFIG.buckets[bucketName];

  if (file.size > config.maxFileSize) {
    throw new Error(
      `File size exceeds limit of ${config.maxFileSize / 1024 / 1024}MB`
    );
  }

  // ✅ ARREGLO: Simplificar la validación de tipos
  const allowedTypes = config.allowedTypes as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(
        ", "
      )}`
    );
  }
}

/**
 * ✅ NUEVA FUNCIÓN: Sube archivo a cualquier bucket
 */
export async function uploadFileToAnyBucket<T extends BucketName>(
  file: File,
  bucketName: T,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  try {
    // Validate file before upload
    validateFile(file, bucketName);

    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const safeName = `${timestamp}.${extension}`;
    const fullPath = path ? `${path}/${safeName}` : safeName;

    onProgress?.(10);

    let uploadResponse;
    try {
      uploadResponse = await supabase.storage
        .from(bucketName)
        .upload(fullPath, file, {
          cacheControl: "3600",
          upsert: true, // ✅ Permitir sobrescribir
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

    onProgress?.(80);

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

    onProgress?.(100);
    return data.publicUrl;
  } catch (error) {
    console.error("Error in uploadFileToAnyBucket:", error);
    throw error;
  }
}

/**
 * Sube un archivo al bucket "public" (función original mantenida)
 */
export async function uploadFile(
  file: File,
  folder: keyof typeof STORAGE_CONFIG.buckets.public.folders,
  onProgress?: (percent: number) => void
): Promise<string> {
  return uploadFileToAnyBucket(
    file,
    "public",
    STORAGE_CONFIG.buckets.public.folders[folder],
    onProgress
  );
}

/**
 * Elimina un archivo de cualquier bucket
 */
export async function deleteFileFromBucket<T extends BucketName>(
  bucketName: T,
  filePath: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    if (error) {
      toast({
        title: "Error eliminando archivo",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteFileFromBucket:", error);
    throw error;
  }
}

/**
 * Elimina un archivo dentro del bucket "public" (función original)
 */
export async function deleteFile(filePath: string): Promise<void> {
  return deleteFileFromBucket("public", filePath);
}

/**
 * Obtiene la URL pública de un archivo de cualquier bucket
 */
export function getPublicUrlFromBucket<T extends BucketName>(
  bucketName: T,
  filePath: string
): string | null {
  try {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    if (!data?.publicUrl) {
      console.error("No se pudo obtener la URL pública.");
      return null;
    }
    return data.publicUrl;
  } catch (error) {
    console.error("Error in getPublicUrlFromBucket:", error);
    return null;
  }
}

/**
 * Obtiene la URL pública de un archivo del bucket "public" (función original)
 */
export function getPublicUrl(filePath: string): string | null {
  return getPublicUrlFromBucket("public", filePath);
}

// Export configuration for use in other files
export const storageConfig = STORAGE_CONFIG;
