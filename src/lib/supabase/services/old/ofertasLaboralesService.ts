import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types/database.types';
import { CacheableService } from '@/lib/supabase/services/cacheableService';
import { createErrorResult as createError, createSuccessResult as createSuccess, ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '@/lib/supabase/errors/types';
import { mapValidationError } from '@/lib/supabase/errors/utils';
import { supabase } from '@/lib/supabase/supabaseClient';

type OfertaLaboral = Database['public']['Tables']['ofertas_laborales']['Row'];
type CreateOfertaLaboral = Database['public']['Tables']['ofertas_laborales']['Insert'];
type UpdateOfertaLaboral = Database['public']['Tables']['ofertas_laborales']['Update'];

/**
 * Mapped version of OfertaLaboral for domain use
 */
export interface MappedOfertaLaboral {
  id: string;
  titulo: string;
  descripcion: string | null;
  empresa: string | null;
  ubicacion: string | null;
  estado: string;
  estaEliminada: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for managing job offers
 */
export class OfertasLaboralesService extends CacheableService<OfertaLaboral> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, {
      entityType: 'proyecto',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected handleError(error: unknown, context: { operation: string; [key: string]: any }): ValidationError {
    if (error instanceof Error) {
      return {
        name: 'ServiceError',
        message: error.message,
        code: 'DB_ERROR',
        source: 'OfertasLaboralesService',
        details: { ...context, error }
      };
    }
    return {
      name: 'ServiceError',
      message: 'An unexpected error occurred',
      code: 'DB_ERROR',
      source: 'OfertasLaboralesService',
      details: { ...context, error }
    };
  }

  /**
   * Maps a database row to a domain model
   */
  private mapOfertaLaboralToDomain(oferta: OfertaLaboral): MappedOfertaLaboral {
    return {
      id: oferta.id,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      empresa: oferta.empresa,
      ubicacion: oferta.ubicacion,
      estado: oferta.estado,
      estaEliminada: oferta.esta_eliminada,
      eliminadoPorUid: oferta.eliminado_por_uid,
      eliminadoEn: oferta.eliminado_en,
      createdAt: oferta.created_at,
      updatedAt: oferta.updated_at
    };
  }

  /**
   * Maps an array of database rows to domain models
   */
  private mapOfertasLaboralesToDomain(ofertas: OfertaLaboral[]): MappedOfertaLaboral[] {
    return ofertas.map(oferta => this.mapOfertaLaboralToDomain(oferta));
  }

  /**
   * Maps a domain model to a database row
   */
  private mapDomainToOfertaLaboral(data: Partial<MappedOfertaLaboral>): Partial<OfertaLaboral> {
    return {
      id: data.id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      empresa: data.empresa,
      ubicacion: data.ubicacion,
      estado: data.estado,
      esta_eliminada: data.estaEliminada,
      eliminado_por_uid: data.eliminadoPorUid,
      eliminado_en: data.eliminadoEn,
      created_at: data.createdAt,
      updated_at: data.updatedAt
    };
  }

  /**
   * Validates input data for creating a job offer
   */
  protected validateCreateInput(data: Partial<OfertaLaboral>): ValidationError | null {
    if (!data.titulo) {
      return mapValidationError('Título is required', 'titulo', data.titulo);
    }
    if (!data.estado) {
      return mapValidationError('Estado is required', 'estado', data.estado);
    }
    return null;
  }

  /**
   * Gets a job offer by ID with domain mapping
   */
  async getByIdMapped(id: string): Promise<ServiceResult<MappedOfertaLaboral | null>> {
    try {
      const result = await super.getById(id);
      if (!result.success || !result.data) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to get oferta laboral',
          code: result.error?.code || 'DB_ERROR',
          details: result.error
        });
      }
      return createSuccess(this.mapOfertaLaboralToDomain(result.data));
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByIdMapped' }));
    }
  }

  /**
   * Gets all job offers with domain mapping
   */
  async getAllMapped(options?: QueryOptions): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      const result = await super.getAll(options);
      if (!result.success || !result.data) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to get ofertas laborales',
          code: result.error?.code || 'DB_ERROR',
          details: result.error
        });
      }
      return createSuccess(this.mapOfertasLaboralesToDomain(result.data));
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getAllMapped' }));
    }
  }

  /**
   * Searches job offers with domain mapping
   */
  async searchMapped(query: string, options?: QueryOptions): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      const result = await super.search(query, options);
      if (!result.success || !result.data) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to search ofertas laborales',
          code: result.error?.code || 'DB_ERROR',
          details: result.error
        });
      }
      return createSuccess(this.mapOfertasLaboralesToDomain(result.data));
    } catch (error) {
      return createError(this.handleError(error, { operation: 'searchMapped' }));
    }
  }

  /**
   * Creates a new job offer with domain mapping
   */
  async createMapped(data: Omit<MappedOfertaLaboral, 'id'>): Promise<ServiceResult<MappedOfertaLaboral | null>> {
    try {
      const dbData = this.mapDomainToOfertaLaboral(data);
      const result = await super.create(dbData as Omit<OfertaLaboral, 'id'>);
      if (!result.success || !result.data) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to create oferta laboral',
          code: result.error?.code || 'DB_ERROR',
          details: result.error
        });
      }
      return createSuccess(this.mapOfertaLaboralToDomain(result.data));
    } catch (error) {
      return createError(this.handleError(error, { operation: 'createMapped' }));
    }
  }

  /**
   * Updates a job offer with domain mapping
   */
  async updateMapped(id: string, data: Partial<MappedOfertaLaboral>): Promise<ServiceResult<MappedOfertaLaboral | null>> {
    try {
      const dbData = this.mapDomainToOfertaLaboral(data);
      const result = await super.update(id, dbData);
      if (!result.success || !result.data) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to update oferta laboral',
          code: result.error?.code || 'DB_ERROR',
          details: result.error
        });
      }
      return createSuccess(this.mapOfertaLaboralToDomain(result.data));
    } catch (error) {
      return createError(this.handleError(error, { operation: 'updateMapped' }));
    }
  }

  /**
   * Gets multiple job offers by IDs with domain mapping
   */
  async getByIdsMapped(ids: string[]): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      if (!ids.length) return createSuccess([]);

      const cachedResults = await Promise.all(ids.map(async (id) => {
        const cached = await this.getFromCache(id);
        return cached.success && cached.data ? cached.data : null;
      }));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return createSuccess(this.mapOfertasLaboralesToDomain(cachedResults.filter(Boolean) as OfertaLaboral[]));
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return createSuccess([]);

      for (const oferta of data) {
        await this.setInCache(oferta.id, oferta);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return createSuccess(this.mapOfertasLaboralesToDomain(allResults));
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByIdsMapped' }));
    }
  }

  /**
   * Gets all public job offers with domain mapping
   */
  async getPublicMapped(): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .eq('estado', 'publicada')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess([]);

      return createSuccess(this.mapOfertasLaboralesToDomain(data));
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getPublicMapped' }));
    }
  }

  async create(data: Omit<OfertaLaboral, 'id'>): Promise<ServiceResult<OfertaLaboral | null>> {
    // Ensure required fields are not undefined
    const createData: Omit<OfertaLaboral, 'id'> = {
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      empresa: data.empresa ?? null,
      ubicacion: data.ubicacion ?? null,
      estado: data.estado,
      esta_eliminada: data.esta_eliminada ?? false,
      eliminado_por_uid: data.eliminado_por_uid ?? null,
      eliminado_en: data.eliminado_en ?? null,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    return super.create(createData);
  }

  /**
   * Searches for job offers based on a query string
   */
  public async search(query: string, options?: QueryOptions): Promise<ServiceResult<OfertaLaboral[]>> {
    try {
      const result = await super.search(query, options);
      if (!result.success) return result;
      return { success: true, data: result.data || [], error: undefined };
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  protected getSearchableFields(): string[] {
    return ['titulo', 'descripcion', 'empresa', 'ubicacion'];
  }
}

// Service instance
const ofertasLaboralesService = new OfertasLaboralesService(supabase);

// Exported functions
export const getOfertaLaboralById = (id: string) => ofertasLaboralesService.getByIdMapped(id);
export const getOfertasLaboralesByIds = (ids: string[]) => ofertasLaboralesService.getByIdsMapped(ids);
export const getPublicOfertasLaborales = () => ofertasLaboralesService.getPublicMapped(); 