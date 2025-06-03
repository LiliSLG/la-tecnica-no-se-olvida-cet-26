import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';

type Persona = Database['public']['Tables']['personas']['Row'];
type CreatePersona = Database['public']['Tables']['personas']['Insert'];
type UpdatePersona = Database['public']['Tables']['personas']['Update'];

export class PersonasService extends BaseService<Persona, CreatePersona, UpdatePersona> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'personas', supabase });
  }

  // Persona-specific methods
  async getByEmail(email: string): Promise<ServiceResult<Persona>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('email', email)
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as Persona);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getAdmins(): Promise<ServiceResult<Persona[]>> {
    return this.getAll({
      filters: { es_admin: true }
    });
  }

  async getByCategoria(categoria: string): Promise<ServiceResult<Persona[]>> {
    return this.getAll({
      filters: { categoria_principal: categoria }
    });
  }

  async getByCapacidad(capacidad: string): Promise<ServiceResult<Persona[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .contains('capacidades_plataforma', [capacidad]);

      if (error) throw error;
      return this.createSuccessResult(data as Persona[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getByTema(temaId: string): Promise<ServiceResult<Persona[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          persona_tema!inner(tema_id)
        `)
        .eq('persona_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data as Persona[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async addTema(personaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('persona_tema')
        .insert({
          persona_id: personaId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async removeTema(personaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('persona_tema')
        .delete()
        .eq('persona_id', personaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getTemas(personaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
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
      return this.createErrorResult(this.handleError(error));
    }
  }

  // Override search to include biografia in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Persona[]>> {
    try {
      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .or(`nombre.ilike.%${query}%,biografia.ilike.%${query}%`);

      if (!options?.includeDeleted) {
        searchQuery = searchQuery.eq('esta_eliminada', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as Persona[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }
} 