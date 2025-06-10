import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { CacheableService } from './cacheableService';
import { ServiceResult } from '../types/service';
import { QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type Entrevista = Database['public']['Tables']['entrevistas']['Row'];
type CreateEntrevista = Database['public']['Tables']['entrevistas']['Insert'];
type UpdateEntrevista = Database['public']['Tables']['entrevistas']['Update'];

export class EntrevistasService extends CacheableService<Entrevista> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, {
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

  async getAll(options?: QueryOptions): Promise<ServiceResult<Entrevista[] | null>> {
    return super.getAll(options);
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
        .from('entrevistas')
        .select()
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!results) return createSuccess<Entrevista[] | null>(null);

      return createSuccess(results as Entrevista[]);
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
    return super.getById(id);
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      const { data: results, error } = await this.supabase
        .from('entrevistas')
        .select()
        .in('id', ids);

      if (error) throw error;
      if (!results) return createSuccess<Entrevista[] | null>(null);

      return createSuccess(results as Entrevista[]);
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
      const { data: results, error } = await this.supabase
        .from('entrevistas')
        .select()
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!results) return createSuccess<Entrevista[] | null>(null);

      return createSuccess(results as Entrevista[]);
    } catch (error) {
      return createError<Entrevista[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  public async search(query: string, options?: QueryOptions): Promise<ServiceResult<Entrevista[]>> {
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

  async update(id: string, data: UpdateEntrevista): Promise<ServiceResult<Entrevista | null>> {
    return super.update(id, data);
  }

  async create(data: Omit<Entrevista, 'id'>): Promise<ServiceResult<Entrevista | null>> {
    // Ensure required fields are not undefined
    const createData: Omit<Entrevista, 'id'> = {
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      video_url: data.video_url ?? null,
      status: data.status ?? 'scheduled',
      fecha_entrevista: data.fecha_entrevista ?? null,
      esta_eliminada: data.esta_eliminada ?? false,
      eliminado_por_uid: data.eliminado_por_uid ?? null,
      eliminado_en: data.eliminado_en ?? null,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    };
    return super.create(createData);
  }

  protected getSearchableFields(): string[] {
    return ['titulo', 'descripcion', 'entrevistador', 'entrevistado'];
  }
} 