import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { RelationshipService } from './relationshipService';
import { ServiceResult } from '../types/service';

type Tema = Database['public']['Tables']['temas']['Row'];

export class ProyectoTemaService extends RelationshipService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'proyecto_tema', 'proyecto_id', 'tema_id');
  }

  async getTemasWithDetails(proyectoId: string): Promise<ServiceResult<Tema[]>> {
    try {
      const { data, error } = await this.supabase
        .from('temas')
        .select(`
          *,
          proyecto_tema!inner(proyecto_id)
        `)
        .eq('proyecto_tema.proyecto_id', proyectoId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getProyectosByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('proyectos')
        .select(`
          *,
          proyecto_tema!inner(tema_id)
        `)
        .eq('proyecto_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async addTemaToProyecto(proyectoId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.addRelationship(proyectoId, temaId);
  }

  async removeTemaFromProyecto(proyectoId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.removeRelationship(proyectoId, temaId);
  }

  async getProyectoTemas(proyectoId: string): Promise<ServiceResult<string[]>> {
    return this.getRelationships(proyectoId);
  }

  async hasTema(proyectoId: string, temaId: string): Promise<ServiceResult<boolean>> {
    return this.hasRelationship(proyectoId, temaId);
  }

  async countProyectoTemas(proyectoId: string): Promise<ServiceResult<number>> {
    return this.countRelationships(proyectoId);
  }
} 