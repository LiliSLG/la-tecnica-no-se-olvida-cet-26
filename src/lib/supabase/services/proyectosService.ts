import { Database } from "../types/database.types";
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { supabase } from "../client";

type Proyecto = Database["public"]["Tables"]["proyectos"]["Row"];
type CreateProyecto = Database["public"]["Tables"]["proyectos"]["Insert"];
type UpdateProyecto = Database["public"]["Tables"]["proyectos"]["Update"];

class ProyectosService {
  // --- Standard CRUD Methods ---

  async create(data: CreateProyecto): Promise<ServiceResult<Proyecto | null>> {
    try {
      const { data: newProyecto, error } = await supabase
        .from("proyectos")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(newProyecto);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error creating proyecto",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async update(
    id: string,
    data: UpdateProyecto
  ): Promise<ServiceResult<Proyecto>> {
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
        .from("proyectos")
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
        message: "Error updating proyecto",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<Proyecto | null>> {
    try {
      const { data: proyecto, error } = await supabase
        .from("proyectos")
        .select()
        .eq("id", id)
        .single();

      if (error) throw error;
      return createSuccess(proyecto);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching proyecto",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getAll(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      let query = supabase.from("proyectos").select();

      if (!includeDeleted) {
        query = query.eq("is_deleted", false);
      }

      const { data: proyectos, error } = await query;

      if (error) throw error;
      return createSuccess(proyectos);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching proyectos",
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
        .from("proyectos")
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
        message: "Error deleting proyecto",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

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
        .from("proyectos")
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

  async getByEstado(estado: any): Promise<ServiceResult<Proyecto[]>> {
    try {
      if (!estado) {
        return createError({
          name: "ValidationError",
          message: "Estado is required",
          code: "VALIDATION_ERROR",
          details: { estado },
        });
      }

      const { data, error } = await supabase
        .from("proyectos")
        .select("*")
        .eq("estado_actual", estado)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching proyectos by estado",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getByAno(ano: number): Promise<ServiceResult<Proyecto[]>> {
    try {
      if (!ano || ano < 1990 || ano > new Date().getFullYear() + 5) {
        return createError({
          name: "ValidationError",
          message: "Valid ano is required",
          code: "VALIDATION_ERROR",
          details: { ano },
        });
      }

      const { data, error } = await supabase
        .from("proyectos")
        .select("*")
        .eq("ano_proyecto", ano)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching proyectos by ano",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getPublicos(): Promise<ServiceResult<Proyecto[]>> {
    try {
      const { data, error } = await supabase
        .from("proyectos")
        .select("*")
        .eq("is_deleted", false)
        .in("estado_actual", ["finalizado", "presentado"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching proyectos publicos",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getFinalizados(): Promise<ServiceResult<Proyecto[]>> {
    try {
      const { data, error } = await supabase
        .from("proyectos")
        .select("*")
        .eq("estado_actual", "finalizado")
        .eq("is_deleted", false)
        .order("fecha_finalizacion_real", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching proyectos finalizados",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getEnDesarrollo(): Promise<ServiceResult<Proyecto[]>> {
    try {
      const { data, error } = await supabase
        .from("proyectos")
        .select("*")
        .eq("estado_actual", "en_desarrollo")
        .eq("is_deleted", false)
        .order("fecha_inicio", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching proyectos en desarrollo",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getAnosDisponibles(): Promise<ServiceResult<number[]>> {
    try {
      const { data, error } = await supabase
        .from("proyectos")
        .select("ano_proyecto")
        .eq("is_deleted", false)
        .not("ano_proyecto", "is", null);

      if (error) throw error;

      // Extraer años únicos y ordenar
      const anos = [
        ...new Set(data?.map((item) => item.ano_proyecto).filter(Boolean)),
      ] as number[];
      anos.sort((a, b) => b - a); // Más recientes primero

      return createSuccess(anos);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching anos disponibles",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
  // --- Relationship Methods ---

  async getByTemaId(temaId: string): Promise<ServiceResult<Proyecto[] | null>> {
    try {
      if (!temaId)
        return createError({
          name: "ValidationError",
          message: "Tema ID is required",
          code: "VALIDATION_ERROR",
        });
      const { data, error } = await supabase
        .from("proyectos")
        .select("*, proyecto_tema!inner(tema_id)")
        .eq("proyecto_tema.tema_id", temaId)
        .eq("is_deleted", false);

      if (error) throw error;
      return createSuccess(data);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching proyectos by tema",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
}

export const proyectosService = new ProyectosService();
