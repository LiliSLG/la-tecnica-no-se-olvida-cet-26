import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { CacheableService } from './cacheableService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type Noticia = Database['public']['Tables']['noticias']['Row'];
type CreateNoticia = Database['public']['Tables']['noticias']['Insert'];
type UpdateNoticia = Database['public']['Tables']['noticias']['Update'];

interface MappedNoticia {
  id: string;
  titulo: string;
  contenido: string | null;
  imagenUrl: string | null;
  tipo: 'article' | 'link';
  urlExterna: string | null;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export class NoticiasService extends CacheableService<Noticia> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, {
      entityType: 'noticia',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  private mapNoticia(noticia: Noticia): MappedNoticia {
    return {
      id: noticia.id,
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      imagenUrl: noticia.imagen_url,
      tipo: noticia.tipo,
      urlExterna: noticia.url_externa,
      activo: !noticia.esta_eliminada,
      eliminadoPorUid: noticia.eliminado_por_uid,
      eliminadoEn: noticia.eliminado_en,
      creadoEn: noticia.created_at,
      actualizadoEn: noticia.updated_at
    };
  }

  private mapNoticias(noticias: Noticia[]): MappedNoticia[] {
    return noticias.map(noticia => this.mapNoticia(noticia));
  }

  protected validateCreateInput(data: CreateNoticia): ValidationError | null {
    if (!data.titulo?.trim()) {
      return mapValidationError('El título es requerido', 'titulo', data.titulo);
    }

    if (!data.contenido?.trim()) {
      return mapValidationError('El contenido es requerido', 'contenido', data.contenido);
    }

    if (data.tipo === 'link' && !data.url_externa?.trim()) {
      return mapValidationError('La URL externa es requerida para noticias de tipo link', 'url_externa', data.url_externa);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateNoticia): ValidationError | null {
    if (data.titulo === '') {
      return mapValidationError('El título no puede estar vacío', 'titulo', data.titulo);
    }

    if (data.contenido === '') {
      return mapValidationError('El contenido no puede estar vacío', 'contenido', data.contenido);
    }

    if (data.tipo === 'link' && data.url_externa === '') {
      return mapValidationError('La URL externa no puede estar vacía', 'url_externa', data.url_externa);
    }

    return null;
  }

  async getById(id: string): Promise<ServiceResult<Noticia | null>> {
    try {
      const cachedResult = await this.getFromCache(id);
      if (cachedResult.success && cachedResult.data) {
        return createSuccess(cachedResult.data);
      }

      const { data: noticia, error } = await this.supabase
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

      if (!noticia) return createSuccess(null);

      await this.setInCache(id, noticia);
      return createSuccess(noticia);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener la noticia',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!ids.length) return createSuccess([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]?.success || !cachedResults[index]?.data);

      if (missingIds.length === 0) {
        const validResults = cachedResults
          .filter(result => result.success && result.data)
          .map(result => result.data as Noticia);
        return createSuccess(validResults);
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return createSuccess([]);

      for (const noticia of data) {
        await this.setInCache(noticia.id, noticia);
      }

      const validCachedResults = cachedResults
        .filter(result => result.success && result.data)
        .map(result => result.data as Noticia);
      const allResults = [...validCachedResults, ...data];
      return createSuccess(allResults);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener las noticias',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublic(): Promise<ServiceResult<Noticia[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess([]);

      for (const noticia of data) {
        await this.setInCache(noticia.id, noticia);
      }

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener las noticias públicas',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  public async search(query: string, options?: QueryOptions): Promise<ServiceResult<Noticia[]>> {
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

  async update(id: string, data: UpdateNoticia): Promise<ServiceResult<Noticia | null>> {
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

      const { data: noticia, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Noticia no encontrada',
            code: 'VALIDATION_ERROR',
            details: { id }
          });
        }
        throw error;
      }

      if (!noticia) {
        return createError({
          name: 'ValidationError',
          message: 'Noticia no encontrada',
          code: 'VALIDATION_ERROR',
          details: { id }
        });
      }

      await this.setInCache(id, noticia);
      return createSuccess(noticia);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al actualizar la noticia',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async create(data: Omit<Noticia, 'id'>): Promise<ServiceResult<Noticia | null>> {
    // Ensure required fields are not undefined
    const createData: Omit<Noticia, 'id'> = {
      titulo: data.titulo,
      contenido: data.contenido ?? null,
      imagen_url: data.imagen_url ?? null,
      tipo: data.tipo ?? 'article',
      url_externa: data.url_externa ?? null,
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
            message: 'Noticia no encontrada',
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
        message: error instanceof Error ? error.message : 'Error al eliminar la noticia',
        code: 'DB_ERROR',
        details: error
      });
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

  protected getSearchableFields(): string[] {
    return ['titulo', 'resumen', 'contenido', 'autor'];
  }
} 