import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ServiceResult, QueryOptions } from '@/lib/supabase/types/service';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';
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
  tableName: keyof Database['public']['Tables'];
}

export type EntityType =
  | 'persona'
  | 'organizacion'
  | 'tema'
  | 'proyecto'
  | 'entrevista'
  | 'noticia'
  | 'curso'
  | 'historia_oral'
  | 'oferta_laboral';

/**
 * Base service class that provides common functionality for all services
 * @template T The type of the entity
 * @template TableName The name of the table in the database
 */
export abstract class BaseService<T extends { id: string }> {
  protected readonly supabase: SupabaseClient;
  protected readonly tableName: keyof Database['public']['Tables'];

  constructor(supabase: SupabaseClient, config: BaseServiceConfig) {
    this.supabase = supabase;
    this.tableName = config.tableName;
  }

  /**
   * Creates a new entity in the database
   */
  public async create(data: Omit<T, 'id'>): Promise<ServiceResult<T | null>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!result) return createSuccessResult<T | null>(null);

      return createSuccessResult(result as T);
    } catch (error) {
      return createErrorResult<T | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Updates an existing entity in the database
   */
  public async update(id: string, data: Partial<T>): Promise<ServiceResult<T | null>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!result) return createSuccessResult<T | null>(null);

      return createSuccessResult(result as T);
    } catch (error) {
      return createErrorResult<T | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Retrieves an entity by its ID
   */
  public async getById(id: string): Promise<ServiceResult<T | null>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!result) return createSuccessResult<T | null>(null);

      return createSuccessResult(result as T);
    } catch (error) {
      return createErrorResult<T | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Retrieves all entities with optional filtering and pagination
   */
  public async getAll(options?: QueryOptions): Promise<ServiceResult<T[] | null>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select();

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      // Apply sorting
      if (options?.sortBy) {
        query = query.order(options.sortBy, { 
          ascending: options.sortOrder !== 'desc' 
        });
      }

      const { data: results, error } = await query;

      if (error) throw error;
      if (!results) return createSuccessResult<T[] | null>(null);

      return createSuccessResult(results as T[]);
    } catch (error) {
      return createErrorResult<T[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Checks if an entity exists by its ID
   */
  public async exists(id: string): Promise<ServiceResult<boolean>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('id', id)
        .single();

      if (error) throw error;
      return createSuccessResult(!!data);
    } catch (error) {
      return createErrorResult<boolean>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  protected abstract validateCreateInput(data: Partial<T>): ValidationError | null;
  protected abstract validateUpdateInput(data: Partial<T>): ValidationError | null;
} 