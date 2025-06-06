import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';
import { CacheableServiceConfig } from './cacheableService';

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

export class NoticiasService extends BaseService<Noticia, 'noticias'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'noticias' = 'noticias',
    cacheConfig: CacheableServiceConfig = { ttl: 3600, entityType: 'noticia' }
  ) {
    super(supabase, tableName, cacheConfig);
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

  async search(term: string, options?: QueryOptions): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!term.trim()) return createSuccess([]);

      const searchPattern = `%${term.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`titulo.ilike.${searchPattern},contenido.ilike.${searchPattern}`)
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
        message: error instanceof Error ? error.message : 'Error al buscar noticias',
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

  async create(data: CreateNoticia): Promise<ServiceResult<Noticia | null>> {
    try {
      const validationError = this.validateCreateInput(data);
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
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!noticia) {
        return createError({
          name: 'ServiceError',
          message: 'Error al crear la noticia',
          code: 'DB_ERROR',
          details: { data }
        });
      }

      await this.setInCache(noticia.id, noticia);
      return createSuccess(noticia);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al crear la noticia',
        code: 'DB_ERROR',
        details: error
      });
    }
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

  async softDelete(id: string, userId: string): Promise<ServiceResult<Noticia | null>> {
    try {
      const { data: noticia, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: true,
          eliminado_por_uid: userId,
          eliminado_en: new Date().toISOString()
        })
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
        message: error instanceof Error ? error.message : 'Error al eliminar la noticia',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 