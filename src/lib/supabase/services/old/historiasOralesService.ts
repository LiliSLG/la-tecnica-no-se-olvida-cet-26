// TODO: Enable real Supabase integration when the historias_orales table is available
// Track this in docs/todos.md
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { CacheableServiceConfig } from './cacheableService';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

// type HistoriaOral = Database['public']['Tables']['historias_orales']['Row'];
// type CreateHistoriaOral = Database['public']['Tables']['historias_orales']['Insert'];
// type UpdateHistoriaOral = Database['public']['Tables']['historias_orales']['Update'];

// Mock type for now
export interface HistoriaOral {
  id: string;
  titulo: string;
  descripcion: string | null;
  archivo_principal_url: string | null;
  estado: string;
  esta_eliminada: boolean;
  eliminado_por_uid: string | null;
  eliminado_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface MappedHistoriaOral {
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

const MOCK_HISTORIAS: HistoriaOral[] = [
  {
    id: '1',
    titulo: 'Historia de la comunidad',
    descripcion: 'Relato sobre la fundación de la comunidad',
    archivo_principal_url: null,
    estado: 'publicada',
    esta_eliminada: false,
    eliminado_por_uid: null,
    eliminado_en: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export class HistoriasOralesService /* extends BaseService<HistoriaOral, 'historias_orales'> */ {
  private historias: HistoriaOral[];

  constructor() {
    this.historias = MOCK_HISTORIAS;
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

  // Mapped methods
  async getByIdMapped(id: string): Promise<ServiceResult<MappedHistoriaOral | null>> {
    try {
      const historia = this.historias.find(h => h.id === id);
      if (!historia) return createSuccess<MappedHistoriaOral | null>(null);
      return createSuccess(this.mapHistoriaOralToDomain(historia));
    } catch (error) {
      return createError<MappedHistoriaOral | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener la historia oral',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getAllMapped(): Promise<ServiceResult<MappedHistoriaOral[] | null>> {
    try {
      return createSuccess(this.mapHistoriasOralesToDomain(this.historias));
    } catch (error) {
      return createError<MappedHistoriaOral[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener historias orales',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async searchMapped(term: string): Promise<ServiceResult<MappedHistoriaOral[] | null>> {
    try {
      if (!term.trim()) return createSuccess<MappedHistoriaOral[] | null>([]);
      const searchTerm = term.toLowerCase().trim();
      const historias = this.historias.filter(h =>
        !h.esta_eliminada && (
          h.titulo.toLowerCase().includes(searchTerm) ||
          (h.descripcion?.toLowerCase().includes(searchTerm) ?? false)
        )
      );
      return createSuccess(this.mapHistoriasOralesToDomain(historias));
    } catch (error) {
      return createError<MappedHistoriaOral[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al buscar historias orales',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublicMapped(): Promise<ServiceResult<MappedHistoriaOral[] | null>> {
    try {
      const historias = this.historias.filter(h => !h.esta_eliminada);
      return createSuccess(this.mapHistoriasOralesToDomain(historias));
    } catch (error) {
      return createError<MappedHistoriaOral[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Error al obtener historias orales públicas',
        code: 'DB_ERROR',
        details: error
      });
    }
  }
}

export const historiasOralesService = new HistoriasOralesService();
export const getHistoriaOralById = (id: string) => historiasOralesService.getByIdMapped(id);
export const getAllHistoriasOrales = () => historiasOralesService.getAllMapped();
export const searchHistoriasOrales = (term: string) => historiasOralesService.searchMapped(term);
export const getPublicHistoriasOrales = () => historiasOralesService.getPublicMapped(); 