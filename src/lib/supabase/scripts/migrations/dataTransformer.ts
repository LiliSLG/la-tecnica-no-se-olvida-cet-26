import { ServiceResult, ServiceError } from '../../types/service';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: (value: any) => any;
}

export interface TransformationOptions {
  fieldMappings?: FieldMapping[];
  timestampFields?: string[];
  relationshipFields?: string[];
  requiredFields?: string[];
  defaultValues?: Record<string, any>;
}

export interface TransformationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    id: string;
    error: any;
  }>;
}

export class DataTransformer {
  private progress: TransformationProgress;
  private options: Required<TransformationOptions>;

  constructor(options: TransformationOptions = {}) {
    this.progress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
    this.options = {
      fieldMappings: options.fieldMappings || [],
      timestampFields: options.timestampFields || [],
      relationshipFields: options.relationshipFields || [],
      requiredFields: options.requiredFields || [],
      defaultValues: options.defaultValues || {}
    };
  }

  private logProgress(message: string): void {
    console.log(`[DataTransformer] ${message}`);
  }

  private logError(id: string, error: any): void {
    console.error(`[DataTransformer] Error transforming ${id}:`, error);
    this.progress.errors.push({ id, error });
  }

  private validateRequiredFields(data: any, id: string): void {
    for (const field of this.options.requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Required field '${field}' is missing in document ${id}`);
      }
    }
  }

  private transformTimestamp(value: any): string | null {
    if (!value) return null;
    
    // Handle Firestore Timestamp
    if (value.toDate) {
      return value.toDate().toISOString();
    }
    
    // Handle ISO string
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return value;
    }
    
    // Handle Unix timestamp
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    
    return null;
  }

  private transformField(value: any, field: string): any {
    // Handle timestamps
    if (this.options.timestampFields.includes(field)) {
      return this.transformTimestamp(value);
    }

    // Handle relationships
    if (this.options.relationshipFields.includes(field)) {
      return value?.id || value;
    }

    return value;
  }

  private applyFieldMappings(data: any): any {
    const result: any = {};

    // Apply field mappings
    for (const mapping of this.options.fieldMappings) {
      const value = data[mapping.sourceField];
      if (value !== undefined) {
        result[mapping.targetField] = mapping.transform 
          ? mapping.transform(value)
          : this.transformField(value, mapping.sourceField);
      }
    }

    // Copy unmapped fields
    for (const key in data) {
      if (!this.options.fieldMappings.some(m => m.sourceField === key)) {
        result[key] = this.transformField(data[key], key);
      }
    }

    return result;
  }

  private applyDefaultValues(data: any): any {
    const result = { ...data };
    for (const [field, value] of Object.entries(this.options.defaultValues)) {
      if (result[field] === undefined || result[field] === null) {
        result[field] = value;
      }
    }
    return result;
  }

  public transform(data: any[], idField: string = 'id'): ServiceResult<any[]> {
    try {
      this.logProgress(`Starting transformation of ${data.length} items`);
      this.progress.total = data.length;
      
      const transformedData = data.map(item => {
        try {
          // Validate required fields
          this.validateRequiredFields(item, item[idField]);

          // Apply transformations
          let transformed = this.applyFieldMappings(item);
          transformed = this.applyDefaultValues(transformed);

          this.progress.successful++;
          return transformed;
        } catch (error) {
          this.logError(item[idField], error);
          this.progress.failed++;
          throw error;
        } finally {
          this.progress.processed++;
        }
      });

      this.logProgress(`Successfully transformed ${this.progress.successful} items`);
      return {
        data: transformedData,
        error: null
      };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'TRANSFORMATION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during transformation',
        details: error
      };
      return {
        data: null,
        error: serviceError
      };
    }
  }

  public getProgress(): TransformationProgress {
    return { ...this.progress };
  }

  public resetProgress(): void {
    this.progress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }
} 