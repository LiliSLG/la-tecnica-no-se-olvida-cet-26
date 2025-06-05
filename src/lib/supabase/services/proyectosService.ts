import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { CacheableServiceConfig } from './cacheableService';

// Import relation services
import { ProyectoTemaService } from './proyectoTemaService';
import { ProyectoPersonaRolService } from './proyectoPersonaRolService';
import { ProyectoOrganizacionRolService } from './proyectoOrganizacionRolService';

type Proyecto = Database['public']['Tables']['proyectos']['Row'];
type CreateProyecto = Database['public']['Tables']['proyectos']['Insert'];
type UpdateProyecto = Database['public']['Tables']['proyectos']['Update'];

interface MappedProyecto {
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

export class ProyectosService extends BaseService<Proyecto, 'proyectos'> {
  private proyectoTemaService: ProyectoTemaService;
  private proyectoPersonaRolService: ProyectoPersonaRolService;
  private proyectoOrganizacionRolService: ProyectoOrganizacionRolService;

  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'proyectos' = 'proyectos',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'proyecto' }
  ) {
    super(supabase, tableName, cacheConfig);
    this.proyectoTemaService = new ProyectoTemaService(supabase);
    this.proyectoPersonaRolService = new ProyectoPersonaRolService(supabase);
    this.proyectoOrganizacionRolService = new ProyectoOrganizacionRolService(supabase);
  }

  private mapProyecto(proyecto: Proyecto): MappedProyecto {
    return {
      id: proyecto.id,
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
      archivoPrincipalURL: proyecto.archivo_principal_url,
      estado: proyecto.status,
      activo: !proyecto.esta_eliminado,
      eliminadoPorUid: proyecto.eliminado_por_uid,
      eliminadoEn: proyecto.eliminado_en,
      creadoEn: proyecto.created_at,
      actualizadoEn: proyecto.updated_at
    };
  }

  private mapProyectos(proyectos: Proyecto[]): MappedProyecto[] {
    return proyectos.map(proyecto => this.mapProyecto(proyecto));
  }

  async getById(id: string): Promise<ServiceResult<Proyecto | null>> {
    try {
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(cached);

      const { data: proyecto, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!proyecto) return this.createSuccessResult(null);

      await this.setInCache(id, proyecto);
      return this.createSuccessResult(proyecto);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Proyecto[]>> {
    try {
      if (!ids.length) return this.createSuccessResult([]);

      const cachedResults = await Promise.all(ids.map(id => this.getFromCache(id)));
      const missingIds = ids.filter((id, index) => !cachedResults[index]);

      if (missingIds.length === 0) {
        return this.createSuccessResult(cachedResults.filter(Boolean) as Proyecto[]);
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', missingIds);

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const proyecto of data) {
        await this.setInCache(proyecto.id, proyecto);
      }

      const allResults = [...cachedResults.filter(Boolean), ...data];
      return this.createSuccessResult(allResults);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByIds' }));
    }
  }

  async getPublic(): Promise<ServiceResult<Proyecto[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult([]);

      for (const proyecto of data) {
        await this.setInCache(proyecto.id, proyecto);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublic' }));
    }
  }

  async search(term: string): Promise<ServiceResult<Proyecto[]>> {
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

      for (const proyecto of data) {
        await this.setInCache(proyecto.id, proyecto);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'search' }));
    }
  }

  protected validateCreateInput(data: CreateProyecto): ValidationError | null {
    if (!data.titulo) {
      return {
        field: 'titulo',
        message: 'El título es requerido',
        value: data.titulo,
        name: 'ValidationError'
      };
    }
    return null;
  }

  protected validateUpdateInput(data: UpdateProyecto): ValidationError | null {
    if (data.titulo === '') {
      return {
        field: 'titulo',
        message: 'El título no puede estar vacío',
        value: data.titulo,
        name: 'ValidationError'
      };
    }
    return null;
  }

  async getByStatus(
    status: Proyecto['status'],
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('status', status)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Cache results
      for (const result of data) {
        await this.setInCache(result.id, result);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByStatus' }));
    }
  }

  async getByTema(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, proyecto_tema!inner(*)')
        .eq('proyecto_tema.tema_id', temaId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Cache results
      for (const result of data) {
        await this.setInCache(result.id, result);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByTema' }));
    }
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, proyecto_persona_rol!inner(*)')
        .eq('proyecto_persona_rol.persona_id', personaId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Cache results
      for (const result of data) {
        await this.setInCache(result.id, result);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByPersona' }));
    }
  }

  async getByOrganizacion(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, proyecto_organizacion_rol!inner(*)')
        .eq('proyecto_organizacion_rol.organizacion_id', organizacionId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Cache results
      for (const result of data) {
        await this.setInCache(result.id, result);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByOrganizacion' }));
    }
  }

  async addProject(
    project: CreateProyecto,
    temaIds: string[],
    personaIds: { id: string; rol: 'director' | 'investigador' | 'colaborador' | 'estudiante' }[],
    organizacionIds: { id: string; rol: 'patrocinador' | 'colaborador' | 'investigador' | 'institucion' }[]
  ): Promise<ServiceResult<Proyecto | null>> {
    try {
      // Validate project data
      const validationError = this.validateCreateInput(project);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      // Create project
      const { data: newProject, error: projectError } = await this.supabase
        .from(this.tableName)
        .insert(project)
        .select()
        .single();

      if (projectError) throw projectError;
      if (!newProject) throw new Error('Failed to create project');

      // Add temas using ProyectoTemaService
      for (const temaId of temaIds) {
        await this.proyectoTemaService.create({ proyecto_id: newProject.id, tema_id: temaId });
      }

      // Add personas using ProyectoPersonaRolService
      for (const persona of personaIds) {
        await this.proyectoPersonaRolService.create({
          proyecto_id: newProject.id,
          persona_id: persona.id,
          rol: persona.rol
        });
      }

      // Add organizaciones using ProyectoOrganizacionRolService
      for (const organizacion of organizacionIds) {
        await this.proyectoOrganizacionRolService.create({
          proyecto_id: newProject.id,
          organizacion_id: organizacion.id,
          rol: organizacion.rol
        });
      }

      // Cache the new project
      await this.setInCache(newProject.id, newProject);

      return this.createSuccessResult(newProject);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addProject' }));
    }
  }

  async getProjectsForUser(
    userId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, proyecto_persona_rol!inner(*)')
        .eq('proyecto_persona_rol.persona_id', userId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Cache results
      for (const result of data) {
        await this.setInCache(result.id, result);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getProjectsForUser' }));
    }
  }

  async getPublicProjects(
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('status', 'published')
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Cache results
      for (const result of data) {
        await this.setInCache(result.id, result);
      }

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPublicProjects' }));
    }
  }

  async logicalDelete(id: string, userId: string): Promise<ServiceResult<Proyecto | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminado: true,
          eliminado_en: new Date().toISOString(),
          eliminado_por_uid: userId
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // No need to update cache on logical delete

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'logicalDelete' }));
    }
  }

  async restore(id: string, userId: string): Promise<ServiceResult<Proyecto | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminado: false,
          eliminado_en: null,
          eliminado_por_uid: null
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

  async update(id: string, data: UpdateProyecto): Promise<ServiceResult<Proyecto>> {
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
          mapValidationError('Proyecto not found', 'id', id)
        );
      }

      await this.setInCache(id, updated);
      return this.createSuccessResult(updated);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'update' }));
    }
  }

  async create(data: CreateProyecto): Promise<ServiceResult<Proyecto>> {
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
          mapValidationError('Failed to create proyecto', 'data', data)
        );
      }

      await this.setInCache(created.id, created);
      return this.createSuccessResult(created);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'create' }));
    }
  }
} 
