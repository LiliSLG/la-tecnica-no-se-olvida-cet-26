import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions, createSuccessResult, createErrorResult } from '@/lib/supabase/types/service';
import { ValidationError } from '@/lib/supabase/errors/types';
import { mapValidationError } from '@/lib/supabase/errors/utils';
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
      const cached = await this.getFromCache(id);
      if (cached) return createSuccessResult(cached);

      const { data: noticia, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!noticia) return createSuccessResult(null);

      await this.setInCache(id, noticia);
      return createSuccessResult(noticia);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener la noticia',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Noticia[]>> {
    try {
      if (!ids.length) return createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return createSuccessResult(cachedResults.filter(Boolean) as Noticia[]);
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return createSuccessResult([]);

      for (const noticia of data) {
        await this.setInCache(noticia.id, noticia);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return createSuccessResult(allResults);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener las noticias',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublic(): Promise<ServiceResult<Noticia[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccessResult([]);

      for (const noticia of data) {
        await this.setInCache(noticia.id, noticia);
      }

      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener las noticias públicas',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async search(term: string, options?: QueryOptions): Promise<ServiceResult<Noticia[]>> {
    try {
      if (!term.trim()) return createSuccessResult([]);

      const searchPattern = `%${term.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`titulo.ilike.${searchPattern},contenido.ilike.${searchPattern}`)
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccessResult([]);

      for (const noticia of data) {
        await this.setInCache(noticia.id, noticia);
      }

      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al buscar noticias',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async update(id: string, data: UpdateNoticia): Promise<ServiceResult<Noticia>> {
    try {
      const validationError = this.validateUpdateInput(data);
      if (validationError) {
        return createErrorResult({
          name: 'ServiceError',
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

      if (error) throw error;
      if (!noticia) throw new Error('Noticia no encontrada');

      await this.setInCache(id, noticia);
      return createSuccessResult(noticia);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al actualizar la noticia',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async create(data: CreateNoticia): Promise<ServiceResult<Noticia>> {
    try {
      const validationError = this.validateCreateInput(data);
      if (validationError) {
        return createErrorResult({
          name: 'ServiceError',
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
      if (!noticia) throw new Error('Error al crear la noticia');

      await this.setInCache(noticia.id, noticia);
      return createSuccessResult(noticia);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al crear la noticia',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 