import { Database } from "../types/database.types";
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
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
      return createSuccess(newNoticia);
    } catch (error) {
      return createError({
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
  ): Promise<ServiceResult<Noticia>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      const { data: result, error } = await supabase
        .from("noticias")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(result);
    } catch (error) {
      return createError({
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
      return createSuccess(noticia);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // Cambio temporal en noticiasService.ts - método getAll

  async getAll(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<Noticia[] | null>> {
    try {
      console.log(
        "🔍 NoticiasService.getAll called with includeDeleted:",
        includeDeleted
      );

      let query = supabase.from("noticias").select();
      console.log("📝 Base query created");

      if (!includeDeleted) {
        query = query.eq("is_deleted", false);
        console.log("📝 Added filter: is_deleted = false");
      }

      console.log("⏳ Executing query...");
      const { data, error } = await query;

      console.log("📥 Query result:", { data, error });
      console.log("📊 Data length:", data?.length);

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      console.log("✅ Returning success result");
      return createSuccess(data);
    } catch (error) {
      console.error("❌ Service error:", error);
      return createError({
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
      return createSuccess(true);
    } catch (error) {
      return createError({
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
        return createError({
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
      return createSuccess(true);
    } catch (error) {
      return createError({
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

  async getDestacadas(): Promise<ServiceResult<Noticia[]>> {
    try {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("es_destacada", true)
        .eq("is_deleted", false)
        .order("fecha_publicacion", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias destacadas",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getByTipo(tipo: any): Promise<ServiceResult<Noticia[]>> {
    try {
      if (!tipo || !["articulo", "link"].includes(tipo)) {
        return createError({
          name: "ValidationError",
          message: "Valid tipo is required (articulo or link)",
          code: "VALIDATION_ERROR",
          details: { tipo },
        });
      }

      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("tipo", tipo)
        .eq("is_deleted", false)
        .order("fecha_publicacion", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias by tipo",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getRecientes(limit: number = 10): Promise<ServiceResult<Noticia[]>> {
    try {
      if (limit < 1 || limit > 100) {
        return createError({
          name: "ValidationError",
          message: "Limit must be between 1 and 100",
          code: "VALIDATION_ERROR",
          details: { limit },
        });
      }

      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("is_deleted", false)
        .order("fecha_publicacion", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias recientes",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async toggleDestacada(id: string): Promise<ServiceResult<Noticia>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      // Primero obtenemos el estado actual
      const getCurrentResult = await this.getById(id);
      if (!getCurrentResult.success || !getCurrentResult.data) {
        return createError({
          name: "NotFoundError",
          message: "Noticia not found",
          code: "NOT_FOUND",
          details: { id },
        });
      }

      const currentState = getCurrentResult.data.es_destacada;

      const { data, error } = await supabase
        .from("noticias")
        .update({
          es_destacada: !currentState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(data);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error toggling noticia destacada",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
  // --- Relationship Methods ---
  /*
  async getByTemaId(temaId: string): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!temaId) return createError({ name: 'ValidationError', message: 'Tema ID is required', code: 'VALIDATION_ERROR' });

      const { data, error } = await supabase
        .from('noticias')
        .select('*, noticia_tema!inner(tema_id)')
        .eq('noticia_tema.tema_id', temaId)
        .eq('is_deleted', false);

      if (error) throw error;
      return createSuccess(data);
    } catch (error) {
      return createError({ name: 'ServiceError', message: 'Error fetching noticias by tema', code: 'DB_ERROR', details: error });
    }
  }
  */
}

export const noticiasService = new NoticiasService();
