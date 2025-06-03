import { storageConfig } from './supabaseStorage';
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

// Types
interface MigrationProgress {
  totalFiles: number;
  processedFiles: number;
  successfulMigrations: number;
  failedMigrations: number;
  currentFile?: string;
}

interface MigrationResult {
  success: boolean;
  originalPath: string;
  newPath: string;
  error?: string;
}

type MigrationCallback = (progress: MigrationProgress) => void;

// Firebase to Supabase path mapping
const PATH_MAPPING = {
  'profile-pictures': storageConfig.buckets.public.folders.profilePictures,
  'organization-logos': storageConfig.buckets.public.folders.organizationLogos,
  'project-files': storageConfig.buckets.public.folders.projectFiles,
  'interviews': storageConfig.buckets.public.folders.interviews,
} as const;

/**
 * Migrates a single file from Firebase Storage to Supabase Storage
 */
async function migrateFile(
  firebaseUrl: string,
  targetFolder: keyof typeof PATH_MAPPING
): Promise<MigrationResult> {
  try {
    // Download file from Firebase
    const response = await fetch(firebaseUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file from Firebase: ${response.statusText}`);
    }

    const blob = await response.blob();
    const file = new File([blob], firebaseUrl.split('/').pop() || 'migrated-file', {
      type: blob.type,
    });

    // Upload to Supabase
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, '_');
    const newPath = `${PATH_MAPPING[targetFolder]}/${timestamp}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(newPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
    }

    return {
      success: true,
      originalPath: firebaseUrl,
      newPath,
    };
  } catch (error) {
    console.error('Error migrating file:', error);
    return {
      success: false,
      originalPath: firebaseUrl,
      newPath: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Migrates multiple files from Firebase Storage to Supabase Storage
 */
export async function migrateFiles(
  firebaseUrls: string[],
  targetFolder: keyof typeof PATH_MAPPING,
  onProgress?: MigrationCallback
): Promise<MigrationResult[]> {
  const progress: MigrationProgress = {
    totalFiles: firebaseUrls.length,
    processedFiles: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
  };

  const results: MigrationResult[] = [];

  for (const url of firebaseUrls) {
    progress.currentFile = url;
    onProgress?.(progress);

    const result = await migrateFile(url, targetFolder);
    results.push(result);

    progress.processedFiles++;
    if (result.success) {
      progress.successfulMigrations++;
    } else {
      progress.failedMigrations++;
    }

    onProgress?.(progress);
  }

  return results;
}

/**
 * Verifies the migration of files by checking their existence in Supabase
 */
export async function verifyMigration(
  results: MigrationResult[]
): Promise<{ verified: MigrationResult[]; failed: MigrationResult[] }> {
  const verified: MigrationResult[] = [];
  const failed: MigrationResult[] = [];

  for (const result of results) {
    if (!result.success) {
      failed.push(result);
      continue;
    }

    try {
      const { data } = await supabase.storage
        .from('public')
        .getPublicUrl(result.newPath);

      if (!data?.publicUrl) {
        failed.push({
          ...result,
          error: 'Failed to verify file existence',
        });
      } else {
        verified.push(result);
      }
    } catch (error) {
      failed.push({
        ...result,
        error: error instanceof Error ? error.message : 'Unknown error during verification',
      });
    }
  }

  return { verified, failed };
}

/**
 * Rolls back a failed migration by removing migrated files from Supabase
 */
export async function rollbackMigration(
  results: MigrationResult[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const pathsToDelete = results
      .filter(result => result.success)
      .map(result => result.newPath);

    if (pathsToDelete.length === 0) {
      return { success: true };
    }

    const { error } = await supabase.storage
      .from('public')
      .remove(pathsToDelete);

    if (error) {
      throw new Error(`Failed to rollback migration: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error rolling back migration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during rollback',
    };
  }
} 