import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';

type ProyectoTema = Database['public']['Tables']['proyecto_tema']['Row'] & { id: string };
type CreateProyectoTema = Database['public']['Tables']['proyecto_tema']['Insert'];

export class ProyectoTemaService extends BaseService<ProyectoTema> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, { tableName: 'proyecto_tema' });
  }

  protected handleError(error: unknown, context: { operation: string; [key: string]: any }): ValidationError {
    if (error instanceof Error) {
      return {
        name: 'ServiceError',
        message: error.message,
        code: 'DB_ERROR',
        source: 'ProyectoTemaService',
        details: { ...context, error }
      };
    }
    return {
      name: 'ServiceError',
      message: 'An unexpected error occurred',
      code: 'DB_ERROR',
      source: 'ProyectoTemaService',
      details: { ...context, error }
    };
  }

  protected validateCreateInput(data: CreateProyectoTema): ValidationError | null {
    if (!data.proyecto_id) {
      return mapValidationError('Proyecto ID is required', 'proyecto_id', data.proyecto_id);
    }

    if (!data.tema_id) {
      return mapValidationError('Tema ID is required', 'tema_id', data.tema_id);
    }

    return null;
  }

  protected validateUpdateInput(data: Partial<ProyectoTema>): ValidationError | null {
    if (data.proyecto_id === '') {
      return mapValidationError('Proyecto ID cannot be empty', 'proyecto_id', data.proyecto_id);
    }

    if (data.tema_id === '') {
      return mapValidationError('Tema ID cannot be empty', 'tema_id', data.tema_id);
    }

    return null;
  }

  async addTemaToProyecto(proyectoId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !temaId) {
        return createError(
          mapValidationError('Both proyectoId and temaId are required', 'relationship', { proyectoId, temaId })
        );
      }

      // Check if proyecto exists
      const { data: proyecto, error: proyectoError } = await this.supabase
        .from('proyectos')
        .select('id')
        .eq('id', proyectoId)
        .single();

      if (proyectoError || !proyecto) {
        return createError(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return createError(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('tema_id', temaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return createError(
          mapValidationError('Relationship already exists', 'relationship', { proyectoId, temaId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          proyecto_id: proyectoId,
          tema_id: temaId
        });

      if (error) throw error;
      return createSuccess(undefined);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'addTemaToProyecto', proyectoId, temaId }));
    }
  }

  async removeTemaFromProyecto(proyectoId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!proyectoId || !temaId) {
        return createError(
          mapValidationError('Both proyectoId and temaId are required', 'relationship', { proyectoId, temaId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('proyecto_id', proyectoId)
        .eq('tema_id', temaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return createError(
            mapValidationError('Relationship does not exist', 'relationship', { proyectoId, temaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('proyecto_id', proyectoId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return createSuccess(undefined);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'removeTemaFromProyecto', proyectoId, temaId }));
    }
  }

  async getTemasByProyecto(proyectoId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
    try {
      if (!proyectoId) {
        return createError(
          mapValidationError('Proyecto ID is required', 'proyectoId', proyectoId)
        );
      }

      // Check if proyecto exists
      const { data: proyecto, error: proyectoError } = await this.supabase
        .from('proyectos')
        .select('id')
        .eq('id', proyectoId)
        .single();

      if (proyectoError || !proyecto) {
        return createError(
          mapValidationError('Proyecto not found', 'proyectoId', proyectoId)
        );
      }

      const { data, error } = await this.supabase
        .from('temas')
        .select(`
          *,
          proyecto_tema!inner(proyecto_id)
        `)
        .eq('proyecto_tema.proyecto_id', proyectoId);

      if (error) throw error;
      return createSuccess(data);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getTemasByProyecto', proyectoId }));
    }
  }

  async getProyectosByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['proyectos']['Row'][] | null>> {
    try {
      if (!temaId) {
        return createError(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return createError(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

      const { data, error } = await this.supabase
        .from('proyectos')
        .select(`
          *,
          proyecto_tema!inner(tema_id)
        `)
        .eq('proyecto_tema.tema_id', temaId);

      if (error) throw error;
      return createSuccess(data);
    } catch (error) {
      return createError(this.handleError(error, { operation: 'getProyectosByTema', temaId }));
    }
  }
} 