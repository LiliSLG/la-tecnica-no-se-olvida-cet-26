import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types/database.types';
import { BaseService } from '@/lib/supabase/services/baseService';
import { ServiceResult, QueryOptions } from '@/lib/supabase/types/service';
import { ValidationError } from '@/lib/supabase/errors/types';
import { mapValidationError } from '@/lib/supabase/errors/utils';
import { CacheableServiceConfig } from '@/lib/supabase/services/cacheableService';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';
import { supabase } from '@/lib/supabase/supabaseClient';

type Persona = Database['public']['Tables']['personas']['Row'];
type CreatePersona = Database['public']['Tables']['personas']['Insert'];
type UpdatePersona = Database['public']['Tables']['personas']['Update'];

interface MappedPersona {
  id: string;
  nombre: string;
  email: string | null;
  fotoURL: string | null;
  biografia: string | null;
  categoriaPrincipal: string | null;
  capacidadesPlataforma: string[] | null;
  esAdmin: boolean;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export class PersonasService extends BaseService<Persona, 'personas'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'personas' = 'personas',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'persona' }
  ) {
    super(supabase, tableName, cacheConfig);
  }

  private mapPersonaToDomain(persona: Persona): MappedPersona {
    return {
      ...persona,
      fotoURL: persona.foto_url,
      categoriaPrincipal: persona.categoria_principal,
      esAdmin: persona.es_admin,
      activo: !persona.esta_eliminada,
      eliminadoPorUid: persona.eliminado_por_uid,
      eliminadoEn: persona.eliminado_en,
      creadoEn: persona.created_at,
      actualizadoEn: persona.updated_at
    };
  }

  private mapPersonasToDomain(personas: Persona[]): MappedPersona[] {
    return personas.map(persona => this.mapPersonaToDomain(persona));
  }

  private mapDomainToPersona(data: any): Partial<Persona> {
    return {
      ...data,
      foto_url: data.fotoURL,
      categoria_principal: data.categoriaPrincipal,
      es_admin: data.esAdmin,
      esta_eliminada: !data.activo,
      eliminado_por_uid: data.eliminadoPorUid,
      eliminado_en: data.eliminadoEn,
      created_at: data.creadoEn,
      updated_at: data.actualizadoEn
    };
  }

  protected validateCreateInput(data: CreatePersona): ValidationError | null {
    if (!data.nombre) {
      return {
        name: 'ValidationError',
        message: 'El nombre es requerido',
        field: 'nombre',
        value: data.nombre
      };
    }
    return null;
  }

  protected validateUpdateInput(data: UpdatePersona): ValidationError | null {
    if (data.nombre === '') {
      return {
        name: 'ValidationError',
        message: 'El nombre no puede estar vacío',
        field: 'nombre',
        value: data.nombre
      };
    }
    return null;
  }

  async create(data: Omit<Persona, 'id'>): Promise<ServiceResult<Persona>> {
    try {
      // Validate input
      const validationError = this.validateCreateInput(data as CreatePersona);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const now = new Date().toISOString();
      const { data: newPersona, error } = await this.supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_at: now,
          updated_at: now,
          esta_eliminada: false,
          eliminado_por_uid: null,
          eliminado_en: null
        })
        .select()
        .single();

      if (error) throw error;
      if (!newPersona) throw new Error('Failed to create persona');

      // Cache the new persona
      await this.setInCache(newPersona.id, newPersona);

      return this.createSuccessResult(newPersona);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'create' }));
    }
  }

  async update(id: string, data: Partial<Persona>): Promise<ServiceResult<Persona>> {
    try {
      // Validate input
      const validationError = this.validateUpdateInput(data as UpdatePersona);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const now = new Date().toISOString();
      const { data: updatedPersona, error } = await this.supabase
        .from(this.tableName)
        .update({
          ...data,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updatedPersona) throw new Error('Failed to update persona');

      // Update cache
      await this.setInCache(id, updatedPersona);

      return this.createSuccessResult(updatedPersona);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'update' }));
    }
  }

  async getById(id: string): Promise<ServiceResult<MappedPersona | null>> {
    try {
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(this.mapPersonaToDomain(cached));

      const { data: persona, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!persona) return this.createSuccessResult(null);

      await this.setInCache(id, persona);
      return this.createSuccessResult(this.mapPersonaToDomain(persona));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<MappedPersona[]>> {
    try {
      if (!ids.length) return this.createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return this.createSuccessResult(this.mapPersonasToDomain(cachedResults.filter(Boolean) as Persona[]));
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return this.createSuccessResult(this.mapPersonasToDomain(allResults));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getAll(options?: QueryOptions): Promise<ServiceResult<Persona[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false);

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      // Cache results
      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getAll' }));
    }
  }

  async search(query: string, options?: QueryOptions): Promise<ServiceResult<MappedPersona[]>> {
    try {
      if (!query.trim()) return this.createSuccessResult([]);

      const searchPattern = `%${query.trim()}%`;
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.${searchPattern},email.ilike.${searchPattern}`)
        .eq('esta_eliminada', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(this.mapPersonasToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }

  async logicalDelete(id: string, adminUid: string): Promise<ServiceResult<Persona>> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: true,
          eliminado_por_uid: adminUid,
          eliminado_en: now,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Update cache
      await this.setInCache(id, data);

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'logicalDelete' }));
    }
  }

  async restore(id: string, adminUid: string): Promise<ServiceResult<Persona>> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: false,
          eliminado_por_uid: null,
          eliminado_en: null,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Update cache
      await this.setInCache(id, data);

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'restore' }));
    }
  }

  public async getByEmail(email: string): Promise<ServiceResult<MappedPersona | null>> {
    try {
      if (!this.isValidEmail(email)) {
        return this.createErrorResult({
          name: 'ValidationError',
          message: 'Email inválido',
          field: 'email',
          value: email
        });
      }

      const { data: persona, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('esta_eliminada', false)
        .single();

      if (error) throw error;
      if (!persona) return this.createSuccessResult(null);

      // Cache the result
      await this.setInCache(persona.id, persona);

      return this.createSuccessResult(this.mapPersonaToDomain(persona));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByEmail' }));
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public async getAdmins(): Promise<ServiceResult<Persona[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('es_admin', true)
        .eq('esta_eliminada', false);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      // Cache results
      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getAdmins' }));
    }
  }

  public async getAllWithPagination(options?: QueryOptions): Promise<ServiceResult<Persona[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false);

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: true });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      // Cache results
      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getAllWithPagination' }));
    }
  }

  public async getByCategoria(
    categoria: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Persona[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('categoria_principal', categoria)
        .eq('esta_eliminada', false);

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      // Cache results
      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByCategoria' }));
    }
  }

  public async getByCapacidad(
    capacidad: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Persona[]>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .contains('capacidades_plataforma', [capacidad])
        .eq('esta_eliminada', false);

      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      // Cache results
      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByCapacidad' }));
    }
  }

  public async getByTema(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Persona[]>> {
    try {
      const { data, error } = await this.supabase
        .from('personas_temas')
        .select('persona_id')
        .eq('tema_id', temaId);

      if (error) throw error;
      if (!data || !data.length) return this.createSuccessResult([]);

      const personaIds = data.map(pt => pt.persona_id);
      return this.getByIds(personaIds);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema' }));
    }
  }

  public async getTemas(
    id: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
    try {
      const { data, error } = await this.supabase
        .from('personas_temas')
        .select('temas(*)')
        .eq('persona_id', id);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      return this.createSuccessResult(data.map(pt => pt.temas as Database['public']['Tables']['temas']['Row']));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getTemas' }));
    }
  }

  public async addTema(personaId: string, temaId: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from('personas_temas')
        .insert({ persona_id: personaId, tema_id: temaId });

      if (error) throw error;

      return this.createSuccessResult(true);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addTema' }));
    }
  }

  public async removeTema(personaId: string, temaId: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await this.supabase
        .from('personas_temas')
        .delete()
        .eq('persona_id', personaId)
        .eq('tema_id', temaId);

      if (error) throw error;

      return this.createSuccessResult(true);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeTema' }));
    }
  }

  public async getPublicEgresadosYEstudiantes(
    options?: QueryOptions
  ): Promise<ServiceResult<MappedPersona[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .in('categoria_principal', ['egresado', 'estudiante'])
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(this.mapPersonasToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublicEgresadosYEstudiantes' }));
    }
  }

  public async getPublicTutoresYColaboradores(
    options?: QueryOptions
  ): Promise<ServiceResult<MappedPersona[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .in('categoria_principal', ['tutor', 'colaborador'])
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(this.mapPersonasToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublicTutoresYColaboradores' }));
    }
  }

  async getPublic(): Promise<ServiceResult<MappedPersona[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const persona of data) {
        await this.setInCache(persona.id, persona);
      }

      return this.createSuccessResult(this.mapPersonasToDomain(data));
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async getCurrentUser(): Promise<ServiceResult<Persona | null>> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) return this.createSuccessResult(null);

      const { data: persona, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!persona) return this.createSuccessResult(null);

      await this.setInCache(persona.id, persona);
      return this.createSuccessResult(persona);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getCurrentUser' }));
    }
  }

  async logout(): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'logout' }));
    }
  }
}

export const personasService = new PersonasService(supabase);

export const getPersonaById = (id: string) => personasService.getById(id);
export const getPersonasByIds = (ids: string[]) => personasService.getByIds(ids);
export const getPublicEgresadosYEstudiantes = (options?: QueryOptions) => personasService.getPublicEgresadosYEstudiantes(options);
export const getPublicTutoresYColaboradores = (options?: QueryOptions) => personasService.getPublicTutoresYColaboradores(options);
