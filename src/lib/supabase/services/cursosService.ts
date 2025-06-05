import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { CacheableServiceConfig } from './cacheableService';

type Curso = Database['public']['Tables']['cursos']['Row'];
type CreateCurso = Database['public']['Tables']['cursos']['Insert'];
type UpdateCurso = Database['public']['Tables']['cursos']['Update'];

interface MappedCurso {
  id: string;
  titulo: string;
  descripcion: string | null;
  nivel: string;
  duracion: number;
  estado: string;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export class CursosService extends BaseService<Curso, 'cursos'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'cursos' = 'cursos',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'curso' }
  ) {
    super(supabase, tableName, cacheConfig);
  }

  private mapCursoToDomain(curso: Curso): MappedCurso {
    return {
      id: curso.id,
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      nivel: curso.nivel,
      duracion: curso.duracion,
      estado: curso.estado,
      activo: !curso.esta_eliminado,
      eliminadoPorUid: curso.eliminado_por_uid,
      eliminadoEn: curso.eliminado_en,
      creadoEn: curso.created_at,
      actualizadoEn: curso.updated_at
    };
  }

  private mapCursosToDomain(cursos: Curso[]): MappedCurso[] {
    return cursos.map(curso => this.mapCursoToDomain(curso));
  }

  async getById(id: string): Promise<ServiceResult<MappedCurso | null>> {
    try {
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(this.mapCursoToDomain(cached));

      const { data: curso, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!curso) return this.createSuccessResult(null);

      await this.setInCache(id, curso);
      return this.createSuccessResult(this.mapCursoToDomain(curso));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<MappedCurso[]>> {
    try {
      if (!ids.length) return this.createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return this.createSuccessResult(this.mapCursosToDomain(cachedResults.filter(Boolean) as Curso[]));
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const curso of data) {
        await this.setInCache(curso.id, curso);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return this.createSuccessResult(this.mapCursosToDomain(allResults));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getPublic(): Promise<ServiceResult<MappedCurso[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const curso of data) {
        await this.setInCache(curso.id, curso);
      }

      return this.createSuccessResult(this.mapCursosToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async search(term: string): Promise<ServiceResult<MappedCurso[]>> {
    try {
      if (!term.trim()) return this.createSuccessResult([]);

      const searchPattern = `%${term.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`titulo.ilike.${searchPattern},descripcion.ilike.${searchPattern}`)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const curso of data) {
        await this.setInCache(curso.id, curso);
      }

      return this.createSuccessResult(this.mapCursosToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }

  async getByNivel(nivel: string, options?: QueryOptions): Promise<ServiceResult<MappedCurso[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('nivel', nivel)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const curso of data) {
        await this.setInCache(curso.id, curso);
      }

      return this.createSuccessResult(this.mapCursosToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByNivel' }));
    }
  }

  async getByTema(temaId: string, options?: QueryOptions): Promise<ServiceResult<MappedCurso[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, curso_tema!inner(*)')
        .eq('curso_tema.tema_id', temaId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const curso of data) {
        await this.setInCache(curso.id, curso);
      }

      return this.createSuccessResult(this.mapCursosToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema' }));
    }
  }
} 