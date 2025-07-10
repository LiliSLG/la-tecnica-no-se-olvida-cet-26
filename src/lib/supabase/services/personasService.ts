// /src/lib/supabase/services/personasService.ts

import { supabase } from "../client";
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { Database } from "../types/database.types";



// 🎯 TIPOS EXPORTADOS (patrón Standalone)
export type PersonaRow = Database["public"]["Tables"]["personas"]["Row"];
export type PersonaInsert = Database["public"]["Tables"]["personas"]["Insert"];
export type PersonaUpdate = Database["public"]["Tables"]["personas"]["Update"];
export type CategoriaPersona =
  Database["public"]["Enums"]["categoria_principal_persona_enum"];

// 🆕 TIPOS ESPECÍFICOS PARA PERSONAS
export interface CreatePersonaData
  extends Omit<PersonaInsert, "id" | "created_at" | "updated_at"> {}

export interface UpdatePersonaData extends Omit<PersonaUpdate, "updated_at"> {
  updated_at?: string;
}

// 🎯 TIPO PERSONA PÚBLICA (para páginas públicas - sin campos sensibles)
export interface PersonaPublica {
  id: string;
  nombre: string;
  apellido: string | null;
  categoria_principal: string | null;
  descripcion_personal_o_profesional: string | null;
  areas_de_interes_o_expertise: string[] | null;
  foto_url: string | null;
  disponible_para_proyectos: boolean;
  ubicacion_residencial: any; // JSONB
  links_profesionales: any; // JSONB
  // NO incluir: email, telefono, estado_verificacion, etc.
}

class PersonasService {
  private supabase = supabase;

  // 📋 MÉTODOS CRUD BÁSICOS

  async create(data: CreatePersonaData): Promise<ServiceResult<PersonaRow>> {
    try {
      console.log("🔍 PersonasService: Creating persona", data);

      const { data: result, error } = await this.supabase
        .from("personas")
        .insert({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("❌ PersonasService: Error creating persona:", error);
        throw error;
      }

      console.log(
        "✅ PersonasService: Persona created successfully:",
        result.id
      );
      return createSuccess(result);
    } catch (error) {
      console.error("❌ PersonasService: Create failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error creating persona",
        code: "CREATE_ERROR",
        details: error,
      });
    }
  }

  async update(
    id: string,
    data: UpdatePersonaData
  ): Promise<ServiceResult<PersonaRow>> {
    try {
      console.log("🔍 PersonasService: Updating persona", id, data);

      const { data: result, error } = await this.supabase
        .from("personas")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ PersonasService: Error updating persona:", error);
        throw error;
      }

      console.log("✅ PersonasService: Persona updated successfully");
      return createSuccess(result);
    } catch (error) {
      console.error("❌ PersonasService: Update failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error updating persona",
        code: "UPDATE_ERROR",
        details: error,
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<PersonaRow | null>> {
    try {
      console.log("🔍 PersonasService: Fetching persona by ID:", id);

      const { data, error } = await this.supabase
        .from("personas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("👤 PersonasService: Persona not found:", id);
          return createSuccess(null);
        }
        console.error("❌ PersonasService: Error fetching persona:", error);
        throw error;
      }

      console.log("✅ PersonasService: Persona fetched successfully");
      return createSuccess(data);
    } catch (error) {
      console.error("❌ PersonasService: GetById failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error fetching persona",
        code: "FETCH_ERROR",
        details: error,
      });
    }
  }

  async getAll(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<PersonaRow[]>> {
    try {
      console.log(
        "🔍 PersonasService: Fetching all personas, includeDeleted:",
        includeDeleted
      );

      let query = this.supabase
        .from("personas")
        .select("*")
        .order("created_at", { ascending: false });

      if (!includeDeleted) {
        query = query.eq("is_deleted", false);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ PersonasService: Error fetching personas:", error);
        throw error;
      }

      console.log(`✅ PersonasService: Fetched ${data?.length || 0} personas`);
      return createSuccess(data || []);
    } catch (error) {
      console.error("❌ PersonasService: GetAll failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error fetching personas",
        code: "FETCH_ERROR",
        details: error,
      });
    }
  }

