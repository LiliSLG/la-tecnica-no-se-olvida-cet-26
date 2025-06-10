import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { CacheableService } from './cacheableService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type EntrevistaTema = Database['public']['Tables']['entrevista_tema']['Row'] & { id: string };
type CreateEntrevistaTema = Database['public']['Tables']['entrevista_tema']['Insert'];

export class EntrevistaTemaService extends CacheableService<EntrevistaTema> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, {
      entityType: 'entrevista',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected handleError(error: unknown, context: { operation: string; [key: string]: any }): ValidationError {
    if (error instanceof Error) {
      return {
        name: 'ServiceError',
        message: error.message,
        code: 'DB_ERROR',
        source: 'EntrevistaTemaService',
        details: { ...context, error }
      };
    }
    return {
      name: 'ServiceError',
      message: 'An unexpected error occurred',
      code: 'DB_ERROR',
      source: 'EntrevistaTemaService',
      details: { ...context, error }
    };
  }

  protected validateCreateInput(data: CreateEntrevistaTema): ValidationError | null {
    if (!data.entrevista_id) {
      return mapValidationError('Entrevista ID is required', 'entrevista_id', data.entrevista_id);
    }

    if (!data.tema_id) {
      return mapValidationError('Tema ID is required', 'tema_id', data.tema_id);
    }

    return null;
  }

  async create(data: Omit<EntrevistaTema, 'id'>): Promise<ServiceResult<EntrevistaTema | null>> {
    // Ensure required fields are not undefined
    const createData: Omit<EntrevistaTema, 'id'> = {
      entrevista_id: data.entrevista_id,
      tema_id: data.tema_id,
    };
    return super.create(createData);
  }

  async addTemaToEntrevista(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !temaId) {
        return createError<void>({
          name: 'ValidationError',
          message: 'Both entrevistaId and temaId are required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId, temaId }
        });
      }

      // Check if entrevista exists
      const { data: entrevista, error: entrevistaError } = await this.supabase
        .from('entrevistas')
        .select('id')
        .eq('id', entrevistaId)
        .single();

      if (entrevistaError || !entrevista) {
        return createError<void>({
          name: 'ValidationError',
          message: 'Entrevista not found',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId }
        });
      }

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return createError<void>({
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
        .eq('entrevista_id', entrevistaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return createError<void>({
          name: 'ValidationError',
          message: 'Relationship already exists',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId, temaId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          entrevista_id: entrevistaId,
          tema_id: temaId
        });

      if (error) throw error;
      return createSuccess(undefined);
    } catch (error) {
      return createError<void>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async removeTemaFromEntrevista(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !temaId) {
        return createError<void>({
          name: 'ValidationError',
          message: 'Both entrevistaId and temaId are required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId, temaId }
        });
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('entrevista_id', entrevistaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError<void>({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { entrevistaId, temaId }
          });
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return createSuccess(undefined);
    } catch (error) {
      return createError<void>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getTemasByEntrevista(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][] | null>> {
    try {
      if (!entrevistaId) {
        return createError<Database['public']['Tables']['temas']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Entrevista ID is required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId }
        });
      }

      // Check if entrevista exists
      const { data: entrevista, error: entrevistaError } = await this.supabase
        .from('entrevistas')
        .select('id')
        .eq('id', entrevistaId)
        .single();

      if (entrevistaError || !entrevista) {
        return createError<Database['public']['Tables']['temas']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Entrevista not found',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId }
        });
      }

      const { data, error } = await this.supabase
        .from('temas')
        .select(`
          *,
          entrevista_tema!inner(entrevista_id)
        `)
        .eq('entrevista_tema.entrevista_id', entrevistaId);

      if (error) throw error;
      return createSuccess(data || null);
    } catch (error) {
      return createError<Database['public']['Tables']['temas']['Row'][] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getEntrevistasByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError<Database['public']['Tables']['entrevistas']['Row'][] | null>({
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
        return createError<Database['public']['Tables']['entrevistas']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Tema not found',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      const { data, error } = await this.supabase
        .from('entrevistas')
        .select(`
          *,
          entrevista_tema!inner(tema_id)
        `)
        .eq('entrevista_tema.tema_id', temaId);

      if (error) throw error;
      return createSuccess(data || null);
    } catch (error) {
      return createError<Database['public']['Tables']['entrevistas']['Row'][] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
} 