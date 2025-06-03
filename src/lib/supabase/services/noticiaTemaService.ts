import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { RelationshipService } from './relationshipService';
import { ServiceResult } from '../types/service';

type Tema = Database['public']['Tables']['temas']['Row'];

export class NoticiaTemaService extends RelationshipService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'noticia_tema', 'noticia_id', 'tema_id');
  }

  async getTemasWithDetails(noticiaId: string): Promise<ServiceResult<Tema[]>> {
    try {
      const { data, error } = await this.supabase
        .from('temas')
        .select(`
          *,
          noticia_tema!inner(noticia_id)
        `)
        .eq('noticia_tema.noticia_id', noticiaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getNoticiasByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['noticias']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('noticias')
        .select(`
          *,
          noticia_tema!inner(tema_id)
        `)
        .eq('noticia_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async addTemaToNoticia(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.addRelationship(noticiaId, temaId);
  }

  async removeTemaFromNoticia(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    return this.removeRelationship(noticiaId, temaId);
  }

  async getNoticiaTemas(noticiaId: string): Promise<ServiceResult<string[]>> {
    return this.getRelationships(noticiaId);
  }

  async hasTema(noticiaId: string, temaId: string): Promise<ServiceResult<boolean>> {
    return this.hasRelationship(noticiaId, temaId);
  }

  async countNoticiaTemas(noticiaId: string): Promise<ServiceResult<number>> {
    return this.countRelationships(noticiaId);
  }
} 