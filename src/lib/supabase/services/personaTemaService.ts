import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { CacheableServiceConfig } from './cacheableService';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type PersonaTema = Database['public']['Tables']['persona_tema']['Row'] & { id: string };
type CreatePersonaTema = Database['public']['Tables']['persona_tema']['Insert'];
type UpdatePersonaTema = Database['public']['Tables']['persona_tema']['Update'];

export class PersonaTemaService extends BaseService<PersonaTema, 'persona_tema'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'persona_tema' = 'persona_tema',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'persona', enableCache: true }
  ) {
    super(supabase, tableName, cacheConfig);
  }

  protected validateCreateInput(data: CreatePersonaTema): ValidationError | null {
    if (!data.persona_id) {
      return mapValidationError('El ID de la persona es requerido', 'persona_id', data.persona_id);
    }
    if (!data.tema_id) {
      return mapValidationError('El ID del tema es requerido', 'tema_id', data.tema_id);
    }
    return null;
  }

  protected validateUpdateInput(data: UpdatePersonaTema): ValidationError | null {
    if (data.persona_id === '') {
      return mapValidationError('El ID de la persona no puede estar vacío', 'persona_id', data.persona_id);
    }
    if (data.tema_id === '') {
      return mapValidationError('El ID del tema no puede estar vacío', 'tema_id', data.tema_id);
    }
    return null;
  }

  async addTemaToPersona(
    personaId: string,
    temaId: string
  ): Promise<ServiceResult<PersonaTema | null>> {
    try {
      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Person ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      if (!temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Theme ID is required',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert({
          persona_id: personaId,
          tema_id: temaId
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return createError({
            name: 'ValidationError',
            message: 'This theme is already associated with this person',
            code: 'VALIDATION_ERROR',
            details: { personaId, temaId }
          });
        }
        throw error;
      }

      if (!data) {
        return createError({
          name: 'ServiceError',
          message: 'Failed to add theme to person',
          code: 'DB_ERROR',
          details: { personaId, temaId }
        });
      }

      await this.setInCache(data.id, data);
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

  async removeTemaFromPersona(
    personaId: string,
    temaId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Person ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      if (!temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Theme ID is required',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('persona_id', personaId)
        .eq('tema_id', temaId);

      if (error) throw error;

      await this.invalidateCache(`${personaId}-${temaId}`);
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

  async getTemasByPersona(
    personaId: string
  ): Promise<ServiceResult<PersonaTema[] | null>> {
    try {
      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Person ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('persona_id', personaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      for (const item of data) {
        await this.setInCache(item.id, item);
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

  async getPersonasByTema(
    temaId: string
  ): Promise<ServiceResult<PersonaTema[] | null>> {
    try {
      if (!temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Theme ID is required',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('tema_id', temaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      for (const item of data) {
        await this.setInCache(item.id, item);
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

  async getPersonaTema(
    personaId: string,
    temaId: string
  ): Promise<ServiceResult<PersonaTema | null>> {
    try {
      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Person ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      if (!temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Theme ID is required',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('persona_id', personaId)
        .eq('tema_id', temaId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createSuccess(null);
        }
        throw error;
      }

      if (!data) return createSuccess(null);

      await this.setInCache(data.id, data);
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
} 