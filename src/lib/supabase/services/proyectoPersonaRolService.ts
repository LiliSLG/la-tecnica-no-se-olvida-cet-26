import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type ProyectoPersonaRol = Database['public']['Tables']['proyecto_persona_rol']['Row'];
type CreateProyectoPersonaRol = Database['public']['Tables']['proyecto_persona_rol']['Insert'];

const VALID_ROLES = ['director', 'investigador', 'colaborador', 'estudiante'];

export class ProyectoPersonaRolService extends BaseService<ProyectoPersonaRol, CreateProyectoPersonaRol, never> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'proyecto_persona_rol', supabase });
  }

  protected validateCreateInput(data: CreateProyectoPersonaRol): ValidationError | null {
    if (!data.proyecto_id) {
      return mapValidationError('Proyecto ID is required', 'proyecto_id', data.proyecto_id);
    }

    if (!data.persona_id) {
      return mapValidationError('Persona ID is required', 'persona_id', data.persona_id);
    }

    if (!data.rol) {
      return mapValidationError('Role is required', 'rol', data.rol);
    }

    if (!VALID_ROLES.includes(data.rol)) {
      return mapValidationError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 'rol', data.rol);
    }

    return null;
  }

  async addPersonaToProyecto(proyectoId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !personaId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { proyectoId, personaId, rol })
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

      // Check if persona exists
      const { data: persona, error: personaError } = await this.supabase
        .from('personas')
        .select('id')
        .eq('id', personaId)
        .single();

      if (personaError || !persona) {
        return this.createErrorResult(
          mapValidationError('Persona not found', 'personaId', personaId)
        );
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { proyectoId, personaId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          proyecto_id: proyectoId,
          persona_id: personaId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addPersonaToProyecto', proyectoId, personaId, rol }));
    }
  }

  async removePersonaFromProyecto(proyectoId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !personaId) {
        return this.createErrorResult(
          mapValidationError('Both proyectoId and personaId are required', 'relationship', { proyectoId, personaId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { proyectoId, personaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removePersonaFromProyecto', proyectoId, personaId }));
    }
  }

  async updatePersonaRol(proyectoId: string, personaId: string, newRol: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !personaId || !newRol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { proyectoId, personaId, newRol })
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
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { proyectoId, personaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'updatePersonaRol', proyectoId, personaId, newRol }));
    }
  }

  async getPersonasByProyecto(proyectoId: string): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
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
        .from('personas')
        .select(`
          *,
          proyecto_persona_rol!inner(proyecto_id, rol)
        `)
        .eq('proyecto_persona_rol.proyecto_id', proyectoId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonasByProyecto', proyectoId }));
    }
  }

  async getProyectosByPersona(personaId: string): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][]>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }

      // Check if persona exists
      const { data: persona, error: personaError } = await this.supabase
        .from('personas')
        .select('id')
        .eq('id', personaId)
        .single();

      if (personaError || !persona) {
        return this.createErrorResult(
          mapValidationError('Persona not found', 'personaId', personaId)
        );
      }

      const { data, error } = await this.supabase
        .from('proyectos')
        .select(`
          *,
          proyecto_persona_rol!inner(persona_id, rol)
        `)
        .eq('proyecto_persona_rol.persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getProyectosByPersona', personaId }));
    }
  }
} 