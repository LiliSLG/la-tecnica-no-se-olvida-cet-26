import { supabase } from '@/lib/supabase/supabaseClient';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';
import { ServiceResult } from '../types/service';

export class StorageService {
  private readonly bucketName: string;

  constructor(bucketName: string = 'personas') {
    this.bucketName = bucketName;
  }

  async uploadFile(
    file: File,
    path: string
  ): Promise<ServiceResult<{ path: string; url: string } | null>> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        return createError({
          name: 'StorageError',
          message: error.message,
          code: 'STORAGE_ERROR',
          details: error,
        });
      }

      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path);

      return createSuccess({
        path: data.path,
        url: publicUrl,
      });
    } catch (error) {
      return createError({
        name: 'StorageError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'STORAGE_ERROR',
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
          name: 'StorageError',
          message: error.message,
          code: 'STORAGE_ERROR',
          details: error,
        });
      }

      return createSuccess(null);
    } catch (error) {
      return createError({
        name: 'StorageError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'STORAGE_ERROR',
        details: error,
      });
    }
  }
}

export const storageService = new StorageService();
export default storageService; 