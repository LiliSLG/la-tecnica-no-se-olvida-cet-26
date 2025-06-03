import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';

type Proyecto = Database['public']['Tables']['proyectos']['Row'];
type CreateProyecto = Database['public']['Tables']['proyectos']['Insert'];
type UpdateProyecto = Database['public']['Tables']['proyectos']['Update'];

export class ProyectosService extends BaseService<Proyecto, CreateProyecto, UpdateProyecto> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'proyectos', supabase });
  }

  // Proyecto-specific methods
  async getByStatus(status: Database['public']['Enums']['project_status']): Promise<ServiceResult<Proyecto[]>> {
    return this.getAll({
      filters: { status }
    });
  }

  async getByTema(temaId: string): Promise<ServiceResult<Proyecto[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          proyecto_tema!inner(tema_id)
        `)
        .eq('proyecto_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data as Proyecto[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getByPersona(personaId: string): Promise<ServiceResult<Proyecto[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          proyecto_persona_rol!inner(persona_id)
        `)
        .eq('proyecto_persona_rol.persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(data as Proyecto[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getByOrganizacion(organizacionId: string): Promise<ServiceResult<Proyecto[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          proyecto_organizacion_rol!inner(organizacion_id)
        `)
        .eq('proyecto_organizacion_rol.organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(data as Proyecto[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async addTema(proyectoId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('proyecto_tema')
        .insert({
          proyecto_id: proyectoId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async removeTema(proyectoId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('proyecto_tema')
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getTemas(proyectoId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
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
      return this.createErrorResult(this.handleError(error));
    }
  }

  async addPersona(proyectoId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('proyecto_persona_rol')
        .insert({
          proyecto_id: proyectoId,
          persona_id: personaId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async removePersona(proyectoId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('proyecto_persona_rol')
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getPersonas(proyectoId: string): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('personas')
        .select(`
          *,
          proyecto_persona_rol!inner(proyecto_id)
        `)
        .eq('proyecto_persona_rol.proyecto_id', proyectoId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async addOrganizacion(proyectoId: string, organizacionId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('proyecto_organizacion_rol')
        .insert({
          proyecto_id: proyectoId,
          organizacion_id: organizacionId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async removeOrganizacion(proyectoId: string, organizacionId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from('proyecto_organizacion_rol')
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  async getOrganizaciones(proyectoId: string): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('organizaciones')
        .select(`
          *,
          proyecto_organizacion_rol!inner(proyecto_id)
        `)
        .eq('proyecto_organizacion_rol.proyecto_id', proyectoId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }

  // Override search to include descripcion in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Proyecto[]>> {
    try {
      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`);

      if (!options?.includeDeleted) {
        searchQuery = searchQuery.eq('esta_eliminado', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as Proyecto[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error));
    }
  }
} 