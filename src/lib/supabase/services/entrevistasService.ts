import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError, ErrorCode } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type Entrevista = Database['public']['Tables']['entrevistas']['Row'];
type CreateEntrevista = Database['public']['Tables']['entrevistas']['Insert'];
type UpdateEntrevista = Database['public']['Tables']['entrevistas']['Update'];

export class EntrevistasService extends BaseService<Entrevista, CreateEntrevista, UpdateEntrevista> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'entrevistas', supabase });
  }

  protected validateCreateInput(data: CreateEntrevista): ValidationError | null {
    if (!data.titulo) {
      return mapValidationError('Title is required', 'titulo', data.titulo);
    }

    if (!data.descripcion) {
      return mapValidationError('Description is required', 'descripcion', data.descripcion);
    }

    if (data.video_url && !this.isValidUrl(data.video_url)) {
      return mapValidationError('Invalid video URL format', 'video_url', data.video_url);
    }

    if (data.status && !this.isValidStatus(data.status)) {
      return mapValidationError('Invalid status value', 'status', data.status);
    }

    if (data.fecha_entrevista && !this.isValidDate(data.fecha_entrevista)) {
      return mapValidationError('Invalid interview date', 'fecha_entrevista', data.fecha_entrevista);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateEntrevista): ValidationError | null {
    if (data.titulo === '') {
      return mapValidationError('Title cannot be empty', 'titulo', data.titulo);
    }

    if (data.descripcion === '') {
      return mapValidationError('Description cannot be empty', 'descripcion', data.descripcion);
    }

    if (data.video_url && !this.isValidUrl(data.video_url)) {
      return mapValidationError('Invalid video URL format', 'video_url', data.video_url);
    }

    if (data.status && !this.isValidStatus(data.status)) {
      return mapValidationError('Invalid status value', 'status', data.status);
    }

    if (data.fecha_entrevista && !this.isValidDate(data.fecha_entrevista)) {
      return mapValidationError('Invalid interview date', 'fecha_entrevista', data.fecha_entrevista);
    }

    return null;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidStatus(status: Database['public']['Enums']['interview_status']): boolean {
    return ['scheduled', 'completed', 'cancelled'].includes(status);
  }

  private isValidDate(date: string | Date): boolean {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  }

  // Entrevista-specific methods
  async getByStatus(status: Database['public']['Enums']['interview_status']): Promise<ServiceResult<Entrevista[]>> {
    try {
      if (!this.isValidStatus(status)) {
        return this.createErrorResult(
          mapValidationError('Invalid status value', 'status', status)
        );
      }

      return this.getAll({
        filters: { status }
      });
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByStatus', status }));
    }
  }

  async getByFecha(fecha: string): Promise<ServiceResult<Entrevista[]>> {
    return this.getAll({
      filters: { fecha_entrevista: fecha }
    });
  }

  async getByTema(temaId: string): Promise<ServiceResult<Entrevista[] | null>> {
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
          entrevista_tema!inner(tema_id)
        `)
        .eq('entrevista_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data as Entrevista[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema', temaId }));
    }
  }

  async getByPersona(personaId: string): Promise<ServiceResult<Entrevista[]>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          entrevista_persona_rol!inner(persona_id)
        `)
        .eq('entrevista_persona_rol.persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(data as Entrevista[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByPersona', personaId }));
    }
  }

  async getByOrganizacion(organizacionId: string): Promise<ServiceResult<Entrevista[] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          entrevista_organizacion_rol!inner(organizacion_id)
        `)
        .eq('entrevista_organizacion_rol.organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(data as Entrevista[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByOrganizacion', organizacionId }));
    }
  }

  async addTema(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both entrevistaId and temaId are required', 'relationship', { entrevistaId, temaId })
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { error } = await this.supabase
        .from('entrevista_tema')
        .insert({
          entrevista_id: entrevistaId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addTema', entrevistaId, temaId }));
    }
  }

  async removeTema(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both entrevistaId and temaId are required', 'relationship', { entrevistaId, temaId })
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { error } = await this.supabase
        .from('entrevista_tema')
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeTema', entrevistaId, temaId }));
    }
  }

  async getTemas(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getTemas', entrevistaId }));
    }
  }

  async addPersona(entrevistaId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !personaId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { entrevistaId, personaId, rol })
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { error } = await this.supabase
        .from('entrevista_persona_rol')
        .insert({
          entrevista_id: entrevistaId,
          persona_id: personaId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addPersona', entrevistaId, personaId, rol }));
    }
  }

  async removePersona(entrevistaId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !personaId) {
        return this.createErrorResult(
          mapValidationError('Both entrevistaId and personaId are required', 'relationship', { entrevistaId, personaId })
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { error } = await this.supabase
        .from('entrevista_persona_rol')
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removePersona', entrevistaId, personaId }));
    }
  }

  async getPersonas(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][]>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { data, error } = await this.supabase
        .from('personas')
        .select(`
          *,
          entrevista_persona_rol!inner(entrevista_id)
        `)
        .eq('entrevista_persona_rol.entrevista_id', entrevistaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonas', entrevistaId }));
    }
  }

  async addOrganizacion(entrevistaId: string, organizacionId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !organizacionId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { entrevistaId, organizacionId, rol })
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { error } = await this.supabase
        .from('entrevista_organizacion_rol')
        .insert({
          entrevista_id: entrevistaId,
          organizacion_id: organizacionId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addOrganizacion', entrevistaId, organizacionId, rol }));
    }
  }

  async removeOrganizacion(entrevistaId: string, organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !organizacionId) {
        return this.createErrorResult(
          mapValidationError('Both entrevistaId and organizacionId are required', 'relationship', { entrevistaId, organizacionId })
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { error } = await this.supabase
        .from('entrevista_organizacion_rol')
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeOrganizacion', entrevistaId, organizacionId }));
    }
  }

  async getOrganizaciones(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][]>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }

      const entrevistaExists = await this.exists(entrevistaId);
      if (!entrevistaExists) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { data, error } = await this.supabase
        .from('organizaciones')
        .select(`
          *,
          entrevista_organizacion_rol!inner(entrevista_id)
        `)
        .eq('entrevista_organizacion_rol.entrevista_id', entrevistaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getOrganizaciones', entrevistaId }));
    }
  }

  // Override search to include descripcion in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Entrevista[]>> {
    try {
      if (!query) {
        return this.createErrorResult(
          mapValidationError('Search query is required', 'query', query)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'search', query, options }));
    }
  }
} 