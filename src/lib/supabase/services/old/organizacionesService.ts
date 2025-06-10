import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { CacheableService } from './cacheableService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type Organizacion = Database['public']['Tables']['organizaciones']['Row'];
type CreateOrganizacion = Database['public']['Tables']['organizaciones']['Insert'];
type UpdateOrganizacion = Database['public']['Tables']['organizaciones']['Update'];
type Tema = Database['public']['Tables']['temas']['Row'];
type Proyecto = Database['public']['Tables']['proyectos']['Row'];
type Noticia = Database['public']['Tables']['noticias']['Row'];
type Entrevista = Database['public']['Tables']['entrevistas']['Row'];

export class OrganizacionesService extends CacheableService<Organizacion> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, {
      entityType: 'organizacion',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateOrganizacion): ValidationError | null {
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

  protected validateUpdateInput(data: UpdateOrganizacion): ValidationError | null {
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

  async getByTema(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Tema ID is required',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }
      return this.getRelatedEntities<Organizacion>(
        temaId,
        'temas',
        'organizaciones',
        'organizacion_tema',
        options
      );
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByProyecto(
    proyectoId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Proyecto ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }
      return this.getRelatedEntities<Organizacion>(
        proyectoId,
        'proyectos',
        'organizaciones',
        'proyecto_organizacion_rol',
        options
      );
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByNoticia(
    noticiaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!noticiaId) {
        return createError({
          name: 'ValidationError',
          message: 'Noticia ID is required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId }
        });
      }
      return this.getRelatedEntities<Organizacion>(
        noticiaId,
        'noticias',
        'organizaciones',
        'noticia_organizacion_rol',
        options
      );
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByEntrevista(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!entrevistaId) {
        return createError({
          name: 'ValidationError',
          message: 'Entrevista ID is required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId }
        });
      }
      return this.getRelatedEntities<Organizacion>(
        entrevistaId,
        'entrevistas',
        'organizaciones',
        'entrevista_organizacion_rol',
        options
      );
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getTemas(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }
      return this.getRelatedEntities<Tema>(
        organizacionId,
        'organizaciones',
        'temas',
        'organizacion_tema',
        options
      );
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getProyectos(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }
      return this.getRelatedEntities<Proyecto>(
        organizacionId,
        'organizaciones',
        'proyectos',
        'proyecto_organizacion_rol',
        options
      );
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getNoticias(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }
      return this.getRelatedEntities<Noticia>(
        organizacionId,
        'organizaciones',
        'noticias',
        'noticia_organizacion_rol',
        options
      );
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getEntrevistas(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!organizacionId) {
        return createError({
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
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<Organizacion | null>> {
    try {
      const cachedResult = await this.getFromCache(id);
      if (cachedResult.success && cachedResult.data) {
        return createSuccess(cachedResult.data);
      }

      const { data: organizacion, error } = await this.supabase
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

      if (!organizacion) return createSuccess(null);

      await this.setInCache(id, organizacion);
      return createSuccess(organizacion);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      if (!ids.length) return createSuccess([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]?.success || !cachedResults[index]?.data);

      if (missingIds.length === 0) {
        const validResults = cachedResults
          .filter(result => result.success && result.data)
          .map(result => result.data as Organizacion);
        return createSuccess(validResults);
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return createSuccess([]);

      for (const organizacion of data) {
        await this.setInCache(organizacion.id, organizacion);
      }

      const validCachedResults = cachedResults
        .filter(result => result.success && result.data)
        .map(result => result.data as Organizacion);
      const allResults = [...validCachedResults, ...data];
      return createSuccess(allResults);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublic(): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess([]);

      for (const organizacion of data) {
        await this.setInCache(organizacion.id, organizacion);
      }

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

  public async search(query: string, options?: QueryOptions): Promise<ServiceResult<Organizacion[]>> {
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

  async update(id: string, data: UpdateOrganizacion): Promise<ServiceResult<Organizacion | null>> {
    try {
      const validationError = this.validateUpdateInput(data);
      if (validationError) {
        return createError({
          name: 'ValidationError',
          message: validationError.message,
          code: 'VALIDATION_ERROR',
          details: validationError
        });
      }

      const { data: organizacion, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Organizacion not found',
            code: 'VALIDATION_ERROR',
            details: { id }
          });
        }
        throw error;
      }

      if (!organizacion) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion not found',
          code: 'VALIDATION_ERROR',
          details: { id }
        });
      }

      await this.setInCache(id, organizacion);
      return createSuccess(organizacion);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async create(data: Omit<Organizacion, 'id'>): Promise<ServiceResult<Organizacion | null>> {
    // Ensure required fields are not undefined
    const createData: Omit<Organizacion, 'id'> = {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      logo_url: data.logo_url ?? null,
      sitio_web: data.sitio_web ?? null,
      esta_eliminada: data.esta_eliminada ?? false,
      eliminado_por_uid: data.eliminado_por_uid ?? null,
      eliminado_en: data.eliminado_en ?? null,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    };
    return super.create(createData);
  }

  async delete(id: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Organizacion not found',
            code: 'VALIDATION_ERROR',
            details: { id }
          });
        }
        throw error;
      }

      await this.invalidateCache(id);
      return createSuccess(true);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }


  protected getSearchableFields(): string[] {
    return ['nombre', 'descripcion', 'tipo', 'ciudad', 'provincia', 'pais'];
  }
} 
