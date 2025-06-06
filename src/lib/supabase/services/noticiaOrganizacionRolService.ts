import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type NoticiaOrganizacionRol = Database['public']['Tables']['noticia_organizacion_rol']['Row'] & { id: string };
type CreateNoticiaOrganizacionRol = Database['public']['Tables']['noticia_organizacion_rol']['Insert'];
type UpdateNoticiaOrganizacionRol = Database['public']['Tables']['noticia_organizacion_rol']['Update'];
type Organizacion = Database['public']['Tables']['organizaciones']['Row'];
type Noticia = Database['public']['Tables']['noticias']['Row'];

const VALID_ROLES = ['editor', 'publicador', 'colaborador'] as const;
type ValidRole = typeof VALID_ROLES[number];

export class NoticiaOrganizacionRolService extends BaseService<NoticiaOrganizacionRol, 'noticia_organizacion_rol'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'noticia_organizacion_rol', {
      entityType: 'noticia',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateNoticiaOrganizacionRol): ValidationError | null {
    if (!data.noticia_id) {
      return mapValidationError('Noticia ID is required', 'noticia_id', data.noticia_id);
    }

    if (!data.organizacion_id) {
      return mapValidationError('Organizacion ID is required', 'organizacion_id', data.organizacion_id);
    }

    if (!data.rol) {
      return mapValidationError('Role is required', 'rol', data.rol);
    }

    if (!this.isValidRole(data.rol)) {
      return mapValidationError('Invalid role value', 'rol', data.rol);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateNoticiaOrganizacionRol): ValidationError | null {
    if (data.rol && !this.isValidRole(data.rol)) {
      return mapValidationError('Invalid role value', 'rol', data.rol);
    }

    return null;
  }

  private isValidRole(rol: string): rol is ValidRole {
    return VALID_ROLES.includes(rol as ValidRole);
  }

  async addOrganizacionToNoticia(noticiaId: string, organizacionId: string, rol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !organizacionId || !rol) {
        return createError({
          name: 'ValidationError',
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, organizacionId, rol }
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

      // Check if organizacion exists
      const { data: organizacion, error: organizacionError } = await this.supabase
        .from('organizaciones')
        .select('id')
        .eq('id', organizacionId)
        .single();

      if (organizacionError || !organizacion) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion not found',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return createError({
          name: 'ValidationError',
          message: 'Relationship already exists',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, organizacionId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          noticia_id: noticiaId,
          organizacion_id: organizacionId,
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

  async removeOrganizacionFromNoticia(noticiaId: string, organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Both noticiaId and organizacionId are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, organizacionId }
        });
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { noticiaId, organizacionId }
          });
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId);

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

  async updateOrganizacionRol(noticiaId: string, organizacionId: string, newRol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !organizacionId || !newRol) {
        return createError({
          name: 'ValidationError',
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, organizacionId, newRol }
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
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { noticiaId, organizacionId }
          });
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId);

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

  async getOrganizacionesByNoticia(noticiaId: string): Promise<ServiceResult<Organizacion[] | null>> {
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
        .from('organizaciones')
        .select(`
          *,
          noticia_organizacion_rol!inner(noticia_id, rol)
        `)
        .eq('noticia_organizacion_rol.noticia_id', noticiaId);

      if (error) throw error;
      return createSuccess(data as Organizacion[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getNoticiasByOrganizacion(organizacionId: string): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      // Check if organizacion exists
      const { data: organizacion, error: organizacionError } = await this.supabase
        .from('organizaciones')
        .select('id')
        .eq('id', organizacionId)
        .single();

      if (organizacionError || !organizacion) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion not found',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      const { data, error } = await this.supabase
        .from('noticias')
        .select(`
          *,
          noticia_organizacion_rol!inner(organizacion_id, rol)
        `)
        .eq('noticia_organizacion_rol.organizacion_id', organizacionId);

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

  async getByNoticia(noticiaId: string): Promise<ServiceResult<NoticiaOrganizacionRol[] | null>> {
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
      return createSuccess(data as NoticiaOrganizacionRol[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByOrganizacion(organizacionId: string): Promise<ServiceResult<NoticiaOrganizacionRol[] | null>> {
    try {
      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return createSuccess(data as NoticiaOrganizacionRol[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByRol(rol: ValidRole): Promise<ServiceResult<NoticiaOrganizacionRol[] | null>> {
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
      return createSuccess(data as NoticiaOrganizacionRol[]);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByNoticiaAndOrganizacion(noticiaId: string, organizacionId: string): Promise<ServiceResult<NoticiaOrganizacionRol | null>> {
    try {
      if (!noticiaId || !organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Both noticiaId and organizacionId are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, organizacionId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createSuccess(null);
        }
        throw error;
      }

      return createSuccess(data as NoticiaOrganizacionRol);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async updateRol(noticiaId: string, organizacionId: string, rol: ValidRole): Promise<ServiceResult<NoticiaOrganizacionRol | null>> {
    try {
      if (!noticiaId || !organizacionId || !rol) {
        return createError({
          name: 'ValidationError',
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId, organizacionId, rol }
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
        .eq('organizacion_id', organizacionId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Relationship does not exist',
            code: 'VALIDATION_ERROR',
            details: { noticiaId, organizacionId }
          });
        }
        throw error;
      }

      return createSuccess(data as NoticiaOrganizacionRol);
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

  async deleteByOrganizacion(organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('organizacion_id', organizacionId);

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