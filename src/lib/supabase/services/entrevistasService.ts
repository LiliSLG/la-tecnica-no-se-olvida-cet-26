import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';

type Entrevista = Database['public']['Tables']['entrevistas']['Row'];
type CreateEntrevista = Database['public']['Tables']['entrevistas']['Insert'];
type UpdateEntrevista = Database['public']['Tables']['entrevistas']['Update'];

export class EntrevistasService extends BaseService<Entrevista, CreateEntrevista, UpdateEntrevista> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'entrevistas', supabase });
  }

  // Entrevista-specific methods
  async getByStatus(status: Database['public']['Enums']['interview_status']): Promise<ServiceResult<Entrevista[]>> {
    return this.getAll({
      filters: { status }
    });
  }

  async getByFecha(fecha: string): Promise<ServiceResult<Entrevista[]>> {
    return this.getAll({
      filters: { fecha_entrevista: fecha }
    });
  }

  async getByTema(temaId: string): Promise<ServiceResult<Entrevista[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          entrevista_tema!inner(tema_id)
        `)
        .eq('entrevista_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data as Entrevista[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async addTema(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('entrevista_tema')
        .insert({
          entrevista_id: entrevistaId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async removeTema(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('entrevista_tema')
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getTemas(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
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
      return this.createErrorResult(this.handleError(error));
    }
  }

  // Override search to include descripcion in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Entrevista[]>> {
    try {
      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`);

      if (!options?.includeDeleted) {
        searchQuery = searchQuery.eq('esta_eliminada', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as Entrevista[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }
} 