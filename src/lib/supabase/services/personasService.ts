import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult, QueryOptions } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';
import { supabase } from '../supabaseClient';

type Persona = Database['public']['Tables']['personas']['Row'];
type CreatePersona = Database['public']['Tables']['personas']['Insert'];
type UpdatePersona = Database['public']['Tables']['personas']['Update'];

/**
 * Mapped version of Persona for domain use
 */
export interface MappedPersona {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  fotoUrl: string | null;
  categoriaPrincipal: string;
  capacidadesPlataforma: string[];
  activo: boolean;
  esAdmin: boolean;
  tituloProfesional: string | null;
  descripcionPersonalOProfesional: string | null;
  areasDeInteresOExpertise: string[];
  disponibleParaProyectos: boolean;
  esExAlumnoCET: boolean;
  anoCursadaActualCET: number | null;
  anoEgresoCET: number | null;
  titulacionObtenidaCET: string | null;
  proyectoFinalCETId: string | null;
  buscandoOportunidades: boolean;
  estadoSituacionLaboral: string;
  historiaDeExitoOResumenTrayectoria: string | null;
  empresaOInstitucionActual: string | null;
  cargoActual: string | null;
  ofreceColaboracionComo: string[];
  telefonoContacto: string | null;
  linksProfesionales: Array<{
    platform: string;
    url: string;
  }>;
  ubicacionResidencial: {
    ciudad: string;
    provincia: string;
    direccion?: string;
    codigoPostal?: string;
  };
  visibilidadPerfil: string;
  estaEliminada: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for managing personas
 */
export class PersonasService extends BaseService<Persona> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, { tableName: 'personas' });
  }

  /**
   * Maps a database row to a domain model
   */
  private mapPersonaToDomain(persona: Persona): MappedPersona {
    return {
      id: persona.id,
      nombre: persona.nombre,
      apellido: persona.apellido,
      email: persona.email,
      fotoUrl: persona.foto_url,
      categoriaPrincipal: persona.categoria_principal || "otro",
      capacidadesPlataforma: persona.capacidades_plataforma || [],
      activo: persona.activo ?? true,
      esAdmin: persona.es_admin ?? false,
      tituloProfesional: persona.titulo_profesional,
      descripcionPersonalOProfesional: persona.descripcion_personal_o_profesional,
      areasDeInteresOExpertise: persona.areas_de_interes_o_expertise || [],
      disponibleParaProyectos: persona.disponible_para_proyectos ?? false,
      esExAlumnoCET: persona.es_ex_alumno_cet ?? false,
      anoCursadaActualCET: persona.ano_cursada_actual_cet,
      anoEgresoCET: persona.ano_egreso_cet,
      titulacionObtenidaCET: persona.titulacion_obtenida_cet,
      proyectoFinalCETId: persona.proyecto_final_cet_id,
      buscandoOportunidades: persona.buscando_oportunidades ?? false,
      estadoSituacionLaboral: persona.estado_situacion_laboral || "no_especificado",
      historiaDeExitoOResumenTrayectoria: persona.historia_de_exito_o_resumen_trayectoria,
      empresaOInstitucionActual: persona.empresa_o_institucion_actual,
      cargoActual: persona.cargo_actual,
      ofreceColaboracionComo: persona.ofrece_colaboracion_como || [],
      telefonoContacto: persona.telefono_contacto,
      linksProfesionales: persona.links_profesionales || [],
      ubicacionResidencial: {
        ciudad: persona.ubicacion_residencial?.ciudad || "",
        provincia: persona.ubicacion_residencial?.provincia || "rio_negro",
        direccion: persona.ubicacion_residencial?.direccion,
        codigoPostal: persona.ubicacion_residencial?.codigo_postal,
      },
      visibilidadPerfil: persona.visibilidad_perfil || "publico",
      estaEliminada: persona.esta_eliminada ?? false,
      eliminadoPorUid: persona.eliminado_por_uid,
      eliminadoEn: persona.eliminado_en,
      createdAt: persona.created_at,
      updatedAt: persona.updated_at,
    };
  }

  /**
   * Maps an array of database rows to domain models
   */
  private mapPersonasToDomain(personas: Persona[]): MappedPersona[] {
    return personas.map(persona => this.mapPersonaToDomain(persona));
  }

  /**
   * Maps a domain model to a database row
   */
  private mapDomainToPersona(data: Partial<MappedPersona>): Partial<Persona> {
    return {
      id: data.id,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      foto_url: data.fotoUrl,
      categoria_principal: data.categoriaPrincipal,
      capacidades_plataforma: data.capacidadesPlataforma,
      activo: data.activo,
      es_admin: data.esAdmin,
      titulo_profesional: data.tituloProfesional,
      descripcion_personal_o_profesional: data.descripcionPersonalOProfesional,
      areas_de_interes_o_expertise: data.areasDeInteresOExpertise,
      disponible_para_proyectos: data.disponibleParaProyectos,
      es_ex_alumno_cet: data.esExAlumnoCET,
      ano_cursada_actual_cet: data.anoCursadaActualCET,
      ano_egreso_cet: data.anoEgresoCET,
      titulacion_obtenida_cet: data.titulacionObtenidaCET,
      proyecto_final_cet_id: data.proyectoFinalCETId,
      buscando_oportunidades: data.buscandoOportunidades,
      estado_situacion_laboral: data.estadoSituacionLaboral,
      historia_de_exito_o_resumen_trayectoria: data.historiaDeExitoOResumenTrayectoria,
      empresa_o_institucion_actual: data.empresaOInstitucionActual,
      cargo_actual: data.cargoActual,
      ofrece_colaboracion_como: data.ofreceColaboracionComo,
      telefono_contacto: data.telefonoContacto,
      links_profesionales: data.linksProfesionales,
      ubicacion_residencial: data.ubicacionResidencial,
      visibilidad_perfil: data.visibilidadPerfil,
      esta_eliminada: data.estaEliminada,
      eliminado_por_uid: data.eliminadoPorUid,
      eliminado_en: data.eliminadoEn,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
    };
  }

  /**
   * Validates input data for creating a persona
   */
  protected validateCreateInput(data: Partial<Persona>): ValidationError | null {
    if (!data.nombre) {
      return mapValidationError(
        'Nombre is required',
        'persona',
        { field: 'nombre', value: data.nombre }
      );
    }
    return null;
  }

  /**
   * Validates input data for updating a persona
   */
  protected validateUpdateInput(data: Partial<Persona>): ValidationError | null {
    // Add validation logic here
    return null;
  }

  /**
   * Gets a persona by ID with domain mapping
   */
  async getByIdMapped(id: string): Promise<ServiceResult<MappedPersona | null>> {
    try {
      const result = await super.getById(id);
      if (!result.success) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to get persona',
          code: result.error?.code || 'DB_ERROR',
          details: result.error?.details
        });
      }
      if (!result.data) {
        return createSuccess(null);
      }
      return createSuccess(this.mapPersonaToDomain(result.data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Gets all personas with domain mapping
   */
  async getAllMapped(options?: QueryOptions): Promise<ServiceResult<MappedPersona[] | null>> {
    try {
      const result = await super.getAll(options);
      if (!result.success) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to get personas',
          code: result.error?.code || 'DB_ERROR',
          details: result.error?.details
        });
      }
      if (!result.data) {
        return createSuccess(null);
      }
      return createSuccess(this.mapPersonasToDomain(result.data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Searches personas
   */
  public async search(query: string, options?: QueryOptions): Promise<ServiceResult<Persona[]>> {
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

  /**
   * Searches personas with domain mapping
   */
  async searchMapped(query: string, options?: QueryOptions): Promise<ServiceResult<MappedPersona[] | null>> {
    try {
      const result = await this.search(query, options);
      if (!result.success) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to search personas',
          code: result.error?.code || 'DB_ERROR',
          details: result.error?.details
        });
      }
      if (!result.data) {
        return createSuccess(null);
      }
      return createSuccess(this.mapPersonasToDomain(result.data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Creates a new persona with domain mapping
   */
  async createMapped(data: Omit<MappedPersona, 'id'>): Promise<ServiceResult<MappedPersona | null>> {
    try {
      const dbData = this.mapDomainToPersona(data);
      const result = await super.create(dbData as Omit<Persona, 'id'>);
      if (!result.success) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to create persona',
          code: result.error?.code || 'DB_ERROR',
          details: result.error?.details
        });
      }
      if (!result.data) {
        return createSuccess(null);
      }
      return createSuccess(this.mapPersonaToDomain(result.data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Updates a persona with domain mapping
   */
  async updateMapped(id: string, data: Partial<MappedPersona>): Promise<ServiceResult<MappedPersona | null>> {
    try {
      const dbData = this.mapDomainToPersona(data);
      const result = await super.update(id, dbData);
      if (!result.success) {
        return createError({
          name: 'ServiceError',
          message: result.error?.message || 'Failed to update persona',
          code: result.error?.code || 'DB_ERROR',
          details: result.error?.details
        });
      }
      if (!result.data) {
        return createSuccess(null);
      }
      return createSuccess(this.mapPersonaToDomain(result.data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Gets multiple personas by IDs with domain mapping
   */
  async getByIdsMapped(ids: string[]): Promise<ServiceResult<MappedPersona[] | null>> {
    try {
      if (!ids.length) return createSuccess([]);

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('id', ids);

      if (error) throw error;
      if (!data) return createSuccess([]);

      return createSuccess(this.mapPersonasToDomain(data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Gets public egresados and estudiantes with domain mapping
   */
  async getPublicEgresadosYEstudiantesMapped(
    options?: QueryOptions
  ): Promise<ServiceResult<MappedPersona[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .in('categoria_principal', ['egresado', 'estudiante'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(this.mapPersonasToDomain(data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Gets public tutores and colaboradores with domain mapping
   */
  async getPublicTutoresYColaboradoresMapped(
    options?: QueryOptions
  ): Promise<ServiceResult<MappedPersona[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .in('categoria_principal', ['tutor', 'colaborador'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(this.mapPersonasToDomain(data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  /**
   * Gets all public personas with domain mapping
   */
  async getPublicMapped(
    options?: QueryOptions
  ): Promise<ServiceResult<MappedPersona[] | null>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('esta_eliminada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(this.mapPersonasToDomain(data));
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async create(data: Omit<Persona, 'id'>): Promise<ServiceResult<Persona | null>> {
    // Ensure required fields are not undefined
    const createData: Omit<Persona, 'id'> = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email ?? null,
      biografia: data.biografia ?? null,
      foto_url: data.foto_url ?? null,
      categoria_principal: data.categoria_principal ?? "otro",
      capacidades_plataforma: data.capacidades_plataforma ?? [],
      activo: data.activo ?? true,
      es_admin: data.es_admin ?? false,
      titulo_profesional: data.titulo_profesional ?? null,
      descripcion_personal_o_profesional: data.descripcion_personal_o_profesional ?? null,
      areas_de_interes_o_expertise: data.areas_de_interes_o_expertise ?? [],
      disponible_para_proyectos: data.disponible_para_proyectos ?? false,
      es_ex_alumno_cet: data.es_ex_alumno_cet ?? false,
      ano_cursada_actual_cet: data.ano_cursada_actual_cet ?? null,
      ano_egreso_cet: data.ano_egreso_cet ?? null,
      titulacion_obtenida_cet: data.titulacion_obtenida_cet ?? null,
      proyecto_final_cet_id: data.proyecto_final_cet_id ?? null,
      buscando_oportunidades: data.buscando_oportunidades ?? false,
      estado_situacion_laboral: data.estado_situacion_laboral ?? "no_especificado",
      historia_de_exito_o_resumen_trayectoria: data.historia_de_exito_o_resumen_trayectoria ?? null,
      empresa_o_institucion_actual: data.empresa_o_institucion_actual ?? null,
      cargo_actual: data.cargo_actual ?? null,
      ofrece_colaboracion_como: data.ofrece_colaboracion_como ?? [],
      telefono_contacto: data.telefono_contacto ?? null,
      links_profesionales: data.links_profesionales ?? [],
      ubicacion_residencial: {
        ciudad: data.ubicacion_residencial?.ciudad ?? "",
        provincia: data.ubicacion_residencial?.provincia ?? "rio_negro",
        direccion: data.ubicacion_residencial?.direccion,
        codigo_postal: data.ubicacion_residencial?.codigo_postal,
      },
      visibilidad_perfil: data.visibilidad_perfil ?? "publico",
      esta_eliminada: data.esta_eliminada ?? false,
      eliminado_por_uid: data.eliminado_por_uid ?? null,
      eliminado_en: data.eliminado_en ?? null,
      created_at: data.created_at ?? new Date().toISOString(),
      updated_at: data.updated_at ?? new Date().toISOString(),
    };
    return super.create(createData);
  }
}

// Create a singleton instance
const personasService = new PersonasService(supabase);

// Export utility functions
export const getPersonasByIds = (ids: string[]) => personasService.getByIdsMapped(ids);
export const getPublicEgresadosYEstudiantes = (options?: QueryOptions) => 
  personasService.getPublicEgresadosYEstudiantesMapped(options);
export const getPublicTutoresYColaboradores = (options?: QueryOptions) => 
  personasService.getPublicTutoresYColaboradoresMapped(options);
export const getPublicPersonas = (options?: QueryOptions) => 
  personasService.getPublicMapped(options);

// Export the singleton instance
export { personasService };
export default personasService;
