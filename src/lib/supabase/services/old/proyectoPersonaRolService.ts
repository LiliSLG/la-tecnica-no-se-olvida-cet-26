import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type ProyectoPersonaRol = Database['public']['Tables']['proyecto_persona_rol']['Row'] & { id: string };
type CreateProyectoPersonaRol = Database['public']['Tables']['proyecto_persona_rol']['Insert'];
type UpdateProyectoPersonaRol = Database['public']['Tables']['proyecto_persona_rol']['Update'];

export class ProyectoPersonaRolService extends BaseService<ProyectoPersonaRol> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, { tableName: 'proyecto_persona_rol' });
  }

  protected handleError(error: unknown, context: { operation: string; [key: string]: any }): ValidationError {
    if (error instanceof Error) {
      return {
        name: 'ServiceError',
        message: error.message,
        code: 'DB_ERROR',
        source: 'ProyectoPersonaRolService',
        details: { ...context, error }
      };
    }
    return {
      name: 'ServiceError',
      message: 'An unexpected error occurred',
      code: 'DB_ERROR',
      source: 'ProyectoPersonaRolService',
      details: { ...context, error }
    };
  }

  protected validateCreateInput(data: CreateProyectoPersonaRol): ValidationError | null {
    if (!data.proyecto_id) {
      return mapValidationError('El ID del proyecto es requerido', 'proyecto_id', data.proyecto_id);
    }
    if (!data.persona_id) {
      return mapValidationError('El ID de la persona es requerido', 'persona_id', data.persona_id);
    }
    if (!data.rol) {
      return mapValidationError('El rol es requerido', 'rol', data.rol);
    }
    if (!this.isValidRol(data.rol)) {
      return mapValidationError('El rol no es válido', 'rol', data.rol);
    }
    return null;
  }

  protected validateUpdateInput(data: UpdateProyectoPersonaRol): ValidationError | null {
    if (data.rol && !this.isValidRol(data.rol)) {
      return mapValidationError('El rol no es válido', 'rol', data.rol);
    }
    return null;
  }

  private isValidRol(rol: string): boolean {
    const validRoles = ['director', 'investigador', 'colaborador', 'estudiante'];
    return validRoles.includes(rol);
  }

  async addPersonaToProyecto(
    proyectoId: string,
    personaId: string,
    rol: 'director' | 'investigador' | 'colaborador' | 'estudiante'
  ): Promise<ServiceResult<ProyectoPersonaRol | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Person ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      if (!rol) {
        return createError({
          name: 'ValidationError',
          message: 'Role is required',
          code: 'VALIDATION_ERROR',
          details: { rol }
        });
      }

      if (!this.isValidRol(rol)) {
        return createError({
          name: 'ValidationError',
          message: 'Invalid role',
          code: 'VALIDATION_ERROR',
          details: { rol }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert({
          proyecto_id: proyectoId,
          persona_id: personaId,
          rol
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return createError({
            name: 'ValidationError',
            message: 'This person is already associated with this project',
            code: 'VALIDATION_ERROR',
            details: { proyectoId, personaId, rol }
          });
        }
        throw error;
      }

      if (!data) {
        return createError({
          name: 'ServiceError',
          message: 'Failed to add person to project',
          code: 'DB_ERROR',
          details: { proyectoId, personaId, rol }
        });
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

  async removePersonaFromProyecto(
    proyectoId: string,
    personaId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Person ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId);

      if (error) throw error;

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

  async updatePersonaRol(
    proyectoId: string,
    personaId: string,
    rol: 'director' | 'investigador' | 'colaborador' | 'estudiante'
  ): Promise<ServiceResult<ProyectoPersonaRol | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Person ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      if (!rol) {
        return createError({
          name: 'ValidationError',
          message: 'Role is required',
          code: 'VALIDATION_ERROR',
          details: { rol }
        });
      }

      if (!this.isValidRol(rol)) {
        return createError({
          name: 'ValidationError',
          message: 'Invalid role',
          code: 'VALIDATION_ERROR',
          details: { rol }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({ rol })
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Person not found in project',
            code: 'VALIDATION_ERROR',
            details: { proyectoId, personaId }
          });
        }
        throw error;
      }

      if (!data) {
        return createError({
          name: 'ValidationError',
          message: 'Person not found in project',
          code: 'VALIDATION_ERROR',
          details: { proyectoId, personaId }
        });
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

  async getPersonasByProyecto(
    proyectoId: string
  ): Promise<ServiceResult<ProyectoPersonaRol[] | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

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

  async getProyectosByPersona(
    personaId: string
  ): Promise<ServiceResult<ProyectoPersonaRol[] | null>> {
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

  async getPersonaRol(
    proyectoId: string,
    personaId: string
  ): Promise<ServiceResult<ProyectoPersonaRol | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

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
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createSuccess(null);
        }
        throw error;
      }

      if (!data) return createSuccess(null);

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

  async create(data: Omit<ProyectoPersonaRol, 'id'>): Promise<ServiceResult<ProyectoPersonaRol | null>> {
    // Ensure required fields are not undefined
    const createData: Omit<ProyectoPersonaRol, 'id'> = {
      proyecto_id: data.proyecto_id,
      persona_id: data.persona_id,
      rol: data.rol,
    };
    return super.create(createData);
  }
} 