import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types/database.types';
import { BaseService } from '@/lib/supabase/services/baseService';
import { ServiceResult, QueryOptions } from '@/lib/supabase/types/service';
import { ValidationError } from '@/lib/supabase/errors/types';
import { mapValidationError } from '@/lib/supabase/errors/utils';
import { CacheableServiceConfig } from '@/lib/supabase/services/cacheableService';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';
import { supabase } from '@/lib/supabase/supabaseClient';

type Persona = Database['public']['Tables']['personas']['Row'];
type CreatePersona = Database['public']['Tables']['personas']['Insert'];
type UpdatePersona = Database['public']['Tables']['personas']['Update'];

export class PersonasService extends BaseService<Persona, 'personas'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'personas' = 'personas',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'persona' }
  ) {
    super(supabase, tableName, cacheConfig);
  }

  protected validateCreateInput(data: CreatePersona): ValidationError | null {
    if (!data.nombre) {
      return {
        name: 'ValidationError',
        message: 'El nombre es requerido',
        field: 'nombre',
        value: data.nombre
      };
    }
    return null;
  }

  protected validateUpdateInput(data: UpdatePersona): ValidationError | null {
    if (data.nombre === '') {
      return {
        name: 'ValidationError',
        message: 'El nombre no puede estar vacío',
        field: 'nombre',
        value: data.nombre
      };
    }
    return null;
  }

  async create(data: Omit<Persona, 'id'>): Promise<ServiceResult<Persona>> {
    try {
      // Validate input
      const validationError = this.validateCreateInput(data as CreatePersona);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const now = new Date().toISOString();
      const { data: newPersona, error } = await this.supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_at: now,
          updated_at: now,
          esta_eliminada: false,
          eliminado_por_uid: null,
          eliminado_en: null
        })
        .select()
        .single();

      if (error) throw error;
      if (!newPersona) throw new Error('Failed to create persona');

      // Cache the new persona
      await this.setInCache(newPersona.id, newPersona);

      return this.createSuccessResult(newPersona);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'create' }));
    }
  }

  async update(id: string, data: Partial<Persona>): Promise<ServiceResult<Persona>> {
    try {
      // Validate input
      const validationError = this.validateUpdateInput(data as UpdatePersona);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const now = new Date().toISOString();
      const { data: updatedPersona, error } = await this.supabase
        .from(this.tableName)
        .update({
          ...data,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updatedPersona) throw new Error('Failed to update persona');

      // Update cache
      await this.setInCache(id, updatedPersona);

      return this.createSuccessResult(updatedPersona);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'update' }));
    }
  }

  async getById(id: string): Promise<ServiceResult<Persona>> {
    try {
      // Try to get from cache first
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(cached);

      const { data: persona, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!persona) return this.createSuccessResult(null);

      // Cache the result
      await this.setInCache(id, persona);

      return this.createSuccessResult(persona);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Persona[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false);

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      // Cache results
      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getAll' }));
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Persona[]>> {
    try {
      if (!query.trim()) return this.createSuccessResult([]);

      const searchPattern = `%${query.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.${searchPattern},email.ilike.${searchPattern}`)
        .eq('esta_eliminada', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      // Cache results
      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }

  async logicalDelete(id: string, adminUid: string): Promise<ServiceResult<Persona>> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: true,
          eliminado_por_uid: adminUid,
          eliminado_en: now,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Update cache
      await this.setInCache(id, data);

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'logicalDelete' }));
    }
  }

  async restore(id: string, adminUid: string): Promise<ServiceResult<Persona>> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: false,
          eliminado_por_uid: null,
          eliminado_en: null,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Update cache
      await this.setInCache(id, data);

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'restore' }));
    }
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

  public async getAllWithPagination(options?: QueryOptions): Promise<ServiceResult<Persona[] | null>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false);

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return createSuccessResult(null);

      // Cache results
      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult(this.handleError(error, { operation: 'getAllWithPagination' }));
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

  public async getPublicEgresadosYEstudiantes(
    options?: QueryOptions
  ): Promise<ServiceResult<Persona[] | null>> {
    try {
      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select()
        .in('categoria_principal', ['egresado', 'estudiante'])
        .eq('esta_eliminada', false)
        .eq('es_publico', true)
        .order('created_at', { ascending: false });

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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Singleton instance
export const personasService = new PersonasService(supabase);

// Export individual functions for backward compatibility
export const getPersonaById = (id: string) => personasService.getById(id);
export const getPersonasByIds = (ids: string[]) => Promise.all(ids.map(id => personasService.getById(id)));
export const getPublicEgresadosYEstudiantes = (options?: QueryOptions) => personasService.getPublicEgresadosYEstudiantes(options);
export const getPublicTutoresYColaboradores = (options?: QueryOptions) => personasService.getByCategoria('tutor', options);
