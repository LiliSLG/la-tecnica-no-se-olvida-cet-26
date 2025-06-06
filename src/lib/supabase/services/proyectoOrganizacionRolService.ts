import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { CacheableServiceConfig } from './cacheableService';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type ProyectoOrganizacionRol = Database['public']['Tables']['proyecto_organizacion_rol']['Row'] & { id: string };
type CreateProyectoOrganizacionRol = Database['public']['Tables']['proyecto_organizacion_rol']['Insert'];
type UpdateProyectoOrganizacionRol = Database['public']['Tables']['proyecto_organizacion_rol']['Update'];

export class ProyectoOrganizacionRolService extends BaseService<ProyectoOrganizacionRol, 'proyecto_organizacion_rol'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'proyecto_organizacion_rol' = 'proyecto_organizacion_rol',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'proyecto', enableCache: true }
  ) {
    super(supabase, tableName, cacheConfig);
  }

  protected validateCreateInput(data: CreateProyectoOrganizacionRol): ValidationError | null {
    if (!data.proyecto_id) {
      return mapValidationError('El ID del proyecto es requerido', 'proyecto_id', data.proyecto_id);
    }
    if (!data.organizacion_id) {
      return mapValidationError('El ID de la organización es requerido', 'organizacion_id', data.organizacion_id);
    }
    if (!data.rol) {
      return mapValidationError('El rol es requerido', 'rol', data.rol);
    }
    if (!this.isValidRol(data.rol)) {
      return mapValidationError('El rol no es válido', 'rol', data.rol);
    }
    return null;
  }

  protected validateUpdateInput(data: UpdateProyectoOrganizacionRol): ValidationError | null {
    if (data.rol && !this.isValidRol(data.rol)) {
      return mapValidationError('El rol no es válido', 'rol', data.rol);
    }
    return null;
  }

  private isValidRol(rol: string): boolean {
    const validRoles = ['patrocinador', 'colaborador', 'investigador', 'institucion'];
    return validRoles.includes(rol);
  }

  async addOrganizacionToProyecto(
    proyectoId: string,
    organizacionId: string,
    rol: 'patrocinador' | 'colaborador' | 'investigador' | 'institucion'
  ): Promise<ServiceResult<ProyectoOrganizacionRol | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organization ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
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
          organizacion_id: organizacionId,
          rol
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return createError({
            name: 'ValidationError',
            message: 'This organization is already associated with this project',
            code: 'VALIDATION_ERROR',
            details: { proyectoId, organizacionId, rol }
          });
        }
        throw error;
      }

      if (!data) {
        return createError({
          name: 'ServiceError',
          message: 'Failed to add organization to project',
          code: 'DB_ERROR',
          details: { proyectoId, organizacionId, rol }
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

  async removeOrganizacionFromProyecto(
    proyectoId: string,
    organizacionId: string
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

      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organization ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;

      await this.invalidateCache(`${proyectoId}-${organizacionId}`);
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

  async updateOrganizacionRol(
    proyectoId: string,
    organizacionId: string,
    rol: 'patrocinador' | 'colaborador' | 'investigador' | 'institucion'
  ): Promise<ServiceResult<ProyectoOrganizacionRol | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organization ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
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
        .eq('organizacion_id', organizacionId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Organization not found in project',
            code: 'VALIDATION_ERROR',
            details: { proyectoId, organizacionId }
          });
        }
        throw error;
      }

      if (!data) {
        return createError({
          name: 'ValidationError',
          message: 'Organization not found in project',
          code: 'VALIDATION_ERROR',
          details: { proyectoId, organizacionId }
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

  async getOrganizacionesByProyecto(
    proyectoId: string
  ): Promise<ServiceResult<ProyectoOrganizacionRol[] | null>> {
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

  async getProyectosByOrganizacion(
    organizacionId: string
  ): Promise<ServiceResult<ProyectoOrganizacionRol[] | null>> {
    try {
      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organization ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('organizacion_id', organizacionId)
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

  async getOrganizacionRol(
    proyectoId: string,
    organizacionId: string
  ): Promise<ServiceResult<ProyectoOrganizacionRol | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Project ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organization ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId)
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