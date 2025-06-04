import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type EntrevistaOrganizacionRol = Database['public']['Tables']['entrevista_organizacion_rol']['Row'] & { id: string };
type CreateEntrevistaOrganizacionRol = Database['public']['Tables']['entrevista_organizacion_rol']['Insert'];

const VALID_ROLES = ['patrocinador', 'organizador', 'colaborador'] as const;
type ValidRole = typeof VALID_ROLES[number];

export class EntrevistaOrganizacionRolService extends BaseService<EntrevistaOrganizacionRol, 'entrevista_organizacion_rol'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'entrevista_organizacion_rol', {
      entityType: 'entrevista',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateEntrevistaOrganizacionRol): ValidationError | null {
    if (!data.entrevista_id) {
      return mapValidationError('Entrevista ID is required', 'entrevista_id', data.entrevista_id);
    }

    if (!data.organizacion_id) {
      return mapValidationError('Organizacion ID is required', 'organizacion_id', data.organizacion_id);
    }

    if (!data.rol) {
      return mapValidationError('Role is required', 'rol', data.rol);
    }

    if (!VALID_ROLES.includes(data.rol as ValidRole)) {
      return mapValidationError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 'rol', data.rol);
    }

    return null;
  }

  async addOrganizacionToEntrevista(entrevistaId: string, organizacionId: string, rol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !organizacionId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { entrevistaId, organizacionId, rol })
        );
      }

      if (!VALID_ROLES.includes(rol)) {
        return this.createErrorResult(
          mapValidationError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 'rol', rol)
        );
      }

      // Check if entrevista exists
      const { data: entrevista, error: entrevistaError } = await this.supabase
        .from('entrevistas')
        .select('id')
        .eq('id', entrevistaId)
        .single();

      if (entrevistaError || !entrevista) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
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
        .eq('entrevista_id', entrevistaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { entrevistaId, organizacionId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          entrevista_id: entrevistaId,
          organizacion_id: organizacionId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addOrganizacionToEntrevista', entrevistaId, organizacionId, rol }));
    }
  }

  async removeOrganizacionFromEntrevista(entrevistaId: string, organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !organizacionId) {
        return this.createErrorResult(
          mapValidationError('Both entrevistaId and organizacionId are required', 'relationship', { entrevistaId, organizacionId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('entrevista_id', entrevistaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { entrevistaId, organizacionId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeOrganizacionFromEntrevista', entrevistaId, organizacionId }));
    }
  }

  async updateOrganizacionRol(entrevistaId: string, organizacionId: string, newRol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !organizacionId || !newRol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { entrevistaId, organizacionId, newRol })
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
        .eq('entrevista_id', entrevistaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { entrevistaId, organizacionId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('entrevista_id', entrevistaId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'updateOrganizacionRol', entrevistaId, organizacionId, newRol }));
    }
  }

  async getOrganizacionesByEntrevista(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][]>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }

      // Check if entrevista exists
      const { data: entrevista, error: entrevistaError } = await this.supabase
        .from('entrevistas')
        .select('id')
        .eq('id', entrevistaId)
        .single();

      if (entrevistaError || !entrevista) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { data, error } = await this.supabase
        .from('organizaciones')
        .select(`
          *,
          entrevista_organizacion_rol!inner(entrevista_id, rol)
        `)
        .eq('entrevista_organizacion_rol.entrevista_id', entrevistaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getOrganizacionesByEntrevista', entrevistaId }));
    }
  }

  async getEntrevistasByOrganizacion(organizacionId: string): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][]>> {
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
        .from('entrevistas')
        .select(`
          *,
          entrevista_organizacion_rol!inner(organizacion_id, rol)
        `)
        .eq('entrevista_organizacion_rol.organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getEntrevistasByOrganizacion', organizacionId }));
    }
  }
} 