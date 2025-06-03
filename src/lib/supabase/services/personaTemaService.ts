import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { RelationshipService } from './relationshipService';
import { ServiceResult } from '../types/service';

type Tema = Database['public']['Tables']['temas']['Row'];

export class PersonaTemaService extends RelationshipService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'persona_tema', 'persona_id', 'tema_id');
  }

  async getTemasWithDetails(personaId: string): Promise<ServiceResult<Tema[]>> {
    try {
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
      return this.createErrorResult(error);
    }
  }

  async getPersonasByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][]>> {
    try {
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
      return this.createErrorResult(error);
    }
  }

  async addTemaToPersona(personaId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.addRelationship(personaId, temaId);
  }

  async removeTemaFromPersona(personaId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.removeRelationship(personaId, temaId);
  }

  async getPersonaTemas(personaId: string): Promise<ServiceResult<string[]>> {
    return this.getRelationships(personaId);
  }

  async hasTema(personaId: string, temaId: string): Promise<ServiceResult<boolean>> {
    return this.hasRelationship(personaId, temaId);
  }

  async countPersonaTemas(personaId: string): Promise<ServiceResult<number>> {
    return this.countRelationships(personaId);
  }
} 