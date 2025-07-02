// 🔧 COMPLETE organizacionesService.ts - Fix Tipos + Métodos Públicos

import { supabase } from "../client";
import { Database } from "../types/database.types";
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";

// ✅ USAR TIPOS CORRECTOS DE LA BASE DE DATOS
type OrganizacionRow = Database["public"]["Tables"]["organizaciones"]["Row"];
type OrganizacionInsert =
  Database["public"]["Tables"]["organizaciones"]["Insert"];
type OrganizacionUpdate =
  Database["public"]["Tables"]["organizaciones"]["Update"];

// ✅ TAMBIÉN EXPORTAR PARA COMPATIBILIDAD CON COMPONENTES EXISTENTES
export type { OrganizacionRow };

const TIPOS_VALIDOS = [
  "empresa",
  "institucion_educativa",
  "ONG",
  "establecimiento_ganadero",
  "organismo_gubernamental",
  "cooperativa",
  "otro",
] as const;

type TipoOrganizacionValido = (typeof TIPOS_VALIDOS)[number];

// ✅ FUNCIÓN HELPER PARA VALIDAR TIPOS
function isValidTipo(tipo: string): tipo is TipoOrganizacionValido {
  return TIPOS_VALIDOS.includes(tipo as TipoOrganizacionValido);
}

class OrganizacionesService {
  // ===== MÉTODOS ADMIN =====