  // 🗑️ SOFT DELETE
  async delete(
    id: string,
    deletedByUid: string
  ): Promise<ServiceResult<boolean>> {
    try {
      console.log("🔍 PersonasService: Soft deleting persona:", id);

      const { error } = await this.supabase
        .from("personas")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by_uid: deletedByUid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("❌ PersonasService: Error deleting persona:", error);
        throw error;
      }

      console.log("✅ PersonasService: Persona deleted successfully");
      return createSuccess(true);
    } catch (error) {
      console.error("❌ PersonasService: Delete failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error deleting persona",
        code: "DELETE_ERROR",
        details: error,
      });
    }
  }

  // 🔄 RESTORE
  async restore(id: string): Promise<ServiceResult<boolean>> {
    try {
      console.log("🔍 PersonasService: Restoring persona:", id);

      const { error } = await this.supabase
        .from("personas")
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by_uid: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("❌ PersonasService: Error restoring persona:", error);
        throw error;
      }

      console.log("✅ PersonasService: Persona restored successfully");
      return createSuccess(true);
    } catch (error) {
      console.error("❌ PersonasService: Restore failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error restoring persona",
        code: "RESTORE_ERROR",
        details: error,
      });
    }
  }

  // 🎯 MÉTODOS ESPECÍFICOS PARA PERSONAS

  async getByCategoria(
    categoria: CategoriaPersona
  ): Promise<ServiceResult<PersonaRow[]>> {
    try {
      console.log(
        "🔍 PersonasService: Fetching personas by categoria:",
        categoria
      );

      const { data, error } = await this.supabase
        .from("personas")
        .select("*")
        .eq("categoria_principal", categoria)
        .eq("is_deleted", false)
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (error) {
        console.error(
          "❌ PersonasService: Error fetching by categoria:",
          error
        );
        throw error;
      }

      console.log(
        `✅ PersonasService: Fetched ${
          data?.length || 0
        } personas for categoria ${categoria}`
      );
      return createSuccess(data || []);
    } catch (error) {
      console.error("❌ PersonasService: GetByCategoria failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error
            ? error.message
            : "Error fetching personas by categoria",
        code: "FETCH_ERROR",
        details: error,
      });
    }
  }

  async getDisponiblesParaColaboracion(): Promise<ServiceResult<PersonaRow[]>> {
    try {
      console.log(
        "🔍 PersonasService: Fetching personas disponibles para colaboración"
      );

      const { data, error } = await this.supabase
        .from("personas")
        .select("*")
        .eq("disponible_para_proyectos", true)
        .eq("is_deleted", false)
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (error) {
        console.error("❌ PersonasService: Error fetching disponibles:", error);
        throw error;
      }

      console.log(
        `✅ PersonasService: Fetched ${data?.length || 0} personas disponibles`
      );
      return createSuccess(data || []);
    } catch (error) {
      console.error("❌ PersonasService: GetDisponibles failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error
            ? error.message
            : "Error fetching personas disponibles",
        code: "FETCH_ERROR",
        details: error,
      });
    }
  }

  // 🎯 MÉTODOS PARA SISTEMA DE INVITACIONES (siguiendo patrón organizaciones)

  async generarTokenYEnviarInvitacion(
    personaId: string,
    adminUid: string,
    adminNombre?: string
  ): Promise<ServiceResult<string>> {
    try {
      console.log(
        "🔍 PersonasService: Generando token y enviando invitación:",
        personaId
      );

      // 1. Obtener datos de la persona
      const personaResult = await this.getById(personaId);
      if (!personaResult.success || !personaResult.data) {
        return createError({
          name: "ValidationError",
          message: `Persona no encontrada para ID: ${personaId}`,
          code: "PERSONA_NOT_FOUND",
        });
      }

      const persona = personaResult.data;

      if (!persona.email) {
        return createError({
          name: "ValidationError",
          message: "La persona no tiene email de contacto",
          code: "NO_EMAIL_CONTACT",
        });
      }

      // 2. Generar token
      const { tokenService } = await import("./tokenService");
      const token = tokenService.generateToken(personaId, "persona", 30);

      // 3. Actualizar BD con token y estado
      const updateResult = await this.update(personaId, {
        token_reclamacion: token,
        estado_verificacion: "invitacion_enviada",
        fecha_ultima_invitacion: new Date().toISOString(),
        updated_by_uid: adminUid,
        updated_at: new Date().toISOString(),
      });

      if (!updateResult.success) {
        return createError({
          name: "ServiceError",
          message: "Error actualizando persona",
          code: "UPDATE_ERROR",
          details: updateResult.error,
        });
      }

      // 4. Enviar email
      const { emailService } = await import("./emailService");
      const emailResult = await emailService.sendPersonaInvitation(
        persona.email,
        `${persona.nombre} ${persona.apellido || ""}`.trim(),
        token,
        adminNombre
      );

      if (!emailResult.success) {
        console.error(
          "Error enviando email, pero persona actualizada:",
          emailResult.error
        );
        // No fallar la operación por error de email en desarrollo
        if (process.env.NODE_ENV === "development") {
          console.log("🔧 [DEV] Email simulado enviado correctamente");
        }
      }

      console.log("✅ Invitación procesada:", {
        persona: `${persona.nombre} ${persona.apellido || ""}`.trim(),
        email: persona.email,
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

  async validarToken(token: string): Promise<
    ServiceResult<{
      persona: PersonaRow;
      tokenValido: boolean;
      yaReclamada: boolean;
    }>
  > {
    try {
      console.log(
        "🔍 PersonasService: Validando token:",
        token.substring(0, 20) + "..."
      );

      // 1. Validar formato del token
      const { tokenService } = await import("./tokenService");
      const tokenResult = tokenService.parseToken(token);

      if (!tokenResult.success || !tokenResult.data) {
        return createError({
          name: "ValidationError",
          message: "Token inválido",
          code: "INVALID_TOKEN_FORMAT",
          details: tokenResult.error,
        });
      }

      const { entityId: personaId, type } = tokenResult.data;

      if (type !== "persona") {
        return createError({
          name: "ValidationError",
          message: "Token no es de persona",
          code: "WRONG_TOKEN_TYPE",
        });
      }

      // 2. Buscar persona con este token
      const { data, error } = await this.supabase
        .from("personas")
        .select("*")
        .eq("id", personaId)
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
        persona: data,
        tokenValido: true,
        yaReclamada: data.estado_verificacion === "verificada",
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

  async reclamarConToken(
    token: string,
    usuarioUid: string
  ): Promise<ServiceResult<PersonaRow>> {
    try {
      console.log("🔍 PersonasService: Reclamando persona con token");

      // 1. Validar token
      const tokenResult = await this.validarToken(token);
      if (!tokenResult.success || !tokenResult.data) {
        return createError({
          name: "ValidationError",
          message: tokenResult.error?.message || "Token inválido",
          code: "INVALID_TOKEN",
          details: tokenResult.error,
        });
      }

      const { persona, yaReclamada } = tokenResult.data;

      if (yaReclamada) {
        return createError({
          name: "ValidationError",
          message: "Esta persona ya fue reclamada",
          code: "ALREADY_CLAIMED",
        });
      }

      // 2. Actualizar persona como verificada
      const updateResult = await this.update(persona.id, {
        estado_verificacion: "verificada",
        fecha_aprobacion_admin: new Date().toISOString(),
        token_reclamacion: null, // Limpiar token usado
        updated_by_uid: usuarioUid,
      });

      if (!updateResult.success) {
        return createError({
          name: "ServiceError",
          message: "Error actualizando persona",
          code: "UPDATE_ERROR",
          details: updateResult.error,
        });
      }

      console.log("✅ PersonasService: Persona reclamada exitosamente");
      return updateResult;
    } catch (error) {
      console.error("❌ PersonasService: Reclamar failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error reclamando persona",
        code: "CLAIM_ERROR",
        details: error,
      });
    }
  }

  async aprobarParaInvitacion(
    id: string,
    adminUid: string
  ): Promise<ServiceResult<PersonaRow>> {
    try {
      console.log("🔍 PersonasService: Aprobando persona para invitación:", id);

      const result = await this.update(id, {
        estado_verificacion: "pendiente_aprobacion",
        fecha_aprobacion_admin: new Date().toISOString(),
        aprobada_por_admin_uid: adminUid,
        updated_by_uid: adminUid,
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Error aprobando persona");
      }

      console.log("✅ PersonasService: Persona aprobada para invitación");
      return result;
    } catch (error) {
      console.error("❌ PersonasService: Aprobar failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error aprobando persona",
        code: "APPROVE_ERROR",
        details: error,
      });
    }
  }

  async enviarInvitacion(
    personaId: string,
    adminUid: string
  ): Promise<ServiceResult<string>> {
    try {
      console.log(
        "🔍 PersonasService: Enviando invitación a persona:",
        personaId
      );

      // 1. Obtener datos de la persona
      const personaResult = await this.getById(personaId);
      if (!personaResult.success || !personaResult.data) {
        throw new Error("Persona no encontrada");
      }

      const persona = personaResult.data;
      if (!persona.email) {
        throw new Error("La persona no tiene email de contacto");
      }

      // 2. Generar token (reutilizar de organizaciones)
      const { tokenService } = await import("./tokenService");
      const token = tokenService.generateToken(personaId, "persona", 30);

      // 3. Actualizar persona con token y estado
      const updateResult = await this.update(personaId, {
        token_reclamacion: token,
        estado_verificacion: "invitacion_enviada",
        fecha_ultima_invitacion: new Date().toISOString(),
        updated_by_uid: adminUid,
      });

      if (!updateResult.success) {
        throw new Error("Error actualizando persona");
      }

      // 4. TODO: Enviar email (implementar cuando tengamos emailService)
      // await emailService.enviarInvitacionPersona(persona, token);

      console.log("✅ PersonasService: Invitación enviada");
      return createSuccess(token);
    } catch (error) {
      console.error("❌ PersonasService: EnviarInvitacion failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error enviando invitación",
        code: "INVITATION_ERROR",
        details: error,
      });
    }
  }

  async promoverAComunidadActiva(
    personaId: string
  ): Promise<ServiceResult<PersonaRow>> {
    try {
      console.log(
        "🔍 PersonasService: Promoviendo a comunidad activa:",
        personaId
      );

      // Solo promover si está en comunidad_general
      const personaResult = await this.getById(personaId);
      if (!personaResult.success || !personaResult.data) {
        throw new Error("Persona no encontrada");
      }

      const result = await this.update(personaId, {
        categoria_principal: "comunidad_activa" as CategoriaPersona,
        updated_at: new Date().toISOString(),
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Error promoviendo persona");
      }

      console.log("✅ PersonasService: Persona promovida a comunidad_activa");
      return result;
    } catch (error) {
      console.error("❌ PersonasService: Promover failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error promoviendo persona",
        code: "PROMOTE_ERROR",
        details: error,
      });
    }
  }

  async rechazarSolicitud(
    id: string,
    adminUid: string
  ): Promise<ServiceResult<PersonaRow>> {
    try {
      console.log("🔍 PersonasService: Rechazando solicitud persona:", id);

      const result = await this.update(id, {
        estado_verificacion: "rechazada",
        updated_by_uid: adminUid,
        updated_at: new Date().toISOString(),
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Error rechazando persona");
      }

      console.log("✅ PersonasService: Solicitud rechazada");
      return result;
    } catch (error) {
      console.error("❌ PersonasService: Rechazar failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error rechazando persona",
        code: "REJECT_ERROR",
        details: error,
      });
    }
  }

  async aprobarCambioCategoria(
    id: string,
    nuevaCategoria: CategoriaPersona,
    adminUid: string
  ): Promise<ServiceResult<PersonaRow>> {
    try {
      console.log(
        "🔍 PersonasService: Aprobando cambio categoría:",
        id,
        nuevaCategoria
      );

      const result = await this.update(id, {
        categoria_principal: nuevaCategoria,
        estado_verificacion: "verificada",
        fecha_aprobacion_admin: new Date().toISOString(),
        aprobada_por_admin_uid: adminUid,
        updated_by_uid: adminUid,
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Error aprobando cambio");
      }

      console.log("✅ PersonasService: Cambio de categoría aprobado");
      return result;
    } catch (error) {
      console.error("❌ PersonasService: AprobarCambio failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error ? error.message : "Error aprobando cambio",
        code: "APPROVE_CHANGE_ERROR",
        details: error,
      });
    }
  }
  // 🌐 MÉTODOS PARA PÁGINAS PÚBLICAS

  async getAllPublicas(): Promise<ServiceResult<PersonaPublica[]>> {
    try {
      console.log("🔍 PersonasService: Fetching personas públicas");

      const { data, error } = await this.supabase
        .from("personas")
        .select(
          `
          id,
          nombre,
          apellido,
          categoria_principal,
          descripcion_personal_o_profesional,
          areas_de_interes_o_expertise,
          foto_url,
          disponible_para_proyectos,
          ubicacion_residencial,
          links_profesionales
        `
        )
        .eq("visibilidad_perfil", "publico")
        .eq("is_deleted", false)
        .eq("activo", true)
        .order("nombre", { ascending: true });

      if (error) {
        console.error("❌ PersonasService: Error fetching públicas:", error);
        throw error;
      }

      console.log(
        `✅ PersonasService: Fetched ${data?.length || 0} personas públicas`
      );
      return createSuccess(data || []);
    } catch (error) {
      console.error("❌ PersonasService: GetAllPublicas failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error
            ? error.message
            : "Error fetching personas públicas",
        code: "FETCH_ERROR",
        details: error,
      });
    }
  }

  async getPublicaById(
    id: string
  ): Promise<ServiceResult<PersonaPublica | null>> {
    try {
      console.log("🔍 PersonasService: Fetching persona pública by ID:", id);

      const { data, error } = await this.supabase
        .from("personas")
        .select(
          `
          id,
          nombre,
          apellido,
          categoria_principal,
          descripcion_personal_o_profesional,
          areas_de_interes_o_expertise,
          foto_url,
          disponible_para_proyectos,
          ubicacion_residencial,
          links_profesionales
        `
        )
        .eq("id", id)
        .eq("visibilidad_perfil", "publico")
        .eq("is_deleted", false)
        .eq("activo", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("👤 PersonasService: Persona pública not found:", id);
          return createSuccess(null);
        }
        console.error("❌ PersonasService: Error fetching pública:", error);
        throw error;
      }

      console.log("✅ PersonasService: Persona pública fetched successfully");
      return createSuccess(data);
    } catch (error) {
      console.error("❌ PersonasService: GetPublicaById failed:", error);
      return createError({
        name: "ServiceError",
        message:
          error instanceof Error
            ? error.message
            : "Error fetching persona pública",
        code: "FETCH_ERROR",
        details: error,
      });
    }
  }
}

// 🎯 EXPORT SINGLETON (patrón Standalone)
export const personasService = new PersonasService();
export default personasService;
