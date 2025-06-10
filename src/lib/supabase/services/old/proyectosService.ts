import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

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

export class ProyectosService extends BaseService<Proyecto> {
  private proyectoTemaService: ProyectoTemaService;
  private proyectoPersonaRolService: ProyectoPersonaRolService;
  private proyectoOrganizacionRolService: ProyectoOrganizacionRolService;

  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, { tableName: 'proyectos' });
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
      const { data: proyecto, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createSuccess(null);
        }
        throw error;
      }

      if (!proyecto) return createSuccess(null);
      return createSuccess(proyecto);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByIds(ids: string[]): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!ids.length) return createSuccess([]);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', ids);

      if (error) throw error;
      if (!data) return createSuccess([]);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublic(): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  public async search(query: string, options?: QueryOptions): Promise<ServiceResult<Proyecto[]>> {
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

  protected validateCreateInput(data: CreateProyecto): ValidationError | null {
    if (!data.titulo) {
      return mapValidationError('El título es requerido', 'titulo', data.titulo);
    }
    return null;
  }

  protected validateUpdateInput(data: UpdateProyecto): ValidationError | null {
    if (data.titulo === '') {
      return mapValidationError('El título no puede estar vacío', 'titulo', data.titulo);
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
        .select('*')
        .eq('status', status)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByTema(
    temaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!temaId) {
        return createError({
          name: 'ValidationError',
          message: 'Tema ID is required',
          code: 'VALIDATION_ERROR',
          details: { temaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, proyecto_tema!inner(*)')
        .eq('proyecto_tema.tema_id', temaId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByPersona(
    personaId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Persona ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, proyecto_persona_rol!inner(*)')
        .eq('proyecto_persona_rol.persona_id', personaId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByOrganizacion(
    organizacionId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!organizacionId) {
        return createError({
          name: 'ValidationError',
          message: 'Organizacion ID is required',
          code: 'VALIDATION_ERROR',
          details: { organizacionId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, proyecto_organizacion_rol!inner(*)')
        .eq('proyecto_organizacion_rol.organizacion_id', organizacionId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async addProject(
    project: CreateProyecto,
    temaIds: string[],
    personaIds: { id: string; rol: 'director' | 'investigador' | 'colaborador' | 'estudiante' }[],
    organizacionIds: { id: string; rol: 'patrocinador' | 'colaborador' | 'investigador' | 'institucion' }[]
  ): Promise<ServiceResult<Proyecto | null>> {
    try {
      const validationError = this.validateCreateInput(project);
      if (validationError) {
        return createError({
          name: 'ValidationError',
          message: validationError.message,
          code: 'VALIDATION_ERROR',
          details: validationError
        });
      }

      const { data: proyecto, error } = await this.supabase
        .from(this.tableName)
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      if (!proyecto) {
        return createError({
          name: 'ServiceError',
          message: 'Failed to create project',
          code: 'DB_ERROR',
          details: { project }
        });
      }

      // Add temas
      for (const temaId of temaIds) {
        const temaResult = await this.proyectoTemaService.addTemaToProyecto(proyecto.id, temaId);
        if (!temaResult.success) {
          return createError({
            name: 'ServiceError',
            message: 'Failed to add tema to project',
            code: 'DB_ERROR',
            details: { temaId, error: temaResult.error }
          });
        }
      }

      // Add personas
      for (const { id, rol } of personaIds) {
        const personaResult = await this.proyectoPersonaRolService.addPersonaToProyecto(proyecto.id, id, rol);
        if (!personaResult.success) {
          return createError({
            name: 'ServiceError',
            message: 'Failed to add persona to project',
            code: 'DB_ERROR',
            details: { personaId: id, rol, error: personaResult.error }
          });
        }
      }

      // Add organizaciones
      for (const { id, rol } of organizacionIds) {
        const organizacionResult = await this.proyectoOrganizacionRolService.addOrganizacionToProyecto(proyecto.id, id, rol);
        if (!organizacionResult.success) {
          return createError({
            name: 'ServiceError',
            message: 'Failed to add organizacion to project',
            code: 'DB_ERROR',
            details: { organizacionId: id, rol, error: organizacionResult.error }
          });
        }
      }

      return createSuccess(proyecto);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getProjectsForUser(
    userId: string,
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!userId) {
        return createError({
          name: 'ValidationError',
          message: 'User ID is required',
          code: 'VALIDATION_ERROR',
          details: { userId }
        });
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*, proyecto_persona_rol!inner(*)')
        .eq('proyecto_persona_rol.persona_id', userId)
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getPublicProjects(
    options?: QueryOptions
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async logicalDelete(id: string, userId: string): Promise<ServiceResult<Proyecto | null>> {
    try {
      if (!userId) {
        return createError({
          name: 'ValidationError',
          message: 'User ID is required',
          code: 'VALIDATION_ERROR',
          details: { userId }
        });
      }

      const { data: proyecto, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminado: true,
          eliminado_por_uid: userId,
          eliminado_en: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Project not found',
            code: 'VALIDATION_ERROR',
            details: { id }
          });
        }
        throw error;
      }

      if (!proyecto) {
        return createError({
          name: 'ValidationError',
          message: 'Project not found',
          code: 'VALIDATION_ERROR',
          details: { id }
        });
      }

      return createSuccess(proyecto);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async restore(id: string, userId: string): Promise<ServiceResult<Proyecto | null>> {
    try {
      if (!userId) {
        return createError({
          name: 'ValidationError',
          message: 'User ID is required',
          code: 'VALIDATION_ERROR',
          details: { userId }
        });
      }

      const { data: proyecto, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminado: false,
          eliminado_por_uid: null,
          eliminado_en: null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Project not found',
            code: 'VALIDATION_ERROR',
            details: { id }
          });
        }
        throw error;
      }

      if (!proyecto) {
        return createError({
          name: 'ValidationError',
          message: 'Project not found',
          code: 'VALIDATION_ERROR',
          details: { id }
        });
      }

      return createSuccess(proyecto);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async update(id: string, data: UpdateProyecto): Promise<ServiceResult<Proyecto | null>> {
    try {
      const validationError = this.validateUpdateInput(data);
      if (validationError) {
        return createError({
          name: 'ValidationError',
          message: validationError.message,
          code: 'VALIDATION_ERROR',
          details: validationError
        });
      }

      const { data: proyecto, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createError({
            name: 'ValidationError',
            message: 'Project not found',
            code: 'VALIDATION_ERROR',
            details: { id }
          });
        }
        throw error;
      }

      if (!proyecto) {
        return createError({
          name: 'ValidationError',
          message: 'Project not found',
          code: 'VALIDATION_ERROR',
          details: { id }
        });
      }

      return createSuccess(proyecto);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async create(data: Omit<Proyecto, 'id'>): Promise<ServiceResult<Proyecto | null>> {
    // Ensure required fields are not undefined
    const createData: Omit<Proyecto, 'id'> = {
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      archivo_principal_url: data.archivo_principal_url ?? null,
      status: data.status ?? 'borrador',
      esta_eliminado: data.esta_eliminado ?? false,
      eliminado_por_uid: data.eliminado_por_uid ?? null,
      eliminado_en: data.eliminado_en ?? null,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    };
    return super.create(createData);
  }

  protected async getRelatedEntities<R>(
    id: string,
    sourceTable: string,
    targetTable: string,
    junctionTable: string,
    options?: QueryOptions
  ): Promise<ServiceResult<R[] | null>> {
    try {
      let query = this.supabase
        .from(targetTable)
        .select(`
          *,
          ${junctionTable}!inner (
            ${sourceTable}!inner (
              id
            )
          )
        `)
        .eq(`${junctionTable}.${sourceTable}_id`, id);

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      // Apply sorting
      if (options?.sortBy) {
        query = query.order(options.sortBy, { 
          ascending: options.sortOrder !== 'desc' 
        });
      }

      const { data: results, error } = await query;

      if (error) throw error;
      if (!results) return createSuccess<R[] | null>(null);

      return createSuccess(results as R[]);
    } catch (error) {
      return createError<R[] | null>({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  protected getSearchableFields(): string[] {
    return ['nombre', 'descripcion', 'estado', 'ciudad', 'provincia'];
  }
} 
