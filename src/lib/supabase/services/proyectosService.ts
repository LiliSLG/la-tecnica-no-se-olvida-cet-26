import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type Proyecto = Database['public']['Tables']['proyectos']['Row'];
type CreateProyecto = Database['public']['Tables']['proyectos']['Insert'];
type UpdateProyecto = Database['public']['Tables']['proyectos']['Update'];

export class ProyectosService extends BaseService<Proyecto, 'proyectos'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'proyectos', {
      entityType: 'proyecto',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateProyecto): ValidationError | null {
    if (!data.titulo) {
      return mapValidationError('Title is required', 'titulo', data.titulo);
    }

    if (!data.descripcion) {
      return mapValidationError('Description is required', 'descripcion', data.descripcion);
    }

    if (data.archivo_principal_url && !this.isValidUrl(data.archivo_principal_url)) {
      return mapValidationError('Invalid file URL format', 'archivo_principal_url', data.archivo_principal_url);
    }

    if (data.status && !this.isValidStatus(data.status)) {
      return mapValidationError('Invalid status value', 'status', data.status);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateProyecto): ValidationError | null {
    if (data.titulo === '') {
      return mapValidationError('Title cannot be empty', 'titulo', data.titulo);
    }

    if (data.descripcion === '') {
      return mapValidationError('Description cannot be empty', 'descripcion', data.descripcion);
    }

    if (data.archivo_principal_url && !this.isValidUrl(data.archivo_principal_url)) {
      return mapValidationError('Invalid file URL format', 'archivo_principal_url', data.archivo_principal_url);
    }

    if (data.status && !this.isValidStatus(data.status)) {
      return mapValidationError('Invalid status value', 'status', data.status);
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

  private isValidStatus(status: Database['public']['Enums']['project_status']): boolean {
    return ['draft', 'published', 'archived'].includes(status);
  }

  // Proyecto-specific methods
  async getByStatus(
    status: Database['public']['Enums']['project_status'],
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!this.isValidStatus(status)) {
        return this.createErrorResult(
          mapValidationError('Invalid status value', 'status', status)
        );
      }

      return this.getAllWithPagination({
        ...options,
        filters: {
          ...options?.filters,
          status
        }
      });
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByStatus', status }));
    }
  }

  async getByTema(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      return this.getRelatedEntities<Proyecto>(
        temaId,
        'temas',
        'proyectos',
        'proyecto_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema', temaId }));
    }
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }

      return this.getRelatedEntities<Proyecto>(
        personaId,
        'personas',
        'proyectos',
        'proyecto_persona_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByPersona', personaId }));
    }
  }

  async getByOrganizacion(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }

      return this.getRelatedEntities<Proyecto>(
        organizacionId,
        'organizaciones',
        'proyectos',
        'proyecto_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByOrganizacion', organizacionId }));
    }
  }

  async addTema(proyectoId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both proyectoId and temaId are required', 'relationship', { proyectoId, temaId })
        );
      }

      const proyectoExists = await this.exists(proyectoId);
      if (!proyectoExists) {
        return this.createErrorResult(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      const { error } = await this.supabase
        .from('proyecto_tema')
        .insert({
          proyecto_id: proyectoId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addTema', proyectoId, temaId }));
    }
  }

  async removeTema(proyectoId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both proyectoId and temaId are required', 'relationship', { proyectoId, temaId })
        );
      }

      const proyectoExists = await this.exists(proyectoId);
      if (!proyectoExists) {
        return this.createErrorResult(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      const { error } = await this.supabase
        .from('proyecto_tema')
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeTema', proyectoId, temaId }));
    }
  }

  async getTemas(
    proyectoId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][] | null>> {
    try {
      if (!proyectoId) {
        return this.createErrorResult(
          mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId)
        );
      }

      return this.getRelatedEntities<Database['public']['Tables']['temas']['Row']>(
        proyectoId,
        'proyectos',
        'temas',
        'proyecto_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getTemas', proyectoId }));
    }
  }

  async addPersona(proyectoId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !personaId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { proyectoId, personaId, rol })
        );
      }

      const proyectoExists = await this.exists(proyectoId);
      if (!proyectoExists) {
        return this.createErrorResult(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

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
      return this.createErrorResult(this.handleError(error, { operation: 'addPersona', proyectoId, personaId, rol }));
    }
  }

  async removePersona(proyectoId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !personaId) {
        return this.createErrorResult(
          mapValidationError('Both proyectoId and personaId are required', 'relationship', { proyectoId, personaId })
        );
      }

      const proyectoExists = await this.exists(proyectoId);
      if (!proyectoExists) {
        return this.createErrorResult(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      const { error } = await this.supabase
        .from('proyecto_persona_rol')
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removePersona', proyectoId, personaId }));
    }
  }

  async getPersonas(
    proyectoId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
    try {
      if (!proyectoId) {
        return this.createErrorResult(
          mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['personas']['Row']>(
        proyectoId,
        'proyectos',
        'personas',
        'proyecto_persona_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonas', proyectoId }));
    }
  }

  async addOrganizacion(proyectoId: string, organizacionId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !organizacionId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { proyectoId, organizacionId, rol })
        );
      }

      const proyectoExists = await this.exists(proyectoId);
      if (!proyectoExists) {
        return this.createErrorResult(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      const { error } = await this.supabase
        .from('proyecto_organizacion_rol')
        .insert({
          proyecto_id: proyectoId,
          organizacion_id: organizacionId,
          rol
        });

      if (error) throw error;

      // Invalidate related caches
      await this.invalidateRelatedCaches(proyectoId, ['byId', 'list']);

      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addOrganizacion', proyectoId, organizacionId, rol }));
    }
  }

  async removeOrganizacion(proyectoId: string, organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !organizacionId) {
        return this.createErrorResult(
          mapValidationError('Both proyectoId and organizacionId are required', 'relationship', { proyectoId, organizacionId })
        );
      }

      const proyectoExists = await this.exists(proyectoId);
      if (!proyectoExists) {
        return this.createErrorResult(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      const { error } = await this.supabase
        .from('proyecto_organizacion_rol')
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;

      // Invalidate related caches
      await this.invalidateRelatedCaches(proyectoId, ['byId', 'list']);

      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeOrganizacion', proyectoId, organizacionId }));
    }
  }

  async getOrganizaciones(
    proyectoId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][] | null>> {
    try {
      if (!proyectoId) {
        return this.createErrorResult(
          mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['organizaciones']['Row']>(
        proyectoId,
        'proyectos',
        'organizaciones',
        'proyecto_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getOrganizaciones', proyectoId }));
    }
  }

  // Override search to include descripcion in search
  async search(
    query: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!query) {
        return this.createErrorResult(
          mapValidationError('Search query is required', 'query', query)
        );
      }

      let searchQuery = this.supabase
        .from(this.tableName)
        .select(this.getDefaultFields(this.tableName as string))
        .textSearch('search_vector', query);

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          searchQuery = searchQuery.eq(key, value);
        });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        searchQuery = searchQuery.range(from, to);
      }

      // Apply sorting
      if (options?.sortBy) {
        searchQuery = searchQuery.order(options.sortBy, { 
          ascending: options.sortOrder !== 'desc' 
        });
      }

      const { data, error } = await searchQuery;

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Cast the data to Proyecto[] since we know the structure matches
      return this.createSuccessResult(data as unknown as Proyecto[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search', query }));
    }
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Proyecto[] | null>> {
    return this.getAllWithPagination(options);
  }
} 