import { Database } from "../types/database.types";
import {
  ServiceResult,
  createSuccessResult,
  createErrorResult,
} from "../types/serviceResult";
import { supabase } from "../client";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];
type CreateNoticia = Database["public"]["Tables"]["noticias"]["Insert"];
type UpdateNoticia = Database["public"]["Tables"]["noticias"]["Update"];

class NoticiasService {
  // --- Standard CRUD Methods ---

  async create(data: CreateNoticia): Promise<ServiceResult<Noticia | null>> {
    try {
      const { data: newNoticia, error } = await supabase
        .from("noticias")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return createSuccessResult(newNoticia);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error creating noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async update(
    id: string,
    data: UpdateNoticia
  ): Promise<ServiceResult<Noticia | null>> {
    try {
      const { data: updatedNoticia, error } = await supabase
        .from("noticias")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return createSuccessResult(updatedNoticia);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error updating noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<Noticia | null>> {
    try {
      const { data: noticia, error } = await supabase
        .from("noticias")
        .select()
        .eq("id", id)
        .single();

      if (error) throw error;
      return createSuccessResult(noticia);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error fetching noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getAll(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<Noticia[] | null>> {
    try {
      let query = supabase.from("noticias").select();

      if (!includeDeleted) {
        query = query.eq("is_deleted", false);
      }
      const { data: noticias, error } = await query;

      if (error) throw error;
      return createSuccessResult(noticias);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error fetching noticias",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async delete(
    id: string,
    deletedByUid: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from("noticias")
        .update({
          is_deleted: true,
          deleted_by_uid: deletedByUid,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error deleting noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // En temasService.ts, dentro de la clase TemasService

  async restore(id: string): Promise<ServiceResult<boolean>> {
    try {
      if (!id) {
        return createErrorResult({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      const { error } = await supabase
        .from("noticias")
        .update({
          is_deleted: false,
          // Opcional: podrías querer limpiar también deleted_at  y deleted_by_uid
          // deleted_at : null,
          // deleted_by_uid : null,
        })
        .eq("id", id);

      if (error) throw error;
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
  // --- Relationship Methods ---
  /*
  async getByTemaId(temaId: string): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!temaId) return createErrorResult({ name: 'ValidationError', message: 'Tema ID is required', code: 'VALIDATION_ERROR' });

      const { data, error } = await supabase
        .from('noticias')
        .select('*, noticia_tema!inner(tema_id)')
        .eq('noticia_tema.tema_id', temaId)
        .eq('is_deleted', false);

      if (error) throw error;
      return createSuccessResult(data);
    } catch (error) {
      return createErrorResult({ name: 'ServiceError', message: 'Error fetching noticias by tema', code: 'DB_ERROR', details: error });
    }
  }
  */
}

export const noticiasService = new NoticiasService();
