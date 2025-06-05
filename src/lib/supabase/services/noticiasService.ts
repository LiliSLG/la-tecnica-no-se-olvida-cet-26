import { supabase } from '../supabaseClient';
import { CacheableService } from './cacheableService';
import { ServiceResult } from '../types/service';
import { ServiceError } from '../errors/types';
import { NoticiaRow, NoticiaInsert, NoticiaUpdate, MappedNoticia } from '../types/noticia';
import { Database } from '../types/database.types';

export class NoticiasService extends CacheableService<MappedNoticia> {
  constructor() {
    super({
      entityType: 'noticia',
      ttl: 3600, // 1 hour
      enableCache: true
    });
  }

  private validateNoticia(noticia: Partial<NoticiaInsert>): ServiceError | null {
    if (!noticia.titulo?.trim()) {
      return {
        name: 'ValidationError',
        code: 'VALIDATION_ERROR',
        message: 'El título es requerido',
        details: { field: 'titulo' }
      };
    }

    if (!noticia.contenido?.trim()) {
      return {
        name: 'ValidationError',
        code: 'VALIDATION_ERROR',
        message: 'El contenido es requerido',
        details: { field: 'contenido' }
      };
    }

    if (noticia.tipo === 'link' && !noticia.url_externa?.trim()) {
      return {
        name: 'ValidationError',
        code: 'VALIDATION_ERROR',
        message: 'La URL externa es requerida para noticias de tipo link',
        details: { field: 'url_externa' }
      };
    }

    return null;
  }

  async create(noticia: NoticiaInsert): Promise<ServiceResult<MappedNoticia>> {
    try {
      const error = this.validateNoticia(noticia);
      if (error) {
        return { success: false, error, data: null };
      }

      const { data, error: dbError } = await supabase
        .from('noticias')
        .insert(noticia)
        .select()
        .single();

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: 'Error al crear la noticia',
            details: dbError
          },
          data: null
        };
      }

      await this.invalidateCache('list');
      return { success: true, data, error: null };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Error inesperado al crear la noticia',
          details: error
        },
        data: null
      };
    }
  }

  async update(id: string, noticia: NoticiaUpdate): Promise<ServiceResult<MappedNoticia>> {
    try {
      const error = this.validateNoticia(noticia);
      if (error) {
        return { success: false, error, data: null };
      }

      const { data, error: dbError } = await supabase
        .from('noticias')
        .update(noticia)
        .eq('id', id)
        .select()
        .single();

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: 'Error al actualizar la noticia',
            details: dbError
          },
          data: null
        };
      }

      await this.invalidateCache(id);
      return { success: true, data, error: null };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Error inesperado al actualizar la noticia',
          details: error
        },
        data: null
      };
    }
  }

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error: dbError } = await supabase
        .from('noticias')
        .delete()
        .eq('id', id);

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: 'Error al eliminar la noticia',
            details: dbError
          },
          data: null
        };
      }

      await this.invalidateCache(id);
      return { success: true, data: undefined, error: null };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Error inesperado al eliminar la noticia',
          details: error
        },
        data: null
      };
    }
  }

  async getById(id: string): Promise<ServiceResult<MappedNoticia>> {
    try {
      // Try to get from cache first
      const cached = await this.getFromCache(id);
      if (cached) {
        return { success: true, data: cached, error: null };
      }

      const { data, error: dbError } = await supabase
        .from('noticias')
        .select()
        .eq('id', id)
        .single();

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: 'Error al obtener la noticia',
            details: dbError
          },
          data: null
        };
      }

      if (!data) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Noticia no encontrada',
            details: { id }
          },
          data: null
        };
      }

      await this.setInCache(id, data);
      return { success: true, data, error: null };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Error inesperado al obtener la noticia',
          details: error
        },
        data: null
      };
    }
  }

  async getAll(): Promise<ServiceResult<MappedNoticia[]>> {
    try {
      // Try to get from cache first
      const cached = await this.getListFromCache();
      if (cached) {
        return { success: true, data: cached, error: null };
      }

      const { data, error: dbError } = await supabase
        .from('noticias')
        .select()
        .order('created_at', { ascending: false });

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: 'Error al obtener las noticias',
            details: dbError
          },
          data: null
        };
      }

      await this.setListInCache(data);
      return { success: true, data, error: null };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Error inesperado al obtener las noticias',
          details: error
        },
        data: null
      };
    }
  }

  async search(query: string): Promise<ServiceResult<MappedNoticia[]>> {
    try {
      // Try to get from cache first
      const cached = await this.getQueryFromCache(query);
      if (cached) {
        return { success: true, data: cached, error: null };
      }

      const { data, error: dbError } = await supabase
        .from('noticias')
        .select()
        .or(`titulo.ilike.%${query}%,contenido.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (dbError) {
        return {
          success: false,
          error: {
            code: 'DB_ERROR',
            message: 'Error al buscar noticias',
            details: dbError
          },
          data: null
        };
      }

      await this.setQueryInCache(query, data);
      return { success: true, data, error: null };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Error inesperado al buscar noticias',
          details: error
        },
        data: null
      };
    }
  }
} 