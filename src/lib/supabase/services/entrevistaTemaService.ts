import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { RelationshipService } from './relationshipService';
import { ServiceResult } from '../types/service';

type Tema = Database['public']['Tables']['temas']['Row'];

export class EntrevistaTemaService extends RelationshipService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'entrevista_tema', 'entrevista_id', 'tema_id');
  }

  async getTemasWithDetails(entrevistaId: string): Promise<ServiceResult<Tema[]>> {
    try {
      const { data, error } = await this.supabase
        .from('temas')
        .select(`
          *,
          entrevista_tema!inner(entrevista_id)
        `)
        .eq('entrevista_tema.entrevista_id', entrevistaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getEntrevistasByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('entrevistas')
        .select(`
          *,
          entrevista_tema!inner(tema_id)
        `)
        .eq('entrevista_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async addTemaToEntrevista(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.addRelationship(entrevistaId, temaId);
  }

  async removeTemaFromEntrevista(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.removeRelationship(entrevistaId, temaId);
  }

  async getEntrevistaTemas(entrevistaId: string): Promise<ServiceResult<string[]>> {
    return this.getRelationships(entrevistaId);
  }

  async hasTema(entrevistaId: string, temaId: string): Promise<ServiceResult<boolean>> {
    return this.hasRelationship(entrevistaId, temaId);
  }

  async countEntrevistaTemas(entrevistaId: string): Promise<ServiceResult<number>> {
    return this.countRelationships(entrevistaId);
  }
} 