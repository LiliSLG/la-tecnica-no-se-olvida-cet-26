import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { CacheableServiceConfig } from './cacheableService';

type HistoriaOral = Database['public']['Tables']['historias_orales']['Row'];

type CreateHistoriaOral = Database['public']['Tables']['historias_orales']['Insert'];
type UpdateHistoriaOral = Database['public']['Tables']['historias_orales']['Update'];

interface MappedHistoriaOral {
  id: string;
  titulo: string;
  descripcion: string | null;
  archivoPrincipalURL: string | null;
  estado: string;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export class HistoriasOralesService extends BaseService<HistoriaOral, 'historias_orales'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'historias_orales' = 'historias_orales',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'historia_oral' }
  ) {
    super(supabase, tableName, cacheConfig);
  }

  private mapHistoriaOralToDomain(historia: HistoriaOral): MappedHistoriaOral {
    return {
      id: historia.id,
      titulo: historia.titulo,
      descripcion: historia.descripcion,
      archivoPrincipalURL: historia.archivo_principal_url,
      estado: historia.estado,
      activo: !historia.esta_eliminada,
      eliminadoPorUid: historia.eliminado_por_uid,
      eliminadoEn: historia.eliminado_en,
      creadoEn: historia.created_at,
      actualizadoEn: historia.updated_at
    };
  }

  private mapHistoriasOralesToDomain(historias: HistoriaOral[]): MappedHistoriaOral[] {
    return historias.map(h => this.mapHistoriaOralToDomain(h));
  }

  async getById(id: string): Promise<ServiceResult<MappedHistoriaOral | null>> {
    try {
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(this.mapHistoriaOralToDomain(cached));

      const { data: historia, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!historia) return this.createSuccessResult(null);

      await this.setInCache(id, historia);
      return this.createSuccessResult(this.mapHistoriaOralToDomain(historia));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<MappedHistoriaOral[]>> {
    try {
      if (!ids.length) return this.createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return this.createSuccessResult(this.mapHistoriasOralesToDomain(cachedResults.filter(Boolean) as HistoriaOral[]));
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const historia of data) {
        await this.setInCache(historia.id, historia);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return this.createSuccessResult(this.mapHistoriasOralesToDomain(allResults));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getPublic(): Promise<ServiceResult<MappedHistoriaOral[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const historia of data) {
        await this.setInCache(historia.id, historia);
      }

      return this.createSuccessResult(this.mapHistoriasOralesToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async search(term: string): Promise<ServiceResult<MappedHistoriaOral[]>> {
    try {
      if (!term.trim()) return this.createSuccessResult([]);

      const searchPattern = `%${term.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`titulo.ilike.${searchPattern},descripcion.ilike.${searchPattern}`)
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const historia of data) {
        await this.setInCache(historia.id, historia);
      }

      return this.createSuccessResult(this.mapHistoriasOralesToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }
} 