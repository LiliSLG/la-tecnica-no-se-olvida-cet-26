import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { createSuccessResult, createErrorResult } from '../types/serviceResult';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type Persona = Database['public']['Tables']['personas']['Row'];
type CreatePersona = Database['public']['Tables']['personas']['Insert'];
type UpdatePersona = Database['public']['Tables']['personas']['Update'];

export class PersonasService extends BaseService<Persona, 'personas'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'personas', {
      entityType: 'persona',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: Partial<Persona>): ValidationError | null {
    if (!data.nombre) {
      return mapValidationError('Name is required', 'nombre', data.nombre);
    }

    if (data.email && !this.isValidEmail(data.email)) {
      return mapValidationError('Invalid email format', 'email', data.email);
    }

    if (data.capacidades_plataforma && !Array.isArray(data.capacidades_plataforma)) {
      return mapValidationError('Capacidades must be an array', 'capacidades_plataforma', data.capacidades_plataforma);
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public async getByEmail(email: string): Promise<ServiceResult<Persona | null>> {
    try {
      if (!this.isValidEmail(email)) {
        return createErrorResult(
          mapValidationError('Invalid email format', 'email', email)
        );
      }

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('email', email)
        .single();

      if (error) throw error;
      if (!result) return createSuccessResult(null);

      // Cache the result
      await this.setInCache(result.id, result);

      return createSuccessResult(result);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async getAdmins(): Promise<ServiceResult<Persona[] | null>> {
    try {
      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('es_admin', true);

      if (error) throw error;
      if (!results) return createSuccessResult(null);

      // Cache individual results
      for (const result of results) {
        await this.setInCache(result.id, result);
      }

      return createSuccessResult(results);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async getAll(options?: QueryOptions): Promise<ServiceResult<Persona[] | null>> {
    try {
      return this.getAllWithPagination(options);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async getByCategoria(
    categoria: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!categoria) {
        return createErrorResult(
          mapValidationError('Category is required', 'categoria_principal', categoria)
        );
      }

      return this.getAllWithPagination({
        ...options,
        filters: {
          ...options?.filters,
          categoria_principal: categoria
        }
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async getByCapacidad(
    capacidad: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!capacidad) {
        return createErrorResult(
          mapValidationError('Capacity is required', 'capacidad', capacidad)
        );
      }

      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .contains('capacidades_plataforma', [capacidad])
        .eq('esta_eliminada', false);

      if (error) throw error;
      if (!results) return createSuccessResult(null);

      // Apply pagination and sorting
      let filteredResults = results;
      if (options?.sortBy) {
        filteredResults = filteredResults.sort((a, b) => {
          const aValue = a[options.sortBy as keyof Persona];
          const bValue = b[options.sortBy as keyof Persona];
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return options.sortOrder === 'desc' 
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }
          return 0;
        });
      }

      if (options?.page && options?.pageSize) {
        const start = (options.page - 1) * options.pageSize;
        const end = start + options.pageSize;
        filteredResults = filteredResults.slice(start, end);
      }

      // Cache individual results
      for (const result of filteredResults) {
        await this.setInCache(result.id, result);
      }

      return createSuccessResult(filteredResults);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async getByTema(
    temaId: string, 
    options?: QueryOptions
  ): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!temaId) {
        return createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      return this.getRelatedEntities<Persona>(
        temaId,
        'temas',
        'personas',
        'persona_tema',
        options
      );
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async getTemas(
    id: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][] | null>> {
    try {
      if (!id) {
        return createErrorResult(
          mapValidationError('Persona ID is required', 'id', id)
        );
      }

      return this.getRelatedEntities<Database['public']['Tables']['temas']['Row']>(
        id,
        'personas',
        'temas',
        'persona_tema',
        options
      );
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async addTema(personaId: string, temaId: string): Promise<ServiceResult<boolean>> {
    try {
      if (!personaId || !temaId) {
        return createErrorResult(
          mapValidationError('Both personaId and temaId are required', 'relationship', { personaId, temaId })
        );
      }

      const { error } = await this.supabase
        .from('persona_tema')
        .insert({
          persona_id: personaId,
          tema_id: temaId
        });

      if (error) throw error;

      // Invalidate related caches
      await this.invalidateRelatedCaches(personaId, ['byId', 'list']);

      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async removeTema(personaId: string, temaId: string): Promise<ServiceResult<boolean>> {
    try {
      if (!personaId || !temaId) {
        return createErrorResult(
          mapValidationError('Both personaId and temaId are required', 'relationship', { personaId, temaId })
        );
      }

      const { error } = await this.supabase
        .from('persona_tema')
        .delete()
        .eq('persona_id', personaId)
        .eq('tema_id', temaId);

      if (error) throw error;

      // Invalidate related caches
      await this.invalidateRelatedCaches(personaId, ['byId', 'list']);

      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }

  public async search(
    query: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!query) {
        return createErrorResult(
          mapValidationError('Search query is required', 'query', query)
        );
      }

      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.%${query}%,biografia.ilike.%${query}%`)
        .eq('esta_eliminada', false);

      if (error) throw error;
      if (!results) return createSuccessResult(null);

      // Apply pagination and sorting
      let filteredResults = results;
      if (options?.sortBy) {
        filteredResults = filteredResults.sort((a, b) => {
          const aValue = a[options.sortBy as keyof Persona];
          const bValue = b[options.sortBy as keyof Persona];
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return options.sortOrder === 'desc' 
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }
          return 0;
        });
      }

      if (options?.page && options?.pageSize) {
        const start = (options.page - 1) * options.pageSize;
        const end = start + options.pageSize;
        filteredResults = filteredResults.slice(start, end);
      }

      // Cache individual results
      for (const result of filteredResults) {
        await this.setInCache(result.id, result);
      }

      return createSuccessResult(filteredResults);
    } catch (error) {
      return createErrorResult(error as Error);
    }
  }
}
