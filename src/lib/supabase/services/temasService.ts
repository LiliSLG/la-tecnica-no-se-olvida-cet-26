import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { QueryOptions } from '../types/service';
import { mapValidationError } from '../errors/utils';
import { ValidationError } from '../errors/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { CacheableServiceConfig } from './cacheableService';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type Tema = Database['public']['Tables']['temas']['Row'];

export class TemasService extends BaseService<Tema, 'temas'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'temas', {
      entityType: 'tema',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: Database['public']['Tables']['temas']['Insert']): ValidationError | null {
    if (!data.nombre) {
      return mapValidationError('Name is required', 'nombre', data.nombre);
    }

    if (!data.descripcion) {
      return mapValidationError('Description is required', 'descripcion', data.descripcion);
    }

    return null;
  }

  protected validateUpdateInput(data: Database['public']['Tables']['temas']['Update']): ValidationError | null {
    if (data.nombre === '') {
      return mapValidationError('Name cannot be empty', 'nombre', data.nombre);
    }

    if (data.descripcion === '') {
      return mapValidationError('Description cannot be empty', 'descripcion', data.descripcion);
    }

    return null;
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Tema[] | null>> {
    return this.getAllWithPagination(options);
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!personaId) {
        return createError(mapValidationError('Persona ID is required', 'personaId', personaId));
      }
      return await this.getRelatedEntities<Tema>(
        personaId,
        'personas',
        'temas',
        'persona_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByPersona', personaId }));
    }
  }

  async getByProyecto(
    proyectoId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!proyectoId) {
        return createError(mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId));
      }
      return await this.getRelatedEntities<Tema>(
        proyectoId,
        'proyectos',
        'temas',
        'proyecto_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByProyecto', proyectoId }));
    }
  }

  async getByEntrevista(
    entrevistaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!entrevistaId) {
        return createError(mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId));
      }
      return await this.getRelatedEntities<Tema>(
        entrevistaId,
        'entrevistas',
        'temas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByEntrevista', entrevistaId }));
    }
  }

  async getByNoticia(
    noticiaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!noticiaId) {
        return createError(mapValidationError('Noticia ID is required', 'noticiaId', noticiaId));
      }
      return await this.getRelatedEntities<Tema>(
        noticiaId,
        'noticias',
        'temas',
        'noticia_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByNoticia', noticiaId }));
    }
  }

  async getPersonas(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(mapValidationError('Tema ID is required', 'temaId', temaId));
      }
      return await this.getRelatedEntities<Database['public']['Tables']['personas']['Row']>(
        temaId,
        'temas',
        'personas',
        'persona_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getPersonas', temaId }));
    }
  }

  async getProyectos(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(mapValidationError('Tema ID is required', 'temaId', temaId));
      }
      return await this.getRelatedEntities<Database['public']['Tables']['proyectos']['Row']>(
        temaId,
        'temas',
        'proyectos',
        'proyecto_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getProyectos', temaId }));
    }
  }

  async getEntrevistas(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(mapValidationError('Tema ID is required', 'temaId', temaId));
      }
      return await this.getRelatedEntities<Database['public']['Tables']['entrevistas']['Row']>(
        temaId,
        'temas',
        'entrevistas',
        'entrevista_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getEntrevistas', temaId }));
    }
  }

  async getNoticias(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['noticias']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(mapValidationError('Tema ID is required', 'temaId', temaId));
      }
      return await this.getRelatedEntities<Database['public']['Tables']['noticias']['Row']>(
        temaId,
        'temas',
        'noticias',
        'noticia_tema',
        options
      );
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getNoticias', temaId }));
    }
  }

  public async getAllActivos(
    options?: QueryOptions
  ): Promise<ServiceResult<Tema[] | null>> {
    try {
      const { data: results, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('esta_eliminado', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!results) return createSuccess(null);

      for (const result of results) {
        await this.setInCache(result.id, result);
      }

      return createSuccess(results);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getAllActivos' }));
    }
  }

  async getById(id: string): Promise<ServiceResult<Tema | null>> {
    try {
      const cachedResult = await this.getFromCache(id);
      if (cachedResult.success && cachedResult.data) return createSuccess(cachedResult.data);

      const { data: tema, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!tema) return createSuccess(null);

      await this.setInCache(id, tema);
      return createSuccess(tema);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Tema[]>> {
    try {
      if (!ids.length) return createSuccess([]);

      const cachedResults = await Promise.all(ids.map(async (id) => {
        const cached = await this.getFromCache(id);
        return cached.success && cached.data ? cached.data : null;
      }));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return createSuccess(cachedResults.filter(Boolean) as Tema[]);
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return createSuccess([]);

      for (const tema of data) {
        await this.setInCache(tema.id, tema);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return createSuccess(allResults);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getPublic(): Promise<ServiceResult<Tema[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminado', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return createSuccess([]);

      for (const tema of data) {
        await this.setInCache(tema.id, tema);
      }

      return createSuccess(data);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Tema[]>> {
    try {
      if (!query.trim()) return createSuccess([]);

      const searchPattern = `%${query.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.${searchPattern},descripcion.ilike.${searchPattern}`)
        .eq('esta_eliminado', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return createSuccess([]);

      for (const tema of data) {
        await this.setInCache(tema.id, tema);
      }

      return createSuccess(data);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'search' }));
    }
  }

  async update(id: string, data: Database['public']['Tables']['temas']['Update']): Promise<ServiceResult<Tema>> {
    try {
      const validationError = this.validateUpdateInput(data);
      if (validationError) {
        return createError(validationError);
      }

      const { data: updated, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updated) {
        return createError(mapValidationError('Tema not found', 'id', id));
      }

      await this.setInCache(id, updated);
      return createSuccess(updated);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'update' }));
    }
  }

  async create(data: Database['public']['Tables']['temas']['Insert']): Promise<ServiceResult<Tema>> {
    try {
      const validationError = this.validateCreateInput(data);
      if (validationError) {
        return createError(validationError);
      }

      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!created) {
        return createError(mapValidationError('Failed to create tema', 'data', data));
      }

      await this.setInCache(created.id, created);
      return createSuccess(created);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'create' }));
    }
  }
} 