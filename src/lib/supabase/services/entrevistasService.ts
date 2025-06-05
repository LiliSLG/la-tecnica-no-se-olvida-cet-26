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

  async getById(id: string): Promise<ServiceResult<Entrevista | null>> {
    try {
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(cached);

      const { data: entrevista, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!entrevista) return this.createSuccessResult(null);

      await this.setInCache(id, entrevista);
      return this.createSuccessResult(entrevista);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Entrevista[]>> {
    try {
      if (!ids.length) return this.createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return this.createSuccessResult(cachedResults.filter(Boolean) as Entrevista[]);
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const entrevista of data) {
        await this.setInCache(entrevista.id, entrevista);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return this.createSuccessResult(allResults);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getPublic(): Promise<ServiceResult<Entrevista[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_publicada', true)
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const entrevista of data) {
        await this.setInCache(entrevista.id, entrevista);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Entrevista[]>> {
    try {
      if (!query.trim()) return this.createSuccessResult([]);

      const searchPattern = `%${query.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`titulo.ilike.${searchPattern},descripcion.ilike.${searchPattern}`)
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const entrevista of data) {
        await this.setInCache(entrevista.id, entrevista);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }

  async update(id: string, data: Database['public']['Tables']['entrevistas']['Update']): Promise<ServiceResult<Entrevista>> {
    try {
      const validationError = this.validateUpdateInput(data);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const { data: updated, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updated) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'id', id)
        );
      }

      await this.setInCache(id, updated);
      return this.createSuccessResult(updated);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'update' }));
    }
  }

  async create(data: Database['public']['Tables']['entrevistas']['Insert']): Promise<ServiceResult<Entrevista>> {
    try {
      const validationError = this.validateCreateInput(data);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!created) {
        return this.createErrorResult(
          mapValidationError('Failed to create entrevista', 'data', data)
        );
      }

      await this.setInCache(created.id, created);
      return this.createSuccessResult(created);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'create' }));
    }
  }
} 