import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/serviceResult';
import { QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { CacheableServiceConfig } from './cacheableService';

type Entrevista = Database['public']['Tables']['entrevistas']['Row'];

export class EntrevistasService extends BaseService<Entrevista, 'entrevistas'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'entrevistas', {
      entityType: 'entrevista',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: Database['public']['Tables']['entrevistas']['Insert']): ValidationError | null {
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

  protected validateUpdateInput(data: Database['public']['Tables']['entrevistas']['Update']): ValidationError | null {
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
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }
      return this.getRelatedEntities<Entrevista>(
        temaId,
        'temas',
        'entrevistas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema', temaId }));
    }
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }
      return this.getRelatedEntities<Entrevista>(
        personaId,
        'personas',
        'entrevistas',
        'entrevista_persona_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByPersona', personaId }));
    }
  }

  async getByOrganizacion(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }
      return this.getRelatedEntities<Entrevista>(
        organizacionId,
        'organizaciones',
        'entrevistas',
        'entrevista_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByOrganizacion', organizacionId }));
    }
  }

  async getTemas(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][] | null>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['temas']['Row']>(
        entrevistaId,
        'entrevistas',
        'temas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getTemas', entrevistaId }));
    }
  }

  async getPersonas(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['personas']['Row']>(
        entrevistaId,
        'entrevistas',
        'personas',
        'entrevista_persona_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonas', entrevistaId }));
    }
  }

  async getOrganizaciones(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][] | null>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['organizaciones']['Row']>(
        entrevistaId,
        'entrevistas',
        'organizaciones',
        'entrevista_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getOrganizaciones', entrevistaId }));
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
      if (!results) return this.createSuccessResult(null);

      // Cache individual results
      for (const result of results) {
        await this.setInCache(result.id, result);
      }

      return this.createSuccessResult(results);
    } catch (error) {
      return this.createErrorResult(error as Error);
    }
  }
} 