import { supabase } from '@/lib/supabase/supabaseClient';
import { BaseMigration, MigrationResult } from './baseMigration';
import { DataTransformer, OldUser, OldProject, OldCourse, OldOrganization } from './dataTransformer';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { ProyectosService } from '@/lib/supabase/services/proyectosService';
import { CursosService } from '@/lib/supabase/services/cursosService';
import { OrganizacionesService } from '@/lib/supabase/services/organizacionesService';
import { ServiceError } from '@/lib/supabase/services/baseService';
import { Persona } from '@/types/persona';
import { Proyecto } from '@/types/proyecto';
import { Curso } from '@/types/curso';
import { Organizacion } from '@/types/organizacion';

const personasService = new PersonasService(supabase);
const proyectosService = new ProyectosService(supabase);
const cursosService = new CursosService(supabase);
const organizacionesService = new OrganizacionesService(supabase);

export class DataMigration extends BaseMigration {
  private table: string;
  private transformer: (data: any) => any;

  constructor(table: string, transformer: (data: any) => any) {
    super();
    this.table = table;
    this.transformer = transformer;
  }

  async getSourceData(): Promise<any[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*');

    if (error) {
      throw new Error(`Error fetching data from ${this.table}: ${error.message}`);
    }

    return data || [];
  }

  async transformData(data: any): Promise<any> {
    return this.transformer(data);
  }

  validateData(data: any): boolean {
    return !!data.id;
  }

  async saveData(data: any): Promise<void> {
    let result;
    switch (this.table) {
      case 'users':
        result = await personasService.create(data as Partial<Persona>);
        break;
      case 'projects':
        result = await proyectosService.create(data as Partial<Proyecto>);
        break;
      case 'courses':
        result = await cursosService.create(data as Partial<Curso>);
        break;
      case 'organizations':
        result = await organizacionesService.create(data as Partial<Organizacion>);
        break;
      default:
        throw new Error(`Unknown table: ${this.table}`);
    }

    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}

// Run migrations
async function runMigrations() {
  const migrations = [
    {
      table: 'users',
      transformer: DataTransformer.transformOldUser,
    },
    {
      table: 'projects',
      transformer: DataTransformer.transformOldProject,
    },
    {
      table: 'courses',
      transformer: DataTransformer.transformOldCourse,
    },
    {
      table: 'organizations',
      transformer: DataTransformer.transformOldOrganization,
    },
  ];

  for (const migration of migrations) {
    console.log(`Starting migration for ${migration.table}...`);
    const migrator = new DataMigration(migration.table, migration.transformer);
    const result = await migrator.execute();
    
    if (result.success) {
      console.log(`Migration for ${migration.table} completed successfully`);
      console.log('Details:', result.details);
    } else {
      console.error(`Migration for ${migration.table} failed:`, result.error);
      process.exit(1);
    }
  }
}

// Run all migrations
runMigrations()
  .then(() => {
    console.log('All migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 