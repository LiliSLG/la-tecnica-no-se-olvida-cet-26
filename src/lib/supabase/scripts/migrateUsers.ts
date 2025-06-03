import { supabase } from '../supabaseClient';
import { AuthUser } from '../auth';
import { toast } from '@/hooks/use-toast';

interface MigrationProgress {
  totalUsers: number;
  processedUsers: number;
  successfulMigrations: number;
  failedMigrations: number;
  currentUser?: string;
}

interface MigrationResult {
  success: boolean;
  originalUid: string;
  newUid: string;
  error?: string;
}

type MigrationCallback = (progress: MigrationProgress) => void;

/**
 * Migrates a single user from Firebase to Supabase
 */
async function migrateUser(
  firebaseUser: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  }
): Promise<MigrationResult> {
  try {
    // Check if user already exists in Supabase
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', firebaseUser.email)
      .single();

    if (existingUser) {
      return {
        success: true,
        originalUid: firebaseUser.uid,
        newUid: existingUser.id,
      };
    }

    // Create user in Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email: firebaseUser.email,
      email_confirm: true, // Since they were already verified in Firebase
      user_metadata: {
        full_name: firebaseUser.displayName,
        avatar_url: firebaseUser.photoURL,
        migrated_from: 'firebase',
        original_uid: firebaseUser.uid,
        created_at: firebaseUser.metadata.creationTime,
        last_sign_in: firebaseUser.metadata.lastSignInTime,
      },
    });

    if (error) throw error;

    return {
      success: true,
      originalUid: firebaseUser.uid,
      newUid: data.user.id,
    };
  } catch (error) {
    console.error('Error migrating user:', error);
    return {
      success: false,
      originalUid: firebaseUser.uid,
      newUid: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Migrates multiple users from Firebase to Supabase
 */
export async function migrateUsers(
  firebaseUsers: Array<{
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  }>,
  onProgress?: MigrationCallback
): Promise<MigrationResult[]> {
  const progress: MigrationProgress = {
    totalUsers: firebaseUsers.length,
    processedUsers: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
  };

  const results: MigrationResult[] = [];

  for (const user of firebaseUsers) {
    progress.currentUser = user.email;
    onProgress?.(progress);

    const result = await migrateUser(user);
    results.push(result);

    progress.processedUsers++;
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
 * Verifies the migration of users by checking their existence in Supabase
 */
export async function verifyUserMigration(
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
      const { data, error } = await supabase
        .from('auth.users')
        .select('id')
        .eq('id', result.newUid)
        .single();

      if (error || !data) {
        failed.push({
          ...result,
          error: error?.message || 'Failed to verify user existence',
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
 * Updates user metadata in Supabase after migration
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, any>
): Promise<boolean> {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return false;
  }
}

/**
 * Handles the migration process with progress tracking and verification
 */
export async function handleUserMigration(
  firebaseUsers: Array<{
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    metadata: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  }>
): Promise<void> {
  try {
    // Start migration
    const results = await migrateUsers(firebaseUsers, (progress) => {
      console.log(`Progress: ${progress.processedUsers}/${progress.totalUsers}`);
      console.log(`Success: ${progress.successfulMigrations}, Failed: ${progress.failedMigrations}`);
    });

    // Verify migration
    const { verified, failed } = await verifyUserMigration(results);

    // Log results
    console.log('Migration Results:');
    console.log(`Total: ${results.length}`);
    console.log(`Verified: ${verified.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length > 0) {
      console.error('Failed migrations:', failed);
      toast({
        title: 'Migration Warnings',
        description: `${failed.length} users failed to migrate. Check console for details.`,
        variant: 'destructive',
      });
    }

    toast({
      title: 'Migration Complete',
      description: `Successfully migrated ${verified.length} users.`,
    });
  } catch (error) {
    console.error('Migration error:', error);
    toast({
      title: 'Migration Error',
      description: 'An error occurred during user migration.',
      variant: 'destructive',
    });
  }
} 