import { Database } from "../types/database.types";
import { ServiceResult } from "../types/serviceResult";
import {
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { supabase } from "../client";
type AnalisisSatelital =
  Database["public"]["Tables"]["analisis_satelitales"]["Row"];
type CreateAnalisisSatelital =
  Database["public"]["Tables"]["analisis_satelitales"]["Insert"];
type UpdateAnalisisSatelital =
  Database["public"]["Tables"]["analisis_satelitales"]["Update"];

class AnalisisSatelitalesService {
  async create(
    data: CreateAnalisisSatelital
  ): Promise<ServiceResult<AnalisisSatelital | null>> {
    try {
      const { data: result, error } = await supabase
        .from("analisis_satelitales")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(result);
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

  async update(
    id: string,
    data: UpdateAnalisisSatelital
  ): Promise<ServiceResult<AnalisisSatelital | null>> {
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
        .from("analisis_satelitales")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(result);
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

  async getById(id: string): Promise<ServiceResult<AnalisisSatelital | null>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      const { data, error } = await supabase
        .from("analisis_satelitales")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return createSuccess(null); // Not found is not an error
        }
        throw error;
      }

      return createSuccess(data);
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

  async getAll(): Promise<ServiceResult<AnalisisSatelital[] | null>> {
    try {
      const { data, error } = await supabase
        .from("analisis_satelitales")
        .select("*")
        .order("creado_en", { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
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

  async delete(id: string): Promise<ServiceResult<boolean>> {
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
        .from("analisis_satelitales")
        .delete()
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

  async getByProyectoId(
    proyectoId: string
  ): Promise<ServiceResult<AnalisisSatelital[] | null>> {
    try {
      if (!proyectoId) {
        return createError({
          name: "ValidationError",
          message: "Proyecto ID is required",
          code: "VALIDATION_ERROR",
          details: { proyectoId },
        });
      }

      const { data, error } = await supabase
        .from("analisis_satelitales")
        .select("*")
        .eq("proyecto_id", proyectoId)
        .order("creado_en", { ascending: false });

      if (error) throw error;
      if (!data) return createSuccess(null);

      return createSuccess(data);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        code: "DB_ERROR",
        details: { operation: "getByProyectoId", proyectoId, error },
      });
    }
  }
}

export const analisisSatelitalesService = new AnalisisSatelitalesService();
