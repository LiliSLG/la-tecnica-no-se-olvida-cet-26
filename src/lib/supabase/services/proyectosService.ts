import { Database } from '../types/database.types';
import { ServiceResult, createSuccessResult, createErrorResult } from '../types/serviceResult';
import { supabase } from '../supabaseClient';

type Proyecto = Database['public']['Tables']['proyectos']['Row'];
type CreateProyecto = Database['public']['Tables']['proyectos']['Insert'];
type UpdateProyecto = Database['public']['Tables']['proyectos']['Update'];

class ProyectosService {
  // --- Standard CRUD Methods ---

  async create(data: CreateProyecto): Promise<ServiceResult<Proyecto | null>> {
    try {
      const { data: newProyecto, error } = await supabase
        .from('proyectos')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return createSuccessResult(newProyecto);
    } catch (error) {
      return createErrorResult({ name: 'ServiceError', message: 'Error creating proyecto', code: 'DB_ERROR', details: error });
    }
  }

  async update(id: string, data: UpdateProyecto): Promise<ServiceResult<Proyecto | null>> {
    try {
      const { data: updatedProyecto, error } = await supabase
        .from('proyectos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return createSuccessResult(updatedProyecto);
    } catch (error) {
      return createErrorResult({ name: 'ServiceError', message: 'Error updating proyecto', code: 'DB_ERROR', details: error });
    }
  }

  async getById(id: string): Promise<ServiceResult<Proyecto | null>> {
    try {
      const { data: proyecto, error } = await supabase
        .from('proyectos')
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      return createSuccessResult(proyecto);
    } catch (error) {
      return createErrorResult({ name: 'ServiceError', message: 'Error fetching proyecto', code: 'DB_ERROR', details: error });
    }
  }

  async getAll(includeDeleted: boolean = false): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      let query = supabase
        .from('proyectos')
        .select();

      if (!includeDeleted) {
        query = query.eq('es_eliminado', false);
      }

      const { data: proyectos, error } = await query;

      if (error) throw error;
      return createSuccessResult(proyectos);
    } catch (error) {
      return createErrorResult({ name: 'ServiceError', message: 'Error fetching proyectos', code: 'DB_ERROR', details: error });
    }
  }

  async delete(id: string, deletedByUid: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from('proyectos')
        .update({
          es_eliminado: true,
          deleted_by: deletedByUid,
          deleted_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult({ name: 'ServiceError', message: 'Error deleting proyecto', code: 'DB_ERROR', details: error });
    }
  }

  // --- Relationship Methods ---

  async getByTemaId(temaId: string): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!temaId) return createErrorResult({ name: 'ValidationError', message: 'Tema ID is required', code: 'VALIDATION_ERROR' });

      const { data, error } = await supabase
        .from('proyectos')
        .select('*, proyecto_tema!inner(tema_id)')
        .eq('proyecto_tema.tema_id', temaId)
        .eq('es_eliminado', false);

      if (error) throw error;
      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult({ name: 'ServiceError', message: 'Error fetching proyectos by tema', code: 'DB_ERROR', details: error });
    }
  }
}

export const proyectosService = new ProyectosService(); 