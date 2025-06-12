import { Database } from '../types/database.types';
import { ServiceResult } from '../types/serviceResult';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';
import { supabase } from '../supabaseClient';

type Tema = Database['public']['Tables']['temas']['Row'];
type CreateTema = Database['public']['Tables']['temas']['Insert'];
type UpdateTema = Database['public']['Tables']['temas']['Update'];

class TemasService {
  async create(data: CreateTema): Promise<ServiceResult<Tema | null>> {
    try {
      const { data: result, error } = await supabase
        .from('temas')
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

  async update(id: string, data: UpdateTema): Promise<ServiceResult<Tema | null>> {
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
        .from('temas')
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

  async getById(id: string): Promise<ServiceResult<Tema | null>> {
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
        .from('temas')
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

  async getAll(includeDeleted: boolean = false): Promise<ServiceResult<Tema[] | null>> {
    try {
      let query = supabase
        .from('temas')
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
        .from('temas')
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

  async restore(id: string): Promise<ServiceResult<boolean>> {
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
        .from('temas')
        .update({
          esta_eliminada: false,
          // Opcional: podrías querer limpiar también eliminado_en y eliminado_por_uid
          // eliminado_en: null,
          // eliminado_por_uid: null,
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
  
  async getByPersona(personaId: string): Promise<ServiceResult<Tema[] | null>> {
    try {
      if (!personaId) {
        return createError({
          name: 'ValidationError',
          message: 'Persona ID is required',
          code: 'VALIDATION_ERROR',
          details: { personaId }
        });
      }

      const { data, error } = await supabase
        .from('temas')
        .select(`
          *,
          persona_tema!inner (
            persona_id
          )
        `)
        .eq('persona_tema.persona_id', personaId)
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
        details: { operation: 'getByPersona', personaId, error }
      });
    }
  }

  async getByProyecto(proyectoId: string): Promise<ServiceResult<Tema[] | null>> {
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
        .from('temas')
        .select(`
          *,
          proyecto_tema!inner (
            proyecto_id
          )
        `)
        .eq('proyecto_tema.proyecto_id', proyectoId)
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

  async getByHistoriaOral(historiaOralId: string): Promise<ServiceResult<Tema[] | null>> {
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
        .from('temas')
        .select(`
          *,
          historia_oral_tema!inner (
            historia_oral_id
          )
        `)
        .eq('historia_oral_tema.historia_oral_id', historiaOralId)
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

  async getByNoticia(noticiaId: string): Promise<ServiceResult<Tema[] | null>> {
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
        .from('temas')
        .select(`
          *,
          noticia_tema!inner (
            noticia_id
          )
        `)
        .eq('noticia_tema.noticia_id', noticiaId)
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

export const temasService = new TemasService(); 