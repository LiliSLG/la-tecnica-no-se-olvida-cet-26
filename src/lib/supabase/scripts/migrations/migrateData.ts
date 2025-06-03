import { Firestore } from 'firebase-admin/firestore';
import { SupabaseClient } from '@supabase/supabase-js';
import { FirebaseExtractor } from './firebaseExtractor';
import { DataTransformer } from './dataTransformer';
import { personaTransformationConfig } from './configs/personaTransformer';
import { organizacionTransformationConfig } from './configs/organizacionTransformer';
import { temaTransformationConfig } from './configs/temaTransformer';
import { proyectoTransformationConfig } from './configs/proyectoTransformer';
import { entrevistaTransformationConfig } from './configs/entrevistaTransformer';
import { noticiaTransformationConfig } from './configs/noticiaTransformer';
import { ServiceResult, ServiceError } from '../../types/service';

interface MigrationConfig {
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
  dryRun?: boolean;
}

interface MigrationProgress {
  total: number;
  completed: number;
  failed: number;
  currentEntity: string;
  errors: Array<{
    entity: string;
    error: any;
  }>;
}

export class DataMigration {
  private firestore: Firestore;
  private supabase: SupabaseClient;
  private extractor: FirebaseExtractor;
  private transformer: DataTransformer | null = null;
  private config: Required<MigrationConfig>;
  private progress: MigrationProgress;

  constructor(
    firestore: Firestore,
    supabase: SupabaseClient,
    config: MigrationConfig = {}
  ) {
    this.firestore = firestore;
    this.supabase = supabase;
    this.config = {
      batchSize: config.batchSize ?? 100,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      dryRun: config.dryRun ?? false
    };
    this.extractor = new FirebaseExtractor(firestore, {
      batchSize: this.config.batchSize,
      maxRetries: this.config.maxRetries,
      retryDelay: this.config.retryDelay
    });
    this.progress = {
      total: 0,
      completed: 0,
      failed: 0,
      currentEntity: '',
      errors: []
    };
  }

  private logProgress(message: string): void {
    console.log(`[DataMigration] ${message}`);
  }

  private logError(entity: string, error: any): void {
    console.error(`[DataMigration] Error migrating ${entity}:`, error);
    this.progress.errors.push({ entity, error });
  }

  private async migrateEntity<T>(
    collectionPath: string,
    config: any,
    entityName: string
  ): Promise<ServiceResult<T[]>> {
    try {
      this.progress.currentEntity = entityName;
      this.logProgress(`Starting migration of ${entityName}`);

      // Extract data from Firebase
      const extractionResult = await this.extractor.extractCollection(collectionPath);
      if (extractionResult.error || !extractionResult.data) {
        throw extractionResult.error || new Error('No data extracted');
      }

      // Transform data
      this.transformer = new DataTransformer(config);
      const transformationResult = await this.transformer.transform(extractionResult.data);
      if (transformationResult.error || !transformationResult.data) {
        throw transformationResult.error || new Error('No data transformed');
      }

      // Insert data into Supabase (if not dry run)
      if (!this.config.dryRun) {
        const { data, error } = await this.supabase
          .from(entityName.toLowerCase())
          .upsert(transformationResult.data, { onConflict: 'id' });

        if (error) {
          throw error;
        }

        this.progress.completed += transformationResult.data.length;
        this.logProgress(`Successfully migrated ${transformationResult.data.length} ${entityName}`);
        return { data, error: null };
      }

      this.progress.completed += transformationResult.data.length;
      this.logProgress(`[DRY RUN] Would migrate ${transformationResult.data.length} ${entityName}`);
      return { data: transformationResult.data, error: null };
    } catch (error) {
      this.logError(entityName, error);
      this.progress.failed++;
      const serviceError: ServiceError = {
        code: 'MIGRATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during migration',
        details: error
      };
      return { data: null, error: serviceError };
    }
  }

