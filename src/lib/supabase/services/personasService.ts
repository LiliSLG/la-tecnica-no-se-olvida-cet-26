import { Database } from '../types/database.types';
import { ServiceResult } from '../types/serviceResult';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';
import { supabase } from '../supabaseClient';

type Persona = Database['public']['Tables']['personas']['Row'];
type CreatePersona = Database['public']['Tables']['personas']['Insert'];
type UpdatePersona = Database['public']['Tables']['personas']['Update'];

class PersonasService {
  async create(data: CreatePersona): Promise<ServiceResult<Persona | null>> {
    try {
      const { data: result, error } = await supabase
        .from('personas')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(result);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async update(id: string, data: UpdatePersona): Promise<ServiceResult<Persona | null>> {
    try {
      if (!id) {
        return createError({
          name: 'ValidationError',
          message: 'ID is required',
          code: 'VALIDATION_ERROR',
          details: { id }
        });
      }

      const { data: result, error } = await supabase
        .from('personas')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(result);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<Persona | null>> {
    try {
      if (!id) {
        return createError({
          name: 'ValidationError',
          message: 'ID is required',
          code: 'VALIDATION_ERROR',
          details: { id }
        });
      }

      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return createSuccess(null); // Not found is not an error
        }
        throw error;
      }

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

  async getAll(includeDeleted: boolean = false): Promise<ServiceResult<Persona[] | null>> {
    try {
      let query = supabase
        .from('personas')
        .select('*')
        .order('nombre', { ascending: true });

      if (!includeDeleted) {
        query = query.eq('esta_eliminada', false);
      }

      const { data, error } = await query;

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

  async delete(id: string, deletedByUid: string): Promise<ServiceResult<boolean>> {
    try {
      if (!id) {
        return createError({
          name: 'ValidationError',
          message: 'ID is required',
          code: 'VALIDATION_ERROR',
          details: { id }
        });
      }

      const { error } = await supabase
        .from('personas')
        .update({
          esta_eliminada: true,
          eliminado_en: new Date().toISOString(),
          eliminado_por_uid: deletedByUid
        })
        .eq('id', id);

      if (error) throw error;
      return createSuccess(true);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: error
      });
    }
  }

  async getByProyecto(proyectoId: string): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: 'ValidationError',
          message: 'Proyecto ID is required',
          code: 'VALIDATION_ERROR',
          details: { proyectoId }
        });
      }

      const { data, error } = await supabase
        .from('personas')
        .select(`
          *,
          proyecto_persona!inner (
            proyecto_id
          )
        `)
        .eq('proyecto_persona.proyecto_id', proyectoId)
        .eq('esta_eliminada', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: { operation: 'getByProyecto', proyectoId, error }
      });
    }
  }

  async getByHistoriaOral(historiaOralId: string): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!historiaOralId) {
        return createError({
          name: 'ValidationError',
          message: 'Historia Oral ID is required',
          code: 'VALIDATION_ERROR',
          details: { historiaOralId }
        });
      }

      const { data, error } = await supabase
        .from('personas')
        .select(`
          *,
          historia_oral_persona!inner (
            historia_oral_id
          )
        `)
        .eq('historia_oral_persona.historia_oral_id', historiaOralId)
        .eq('esta_eliminada', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: { operation: 'getByHistoriaOral', historiaOralId, error }
      });
    }
  }

  async getByNoticia(noticiaId: string): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!noticiaId) {
        return createError({
          name: 'ValidationError',
          message: 'Noticia ID is required',
          code: 'VALIDATION_ERROR',
          details: { noticiaId }
        });
      }

      const { data, error } = await supabase
        .from('personas')
        .select(`
          *,
          noticia_persona!inner (
            noticia_id
          )
        `)
        .eq('noticia_persona.noticia_id', noticiaId)
        .eq('esta_eliminada', false)
        .order('nombre', { ascending: true });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'DB_ERROR',
        details: { operation: 'getByNoticia', noticiaId, error }
      });
    }
  }
}

export const personasService = new PersonasService(); 