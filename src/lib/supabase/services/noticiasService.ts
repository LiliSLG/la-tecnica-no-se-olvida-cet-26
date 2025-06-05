import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, createSuccessResult, createErrorResult } from '../types/serviceResult';
import { QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type Noticia = Database['public']['Tables']['noticias']['Row'];
type CreateNoticia = Database['public']['Tables']['noticias']['Insert'];
type UpdateNoticia = Database['public']['Tables']['noticias']['Update'];

export class NoticiasService extends BaseService<Noticia, 'noticias'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'noticias', {
      entityType: 'noticia',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateNoticia): ValidationError | null {
    if (!data.titulo) {
      return mapValidationError('Title is required', 'titulo', data.titulo);
    }

    if (!data.contenido && data.tipo === 'article') {
      return mapValidationError('Content is required for article type', 'contenido', data.contenido);
    }

    if (!data.url_externa && data.tipo === 'link') {
      return mapValidationError('External URL is required for link type', 'url_externa', data.url_externa);
    }

    if (data.imagen_url && !this.isValidUrl(data.imagen_url)) {
      return mapValidationError('Invalid image URL format', 'imagen_url', data.imagen_url);
    }

    if (data.url_externa && !this.isValidUrl(data.url_externa)) {
      return mapValidationError('Invalid external URL format', 'url_externa', data.url_externa);
    }

    if (data.tipo && !this.isValidTipo(data.tipo)) {
      return mapValidationError('Invalid type value', 'tipo', data.tipo);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateNoticia): ValidationError | null {
    if (data.titulo === '') {
      return mapValidationError('Title cannot be empty', 'titulo', data.titulo);
    }

    if (data.contenido === '' && data.tipo === 'article') {
      return mapValidationError('Content cannot be empty for article type', 'contenido', data.contenido);
    }

    if (data.url_externa === '' && data.tipo === 'link') {
      return mapValidationError('External URL cannot be empty for link type', 'url_externa', data.url_externa);
    }

    if (data.imagen_url && !this.isValidUrl(data.imagen_url)) {
      return mapValidationError('Invalid image URL format', 'imagen_url', data.imagen_url);
    }

    if (data.url_externa && !this.isValidUrl(data.url_externa)) {
      return mapValidationError('Invalid external URL format', 'url_externa', data.url_externa);
    }

    if (data.tipo && !this.isValidTipo(data.tipo)) {
      return mapValidationError('Invalid type value', 'tipo', data.tipo);
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

  private isValidTipo(tipo: Database['public']['Enums']['news_type']): boolean {
    return ['article', 'link'].includes(tipo);
  }

  // Noticia-specific methods
  async getByTipo(tipo: Database['public']['Enums']['news_type']): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!this.isValidTipo(tipo)) {
        return createErrorResult(
          mapValidationError('Invalid type value', 'tipo', tipo)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('tipo', tipo);

      if (error) throw error;
      if (!data) return createSuccessResult(null);

      // Cache individual results
      for (const result of data) {
        await this.setInCache(result.id, result);
      }

      return createSuccessResult(data as Noticia[]);
    } catch (error) {
      return createErrorResult(this.handleError(error, { operation: 'getByTipo', tipo }));
    }
  }

  async getByTema(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }
      return this.getRelatedEntities<Noticia>(
        temaId,
        'temas',
        'noticias',
        'noticia_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema', temaId }));
    }
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }
      return this.getRelatedEntities<Noticia>(
        personaId,
        'personas',
        'noticias',
        'noticia_persona_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByPersona', personaId }));
    }
  }

  async getByOrganizacion(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }
      return this.getRelatedEntities<Noticia>(
        organizacionId,
        'organizaciones',
        'noticias',
        'noticia_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByOrganizacion', organizacionId }));
    }
  }

  async addTema(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !temaId) {
        return createErrorResult(
          mapValidationError('Both noticiaId and temaId are required', 'relationship', { noticiaId, temaId })
        );
      }

      const noticiaExists = await this.exists(noticiaId);
      if (!noticiaExists) {
        return createErrorResult(
          mapValidationError('Noticia not found', 'noticiaId', noticiaId)
        );
      }

      const { error } = await this.supabase
        .from('noticia_tema')
        .insert({
          noticia_id: noticiaId,
          tema_id: temaId
        });

      if (error) throw error;
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(this.handleError(error, { operation: 'addTema', noticiaId, temaId }));
    }
  }

  async removeTema(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !temaId) {
        return createErrorResult(
          mapValidationError('Both noticiaId and temaId are required', 'relationship', { noticiaId, temaId })
        );
      }

      const noticiaExists = await this.exists(noticiaId);
      if (!noticiaExists) {
        return createErrorResult(
          mapValidationError('Noticia not found', 'noticiaId', noticiaId)
        );
      }

      const { error } = await this.supabase
        .from('noticia_tema')
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(this.handleError(error, { operation: 'removeTema', noticiaId, temaId }));
    }
  }

  async getTemas(
    noticiaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][] | null>> {
    try {
      if (!noticiaId) {
        return this.createErrorResult(
          mapValidationError('Noticia ID is required', 'noticiaId', noticiaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['temas']['Row']>(
        noticiaId,
        'noticias',
        'temas',
        'noticia_tema',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getTemas', noticiaId }));
    }
  }

  async addPersona(noticiaId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !personaId || !rol) {
        return createErrorResult(
          mapValidationError('All fields are required', 'relationship', { noticiaId, personaId, rol })
        );
      }

      const noticiaExists = await this.exists(noticiaId);
      if (!noticiaExists) {
        return createErrorResult(
          mapValidationError('Noticia not found', 'noticiaId', noticiaId)
        );
      }

      const { error } = await this.supabase
        .from('noticia_persona_rol')
        .insert({
          noticia_id: noticiaId,
          persona_id: personaId,
          rol
        });

      if (error) throw error;
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(this.handleError(error, { operation: 'addPersona', noticiaId, personaId, rol }));
    }
  }

  async removePersona(noticiaId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !personaId) {
        return createErrorResult(
          mapValidationError('Both noticiaId and personaId are required', 'relationship', { noticiaId, personaId })
        );
      }

      const noticiaExists = await this.exists(noticiaId);
      if (!noticiaExists) {
        return createErrorResult(
          mapValidationError('Noticia not found', 'noticiaId', noticiaId)
        );
      }

      const { error } = await this.supabase
        .from('noticia_persona_rol')
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(this.handleError(error, { operation: 'removePersona', noticiaId, personaId }));
    }
  }

  async getPersonas(
    noticiaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['personas']['Row'][] | null>> {
    try {
      if (!noticiaId) {
        return this.createErrorResult(
          mapValidationError('Noticia ID is required', 'noticiaId', noticiaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['personas']['Row']>(
        noticiaId,
        'noticias',
        'personas',
        'noticia_persona_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonas', noticiaId }));
    }
  }

  async addOrganizacion(noticiaId: string, organizacionId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !organizacionId || !rol) {
        return createErrorResult(
          mapValidationError('All fields are required', 'relationship', { noticiaId, organizacionId, rol })
        );
      }

      const noticiaExists = await this.exists(noticiaId);
      if (!noticiaExists) {
        return createErrorResult(
          mapValidationError('Noticia not found', 'noticiaId', noticiaId)
        );
      }

      const { error } = await this.supabase
        .from('noticia_organizacion_rol')
        .insert({
          noticia_id: noticiaId,
          organizacion_id: organizacionId,
          rol
        });

      if (error) throw error;
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(this.handleError(error, { operation: 'addOrganizacion', noticiaId, organizacionId, rol }));
    }
  }

  async removeOrganizacion(noticiaId: string, organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !organizacionId) {
        return createErrorResult(
          mapValidationError('Both noticiaId and organizacionId are required', 'relationship', { noticiaId, organizacionId })
        );
      }

      const noticiaExists = await this.exists(noticiaId);
      if (!noticiaExists) {
        return createErrorResult(
          mapValidationError('Noticia not found', 'noticiaId', noticiaId)
        );
      }

      const { error } = await this.supabase
        .from('noticia_organizacion_rol')
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult(this.handleError(error, { operation: 'removeOrganizacion', noticiaId, organizacionId }));
    }
  }

  async getOrganizaciones(
    noticiaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['organizaciones']['Row'][] | null>> {
    try {
      if (!noticiaId) {
        return this.createErrorResult(
          mapValidationError('Noticia ID is required', 'noticiaId', noticiaId)
        );
      }
      return this.getRelatedEntities<Database['public']['Tables']['organizaciones']['Row']>(
        noticiaId,
        'noticias',
        'organizaciones',
        'noticia_organizacion_rol',
        options
      );
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getOrganizaciones', noticiaId }));
    }
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Noticia[] | null>> {
    return this.getAllWithPagination(options);
  }

  async search(
    query: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Noticia[] | null>> {
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

      // Cast the data to Noticia[] since we know the structure matches
      return this.createSuccessResult(data as unknown as Noticia[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search', query }));
    }
  }

  async getById(id: string): Promise<ServiceResult<Noticia | null>> {
    try {
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(cached);

      const { data: noticia, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!noticia) return this.createSuccessResult(null);

      await this.setInCache(id, noticia);
      return this.createSuccessResult(noticia);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Noticia[]>> {
    try {
      if (!ids.length) return this.createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return this.createSuccessResult(cachedResults.filter(Boolean) as Noticia[]);
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const noticia of data) {
        await this.setInCache(noticia.id, noticia);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return this.createSuccessResult(allResults);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getPublic(): Promise<ServiceResult<Noticia[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const noticia of data) {
        await this.setInCache(noticia.id, noticia);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<Noticia[]>> {
    try {
      if (!query.trim()) return this.createSuccessResult([]);

      const searchPattern = `%${query.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`titulo.ilike.${searchPattern},contenido.ilike.${searchPattern}`)
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const noticia of data) {
        await this.setInCache(noticia.id, noticia);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }

  async update(id: string, data: UpdateNoticia): Promise<ServiceResult<Noticia>> {
    try {
      const validationError = this.validateUpdateInput(data);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const { data: updated, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updated) {
        return this.createErrorResult(
          mapValidationError('Noticia not found', 'id', id)
        );
      }

      await this.setInCache(id, updated);
      return this.createSuccessResult(updated);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'update' }));
    }
  }

  async create(data: CreateNoticia): Promise<ServiceResult<Noticia>> {
    try {
      const validationError = this.validateCreateInput(data);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      if (!created) {
        return this.createErrorResult(
          mapValidationError('Failed to create noticia', 'data', data)
        );
      }

      await this.setInCache(created.id, created);
      return this.createSuccessResult(created);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'create' }));
    }
  }
} 