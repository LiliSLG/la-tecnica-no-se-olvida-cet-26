import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';

type Noticia = Database['public']['Tables']['noticias']['Row'];
type CreateNoticia = Database['public']['Tables']['noticias']['Insert'];
type UpdateNoticia = Database['public']['Tables']['noticias']['Update'];

export class NoticiasService extends BaseService<Noticia, CreateNoticia, UpdateNoticia> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'noticias', supabase });
  }

  // Noticia-specific methods
  async getByTipo(tipo: Database['public']['Enums']['news_type']): Promise<ServiceResult<Noticia[]>> {
    return this.getAll({
      filters: { tipo }
    });
  }

  async getByTema(temaId: string): Promise<ServiceResult<Noticia[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          noticia_tema!inner(tema_id)
        `)
        .eq('noticia_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data as Noticia[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async addTema(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('noticia_tema')
        .insert({
          noticia_id: noticiaId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async removeTema(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('noticia_tema')
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getTemas(noticiaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
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
      return this.createErrorResult(this.handleError(error));
    }
  }

  // Override search to include contenido in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Noticia[]>> {
    try {
      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .or(`titulo.ilike.%${query}%,contenido.ilike.%${query}%`);

      if (!options?.includeDeleted) {
        searchQuery = searchQuery.eq('esta_eliminada', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as Noticia[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }
} 