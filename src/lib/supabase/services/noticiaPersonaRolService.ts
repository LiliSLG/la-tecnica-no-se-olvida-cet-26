import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type NoticiaPersonaRol = Database['public']['Tables']['noticia_persona_rol']['Row'] & { id: string };
type CreateNoticiaPersonaRol = Database['public']['Tables']['noticia_persona_rol']['Insert'];
type UpdateNoticiaPersonaRol = Database['public']['Tables']['noticia_persona_rol']['Update'];
type Persona = Database['public']['Tables']['personas']['Row'];
type Noticia = Database['public']['Tables']['noticias']['Row'];

const VALID_ROLES = ['autor', 'editor', 'colaborador'] as const;
type ValidRole = typeof VALID_ROLES[number];

export class NoticiaPersonaRolService extends BaseService<NoticiaPersonaRol, 'noticia_persona_rol'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'noticia_persona_rol', {
      entityType: 'noticia',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateNoticiaPersonaRol): ValidationError | null {
    if (!data.noticia_id) {
      return mapValidationError('Noticia ID is required', 'noticia_id', data.noticia_id);
    }

    if (!data.persona_id) {
      return mapValidationError('Persona ID is required', 'persona_id', data.persona_id);
    }

    if (!data.rol) {
      return mapValidationError('Role is required', 'rol', data.rol);
    }

    if (!this.isValidRole(data.rol)) {
      return mapValidationError('Invalid role value', 'rol', data.rol);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateNoticiaPersonaRol): ValidationError | null {
    if (data.rol && !this.isValidRole(data.rol)) {
      return mapValidationError('Invalid role value', 'rol', data.rol);
    }

    return null;
  }

  private isValidRole(rol: string): rol is ValidRole {
    return VALID_ROLES.includes(rol as ValidRole);
  }

  async addPersonaToNoticia(noticiaId: string, personaId: string, rol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !personaId || !rol) {
        return createError({
          name: 'ValidationError',
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, personaId, rol }
        });
      }

      if (!this.isValidRole(rol)) {
        return createError({
          name: 'ValidationError',
          message: 'Invalid role value',
          code: 'VALIDATION_ERROR',
          details: { rol }
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

      // Check if persona exists
      const { data: persona, error: personaError } = await this.supabase
        .from('personas')
        .select('id')
        .eq('id', personaId)
        .single();

      if (personaError || !persona) {
        return createError({
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
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return createError({
          name: 'ValidationError',
          message: 'Relationship already exists',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, personaId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          noticia_id: noticiaId,
          persona_id: personaId,
          rol
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

  async removePersonaFromNoticia(noticiaId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Both noticiaId and personaId are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, personaId }
        });
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { noticiaId, personaId }
          });
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId);

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

  async updatePersonaRol(noticiaId: string, personaId: string, newRol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !personaId || !newRol) {
        return createError({
          name: 'ValidationError',
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, personaId, newRol }
        });
      }

      if (!this.isValidRole(newRol)) {
        return createError({
          name: 'ValidationError',
          message: 'Invalid role value',
          code: 'VALIDATION_ERROR',
          details: { newRol }
        });
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { noticiaId, personaId }
          });
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId);

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

  async getPersonasByNoticia(noticiaId: string): Promise<ServiceResult<Persona[] | null>> {
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
        .from('personas')
        .select(`
          *,
          noticia_persona_rol!inner(noticia_id, rol)
        `)
        .eq('noticia_persona_rol.noticia_id', noticiaId);

      if (error) throw error;
      return createSuccess(data as Persona[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getNoticiasByPersona(personaId: string): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!personaId) {
        return createError({
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
        return createError({
          name: 'ValidationError',
          message: 'Persona not found',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      const { data, error } = await this.supabase
        .from('noticias')
        .select(`
          *,
          noticia_persona_rol!inner(persona_id, rol)
        `)
        .eq('noticia_persona_rol.persona_id', personaId);

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

  async getByNoticia(noticiaId: string): Promise<ServiceResult<NoticiaPersonaRol[] | null>> {
    try {
      if (!noticiaId) {
        return createError({
          name: 'ValidationError',
          message: 'Noticia ID is required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId);

      if (error) throw error;
      return createSuccess(data as NoticiaPersonaRol[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByPersona(personaId: string): Promise<ServiceResult<NoticiaPersonaRol[] | null>> {
    try {
      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Persona ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('persona_id', personaId);

      if (error) throw error;
      return createSuccess(data as NoticiaPersonaRol[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByRol(rol: ValidRole): Promise<ServiceResult<NoticiaPersonaRol[] | null>> {
    try {
      if (!rol) {
        return createError({
          name: 'ValidationError',
          message: 'Role is required',
          code: 'VALIDATION_ERROR',
          details: { rol }
        });
      }

      if (!this.isValidRole(rol)) {
        return createError({
          name: 'ValidationError',
          message: 'Invalid role value',
          code: 'VALIDATION_ERROR',
          details: { rol }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('rol', rol);

      if (error) throw error;
      return createSuccess(data as NoticiaPersonaRol[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByNoticiaAndPersona(noticiaId: string, personaId: string): Promise<ServiceResult<NoticiaPersonaRol | null>> {
    try {
      if (!noticiaId || !personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Both noticiaId and personaId are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, personaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createSuccess(null);
        }
        throw error;
      }

      return createSuccess(data as NoticiaPersonaRol);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async updateRol(noticiaId: string, personaId: string, rol: ValidRole): Promise<ServiceResult<NoticiaPersonaRol | null>> {
    try {
      if (!noticiaId || !personaId || !rol) {
        return createError({
          name: 'ValidationError',
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, personaId, rol }
        });
      }

      if (!this.isValidRole(rol)) {
        return createError({
          name: 'ValidationError',
          message: 'Invalid role value',
          code: 'VALIDATION_ERROR',
          details: { rol }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({ rol })
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { noticiaId, personaId }
          });
        }
        throw error;
      }

      return createSuccess(data as NoticiaPersonaRol);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async deleteByNoticia(noticiaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId) {
        return createError({
          name: 'ValidationError',
          message: 'Noticia ID is required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('noticia_id', noticiaId);

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

  async deleteByPersona(personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Persona ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('persona_id', personaId);

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
} 