import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { ServiceResult, ServiceError } from '../../types/service';

export interface MigrationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    id: string;
    error: any;
  }>;
}

export interface MigrationOptions {
  batchSize?: number;
  dryRun?: boolean;
  continueOnError?: boolean;
}

export abstract class BaseMigration {
  protected supabase: SupabaseClient<Database>;
  protected progress: MigrationProgress;
  protected options: Required<MigrationOptions>;

  constructor(
    supabase: SupabaseClient<Database>,
    options: MigrationOptions = {}
  ) {
    this.supabase = supabase;
    this.progress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
    this.options = {
      batchSize: options.batchSize || 100,
      dryRun: options.dryRun || false,
      continueOnError: options.continueOnError || false
    };
  }

  protected abstract extractData(): Promise<any[]>;
  protected abstract transformData(data: any[]): Promise<any[]>;
  protected abstract loadData(data: any[]): Promise<void>;

  protected logProgress(message: string): void {
    console.log(`[${this.constructor.name}] ${message}`);
  }

  protected logError(id: string, error: any): void {
    console.error(`[${this.constructor.name}] Error processing ${id}:`, error);
    this.progress.errors.push({ id, error });
  }

  protected async processBatch(items: any[]): Promise<void> {
    for (const item of items) {
      try {
        if (!this.options.dryRun) {
          await this.loadData([item]);
        }
        this.progress.successful++;
      } catch (error) {
        this.logError(item.id, error);
        this.progress.failed++;
        if (!this.options.continueOnError) {
          throw error;
        }
      }
      this.progress.processed++;
      this.logProgress(`Progress: ${this.progress.processed}/${this.progress.total}`);
    }
  }

  public async execute(): Promise<ServiceResult<MigrationProgress>> {
    try {
      this.logProgress('Starting migration...');
      
      // Extract data
      const data = await this.extractData();
      this.progress.total = data.length;
      this.logProgress(`Extracted ${data.length} items`);

      // Transform data
      const transformedData = await this.transformData(data);
      this.logProgress('Data transformation completed');

      // Process in batches
      for (let i = 0; i < transformedData.length; i += this.options.batchSize) {
        const batch = transformedData.slice(i, i + this.options.batchSize);
        await this.processBatch(batch);
      }

      this.logProgress('Migration completed');
      return {
        data: this.progress,
        error: null
      };
    } catch (error) {
      this.logProgress('Migration failed');
      const serviceError: ServiceError = {
        code: 'MIGRATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during migration',
        details: error
      };
      return {
        data: null,
        error: serviceError
      };
    }
  }

  public getProgress(): MigrationProgress {
    return { ...this.progress };
  }
} 