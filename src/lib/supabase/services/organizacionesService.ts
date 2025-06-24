import { Database } from "../types/database.types";
import { ServiceResult } from "../types/serviceResult";
import {
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { supabase } from "../client";

type Organizacion = Database["public"]["Tables"]["organizaciones"]["Row"];
type CreateOrganizacion =
  Database["public"]["Tables"]["organizaciones"]["Insert"];
type UpdateOrganizacion =
  Database["public"]["Tables"]["organizaciones"]["Update"];

class OrganizacionesService {
  async create(
    data: CreateOrganizacion
  ): Promise<ServiceResult<Organizacion | null>> {
    try {
      const { data: result, error } = await supabase
        .from("organizaciones")
        .insert({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
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
    data: UpdateOrganizacion
  ): Promise<ServiceResult<Organizacion>> {
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
        .from("organizaciones")
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
        message: "Error updating organizacion",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<Organizacion | null>> {
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
        .from("organizaciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return createSuccess(null);
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

  async getAll(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<Organizacion[] | null>> {
    try {
      let query = supabase
        .from("organizaciones")
        .select("*")
        .order("nombre_oficial", { ascending: true });

      if (!includeDeleted) {
        query = query.eq("is_deleted", false);
      }

      const { data, error } = await query;

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

  async delete(
    id: string,
    deletedByUid: string
  ): Promise<ServiceResult<boolean>> {
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
        .from("organizaciones")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by_uid: deletedByUid,
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
        .from("organizaciones")
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by_uid: null,
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

  // Métodos específicos
  async getByTipo(tipo: any): Promise<ServiceResult<Organizacion[]>> {
    try {
      if (!tipo) {
        return createError({
          name: "ValidationError",
          message: "Tipo is required",
          code: "VALIDATION_ERROR",
          details: { tipo },
        });
      }

      const { data, error } = await supabase
        .from("organizaciones")
        .select("*")
        .eq("tipo", tipo)
        .eq("is_deleted", false)
        .order("nombre_oficial", { ascending: true });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching organizaciones by tipo",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getAbiertas(): Promise<ServiceResult<Organizacion[]>> {
    try {
      const { data, error } = await supabase
        .from("organizaciones")
        .select("*")
        .eq("abierta_a_colaboraciones", true)
        .eq("is_deleted", false)
        .order("nombre_oficial", { ascending: true });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching organizaciones abiertas",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getAllTipos(): Promise<ServiceResult<string[]>> {
    try {
      const { data, error } = await supabase
        .from("organizaciones")
        .select("tipo")
        .eq("is_deleted", false)
        .not("tipo", "is", null);

      if (error) throw error;

      // Extraer tipos únicos
      const tipos = [
        ...new Set(data?.map((item) => item.tipo).filter(Boolean)),
      ] as string[];

      return createSuccess(tipos);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching organization tipos",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
}

export const organizacionesService = new OrganizacionesService();
