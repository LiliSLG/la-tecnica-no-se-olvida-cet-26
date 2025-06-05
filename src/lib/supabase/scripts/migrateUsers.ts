import { PersonasService } from '@/lib/supabase/services/personasService';
import { supabase } from '@/lib/supabase/supabaseClient';
import { ServiceError } from '@/lib/supabase/errors/types';
import { Persona } from '@/types/persona';

const personasService = new PersonasService(supabase);

async function migrateUsers() {
  try {
    console.log('Starting users migration...');
    
    // Get all users from the old table
    const { data: oldUsers, error: fetchError } = await supabase
      .from('users')
      .select('*');
    
    if (fetchError) {
      throw new Error(`Error fetching users: ${fetchError.message}`);
    }
    
    console.log(`Found ${oldUsers.length} users to migrate`);
    
    // Process each user
    for (const oldUser of oldUsers) {
      try {
        // Check if user already exists in the new table
        const { data: existingUser } = await personasService.getByEmail(oldUser.email);
        
        if (existingUser) {
          console.log(`User ${oldUser.email} already exists in new table, skipping...`);
          continue;
        }
        
        // Create user in the new table
        const persona: Partial<Persona> = {
          id: oldUser.id,
          email: oldUser.email,
          nombre: oldUser.first_name || '',
          apellido: oldUser.last_name || '',
          avatarUrl: oldUser.avatar_url,
          estado: 'activo',
          categoriaPrincipal: 'estudiante',
          activo: true,
          esAdmin: oldUser.is_admin || false,
          creadoEn: oldUser.created_at,
          actualizadoEn: oldUser.updated_at,
        };
        
        const result = await personasService.create(persona);
        
        if (result.error) {
          throw new Error(result.error.message);
        }
        
        console.log(`Successfully migrated user ${oldUser.email}`);
      } catch (error) {
        console.error(`Error processing user ${oldUser.email}:`, error);
      }
    }
    
    console.log('Users migration completed');
  } catch (error) {
    console.error('Error in users migration:', error);
    throw error;
  }
}

// Run the script
migrateUsers()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 