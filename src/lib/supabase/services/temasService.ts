import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/serviceResult';
import { QueryOptions } from '../types/service';
import { mapValidationError } from '../errors/utils';
import { ValidationError } from '../errors/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { CacheableServiceConfig } from './cacheableService';

type Tema = Database['public']['Tables']['temas']['Row'];

export class TemasService extends BaseService<Tema, 'temas'> {
  constructor(supabase: SupabaseClient<Database>, cacheConfig: CacheableServiceConfig) {
    super(supabase, 'temas', cacheConfig);
  }

  protected validateCreateInput(data: Database['public']['Tables']['temas']['Insert']): ValidationError | null {
    if (!data.nombre) {
      return mapValidationError('Name is required', 'nombre', data.nombre);
    }

    if (!data.descripcion) {
      return mapValidationError('Description is required', 'descripcion', data.descripcion);
    }

    return null;
  }

  protected validateUpdateInput(data: Database['public']['Tables']['temas']['Update']): ValidationError | null {
    if (data.nombre === '') {
      return mapValidationError('Name cannot be empty', 'nombre', data.nombre);
    }

    if (data.descripcion === '') {
      return mapValidationError('Description cannot be empty', 'descripcion', data.descripcion);
    }

    return null;
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Tema[] | null>> {
    return this.getAllWithPagination(options);
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }
      return this.getRelatedEntities<Tema>(
        personaId,
        'personas',
        'temas',
        'persona_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByPersona', personaId }));
    }
  }

  async getByProyecto(
    proyectoId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!proyectoId) {
        return this.createErrorResult(
          mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId)
        );
      }
      return this.getRelatedEntities<Tema>(
        proyectoId,
        'proyectos',
        'temas',
        'proyecto_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByProyecto', proyectoId }));
    }
  }

  async getByEntrevista(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }
      return this.getRelatedEntities<Tema>(
        entrevistaId,
        'entrevistas',
        'temas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByEntrevista', entrevistaId }));
    }
  }

  async getByNoticia(
    noticiaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!noticiaId) {
        return this.createErrorResult(
          mapValidationError('Noticia ID is required', 'noticiaId', noticiaId)
        );
      }
      return this.getRelatedEntities<Tema>(
        noticiaId,
        'noticias',
        'temas',
        'noticia_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByNoticia', noticiaId }));
    }
  }

  async getPersonas(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['personas']['Row']>(
        temaId,
        'temas',
        'personas',
        'persona_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonas', temaId }));
    }
  }

  async getProyectos(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][] | null>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['proyectos']['Row']>(
        temaId,
        'temas',
        'proyectos',
        'proyecto_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getProyectos', temaId }));
    }
  }

  async getEntrevistas(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][] | null>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['entrevistas']['Row']>(
        temaId,
        'temas',
        'entrevistas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getEntrevistas', temaId }));
    }
  }

  async getNoticias(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['noticias']['Row'][] | null>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['noticias']['Row']>(
        temaId,
        'temas',
        'noticias',
        'noticia_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getNoticias', temaId }));
    }
  }
} 