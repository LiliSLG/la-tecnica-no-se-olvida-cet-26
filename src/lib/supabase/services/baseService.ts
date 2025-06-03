import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

export interface WithTimestamps {
  created_at: string;
  updated_at: string;
}

export interface BaseEntity extends WithTimestamps {
  id: string;
}

export interface BaseServiceConfig {
  tableName: string;
  supabase: SupabaseClient<Database>;
}

export abstract class BaseService<
  T extends BaseEntity | Record<string, any>,
  CreateInput extends Partial<T>,
  UpdateInput extends Partial<T>
> {
  protected tableName: string;
  protected supabase: SupabaseClient<Database>;

  constructor(config: BaseServiceConfig) {
    this.tableName = config.tableName;
    this.supabase = config.supabase;
  }

  protected abstract validateCreateInput(data: CreateInput): ValidationError | null;

  protected createSuccessResult<T>(data: T): ServiceResult<T> {
    return { data, error: null };
  }

  protected createErrorResult(error: ValidationError): ServiceResult<null> {
    return { data: null, error };
  }

  protected handleError(error: any, context?: any): ValidationError {
    console.error('Service error:', error, context);
    return mapValidationError(
      error.message || 'An unexpected error occurred',
      'service',
      error
    );
  }

  async exists(id: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('id', id)
        .single();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking existence:', error);
      return false;
    }
  }

  async create(data: CreateInput): Promise<ServiceResult<T | null>> {
    try {
      const validationError = this.validateCreateInput(data);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return this.createSuccessResult(result as T);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'create', data }));
    }
  }

  async update(id: string, data: UpdateInput): Promise<ServiceResult<T | null>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.createSuccessResult(result as T);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'update', id, data }));
    }
  }

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'delete', id }));
    }
  }

  async getById(id: string): Promise<ServiceResult<T | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as T);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById', id }));
    }
  }

  async getAll(): Promise<ServiceResult<T[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select();

      if (error) throw error;
      return this.createSuccessResult(data as T[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getAll' }));
    }
  }
} 