  private async migrateRelationships(
    collectionPath: string,
    sourceField: string,
    targetField: string,
    junctionTable: string,
    entityName: string
  ): Promise<ServiceResult<any[]>> {
    try {
      this.logProgress(`Starting migration of ${entityName} relationships`);

      const extractionResult = await this.extractor.extractRelationships(
        collectionPath,
        [sourceField],
        [targetField]
      );
      if (extractionResult.error || !extractionResult.data) {
        throw extractionResult.error || new Error('No relationship data extracted');
      }

      const relationshipData = extractionResult.data;

      if (!this.config.dryRun) {
        const { data, error } = await this.supabase
          .from(junctionTable)
          .upsert(relationshipData, { onConflict: `${sourceField},${targetField}` });

        if (error) {
          throw error;
        }

        this.logProgress(`Successfully migrated ${relationshipData.length} ${entityName} relationships`);
        return { data, error: null };
      }

      this.logProgress(`[DRY RUN] Would migrate ${relationshipData.length} ${entityName} relationships`);
      return { data: relationshipData, error: null };
    } catch (error) {
      this.logError(`${entityName} relationships`, error);
      const serviceError: ServiceError = {
        code: 'MIGRATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during relationship migration',
        details: error
      };
      return { data: null, error: serviceError };
    }
  }

  public async migrate(): Promise<ServiceResult<void>> {
    try {
      this.logProgress('Starting data migration');
      this.progress.total = 6; // Number of entities to migrate

      // Migrate entities in order
      await this.migrateEntity('personas', personaTransformationConfig, 'Personas');
      await this.migrateEntity('organizaciones', organizacionTransformationConfig, 'Organizaciones');
      await this.migrateEntity('temas', temaTransformationConfig, 'Temas');
      await this.migrateEntity('proyectos', proyectoTransformationConfig, 'Proyectos');
      await this.migrateEntity('entrevistas', entrevistaTransformationConfig, 'Entrevistas');
      await this.migrateEntity('noticias', noticiaTransformationConfig, 'Noticias');

      // Migrate relationships
      await this.migrateRelationships('persona_tema', 'persona_id', 'tema_id', 'persona_tema', 'Persona-Tema');
      await this.migrateRelationships('organizacion_tema', 'organizacion_id', 'tema_id', 'organizacion_tema', 'Organizacion-Tema');
      await this.migrateRelationships('proyecto_tema', 'proyecto_id', 'tema_id', 'proyecto_tema', 'Proyecto-Tema');
      await this.migrateRelationships('entrevista_tema', 'entrevista_id', 'tema_id', 'entrevista_tema', 'Entrevista-Tema');
      await this.migrateRelationships('noticia_tema', 'noticia_id', 'tema_id', 'noticia_tema', 'Noticia-Tema');
      await this.migrateRelationships('proyecto_persona_rol', 'proyecto_id', 'persona_id', 'proyecto_persona_rol', 'Proyecto-Persona-Rol');
      await this.migrateRelationships('proyecto_organizacion_rol', 'proyecto_id', 'organizacion_id', 'proyecto_organizacion_rol', 'Proyecto-Organizacion-Rol');
      await this.migrateRelationships('entrevista_persona_rol', 'entrevista_id', 'persona_id', 'entrevista_persona_rol', 'Entrevista-Persona-Rol');
      await this.migrateRelationships('entrevista_organizacion_rol', 'entrevista_id', 'organizacion_id', 'entrevista_organizacion_rol', 'Entrevista-Organizacion-Rol');

      this.logProgress('Data migration completed');
      return { data: undefined, error: null };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'MIGRATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during migration',
        details: error
      };
      return { data: null, error: serviceError };
    }
  }

  public getProgress(): MigrationProgress {
    return { ...this.progress };
  }

  public resetProgress(): void {
    this.progress = {
      total: 0,
      completed: 0,
      failed: 0,
      currentEntity: '',
      errors: []
    };
  }
} 