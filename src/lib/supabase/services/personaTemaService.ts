import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type PersonaTema = Database['public']['Tables']['persona_tema']['Row'] & { id: string };
type CreatePersonaTema = Database['public']['Tables']['persona_tema']['Insert'];

export class PersonaTemaService extends BaseService<PersonaTema, 'persona_tema'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'persona_tema', {
      entityType: 'persona',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreatePersonaTema): ValidationError | null {
    if (!data.persona_id) {
      return mapValidationError('Persona ID is required', 'persona_id', data.persona_id);
    }

    if (!data.tema_id) {
      return mapValidationError('Tema ID is required', 'tema_id', data.tema_id);
    }

    return null;
  }

  async addTemaToPersona(personaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!personaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both personaId and temaId are required', 'relationship', { personaId, temaId })
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

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('persona_id', personaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { personaId, temaId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          persona_id: personaId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addTemaToPersona', personaId, temaId }));
    }
  }

  async removeTemaFromPersona(personaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!personaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both personaId and temaId are required', 'relationship', { personaId, temaId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('persona_id', personaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { personaId, temaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('persona_id', personaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeTemaFromPersona', personaId, temaId }));
    }
  }

  async getTemasByPersona(personaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
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
        .from('temas')
        .select(`
          *,
          persona_tema!inner(persona_id)
        `)
        .eq('persona_tema.persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getTemasByPersona', personaId }));
    }
  }

  async getPersonasByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][]>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

      const { data, error } = await this.supabase
        .from('personas')
        .select(`
          *,
          persona_tema!inner(tema_id)
        `)
        .eq('persona_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonasByTema', temaId }));
    }
  }
} 