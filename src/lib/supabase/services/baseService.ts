import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ServiceResult, QueryOptions } from '@/lib/supabase/types/service';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { CacheableService, CacheableServiceConfig } from './cacheableService';

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

export interface CacheConfig {
  entityType: string;
  ttl: number;
  enableCache: boolean;
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
export abstract class BaseService<
  T extends { id: string },
  TableName extends keyof Database['public']['Tables']
> extends CacheableService<T> {
  protected readonly tableName: TableName;
  protected readonly supabase: SupabaseClient<Database>;
  protected readonly cacheConfig: CacheConfig;

  constructor(
    supabase: SupabaseClient<Database>,
    tableName: TableName,
    cacheConfig: CacheableServiceConfig
  ) {
    super(cacheConfig);
    this.tableName = tableName;
    this.supabase = supabase;
    this.cacheConfig = cacheConfig as CacheConfig;
  }

  protected abstract validateCreateInput(data: Partial<T>): ValidationError | null;

  protected handleError(error: any, context?: any): ValidationError {
    console.error('Service error:', error, context);
    return mapValidationError(
      error.message || 'An unexpected error occurred',
      'service',
      error
    );
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

      // Cache the new entity
      await this.setInCache(result.id, result);
      // Invalidate list cache
      await this.invalidateCache(result.id);

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

      // Update cache
      await this.setInCache(id, result as T);
      // Invalidate related caches
      await this.invalidateCache(id);

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
   * Deletes an entity from the database
   */
  public async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Invalidate caches
      await this.invalidateCache(id);

      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult<boolean>({
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
      // Try to get from cache first
      const cachedResult = await this.getFromCache(id);
      if (cachedResult.success && cachedResult.data) {
        return createSuccessResult(cachedResult.data);
      }

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!result) return createSuccessResult<T | null>(null);

      // Cache the result
      await this.setInCache(id, result as T);

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
      // Try to get from cache first if not bypassing cache
      if (!options?.bypassCache) {
        const cachedResult = await this.getListFromCache();
        if (cachedResult.success && cachedResult.data) {
          return createSuccessResult(cachedResult.data);
        }
      }

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

      // Cache the results if not bypassing cache
      if (!options?.bypassCache) {
        await this.setListInCache(results as T[]);
      }

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
      // Try to get from cache first
      const cachedResult = await this.getFromCache(id);
      if (cachedResult.success && cachedResult.data) {
        return createSuccessResult(true);
      }

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

  /**
   * Searches entities using text search
   */
  public async search(query: string, options?: QueryOptions): Promise<ServiceResult<T[] | null>> {
    try {
      // Try to get from cache first if not bypassing cache
      if (!options?.bypassCache) {
        const cachedResult = await this.getQueryFromCache(query);
        if (cachedResult.success && cachedResult.data) {
          return createSuccessResult(cachedResult.data);
        }
      }

      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .textSearch('search_vector', query);

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          searchQuery = searchQuery.eq(key, value);
        });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        searchQuery = searchQuery.range(from, to);
      }

      // Apply sorting
      if (options?.sortBy) {
        searchQuery = searchQuery.order(options.sortBy, { 
          ascending: options.sortOrder !== 'desc' 
        });
      }

      const { data: results, error } = await searchQuery;

      if (error) throw error;
      if (!results) return createSuccessResult<T[] | null>(null);

      // Cache the results if not bypassing cache
      if (!options?.bypassCache) {
        await this.setQueryInCache(query, results as T[]);
      }

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
   * Gets related entities through a junction table
   */
  protected async getRelatedEntities<R>(
    sourceId: string,
    sourceTable: string,
    targetTable: string,
    junctionTable: string,
    options?: QueryOptions
  ): Promise<ServiceResult<R[] | null>> {
    try {
      if (!sourceId) {
        return createErrorResult<R[] | null>({
          name: 'ServiceError',
          message: 'Source ID is required',
          code: 'VALIDATION_ERROR',
          details: { sourceId }
        });
      }

      let query = this.supabase
        .from(targetTable)
        .select(`
          id,
          ${this.getDefaultFields(targetTable)},
          ${junctionTable}!inner(${sourceTable}_id)
        `)
        .eq(`${junctionTable}.${sourceTable}_id`, sourceId);

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

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return createSuccessResult<R[] | null>(null);

      return createSuccessResult(data as unknown as R[]);
    } catch (error) {
      return createErrorResult<R[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Gets default fields for a table
   */
  protected getDefaultFields(table: string): string {
    const fieldMap: Record<string, string> = {
      personas: 'nombre, email, foto_url, biografia, categoria_principal',
      proyectos: 'titulo, descripcion, status, archivo_principal_url',
      noticias: 'titulo, contenido, tipo, imagen_url',
      temas: 'nombre, descripcion',
      organizaciones: 'nombre, descripcion, logo_url',
      entrevistas: 'titulo, descripcion, status, video_url'
    };

    return fieldMap[table] || '*';
  }

  /**
   * Gets all entities with pagination
   */
  protected async getAllWithPagination(options?: QueryOptions): Promise<ServiceResult<T[] | null>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select(this.getDefaultFields(this.tableName as string));

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

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return createSuccessResult<T[] | null>(null);

      if (
        !data ||
        (Array.isArray(data) && data.some((item) => "message" in item))
      ) {
        return createErrorResult<T[] | null>({
          name: 'ServiceError',
          message: 'Unexpected data format from Supabase',
          code: 'DB_ERROR',
          details: data
        });
      }

      return createSuccessResult(data as unknown as T[]);
    } catch (error) {
      return createErrorResult<T[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 