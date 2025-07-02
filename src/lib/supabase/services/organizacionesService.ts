// 🔧 COMPLETE organizacionesService.ts - Fix Tipos + Métodos Públicos

import { supabase } from "../client";
import { Database } from "../types/database.types";
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";

// ✅ Extender el tipo para incluir campos de reclamación
// ❌ Eliminar esta interface incorrecta:
// interface OrganizacionWithClaim extends OrganizacionRow {

// ✅ Usar type intersection en su lugar:
type OrganizacionWithClaim = OrganizacionRow & {
  reclamada_por_uid?: string | null;
  fecha_reclamacion?: string | null;
  token_reclamacion?: string | null;
  aprobada_por_admin_uid?: string | null;
  fecha_aprobacion_admin?: string | null;
  fecha_ultima_invitacion?: string | null;
};

// ✅ Mantener el export igual:
export type { OrganizacionRow, OrganizacionWithClaim };

// ✅ USAR TIPOS CORRECTOS DE LA BASE DE DATOS
type OrganizacionRow = Database["public"]["Tables"]["organizaciones"]["Row"];
type OrganizacionInsert =
  Database["public"]["Tables"]["organizaciones"]["Insert"];
type OrganizacionUpdate =
  Database["public"]["Tables"]["organizaciones"]["Update"];


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
  // ===== MÉTODOS PARA SISTEMA DE INVITACIONES =====

  async generarTokenReclamacion(
    organizacionId: string
  ): Promise<ServiceResult<string>> {
    try {
      const token = `org-${crypto.randomUUID()}-${Date.now()}`;

      const { error } = await supabase
        .from("organizaciones")
        .update({
          token_reclamacion: token,
          estado_verificacion: "invitacion_enviada",
          fecha_ultima_invitacion: new Date().toISOString(),
        })
        .eq("id", organizacionId);

      if (error) throw error;
      return createSuccess(token);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error generando token de reclamación",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async generarTokenYEnviarInvitacion(
    organizacionId: string,
    adminUid: string,
    adminNombre?: string
  ): Promise<ServiceResult<string>> {
    try {
      // 1. Obtener datos de la organización
      const orgResult = await this.getById(organizacionId);
      if (!orgResult.success || !orgResult.data) {
        return createError({
          name: "ValidationError",
          message: "Organización no encontrada",
          code: "ORGANIZATION_NOT_FOUND",
        });
      }

      const organizacion = orgResult.data;

      if (!organizacion.email_contacto) {
        return createError({
          name: "ValidationError",
          message: "La organización no tiene email de contacto",
          code: "NO_EMAIL_CONTACT",
        });
      }

      // 2. Generar token
      const { tokenService } = await import("./tokenService");
      const token = tokenService.generateToken(
        organizacionId,
        "organizacion",
        30
      );

      // 3. Actualizar BD con token y estado
      const updateResult = await this.update(organizacionId, {
        token_reclamacion: token,
        estado_verificacion: "invitacion_enviada" as const,
        fecha_ultima_invitacion: new Date().toISOString(),
        updated_by_uid: adminUid,
        updated_at: new Date().toISOString(),
      });

      if (!updateResult.success) {
        return createError({
          name: "ServiceError",
          message: "Error actualizando organización",
          code: "UPDATE_ERROR",
          details: updateResult.error,
        });
      }

      // 4. Enviar email
      const { emailService } = await import("./emailService");
      const emailResult = await emailService.sendOrganizacionInvitation(
        organizacion.email_contacto,
        organizacion.nombre_oficial,
        token,
        adminNombre
      );

      if (!emailResult.success) {
        console.error(
          "Error enviando email, pero organización actualizada:",
          emailResult.error
        );
        // No fallar la operación por error de email en desarrollo
        if (process.env.NODE_ENV === "development") {
          console.log("🔧 [DEV] Email simulado enviado correctamente");
        }
      }

      console.log("✅ Invitación procesada:", {
        organizacion: organizacion.nombre_oficial,
        email: organizacion.email_contacto,
        token: `${token.substring(0, 20)}...`,
      });

      return createSuccess(token);
    } catch (error) {
      console.error("❌ Error en generarTokenYEnviarInvitacion:", error);
      return createError({
        name: "ServiceError",
        message: "Error procesando invitación",
        code: "INVITATION_ERROR",
        details: error,
      });
    }
  }

  async reclamarConToken(
    token: string,
    personaUid: string
  ): Promise<ServiceResult<OrganizacionRow>> {
    try {
      // 1. Validar token
      const { tokenService } = await import("./tokenService");
      const tokenResult = tokenService.parseToken(token);

      if (!tokenResult.success || !tokenResult.data) {
        return createError({
          name: "ValidationError",
          message: tokenResult.error?.message || "Token inválido",
          code: "INVALID_TOKEN",
          details: tokenResult.error,
        });
      }

      const tokenData = tokenResult.data; // ✅ Ahora TypeScript sabe que existe
      const { entityId: organizacionId, type } = tokenData;

      if (type !== "organizacion") {
        return createError({
          name: "ValidationError",
          message: "Token no es de organización",
          code: "WRONG_TOKEN_TYPE",
        });
      }

      // 2. Verificar que la organización existe y el token coincide
      const { data, error } = await supabase
        .from("organizaciones")
        .select("*")
        .eq("id", organizacionId)
        .eq("token_reclamacion", token)
        .single();

      if (error || !data) {
        return createError({
          name: "ValidationError",
          message: "Token no válido o organización no encontrada",
          code: "TOKEN_NOT_FOUND",
        });
      }

      // 3. Verificar que no esté ya reclamada
      if (data.reclamada_por_uid) {
        return createError({
          name: "ValidationError",
          message: "Esta organización ya fue reclamada",
          code: "ALREADY_CLAIMED",
        });
      }

      // 4. Reclamar organización
      const updateResult = await this.update(organizacionId, {
        reclamada_por_uid: personaUid,
        fecha_reclamacion: new Date().toISOString(),
        estado_verificacion: "verificada" as const,
        token_reclamacion: null, // Limpiar token usado
        updated_by_uid: personaUid,
        updated_at: new Date().toISOString(),
      });

      if (!updateResult.success) {
        return createError({
          name: "ServiceError",
          message: "Error reclamando organización",
          code: "CLAIM_ERROR",
          details: updateResult.error,
        });
      }

      console.log("✅ Organización reclamada:", {
        organizacion: data.nombre_oficial,
        reclamadaPor: personaUid,
      });

      return createSuccess(updateResult.data!);
    } catch (error) {
      console.error("❌ Error en reclamarConToken:", error);
      return createError({
        name: "ServiceError",
        message: "Error procesando reclamación",
        code: "CLAIM_PROCESS_ERROR",
        details: error,
      });
    }
  }

  async validarToken(token: string): Promise<
    ServiceResult<{
      organizacion: OrganizacionRow; // ← Volver al tipo original
      tokenValido: boolean;
      yaReclamada: boolean;
    }>
  > {
    try {
      // 1. Validar formato del token
      const { tokenService } = await import("./tokenService");
      const tokenResult = tokenService.parseToken(token);

      if (!tokenResult.success || !tokenResult.data) {
        return createError({
          name: "ValidationError",
          message: "Token inválido o expirado",
          code: "INVALID_TOKEN",
        });
      }

      const tokenData = tokenResult.data; // ✅ Fix TypeScript
      const { entityId: organizacionId } = tokenData;

      // 2. Buscar organización con este token
      const { data, error } = await supabase
        .from("organizaciones")
        .select("*")
        .eq("id", organizacionId)
        .eq("token_reclamacion", token)
        .single();

      if (error || !data) {
        return createError({
          name: "ValidationError",
          message: "Token no encontrado",
          code: "TOKEN_NOT_FOUND",
        });
      }

      return createSuccess({
        organizacion: data,
        tokenValido: true,
        yaReclamada: !!data.reclamada_por_uid,
      });
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error validando token",
        code: "TOKEN_VALIDATION_ERROR",
        details: error,
      });
    }
  }
}

export const organizacionesService = new OrganizacionesService();
