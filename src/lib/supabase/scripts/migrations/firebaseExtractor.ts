import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { BaseMigration, MigrationResult } from './baseMigration';
import { DataTransformer, FirebaseUser } from './dataTransformer';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { ServiceError } from '@/lib/supabase/services/baseService';
import { Persona } from '@/types/persona';
import { supabase } from '@/lib/supabase/supabaseClient';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();
const personasService = new PersonasService(supabase);

export class FirebaseExtractor extends BaseMigration {
  async getSourceData(): Promise<FirebaseUser[]> {
    const listUsersResult = await auth.listUsers();
    return listUsersResult.users;
  }

  async transformData(user: FirebaseUser): Promise<Partial<Persona>> {
    return DataTransformer.transformFirebaseUser(user);
  }

  validateData(user: FirebaseUser): boolean {
    return !!user.email;
  }

  async saveData(persona: Partial<Persona>): Promise<void> {
    const result = await personasService.create(persona);
    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}

// Run the migration
const extractor = new FirebaseExtractor();
extractor.execute()
  .then((result: MigrationResult) => {
    if (result.success) {
      console.log('Migration completed successfully');
      console.log('Details:', result.details);
    } else {
      console.error('Migration failed:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 