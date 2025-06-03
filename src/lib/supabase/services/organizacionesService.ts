import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';

type Organizacion = Database['public']['Tables']['organizaciones']['Row'];
type CreateOrganizacion = Database['public']['Tables']['organizaciones']['Insert'];
type UpdateOrganizacion = Database['public']['Tables']['organizaciones']['Update'];

export class OrganizacionesService extends BaseService<Organizacion, CreateOrganizacion, UpdateOrganizacion> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'organizaciones', supabase });
  }

  // Organizacion-specific methods
  async getByTema(temaId: string): Promise<ServiceResult<Organizacion[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          organizacion_tema!inner(tema_id)
        `)
        .eq('organizacion_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data as Organizacion[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async addTema(organizacionId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('organizacion_tema')
        .insert({
          organizacion_id: organizacionId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async removeTema(organizacionId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('organizacion_tema')
        .delete()
        .eq('organizacion_id', organizacionId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getTemas(organizacionId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
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
      return this.createErrorResult(this.handleError(error));
    }
  }

  // Override search to include descripcion in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Organizacion[]>> {
    try {
      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`);

      if (!options?.includeDeleted) {
        searchQuery = searchQuery.eq('esta_eliminada', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as Organizacion[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }
} 