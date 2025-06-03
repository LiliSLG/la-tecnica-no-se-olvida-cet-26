import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError, ErrorCode } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type Organizacion = Database['public']['Tables']['organizaciones']['Row'];
type CreateOrganizacion = Database['public']['Tables']['organizaciones']['Insert'];
type UpdateOrganizacion = Database['public']['Tables']['organizaciones']['Update'];

export class OrganizacionesService extends BaseService<Organizacion, CreateOrganizacion, UpdateOrganizacion> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'organizaciones', supabase });
  }

  protected validateCreateInput(data: CreateOrganizacion): ValidationError | null {
    if (!data.nombre) {
      return mapValidationError('Name is required', 'nombre', data.nombre);
    }

    if (data.sitio_web && !this.isValidUrl(data.sitio_web)) {
      return mapValidationError('Invalid website URL format', 'sitio_web', data.sitio_web);
    }

    if (data.logo_url && !this.isValidUrl(data.logo_url)) {
      return mapValidationError('Invalid logo URL format', 'logo_url', data.logo_url);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateOrganizacion): ValidationError | null {
    if (data.nombre === '') {
      return mapValidationError('Name cannot be empty', 'nombre', data.nombre);
    }

    if (data.sitio_web && !this.isValidUrl(data.sitio_web)) {
      return mapValidationError('Invalid website URL format', 'sitio_web', data.sitio_web);
    }

    if (data.logo_url && !this.isValidUrl(data.logo_url)) {
      return mapValidationError('Invalid logo URL format', 'logo_url', data.logo_url);
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

  // Organizacion-specific methods
  async getByTema(temaId: string): Promise<ServiceResult<Organizacion[] | null>> {
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
          organizacion_tema!inner(tema_id)
        `)
        .eq('organizacion_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data as Organizacion[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema', temaId }));
    }
  }

  async addTema(organizacionId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!organizacionId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both organizacionId and temaId are required', 'relationship', { organizacionId, temaId })
        );
      }

      const organizacionExists = await this.exists(organizacionId);
      if (!organizacionExists) {
        return this.createErrorResult(
          mapValidationError('Organizacion not found', 'organizacionId', organizacionId)
        );
      }

      const { error } = await this.supabase
        .from('organizacion_tema')
        .insert({
          organizacion_id: organizacionId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addTema', organizacionId, temaId }));
    }
  }

  async removeTema(organizacionId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!organizacionId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both organizacionId and temaId are required', 'relationship', { organizacionId, temaId })
        );
      }

      const organizacionExists = await this.exists(organizacionId);
      if (!organizacionExists) {
        return this.createErrorResult(
          mapValidationError('Organizacion not found', 'organizacionId', organizacionId)
        );
      }

      const { error } = await this.supabase
        .from('organizacion_tema')
        .delete()
        .eq('organizacion_id', organizacionId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeTema', organizacionId, temaId }));
    }
  }

  async getTemas(organizacionId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }

      const organizacionExists = await this.exists(organizacionId);
      if (!organizacionExists) {
        return this.createErrorResult(
          mapValidationError('Organizacion not found', 'organizacionId', organizacionId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'getTemas', organizacionId }));
    }
  }

  // Override search to include descripcion in search
  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Organizacion[]>> {
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
        searchQuery = searchQuery.eq('esta_eliminada', false);
      }

      if (options?.limit) {
        searchQuery = searchQuery.limit(options.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      return this.createSuccessResult(data as Organizacion[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search', query, options }));
    }
  }
} 