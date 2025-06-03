import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import {
  BaseServiceConfig,
  IBaseService,
  ServiceResult,
  ServiceError,
  QueryOptions,
  CreateOptions,
  UpdateOptions,
  DeleteOptions,
  BaseEntity
} from '../types/service';

export abstract class BaseService<T extends BaseEntity, CreateInput, UpdateInput>
  implements IBaseService<T, CreateInput, UpdateInput>
{
  protected readonly tableName: string;
  protected readonly supabase: SupabaseClient<Database>;

  constructor(config: BaseServiceConfig) {
    this.tableName = config.tableName;
    this.supabase = config.supabase;
  }

  protected handleError(error: unknown): ServiceError {
    if (error instanceof Error) {
      return {
        code: 'SERVICE_ERROR',
        message: error.message,
        details: error
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error
    };
  }

  protected createSuccessResult<T>(data: T): ServiceResult<T> {
    return { data, error: null };
  }

  protected createErrorResult<T>(error: ServiceError): ServiceResult<T> {
    return { data: null, error };
  }

  async create(data: CreateInput, options?: CreateOptions): Promise<ServiceResult<T>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return this.createSuccessResult(result as T);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getById(id: string): Promise<ServiceResult<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as T);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<T[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select();

      if (!options?.includeDeleted) {
        query = query.eq('esta_eliminada', false);
      }

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return this.createSuccessResult(data as T[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async update(id: string, data: UpdateInput, options?: UpdateOptions): Promise<ServiceResult<T>> {
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
      return this.createErrorResult(this.handleError(error));
    }
  }

  async delete(id: string, options?: DeleteOptions): Promise<ServiceResult<T>> {
    try {
      if (options?.hardDelete) {
        const { data, error } = await this.supabase
          .from(this.tableName)
          .delete()
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return this.createSuccessResult(data as T);
      } else {
        return this.softDelete(id);
      }
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
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
      return false;
    }
  }

  async count(options?: QueryOptions): Promise<number> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('id', { count: 'exact' });

      if (!options?.includeDeleted) {
        query = query.eq('esta_eliminada', false);
      }

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { count, error } = await query;

      if (error) throw error;
      return count ?? 0;
    } catch (error) {
      return 0;
    }
  }

  async softDelete(id: string): Promise<ServiceResult<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: true,
          eliminado_por_uid: this.supabase.auth.getUser().then(({ data }) => data.user?.id),
          eliminado_en: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as T);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async restore(id: string): Promise<ServiceResult<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: false,
          eliminado_por_uid: null,
          eliminado_en: null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as T);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<T[]>> {
    try {
      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .textSearch('nombre', query, {
          type: 'websearch',
          config: 'spanish'
        });

      if (!options?.includeDeleted) {
        searchQuery = searchQuery.eq('esta_eliminada', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as T[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }
} 