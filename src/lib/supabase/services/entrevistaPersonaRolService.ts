import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type EntrevistaPersonaRol = Database['public']['Tables']['entrevista_persona_rol']['Row'] & { id: string };
type CreateEntrevistaPersonaRol = Database['public']['Tables']['entrevista_persona_rol']['Insert'];

const VALID_ROLES = ['entrevistador', 'entrevistado', 'moderador'] as const;
type ValidRole = typeof VALID_ROLES[number];

export class EntrevistaPersonaRolService extends BaseService<EntrevistaPersonaRol, 'entrevista_persona_rol'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'entrevista_persona_rol', {
      entityType: 'entrevista',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateEntrevistaPersonaRol): ValidationError | null {
    if (!data.entrevista_id) {
      return mapValidationError('Entrevista ID is required', 'entrevista_id', data.entrevista_id);
    }

    if (!data.persona_id) {
      return mapValidationError('Persona ID is required', 'persona_id', data.persona_id);
    }

    if (!data.rol) {
      return mapValidationError('Role is required', 'rol', data.rol);
    }

    if (!VALID_ROLES.includes(data.rol as ValidRole)) {
      return mapValidationError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 'rol', data.rol);
    }

    return null;
  }

  async addPersonaToEntrevista(entrevistaId: string, personaId: string, rol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !personaId || !rol) {
        return createError<void>({
          name: 'ValidationError',
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId, personaId, rol }
        });
      }

      if (!VALID_ROLES.includes(rol)) {
        return createError<void>({
          name: 'ValidationError',
          message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'VALIDATION_ERROR',
          details: { rol }
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

      // Check if persona exists
      const { data: persona, error: personaError } = await this.supabase
        .from('personas')
        .select('id')
        .eq('id', personaId)
        .single();

      if (personaError || !persona) {
        return createError<void>({
          name: 'ValidationError',
          message: 'Persona not found',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return createError<void>({
          name: 'ValidationError',
          message: 'Relationship already exists',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId, personaId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          entrevista_id: entrevistaId,
          persona_id: personaId,
          rol
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

  async removePersonaFromEntrevista(entrevistaId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !personaId) {
        return createError<void>({
          name: 'ValidationError',
          message: 'Both entrevistaId and personaId are required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId, personaId }
        });
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError<void>({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { entrevistaId, personaId }
          });
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId);

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

  async updatePersonaRol(entrevistaId: string, personaId: string, newRol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !personaId || !newRol) {
        return createError<void>({
          name: 'ValidationError',
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId, personaId, newRol }
        });
      }

      if (!VALID_ROLES.includes(newRol)) {
        return createError<void>({
          name: 'ValidationError',
          message: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`,
          code: 'VALIDATION_ERROR',
          details: { rol: newRol }
        });
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError<void>({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { entrevistaId, personaId }
          });
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId);

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

  async getPersonasByEntrevista(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
    try {
      if (!entrevistaId) {
        return createError<Database['public']['Tables']['personas']['Row'][] | null>({
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
        return createError<Database['public']['Tables']['personas']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Entrevista not found',
          code: 'VALIDATION_ERROR',
          details: { entrevistaId }
        });
      }

      const { data, error } = await this.supabase
        .from('personas')
        .select(`
          *,
          entrevista_persona_rol!inner(entrevista_id, rol)
        `)
        .eq('entrevista_persona_rol.entrevista_id', entrevistaId);

      if (error) throw error;
      return createSuccess(data || null);
    } catch (error) {
      return createError<Database['public']['Tables']['personas']['Row'][] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getEntrevistasByPersona(personaId: string): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][] | null>> {
    try {
      if (!personaId) {
        return createError<Database['public']['Tables']['entrevistas']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Persona ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      // Check if persona exists
      const { data: persona, error: personaError } = await this.supabase
        .from('personas')
        .select('id')
        .eq('id', personaId)
        .single();

      if (personaError || !persona) {
        return createError<Database['public']['Tables']['entrevistas']['Row'][] | null>({
          name: 'ValidationError',
          message: 'Persona not found',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      const { data, error } = await this.supabase
        .from('entrevistas')
        .select(`
          *,
          entrevista_persona_rol!inner(persona_id, rol)
        `)
        .eq('entrevista_persona_rol.persona_id', personaId);

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