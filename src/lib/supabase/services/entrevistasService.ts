import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { CacheableServiceConfig } from './cacheableService';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type Entrevista = Database['public']['Tables']['entrevistas']['Row'];
type CreateEntrevista = Database['public']['Tables']['entrevistas']['Insert'];
type UpdateEntrevista = Database['public']['Tables']['entrevistas']['Update'];

export class EntrevistasService extends BaseService<Entrevista, 'entrevistas'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'entrevistas', {
      entityType: 'entrevista',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateEntrevista): ValidationError | null {
    if (!data.titulo) {
      return mapValidationError('Title is required', 'titulo', data.titulo);
    }

    if (!data.descripcion) {
      return mapValidationError('Description is required', 'descripcion', data.descripcion);
    }

    if (data.status && !this.isValidStatus(data.status)) {
      return mapValidationError('Invalid status', 'status', data.status);
    }

    if (data.video_url && !this.isValidUrl(data.video_url)) {
      return mapValidationError('Invalid video URL', 'video_url', data.video_url);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateEntrevista): ValidationError | null {
    if (data.titulo === '') {
      return mapValidationError('Title cannot be empty', 'titulo', data.titulo);
    }

    if (data.descripcion === '') {
      return mapValidationError('Description cannot be empty', 'descripcion', data.descripcion);
    }

    if (data.status && !this.isValidStatus(data.status)) {
      return mapValidationError('Invalid status', 'status', data.status);
    }

    if (data.video_url && !this.isValidUrl(data.video_url)) {
      return mapValidationError('Invalid video URL', 'video_url', data.video_url);
    }

    return null;
  }

  private isValidStatus(status: Database['public']['Enums']['interview_status']): boolean {
    return ['scheduled', 'completed', 'cancelled'].includes(status);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Entrevista[] | null>> {
    return this.getAllWithPagination(options);
  }

  async getByTema(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!temaId) {
        return createError<Entrevista[] | null>({
          name: 'ValidationError',
          message: 'Tema ID is required',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }
      return this.getRelatedEntities<Entrevista>(
        temaId,
        'temas',
        'entrevistas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return createError<Entrevista[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!personaId) {
        return createError<Entrevista[] | null>({
          name: 'ValidationError',
          message: 'Persona ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }
      return this.getRelatedEntities<Entrevista>(
        personaId,
        'personas',
        'entrevistas',
        'entrevista_persona_rol',
        options
      );
    } catch (error) {
      return createError<Entrevista[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByOrganizacion(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!organizacionId) {
        return createError<Entrevista[] | null>({
          name: 'ValidationError',
          message: 'Organizacion ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }
      return this.getRelatedEntities<Entrevista>(
        organizacionId,
        'organizaciones',
        'entrevistas',
        'entrevista_organizacion_rol',
        options
      );
    } catch (error) {
      return createError<Entrevista[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getTemas(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][] | null>> {
    try {
      if (!entrevistaId) {
        return createError<Database['public']['Tables']['temas']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Entrevista ID is required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId }
        });
      }
      return this.getRelatedEntities<Database['public']['Tables']['temas']['Row']>(
        entrevistaId,
        'entrevistas',
        'temas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return createError<Database['public']['Tables']['temas']['Row'][] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPersonas(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
    try {
      if (!entrevistaId) {
        return createError<Database['public']['Tables']['personas']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Entrevista ID is required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId }
        });
      }
      return this.getRelatedEntities<Database['public']['Tables']['personas']['Row']>(
        entrevistaId,
        'entrevistas',
        'personas',
        'entrevista_persona_rol',
        options
      );
    } catch (error) {
      return createError<Database['public']['Tables']['personas']['Row'][] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getOrganizaciones(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][] | null>> {
    try {
      if (!entrevistaId) {
        return createError<Database['public']['Tables']['organizaciones']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Entrevista ID is required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId }
        });
      }
      return this.getRelatedEntities<Database['public']['Tables']['organizaciones']['Row']>(
        entrevistaId,
        'entrevistas',
        'organizaciones',
        'entrevista_organizacion_rol',
        options
      );
    } catch (error) {
      return createError<Database['public']['Tables']['organizaciones']['Row'][] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  public async getPublicadas(
    options?: QueryOptions
  ): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('esta_publicada', true)
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!results) return createSuccess<Entrevista[] | null>(null);

      // Cache individual results
      for (const result of results) {
        await this.setInCache(result.id, result);
      }

      return createSuccess(results);
    } catch (error) {
      return createError<Entrevista[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<Entrevista | null>> {
    try {
      const cachedResult = await this.getFromCache(id);
      if (cachedResult.success && cachedResult.data) {
        return createSuccess(cachedResult.data);
      }

      const { data: entrevista, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!entrevista) return createSuccess<Entrevista | null>(null);

      await this.setInCache(id, entrevista);
      return createSuccess(entrevista);
    } catch (error) {
      return createError<Entrevista | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!ids.length) {
        return createSuccess<Entrevista[] | null>([]);
      }

      const { data: entrevistas, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', ids);

      if (error) throw error;
      if (!entrevistas) return createSuccess<Entrevista[] | null>([]);

      // Cache individual results
      for (const entrevista of entrevistas) {
        await this.setInCache(entrevista.id, entrevista);
      }

      return createSuccess(entrevistas);
    } catch (error) {
      return createError<Entrevista[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublic(): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      const { data: entrevistas, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_publicada', true)
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!entrevistas) return createSuccess<Entrevista[] | null>([]);

      // Cache individual results
      for (const entrevista of entrevistas) {
        await this.setInCache(entrevista.id, entrevista);
      }

      return createSuccess(entrevistas);
    } catch (error) {
      return createError<Entrevista[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!query) {
        return createSuccess<Entrevista[] | null>([]);
      }

      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .textSearch('search_vector', query)
        .eq('esta_eliminada', false);

      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          searchQuery = searchQuery.eq(key, value);
        });
      }

      const { data: results, error } = await searchQuery;

      if (error) throw error;
      if (!results) return createSuccess<Entrevista[] | null>([]);

      // Cache individual results
      for (const result of results) {
        await this.setInCache(result.id, result);
      }

      return createSuccess(results);
    } catch (error) {
      return createError<Entrevista[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async update(id: string, data: UpdateEntrevista): Promise<ServiceResult<Entrevista | null>> {
    try {
      const validationError = this.validateUpdateInput(data);
      if (validationError) {
        return createError<Entrevista | null>({
          name: 'ValidationError',
          message: validationError.message,
          code: 'VALIDATION_ERROR',
          details: validationError
        });
      }

      const { data: updated, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updated) return createSuccess<Entrevista | null>(null);

      await this.setInCache(id, updated);
      return createSuccess(updated);
    } catch (error) {
      return createError<Entrevista | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async create(data: CreateEntrevista): Promise<ServiceResult<Entrevista | null>> {
    try {
      const validationError = this.validateCreateInput(data);
      if (validationError) {
        return createError<Entrevista | null>({
          name: 'ValidationError',
          message: validationError.message,
          code: 'VALIDATION_ERROR',
          details: validationError
        });
      }

      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!created) return createSuccess<Entrevista | null>(null);

      await this.setInCache(created.id, created);
      return createSuccess(created);
    } catch (error) {
      return createError<Entrevista | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 