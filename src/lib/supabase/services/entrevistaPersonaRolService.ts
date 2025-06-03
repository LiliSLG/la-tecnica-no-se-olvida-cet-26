import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type EntrevistaPersonaRol = Database['public']['Tables']['entrevista_persona_rol']['Row'];
type CreateEntrevistaPersonaRol = Database['public']['Tables']['entrevista_persona_rol']['Insert'];

const VALID_ROLES = ['entrevistador', 'entrevistado', 'moderador'];

export class EntrevistaPersonaRolService extends BaseService<EntrevistaPersonaRol, CreateEntrevistaPersonaRol, never> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'entrevista_persona_rol', supabase });
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

    if (!VALID_ROLES.includes(data.rol)) {
      return mapValidationError(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 'rol', data.rol);
    }

    return null;
  }

  async addPersonaToEntrevista(entrevistaId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !personaId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { entrevistaId, personaId, rol })
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
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { entrevistaId, personaId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          entrevista_id: entrevistaId,
          persona_id: personaId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addPersonaToEntrevista', entrevistaId, personaId, rol }));
    }
  }

  async removePersonaFromEntrevista(entrevistaId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !personaId) {
        return this.createErrorResult(
          mapValidationError('Both entrevistaId and personaId are required', 'relationship', { entrevistaId, personaId })
        );
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
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { entrevistaId, personaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removePersonaFromEntrevista', entrevistaId, personaId }));
    }
  }

  async updatePersonaRol(entrevistaId: string, personaId: string, newRol: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !personaId || !newRol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { entrevistaId, personaId, newRol })
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
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { entrevistaId, personaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'updatePersonaRol', entrevistaId, personaId, newRol }));
    }
  }

  async getPersonasByEntrevista(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][]>> {
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
        .from('personas')
        .select(`
          *,
          entrevista_persona_rol!inner(entrevista_id, rol)
        `)
        .eq('entrevista_persona_rol.entrevista_id', entrevistaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonasByEntrevista', entrevistaId }));
    }
  }

  async getEntrevistasByPersona(personaId: string): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][]>> {
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
        .from('entrevistas')
        .select(`
          *,
          entrevista_persona_rol!inner(persona_id, rol)
        `)
        .eq('entrevista_persona_rol.persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getEntrevistasByPersona', personaId }));
    }
  }
} 