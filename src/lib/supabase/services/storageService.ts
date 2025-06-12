import { Database } from "../types/database.types";
import { ServiceResult } from "../types/serviceResult";
import {
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { supabase } from "../client";
import { storageConfig } from "../supabaseStorage";

export class StorageService {
  private readonly bucketName: string;
  private readonly maxFileSize: number;
  private readonly allowedTypes: readonly string[];

  constructor(bucketName: keyof typeof storageConfig.buckets = "public") {
    const bucketConfig = storageConfig.buckets[bucketName];
    this.bucketName = bucketConfig.name;
    this.maxFileSize = bucketConfig.maxFileSize;
    this.allowedTypes = bucketConfig.allowedTypes;
  }

  private validateFile(file: File): string | null {
    if (file.size > this.maxFileSize) {
      return `File size exceeds maximum allowed size of ${
        this.maxFileSize / (1024 * 1024)
      }MB`;
    }
    if (!this.allowedTypes.includes(file.type)) {
      return `File type ${
        file.type
      } is not allowed. Allowed types: ${this.allowedTypes.join(", ")}`;
    }
    return null;
  }

  async uploadFile(
    file: File,
    path: string
  ): Promise<ServiceResult<{ path: string; url: string } | null>> {
    try {
      // Validate file
      const validationError = this.validateFile(file);
      if (validationError) {
        return createError({
          name: "ValidationError",
          message: validationError,
          code: "VALIDATION_ERROR",
        });
      }

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        return createError({
          name: "StorageError",
          message: error.message,
          code: "STORAGE_ERROR",
          details: error,
        });
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(this.bucketName).getPublicUrl(data.path);

      return createSuccess({
        path: data.path,
        url: publicUrl,
      });
    } catch (error) {
      return createError({
        name: "StorageError",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "STORAGE_ERROR",
        details: error,
      });
    }
  }

  async deleteFile(path: string): Promise<ServiceResult<null>> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        return createError({
          name: "StorageError",
          message: error.message,
          code: "STORAGE_ERROR",
          details: error,
        });
      }

      return createSuccess(null);
    } catch (error) {
      return createError({
        name: "StorageError",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "STORAGE_ERROR",
        details: error,
      });
    }
  }
}

export const storageService = new StorageService();
export default storageService;
