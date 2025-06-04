import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { RelationshipService } from '@/lib/supabase/services/relationshipService';
import { ServiceResult } from '../types/service';

type Tema = Database['public']['Tables']['temas']['Row'];

export class OrganizacionTemaService extends RelationshipService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'organizacion_tema', 'organizacion_id', 'tema_id');
  }

  async getTemasWithDetails(organizacionId: string): Promise<ServiceResult<Tema[]>> {
    try {
      const { data, error } = await this.supabase
        .from('temas')
        .select(`
          *,
          organizacion_tema!inner(organizacion_id)
        `)
        .eq('organizacion_tema.organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getOrganizacionesByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('organizaciones')
        .select(`
          *,
          organizacion_tema!inner(tema_id)
        `)
        .eq('organizacion_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async addTemaToOrganizacion(organizacionId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.addRelationship(organizacionId, temaId);
  }

  async removeTemaFromOrganizacion(organizacionId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.removeRelationship(organizacionId, temaId);
  }

  async getOrganizacionTemas(organizacionId: string): Promise<ServiceResult<string[]>> {
    return this.getRelationships(organizacionId);
  }

  async hasTema(organizacionId: string, temaId: string): Promise<ServiceResult<boolean>> {
    return this.hasRelationship(organizacionId, temaId);
  }

  async countOrganizacionTemas(organizacionId: string): Promise<ServiceResult<number>> {
    return this.countRelationships(organizacionId);
  }
} 