import { supabase } from '@/lib/supabase/supabaseClient';
import { ServiceError } from '@/lib/supabase/services/baseService';

export interface MigrationResult {
  success: boolean;
  error?: string;
  details?: {
    processed: number;
    succeeded: number;
    failed: number;
    skipped: number;
  };
}

export abstract class BaseMigration {
  protected supabase = supabase;
  protected processed = 0;
  protected succeeded = 0;
  protected failed = 0;
  protected skipped = 0;
  protected errors: string[] = [];

  abstract getSourceData(): Promise<any[]>;
  abstract transformData(data: any): Promise<any>;
  abstract validateData(data: any): boolean;
  abstract saveData(data: any): Promise<void>;

  async execute(): Promise<MigrationResult> {
    try {
      console.log('Starting migration...');
      
      const sourceData = await this.getSourceData();
      console.log(`Found ${sourceData.length} records to process`);
      
      for (const item of sourceData) {
        this.processed++;
        
        try {
          if (!this.validateData(item)) {
            console.log(`Skipping invalid data:`, item);
            this.skipped++;
            continue;
          }
          
          const transformedData = await this.transformData(item);
          await this.saveData(transformedData);
          this.succeeded++;
          
          if (this.processed % 100 === 0) {
            console.log(`Processed ${this.processed} records...`);
          }
        } catch (error) {
          this.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.errors.push(`Error processing record: ${errorMessage}`);
          console.error(`Error processing record:`, error);
        }
      }
      
      console.log('Migration completed');
      console.log('Summary:', {
        processed: this.processed,
        succeeded: this.succeeded,
        failed: this.failed,
        skipped: this.skipped,
      });
      
      if (this.errors.length > 0) {
        console.log('Errors encountered:', this.errors);
      }
      
      return {
        success: this.failed === 0,
        error: this.errors.length > 0 ? this.errors.join('\n') : undefined,
        details: {
          processed: this.processed,
          succeeded: this.succeeded,
          failed: this.failed,
          skipped: this.skipped,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Migration failed:', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
} 