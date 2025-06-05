import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { supabase } from '@/lib/supabase/supabaseClient';
import { ServiceError } from '@/lib/supabase/errors/types';
import { Persona } from '@/types/persona';

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

async function extractFirebaseUsers() {
  try {
    console.log('Starting Firebase users extraction...');
    
    // Get all users from Firebase
    const listUsersResult = await auth.listUsers();
    const firebaseUsers = listUsersResult.users;
    
    console.log(`Found ${firebaseUsers.length} users in Firebase`);
    
    // Process each user
    for (const user of firebaseUsers) {
      try {
        // Check if user already exists in Supabase
        const { data: existingUser } = await personasService.getByEmail(user.email || '');
        
        if (existingUser) {
          console.log(`User ${user.email} already exists in Supabase, skipping...`);
          continue;
        }
        
        // Create user in Supabase
        const persona: Partial<Persona> = {
          id: user.uid,
          email: user.email || '',
          nombre: user.displayName?.split(' ')[0] || '',
          apellido: user.displayName?.split(' ').slice(1).join(' ') || '',
          avatarUrl: user.photoURL,
          estado: 'activo',
          categoriaPrincipal: 'estudiante',
          activo: true,
          esAdmin: false,
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        };
        
        const result = await personasService.create(persona);
        
        if (result.error) {
          throw new Error(result.error.message);
        }
        
        console.log(`Successfully migrated user ${user.email}`);
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }
    }
    
    console.log('Firebase users extraction completed');
  } catch (error) {
    console.error('Error in Firebase users extraction:', error);
    throw error;
  }
}

// Run the script
extractFirebaseUsers()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 