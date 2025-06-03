import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type ProyectoOrganizacionRol = Database['public']['Tables']['proyecto_organizacion_rol']['Row'];
type CreateProyectoOrganizacionRol = Database['public']['Tables']['proyecto_organizacion_rol']['Insert'];

const VALID_ROLES = ['patrocinador', 'colaborador', 'investigador', 'institucion'];

export class ProyectoOrganizacionRolService extends BaseService<ProyectoOrganizacionRol, CreateProyectoOrganizacionRol, never> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'proyecto_organizacion_rol', supabase });
  }

  protected validateCreateInput(data: CreateProyectoOrganizacionRol): ValidationError | null {
    if (!data.proyecto_id) {
      return mapValidationError('Proyecto ID is required', 'proyecto_id', data.proyecto_id);
    }

    if (!data.organizacion_id) {
      return mapValidationError('Organizacion ID is required', 'organizacion_id', data.organizacion_id);
    }

    if (!data.rol) {
      return mapValidationError('Role is required', 'rol', data.rol);
    }

    if (!VALID_ROLES.includes(data.rol)) {
      return mapValidationError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 'rol', data.rol);
    }

    return null;
  }

  async addOrganizacionToProyecto(proyectoId: string, organizacionId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !organizacionId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { proyectoId, organizacionId, rol })
        );
      }

      if (!VALID_ROLES.includes(rol)) {
        return this.createErrorResult(
          mapValidationError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 'rol', rol)
        );
      }

      // Check if proyecto exists
      const { data: proyecto, error: proyectoError } = await this.supabase
        .from('proyectos')
        .select('id')
        .eq('id', proyectoId)
        .single();

      if (proyectoError || !proyecto) {
        return this.createErrorResult(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      // Check if organizacion exists
      const { data: organizacion, error: organizacionError } = await this.supabase
        .from('organizaciones')
        .select('id')
        .eq('id', organizacionId)
        .single();

      if (organizacionError || !organizacion) {
        return this.createErrorResult(
          mapValidationError('Organizacion not found', 'organizacionId', organizacionId)
        );
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { proyectoId, organizacionId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          proyecto_id: proyectoId,
          organizacion_id: organizacionId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addOrganizacionToProyecto', proyectoId, organizacionId, rol }));
    }
  }

  async removeOrganizacionFromProyecto(proyectoId: string, organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !organizacionId) {
        return this.createErrorResult(
          mapValidationError('Both proyectoId and organizacionId are required', 'relationship', { proyectoId, organizacionId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { proyectoId, organizacionId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeOrganizacionFromProyecto', proyectoId, organizacionId }));
    }
  }

  async updateOrganizacionRol(proyectoId: string, organizacionId: string, newRol: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !organizacionId || !newRol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { proyectoId, organizacionId, newRol })
        );
      }

      if (!VALID_ROLES.includes(newRol)) {
        return this.createErrorResult(
          mapValidationError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 'rol', newRol)
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { proyectoId, organizacionId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'updateOrganizacionRol', proyectoId, organizacionId, newRol }));
    }
  }

  async getOrganizacionesByProyecto(proyectoId: string): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][] | null>> {
    try {
      if (!proyectoId) {
        return this.createErrorResult(
          mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId)
        );
      }

      // Check if proyecto exists
      const { data: proyecto, error: proyectoError } = await this.supabase
        .from('proyectos')
        .select('id')
        .eq('id', proyectoId)
        .single();

      if (proyectoError || !proyecto) {
        return this.createErrorResult(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      const { data, error } = await this.supabase
        .from('organizaciones')
        .select(`
          *,
          proyecto_organizacion_rol!inner(proyecto_id, rol)
        `)
        .eq('proyecto_organizacion_rol.proyecto_id', proyectoId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getOrganizacionesByProyecto', proyectoId }));
    }
  }

  async getProyectosByOrganizacion(organizacionId: string): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][]>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }

      // Check if organizacion exists
      const { data: organizacion, error: organizacionError } = await this.supabase
        .from('organizaciones')
        .select('id')
        .eq('id', organizacionId)
        .single();

      if (organizacionError || !organizacion) {
        return this.createErrorResult(
          mapValidationError('Organizacion not found', 'organizacionId', organizacionId)
        );
      }

      const { data, error } = await this.supabase
        .from('proyectos')
        .select(`
          *,
          proyecto_organizacion_rol!inner(organizacion_id, rol)
        `)
        .eq('proyecto_organizacion_rol.organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getProyectosByOrganizacion', organizacionId }));
    }
  }
} 