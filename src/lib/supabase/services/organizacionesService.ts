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
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'organizaciones', {
      entityType: 'organizacion',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
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

  async getById(id: string): Promise<ServiceResult<Organizacion | null>> {
    try {
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(cached);

      const { data: organizacion, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!organizacion) return this.createSuccessResult(null);

      await this.setInCache(id, organizacion);
      return this.createSuccessResult(organizacion);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Organizacion[]>> {
    try {
      if (!ids.length) return this.createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return this.createSuccessResult(cachedResults.filter(Boolean) as Organizacion[]);
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const organizacion of data) {
        await this.setInCache(organizacion.id, organizacion);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return this.createSuccessResult(allResults);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getPublic(): Promise<ServiceResult<Organizacion[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const organizacion of data) {
        await this.setInCache(organizacion.id, organizacion);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Organizacion[]>> {
    try {
      if (!query.trim()) return this.createSuccessResult([]);

      const searchPattern = `%${query.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.${searchPattern},descripcion.ilike.${searchPattern}`)
        .eq('esta_eliminada', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const organizacion of data) {
        await this.setInCache(organizacion.id, organizacion);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }

  async update(id: string, data: UpdateOrganizacion): Promise<ServiceResult<Organizacion>> {
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
          mapValidationError('Organizacion not found', 'id', id)
        );
      }

      await this.setInCache(id, updated);
      return this.createSuccessResult(updated);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'update' }));
    }
  }

  async create(data: CreateOrganizacion): Promise<ServiceResult<Organizacion>> {
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
          mapValidationError('Failed to create organizacion', 'data', data)
        );
      }

      await this.setInCache(created.id, created);
      return this.createSuccessResult(created);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'create' }));
    }
  }
} 
