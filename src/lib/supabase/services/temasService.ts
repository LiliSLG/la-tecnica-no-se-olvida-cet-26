import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { QueryOptions } from '../types/service';
import { mapValidationError } from '../errors/utils';
import { ValidationError } from '../errors/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type Tema = Database['public']['Tables']['temas']['Row'];
type CreateTema = Database['public']['Tables']['temas']['Insert'];
type UpdateTema = Database['public']['Tables']['temas']['Update'];

export class TemasService extends BaseService<Tema> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, { tableName: 'temas' });
  }

  protected validateCreateInput(data: CreateTema): ValidationError | null {
    if (!data.nombre) {
      return mapValidationError('Name is required', 'nombre', data.nombre);
    }

    if (!data.descripcion) {
      return mapValidationError('Description is required', 'descripcion', data.descripcion);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateTema): ValidationError | null {
    if (data.nombre === '') {
      return mapValidationError('Name cannot be empty', 'nombre', data.nombre);
    }

    if (data.descripcion === '') {
      return mapValidationError('Description cannot be empty', 'descripcion', data.descripcion);
    }

    return null;
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Tema[] | null>> {
    return super.getAll(options);
  }

  protected async getRelatedEntities<R>(
    id: string,
    sourceTable: string,
    targetTable: string,
    junctionTable: string,
    options?: QueryOptions
  ): Promise<ServiceResult<R[] | null>> {
    try {
      let query = this.supabase
        .from(targetTable)
        .select(`
          *,
          ${junctionTable}!inner (
            ${sourceTable}!inner (
              id
            )
          )
        `)
        .eq(`${junctionTable}.${sourceTable}_id`, id);

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
      if (!results) return createSuccess<R[] | null>(null);

      return createSuccess(results as R[]);
    } catch (error) {
      return createError<R[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  protected handleError(error: unknown, context: { operation: string; [key: string]: any }): ValidationError {
    if (error instanceof Error) {
      return {
        name: 'ServiceError',
        message: error.message,
        code: 'DB_ERROR',
        source: 'TemasService',
        details: { ...context, error }
      };
    }
    return {
      name: 'ServiceError',
      message: 'An unexpected error occurred',
      code: 'DB_ERROR',
      source: 'TemasService',
      details: { ...context, error }
    };
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!personaId) {
        return createError(mapValidationError('Persona ID is required', 'personaId', personaId));
      }
      return await this.getRelatedEntities<Tema>(
        personaId,
        'personas',
        'temas',
        'persona_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByPersona', personaId }));
    }
  }

  async getByProyecto(
    proyectoId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!proyectoId) {
        return createError(mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId));
      }
      return await this.getRelatedEntities<Tema>(
        proyectoId,
        'proyectos',
        'temas',
        'proyecto_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByProyecto', proyectoId }));
    }
  }

  async getByEntrevista(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!entrevistaId) {
        return createError(mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId));
      }
      return await this.getRelatedEntities<Tema>(
        entrevistaId,
        'entrevistas',
        'temas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByEntrevista', entrevistaId }));
    }
  }

  async getByNoticia(
    noticiaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!noticiaId) {
        return createError(mapValidationError('Noticia ID is required', 'noticiaId', noticiaId));
      }
      return await this.getRelatedEntities<Tema>(
        noticiaId,
        'noticias',
        'temas',
        'noticia_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByNoticia', noticiaId }));
    }
  }

  async getPersonas(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(mapValidationError('Tema ID is required', 'temaId', temaId));
      }
      return await this.getRelatedEntities<Database['public']['Tables']['personas']['Row']>(
        temaId,
        'temas',
        'personas',
        'persona_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getPersonas', temaId }));
    }
  }

  async getProyectos(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(mapValidationError('Tema ID is required', 'temaId', temaId));
      }
      return await this.getRelatedEntities<Database['public']['Tables']['proyectos']['Row']>(
        temaId,
        'temas',
        'proyectos',
        'proyecto_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getProyectos', temaId }));
    }
  }

  async getEntrevistas(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(mapValidationError('Tema ID is required', 'temaId', temaId));
      }
      return await this.getRelatedEntities<Database['public']['Tables']['entrevistas']['Row']>(
        temaId,
        'temas',
        'entrevistas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getEntrevistas', temaId }));
    }
  }

  async getNoticias(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['noticias']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(mapValidationError('Tema ID is required', 'temaId', temaId));
      }
      return await this.getRelatedEntities<Database['public']['Tables']['noticias']['Row']>(
        temaId,
        'temas',
        'noticias',
        'noticia_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getNoticias', temaId }));
    }
  }

  public async getAllActivos(
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('esta_eliminado', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!results) return createSuccess(null);

      for (const result of results) {
        await this.setInCache(result.id, result);
      }

      return createSuccess(results);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getAllActivos' }));
    }
  }

  async getById(id: string): Promise<ServiceResult<Tema | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createSuccess(null);
        }
        throw error;
      }

      if (!data) return createSuccess(null);
      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Tema[]>> {
    try {
      if (!ids.length) return createSuccess([]);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', ids);

      if (error) throw error;
      if (!data) return createSuccess([]);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublic(): Promise<ServiceResult<Tema[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess([]);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Tema[]>> {
    try {
      const result = await super.search(query, options);
      if (!result.success) return result;
      return { success: true, data: result.data || [], error: undefined };
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async update(id: string, data: Database['public']['Tables']['temas']['Update']): Promise<ServiceResult<Tema>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!result) {
        return createError({
          name: 'ServiceError',
          message: 'Tema not found',
          code: 'DB_ERROR',
          details: { id }
        });
      }

      return createSuccess(result);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async create(data: Omit<Tema, 'id'>): Promise<ServiceResult<Tema | null>> {
    try {
      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!result) return createSuccess(null);

      return createSuccess(result);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 