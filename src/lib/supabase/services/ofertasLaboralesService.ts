import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { CacheableServiceConfig } from './cacheableService';
import { ValidationError } from '../types/validation';

type OfertaLaboral = Database['public']['Tables']['ofertas_laborales']['Row'];

type CreateOfertaLaboral = Database['public']['Tables']['ofertas_laborales']['Insert'];
type UpdateOfertaLaboral = Database['public']['Tables']['ofertas_laborales']['Update'];

interface MappedOfertaLaboral {
  id: string;
  titulo: string;
  descripcion: string | null;
  empresa: string | null;
  ubicacion: string | null;
  estado: string;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export class OfertasLaboralesService extends BaseService<OfertaLaboral, 'ofertas_laborales'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'ofertas_laborales' = 'ofertas_laborales',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'oferta_laboral' }
  ) {
    super(supabase, tableName, cacheConfig);
  }

  protected validateCreateInput(data: CreateOfertaLaboral): ValidationError | null {
    // TODO: Implement proper validation
    return null;
  }

  protected validateUpdateInput(data: UpdateOfertaLaboral): ValidationError | null {
    // TODO: Implement proper validation
    return null;
  }

  private mapOfertaLaboralToDomain(oferta: OfertaLaboral): MappedOfertaLaboral {
    return {
      id: oferta.id,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      empresa: oferta.empresa,
      ubicacion: oferta.ubicacion,
      estado: oferta.estado,
      activo: !oferta.esta_eliminada,
      eliminadoPorUid: oferta.eliminado_por_uid,
      eliminadoEn: oferta.eliminado_en,
      creadoEn: oferta.created_at,
      actualizadoEn: oferta.updated_at
    };
  }

  private mapOfertasLaboralesToDomain(ofertas: OfertaLaboral[]): MappedOfertaLaboral[] {
    return ofertas.map(o => this.mapOfertaLaboralToDomain(o));
  }

  async getById(id: string): Promise<ServiceResult<MappedOfertaLaboral | null>> {
    try {
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(this.mapOfertaLaboralToDomain(cached));

      const { data: oferta, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!oferta) return this.createSuccessResult(null);

      await this.setInCache(id, oferta);
      return this.createSuccessResult(this.mapOfertaLaboralToDomain(oferta));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      if (!ids.length) return this.createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return this.createSuccessResult(this.mapOfertasLaboralesToDomain(cachedResults.filter(Boolean) as OfertaLaboral[]));
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const oferta of data) {
        await this.setInCache(oferta.id, oferta);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return this.createSuccessResult(this.mapOfertasLaboralesToDomain(allResults));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getPublic(): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const oferta of data) {
        await this.setInCache(oferta.id, oferta);
      }

      return this.createSuccessResult(this.mapOfertasLaboralesToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async search(term: string): Promise<ServiceResult<MappedOfertaLaboral[]>> {
    try {
      if (!term.trim()) return this.createSuccessResult([]);

      const searchPattern = `%${term.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`titulo.ilike.${searchPattern},descripcion.ilike.${searchPattern},empresa.ilike.${searchPattern},ubicacion.ilike.${searchPattern}`)
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const oferta of data) {
        await this.setInCache(oferta.id, oferta);
      }

      return this.createSuccessResult(this.mapOfertasLaboralesToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }
} 