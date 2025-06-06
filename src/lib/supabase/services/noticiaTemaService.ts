import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type NoticiaTema = Database['public']['Tables']['noticia_tema']['Row'] & { id: string };
type CreateNoticiaTema = Database['public']['Tables']['noticia_tema']['Insert'];
type Tema = Database['public']['Tables']['temas']['Row'];
type Noticia = Database['public']['Tables']['noticias']['Row'];

export class NoticiaTemaService extends BaseService<NoticiaTema, 'noticia_tema'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'noticia_tema', {
      entityType: 'noticia',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateNoticiaTema): ValidationError | null {
    if (!data.noticia_id) {
      return mapValidationError('Noticia ID is required', 'noticia_id', data.noticia_id);
    }

    if (!data.tema_id) {
      return mapValidationError('Tema ID is required', 'tema_id', data.tema_id);
    }

    return null;
  }

  async addTemaToNoticia(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Both noticiaId and temaId are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, temaId }
        });
      }

      // Check if noticia exists
      const { data: noticia, error: noticiaError } = await this.supabase
        .from('noticias')
        .select('id')
        .eq('id', noticiaId)
        .single();

      if (noticiaError || !noticia) {
        return createError({
          name: 'ValidationError',
          message: 'Noticia not found',
          code: 'VALIDATION_ERROR',
          details: { noticiaId }
        });
      }

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return createError({
          name: 'ValidationError',
          message: 'Tema not found',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return createError({
          name: 'ValidationError',
          message: 'Relationship already exists',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, temaId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          noticia_id: noticiaId,
          tema_id: temaId
        });

      if (error) throw error;
      return createSuccess(undefined);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async removeTemaFromNoticia(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Both noticiaId and temaId are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, temaId }
        });
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { noticiaId, temaId }
          });
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return createSuccess(undefined);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getTemasByNoticia(noticiaId: string): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!noticiaId) {
        return createError({
          name: 'ValidationError',
          message: 'Noticia ID is required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId }
        });
      }

      // Check if noticia exists
      const { data: noticia, error: noticiaError } = await this.supabase
        .from('noticias')
        .select('id')
        .eq('id', noticiaId)
        .single();

      if (noticiaError || !noticia) {
        return createError({
          name: 'ValidationError',
          message: 'Noticia not found',
          code: 'VALIDATION_ERROR',
          details: { noticiaId }
        });
      }

      const { data, error } = await this.supabase
        .from('temas')
        .select(`
          *,
          noticia_tema!inner(noticia_id)
        `)
        .eq('noticia_tema.noticia_id', noticiaId);

      if (error) throw error;
      return createSuccess(data as Tema[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getNoticiasByTema(temaId: string): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Tema ID is required',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return createError({
          name: 'ValidationError',
          message: 'Tema not found',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      const { data, error } = await this.supabase
        .from('noticias')
        .select(`
          *,
          noticia_tema!inner(tema_id)
        `)
        .eq('noticia_tema.tema_id', temaId);

      if (error) throw error;
      return createSuccess(data as Noticia[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 