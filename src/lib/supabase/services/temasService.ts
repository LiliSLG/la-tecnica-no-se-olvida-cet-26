import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError, ErrorCode } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type Tema = Database['public']['Tables']['temas']['Row'];
type CreateTema = Database['public']['Tables']['temas']['Insert'];
type UpdateTema = Database['public']['Tables']['temas']['Update'];

export class TemasService extends BaseService<Tema, CreateTema, UpdateTema> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'temas', supabase });
  }

  protected validateCreateInput(data: CreateTema): ValidationError | null {
    if (!data.nombre) {
      return mapValidationError('Name is required', 'nombre', data.nombre);
    }

    if (!data.descripcion) {
      return mapValidationError('Description is required', 'descripcion', data.descripcion);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateTema): ValidationError | null {
    if (data.nombre === '') {
      return mapValidationError('Name cannot be empty', 'nombre', data.nombre);
    }

    if (data.descripcion === '') {
      return mapValidationError('Description cannot be empty', 'descripcion', data.descripcion);
    }

    return null;
  }

  // Tema-specific methods
  async getPersonas(temaId: string): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][]>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      const temaExists = await this.exists(temaId);
      if (!temaExists) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonas', temaId }));
    }
  }

  async getOrganizaciones(temaId: string): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][]>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      const temaExists = await this.exists(temaId);
      if (!temaExists) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getOrganizaciones', temaId }));
    }
  }

  async getProyectos(temaId: string): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][]>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      const temaExists = await this.exists(temaId);
      if (!temaExists) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getProyectos', temaId }));
    }
  }

  async getEntrevistas(temaId: string): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][]>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      const temaExists = await this.exists(temaId);
      if (!temaExists) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getEntrevistas', temaId }));
    }
  }

  async getNoticias(temaId: string): Promise<ServiceResult<Database['public']['Tables']['noticias']['Row'][]>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      const temaExists = await this.exists(temaId);
      if (!temaExists) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getNoticias', temaId }));
    }
  }

  // Override search to include descripcion in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Tema[]>> {
    try {
      if (!query) {
        return this.createErrorResult(
          mapValidationError('Search query is required', 'query', query)
        );
      }

      let searchQuery = this.supabase
        .from(this.tableName)
        .select()
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`);

      if (!options?.includeDeleted) {
        searchQuery = searchQuery.eq('esta_eliminado', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as Tema[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search', query, options }));
    }
  }
} 