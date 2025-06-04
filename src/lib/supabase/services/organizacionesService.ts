import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/serviceResult';
import { QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { CacheableServiceConfig } from './cacheableService';

type Organizacion = Database['public']['Tables']['organizaciones']['Row'];
type CreateOrganizacion = Database['public']['Tables']['organizaciones']['Insert'];
type UpdateOrganizacion = Database['public']['Tables']['organizaciones']['Update'];

export class OrganizacionesService extends BaseService<Organizacion, 'organizaciones'> {
  constructor(supabase: SupabaseClient<Database>, cacheConfig: CacheableServiceConfig) {
    super(supabase, 'organizaciones', cacheConfig);
  }

  protected validateCreateInput(data: Database['public']['Tables']['organizaciones']['Insert']): ValidationError | null {
    if (!data.nombre) {
      return mapValidationError('Name is required', 'nombre', data.nombre);
    }

    if (data.sitio_web && !this.isValidUrl(data.sitio_web)) {
      return mapValidationError('Invalid website URL format', 'sitio_web', data.sitio_web);
    }

    if (data.logo_url && !this.isValidUrl(data.logo_url)) {
      return mapValidationError('Invalid logo URL format', 'logo_url', data.logo_url);
    }

    return null;
  }

  protected validateUpdateInput(data: Database['public']['Tables']['organizaciones']['Update']): ValidationError | null {
    if (data.nombre === '') {
      return mapValidationError('Name cannot be empty', 'nombre', data.nombre);
    }

    if (data.sitio_web && !this.isValidUrl(data.sitio_web)) {
      return mapValidationError('Invalid website URL format', 'sitio_web', data.sitio_web);
    }

    if (data.logo_url && !this.isValidUrl(data.logo_url)) {
      return mapValidationError('Invalid logo URL format', 'logo_url', data.logo_url);
    }

    return null;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Organizacion[] | null>> {
    return this.getAllWithPagination(options);
  }

  async getByTema(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }
      return this.getRelatedEntities<Organizacion>(
        temaId,
        'temas',
        'organizaciones',
        'organizacion_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema', temaId }));
    }
  }

  async getByProyecto(
    proyectoId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!proyectoId) {
        return this.createErrorResult(
          mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId)
        );
      }
      return this.getRelatedEntities<Organizacion>(
        proyectoId,
        'proyectos',
        'organizaciones',
        'proyecto_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByProyecto', proyectoId }));
    }
  }

  async getByNoticia(
    noticiaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!noticiaId) {
        return this.createErrorResult(
          mapValidationError('Noticia ID is required', 'noticiaId', noticiaId)
        );
      }
      return this.getRelatedEntities<Organizacion>(
        noticiaId,
        'noticias',
        'organizaciones',
        'noticia_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByNoticia', noticiaId }));
    }
  }

  async getByEntrevista(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }
      return this.getRelatedEntities<Organizacion>(
        entrevistaId,
        'entrevistas',
        'organizaciones',
        'entrevista_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByEntrevista', entrevistaId }));
    }
  }

  async getTemas(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['temas']['Row']>(
        organizacionId,
        'organizaciones',
        'temas',
        'organizacion_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getTemas', organizacionId }));
    }
  }

  async getProyectos(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['proyectos']['Row']>(
        organizacionId,
        'organizaciones',
        'proyectos',
        'proyecto_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getProyectos', organizacionId }));
    }
  }

  async getNoticias(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['noticias']['Row'][] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['noticias']['Row']>(
        organizacionId,
        'organizaciones',
        'noticias',
        'noticia_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getNoticias', organizacionId }));
    }
  }

  async getEntrevistas(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['entrevistas']['Row']>(
        organizacionId,
        'organizaciones',
        'entrevistas',
        'entrevista_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getEntrevistas', organizacionId }));
    }
  }

  // Override search to include descripcion in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Organizacion[]>> {
    try {
      if (!query) {
        return this.createErrorResult(
          mapValidationError('Search query is required', 'query', query)
        );
      }

      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`);

      if (!options?.includeDeleted) {
        searchQuery = searchQuery.eq('esta_eliminada', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as Organizacion[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search', query, options }));
    }
  }
} 