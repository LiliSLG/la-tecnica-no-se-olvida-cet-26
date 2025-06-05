import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ServiceResult, QueryOptions } from '@/lib/supabase/types/service';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/service';
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

  protected createSuccessResult<T>(data: T): ServiceResult<T> {
    return createSuccessResult(data);
  }

  protected createErrorResult<T>(error: any): ServiceResult<T> {
    return createErrorResult({
      name: 'ServiceError',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'DB_ERROR',
      details: error
    });
  }

  public async create(data: Omit<T, 'id'>): Promise<ServiceResult<T | null>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!result) return createSuccessResult(null);

      // Cache the new entity
      await this.setInCache(result.id, result);
      // Invalidate list cache
      await this.invalidateCache(result.id);

      return createSuccessResult(result as T);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  public async update(id: string, data: Partial<T>): Promise<ServiceResult<T | null>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!result) return createSuccessResult(null);

      // Update cache
      await this.setInCache(id, result as T);
      // Invalidate related caches
      await this.invalidateCache(id);

      return createSuccessResult(result as T);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

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
      return this.createErrorResult(error);
    }
  }

  public async getById(id: string): Promise<ServiceResult<T | null>> {
    try {
      // Try to get from cache first
      const cached = await this.getFromCache(id);
      if (cached) return createSuccessResult(cached);

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!result) return createSuccessResult(null);

      // Cache the result
      await this.setInCache(id, result as T);

      return createSuccessResult(result as T);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  public async getAll(): Promise<ServiceResult<T[] | null>> {
    try {
      // Try to get from cache first
      const cached = await this.getListFromCache();
      if (cached) return createSuccessResult(cached);

      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select();

      if (error) throw error;
      if (!results) return createSuccessResult(null);

      // Cache the results
      await this.setListInCache(results as T[]);

      return createSuccessResult(results as T[]);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  public async exists(id: string): Promise<ServiceResult<boolean>> {
    try {
      // Try to get from cache first
      const cached = await this.getFromCache(id);
      if (cached) return createSuccessResult(true);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('id', id)
        .single();

      if (error) throw error;
      return createSuccessResult(!!data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  public async query(query: string): Promise<ServiceResult<T[] | null>> {
    try {
      // Try to get from cache first
      const cached = await this.getQueryFromCache(query);
      if (cached) return createSuccessResult(cached);

      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select()
        .textSearch('search_vector', query);

      if (error) throw error;
      if (!results) return createSuccessResult(null);

      // Cache the results
      await this.setQueryInCache(query, results as T[]);

      return createSuccessResult(results as T[]);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  protected async getRelatedEntities<R>(
    sourceId: string,
    sourceTable: string,
    targetTable: string,
    junctionTable: string,
    options?: QueryOptions
  ): Promise<ServiceResult<R[] | null>> {
    try {
      if (!sourceId) {
        return this.createErrorResult({
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
      if (!data) return createSuccessResult(null);

      // Cast the data to R[] since we know the structure matches
      return createSuccessResult(data as unknown as R[]);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

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
      if (!data) return createSuccessResult(null);

      if (
        !data ||
        (Array.isArray(data) && data.some((item) => "message" in item))
      ) {
        return createErrorResult(
          new Error("Unexpected data format from Supabase")
        );
      }

      return createSuccessResult(data as unknown as T[]);

      
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }
} 