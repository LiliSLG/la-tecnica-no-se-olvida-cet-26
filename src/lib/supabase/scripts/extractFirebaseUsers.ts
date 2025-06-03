import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { handleUserMigration } from './migrateUsers';

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

/**
 * Extracts user data from Firebase for migration to Supabase
 */
export async function extractFirebaseUsers(): Promise<void> {
  try {
    const auth = getAuth();
    const db = getFirestore();

    // Get all users from Firebase Auth
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;

    // Get additional user data from Firestore if needed
    const userProfiles = await db.collection('users').get();

    // Map Firebase users to migration format
    const firebaseUsers = users.map((user: FirebaseUser) => ({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName,
      photoURL: user.photoURL,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    }));

    // Start migration process
    await handleUserMigration(firebaseUsers);
  } catch (error) {
    console.error('Error extracting Firebase users:', error);
    throw error;
  }
}

// Export a function to run the extraction and migration
export async function runUserMigration(): Promise<void> {
  try {
    console.log('Starting user data extraction from Firebase...');
    await extractFirebaseUsers();
    console.log('User data extraction and migration completed.');
  } catch (error) {
    console.error('User migration failed:', error);
    throw error;
  }
} 