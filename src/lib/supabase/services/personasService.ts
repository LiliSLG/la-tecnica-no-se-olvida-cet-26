import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError, ErrorCode } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type Persona = Database['public']['Tables']['personas']['Row'];
type CreatePersona = Database['public']['Tables']['personas']['Insert'];
type UpdatePersona = Database['public']['Tables']['personas']['Update'];

export class PersonasService extends BaseService<Persona, CreatePersona, UpdatePersona> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'personas', supabase });
  }

  protected validateCreateInput(data: CreatePersona): ValidationError | null {
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

  protected validateUpdateInput(data: UpdatePersona): ValidationError | null {
    if (data.nombre === '') {
      return mapValidationError('Name cannot be empty', 'nombre', data.nombre);
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

  // Persona-specific methods
  async getByEmail(email: string): Promise<ServiceResult<Persona>> {
    try {
      if (!this.isValidEmail(email)) {
        return this.createErrorResult(
          mapValidationError('Invalid email format', 'email', email)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('email', email)
        .single();

      if (error) throw error;
      if (!data) {
        return this.createErrorResult(
          mapValidationError('Persona not found with this email', 'email', email)
        );
      }
      return this.createSuccessResult(data as Persona);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByEmail', email }));
    }
  }

  async getAdmins(): Promise<ServiceResult<Persona[]>> {
    return this.getAll({
      filters: { es_admin: true }
    });
  }

  async getByCategoria(categoria: string): Promise<ServiceResult<Persona[]>> {
    if (!categoria) {
      return this.createErrorResult(
        mapValidationError('Category is required', 'categoria_principal', categoria)
      );
    }
    return this.getAll({
      filters: { categoria_principal: categoria }
    });
  }

  async getByCapacidad(capacidad: string): Promise<ServiceResult<Persona[]>> {
    try {
      if (!capacidad) {
        return this.createErrorResult(
          mapValidationError('Capacity is required', 'capacidad', capacidad)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .contains('capacidades_plataforma', [capacidad]);

      if (error) throw error;
      return this.createSuccessResult(data as Persona[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByCapacidad', capacidad }));
    }
  }

  async getByTema(temaId: string): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema', temaId }));
    }
  }

  async addTema(personaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!personaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both personaId and temaId are required', 'relationship', { personaId, temaId })
        );
      }

      const personaExists = await this.exists(personaId);
      if (!personaExists) {
        return this.createErrorResult(
          mapValidationError('Persona not found', 'personaId', personaId)
        );
      }

      const { error } = await this.supabase
        .from('persona_tema')
        .insert({
          persona_id: personaId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addTema', personaId, temaId }));
    }
  }

  async removeTema(personaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!personaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both personaId and temaId are required', 'relationship', { personaId, temaId })
        );
      }

      const personaExists = await this.exists(personaId);
      if (!personaExists) {
        return this.createErrorResult(
          mapValidationError('Persona not found', 'personaId', personaId)
        );
      }

      const { error } = await this.supabase
        .from('persona_tema')
        .delete()
        .eq('persona_id', personaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeTema', personaId, temaId }));
    }
  }

  async getTemas(personaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }

      const personaExists = await this.exists(personaId);
      if (!personaExists) {
        return this.createErrorResult(
          mapValidationError('Persona not found', 'personaId', personaId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getTemas', personaId }));
    }
  }

  // Override search to include biografia in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Persona[]>> {
    try {
      if (!query) {
        return this.createErrorResult(
          mapValidationError('Search query is required', 'query', query)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'search', query, options }));
    }
  }
} 