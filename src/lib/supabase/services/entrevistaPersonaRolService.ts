import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { RelationshipService } from './relationshipService';
import { ServiceResult } from '../types/service';

type Persona = Database['public']['Tables']['personas']['Row'];
type EntrevistaPersonaRol = {
  entrevista_id: string;
  persona_id: string;
  rol: string;
};

export class EntrevistaPersonaRolService extends RelationshipService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'entrevista_persona_rol', 'entrevista_id', 'persona_id');
  }

  async getPersonasWithRoles(entrevistaId: string): Promise<ServiceResult<(Persona & { rol: string })[]>> {
    try {
      const { data, error } = await this.supabase
        .from('personas')
        .select(`
          *,
          entrevista_persona_rol!inner(entrevista_id, rol)
        `)
        .eq('entrevista_persona_rol.entrevista_id', entrevistaId);

      if (error) throw error;
      const personasWithRoles = data.map(persona => ({
        ...persona,
        rol: (persona.entrevista_persona_rol as EntrevistaPersonaRol).rol
      }));
      return this.createSuccessResult(personasWithRoles);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getEntrevistasByPersona(personaId: string): Promise<ServiceResult<(Database['public']['Tables']['entrevistas']['Row'] & { rol: string })[]>> {
    try {
      const { data, error } = await this.supabase
        .from('entrevistas')
        .select(`
          *,
          entrevista_persona_rol!inner(persona_id, rol)
        `)
        .eq('entrevista_persona_rol.persona_id', personaId);

      if (error) throw error;
      const entrevistasWithRoles = data.map(entrevista => ({
        ...entrevista,
        rol: (entrevista.entrevista_persona_rol as EntrevistaPersonaRol).rol
      }));
      return this.createSuccessResult(entrevistasWithRoles);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async addPersonaToEntrevista(entrevistaId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.junctionTable)
        .insert({
          entrevista_id: entrevistaId,
          persona_id: personaId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async updatePersonaRol(entrevistaId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.junctionTable)
        .update({ rol })
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async removePersonaFromEntrevista(entrevistaId: string, personaId: string): Promise<ServiceResult<void>> {
    return this.removeRelationship(entrevistaId, personaId);
  }

  async getPersonaRoles(entrevistaId: string): Promise<ServiceResult<{ persona_id: string; rol: string }[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.junctionTable)
        .select('persona_id, rol')
        .eq('entrevista_id', entrevistaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async hasPersona(entrevistaId: string, personaId: string): Promise<ServiceResult<boolean>> {
    return this.hasRelationship(entrevistaId, personaId);
  }

  async countEntrevistaPersonas(entrevistaId: string): Promise<ServiceResult<number>> {
    return this.countRelationships(entrevistaId);
  }
} 