  async create(
    data: OrganizacionInsert
  ): Promise<ServiceResult<OrganizacionRow>> {
    try {
      console.log("🔍 Creating organizacion:", data);

      const { data: result, error } = await supabase
        .from("organizaciones")
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Organizacion created:", result);
      return createSuccess(result);
    } catch (error) {
      console.error("❌ Error creating organizacion:", error);
      return createError({
        name: "ServiceError",
        message: "Error creating organizacion",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async update(
    id: string,
    data: OrganizacionUpdate
  ): Promise<ServiceResult<OrganizacionRow>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      console.log("🔍 Updating organizacion:", id, data);

      const { data: result, error } = await supabase
        .from("organizaciones")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Organizacion updated:", result);
      return createSuccess(result);
    } catch (error) {
      console.error("❌ Error updating organizacion:", error);
      return createError({
        name: "ServiceError",
        message: "Error updating organizacion",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<OrganizacionRow | null>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      console.log("🔍 Fetching organizacion by ID:", id);

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
      console.error("❌ Error fetching organizacion:", error);
      return createError({
        name: "ServiceError",
        message: "Error fetching organizacion",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getAll(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<OrganizacionRow[]>> {
    try {
      console.log(
        "🔍 OrganizacionesService.getAll() - includeDeleted:",
        includeDeleted
      );

      let query = supabase.from("organizaciones").select("*");

      // Solo incluir eliminadas si se especifica
      if (!includeDeleted) {
        query = query.eq("is_deleted", false);
      }

      query = query.order("nombre_oficial", { ascending: true });

      console.log("🔍 Ejecutando query organizaciones...");
      const { data, error } = await query;

      if (error) {
        console.error("❌ Error en query organizaciones:", error);
        throw error;
      }

      console.log("📊 Organizaciones obtenidas:", {
        total: data?.length || 0,
        estados: data?.map((o) => o.estado_verificacion) || [],
        verificadas:
          data?.filter((o) => o.estado_verificacion === "verificada").length ||
          0,
      });

      return createSuccess(data || []);
    } catch (error) {
      console.error("❌ Error completo en getAll():", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error
            ? error.message
            : "Error fetching organizaciones",
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
      if (!id || !deletedByUid) {
        return createError({
          name: "ValidationError",
          message: "ID and deletedByUid are required",
          code: "VALIDATION_ERROR",
          details: { id, deletedByUid },
        });
      }

      console.log("🔍 Soft deleting organizacion:", id);

      const { error } = await supabase
        .from("organizaciones")
        .update({
          is_deleted: true,
          deleted_by_uid: deletedByUid,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      console.log("✅ Organizacion soft deleted:", id);
      return createSuccess(true);
    } catch (error) {
      console.error("❌ Error deleting organizacion:", error);
      return createError({
        name: "ServiceError",
        message: "Error deleting organizacion",
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

      console.log("🔍 Restoring organizacion:", id);

      const { error } = await supabase
        .from("organizaciones")
        .update({
          is_deleted: false,
          deleted_by_uid: null,
          deleted_at: null,
        })
        .eq("id", id);

      if (error) throw error;

      console.log("✅ Organizacion restored:", id);
      return createSuccess(true);
    } catch (error) {
      console.error("❌ Error restoring organizacion:", error);
      return createError({
        name: "ServiceError",
        message: "Error restoring organizacion",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // Métodos específicos existentes
  async getByTipo(tipo: string): Promise<ServiceResult<OrganizacionRow[]>> {
    try {
      if (!tipo) {
        return createError({
          name: "ValidationError",
          message: "Tipo is required",
          code: "VALIDATION_ERROR",
          details: { tipo },
        });
      }

      // ✅ VALIDAR QUE EL TIPO SEA VÁLIDO
      if (!isValidTipo(tipo)) {
        return createError({
          name: "ValidationError",
          message: `Tipo inválido: ${tipo}. Tipos válidos: ${TIPOS_VALIDOS.join(
            ", "
          )}`,
          code: "VALIDATION_ERROR",
          details: { tipo, tiposValidos: TIPOS_VALIDOS },
        });
      }

      const { data, error } = await supabase
        .from("organizaciones")
        .select("*")
        .eq("tipo", tipo) // ✅ Ahora TypeScript sabe que tipo es válido
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

  async getAbiertas(): Promise<ServiceResult<OrganizacionRow[]>> {
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

  // ===== MÉTODOS PARA PÁGINAS PÚBLICAS =====

  // ✨ Obtener todas las organizaciones públicas (para página pública)
  async getAllPublic(): Promise<ServiceResult<OrganizacionRow[]>> {
    try {
      console.log("🔍 Server Public: Loading public organizaciones");

      const { data, error } = await supabase
        .from("organizaciones")
        .select("*")
        //.eq("estado_verificacion", "verificada")
        //.eq("abierta_a_colaboraciones", true)
        .eq("is_deleted", false)
        .order("nombre_oficial", { ascending: true });

      if (error) throw error;

      console.log(
        "📊 Server Public: Loaded public organizaciones:",
        data?.length || 0
      );
      return createSuccess(data || []);
    } catch (error) {
      console.error(
        "❌ Server Public: Error loading public organizaciones:",
        error
      );
      return createError({
        name: "ServiceError",
        message: "Error fetching public organizaciones",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✨ Obtener organización pública por ID (para página de detalle)
  async getPublicById(
    id: string
  ): Promise<ServiceResult<OrganizacionRow | null>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      console.log("🔍 Server Public: Loading public organizacion:", id);

      const { data, error } = await supabase
        .from("organizaciones")
        .select("*")
        .eq("id", id)
        //.eq("estado_verificacion", "verificada")
        .eq("is_deleted", false)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return createSuccess(null);
        }
        throw error;
      }

      console.log(
        "📊 Server Public: Found public organizacion:",
        data.nombre_oficial
      );
      return createSuccess(data);
    } catch (error) {
      console.error(
        "❌ Server Public: Error loading public organizacion:",
        error
      );
      return createError({
        name: "ServiceError",
        message: "Error fetching public organizacion",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✨ Obtener organizaciones por tipo (para filtros públicos)
  async getPublicByTipo(
    tipo: string
  ): Promise<ServiceResult<OrganizacionRow[]>> {
    try {
      if (!tipo) {
        return createError({
          name: "ValidationError",
          message: "Tipo is required",
          code: "VALIDATION_ERROR",
          details: { tipo },
        });
      }

      // ✅ VALIDAR QUE EL TIPO SEA VÁLIDO
      if (!isValidTipo(tipo)) {
        return createError({
          name: "ValidationError",
          message: `Tipo inválido: ${tipo}. Tipos válidos: ${TIPOS_VALIDOS.join(
            ", "
          )}`,
          code: "VALIDATION_ERROR",
          details: { tipo, tiposValidos: TIPOS_VALIDOS },
        });
      }

      console.log("🔍 Server Public: Loading organizaciones by tipo:", tipo);

      const { data, error } = await supabase
        .from("organizaciones")
        .select("*")
        .eq("tipo", tipo) // ✅ Ahora TypeScript sabe que tipo es válido
        //.eq("estado_verificacion", "verificada")
        //.eq("abierta_a_colaboraciones", true)
        .eq("is_deleted", false)
        .order("nombre_oficial", { ascending: true });

      if (error) throw error;

      console.log(
        "📊 Server Public: Loaded organizaciones by tipo:",
        data?.length || 0
      );
      return createSuccess(data || []);
    } catch (error) {
      console.error(
        "❌ Server Public: Error loading organizaciones by tipo:",
        error
      );
      return createError({
        name: "ServiceError",
        message: "Error fetching organizaciones by tipo",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
}

export const organizacionesService = new OrganizacionesService();
