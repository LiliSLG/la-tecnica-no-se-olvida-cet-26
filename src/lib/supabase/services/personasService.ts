import { Database } from "../types/database.types";
import { ServiceResult } from "../types/serviceResult";
import {
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { supabase } from "../client";

type Persona = Database["public"]["Tables"]["personas"]["Row"];
type CreatePersona = Database["public"]["Tables"]["personas"]["Insert"];
type UpdatePersona = Database["public"]["Tables"]["personas"]["Update"];

class PersonasService {
  async create(data: CreatePersona): Promise<ServiceResult<Persona | null>> {
    try {
      const { data: result, error } = await supabase
        .from("personas")
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
    data: UpdatePersona
  ): Promise<ServiceResult<Persona>> {
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
        .from("personas")
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
        message: "Error updating persona",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<Persona | null>> {
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
        .from("personas")
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

  async getAll(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<Persona[] | null>> {
    try {
      let query = supabase
        .from("personas")
        .select("*")
        .order("nombre", { ascending: true });

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
        .from("personas")
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

  async getByProyecto(
    proyectoId: string
  ): Promise<ServiceResult<Persona[] | null>> {
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
        .from("personas")
        .select(
          `
          *,
          proyecto_persona!inner (
            proyecto_id
          )
        `
        )
        .eq("proyecto_persona.proyecto_id", proyectoId)
        .eq("is_deleted", false)
        .order("nombre", { ascending: true });

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
        details: { operation: "getByProyecto", proyectoId, error },
      });
    }
  }

  async getByHistoriaOral(
    historiaOralId: string
  ): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!historiaOralId) {
        return createError({
          name: "ValidationError",
          message: "Historia Oral ID is required",
          code: "VALIDATION_ERROR",
          details: { historiaOralId },
        });
      }

      const { data, error } = await supabase
        .from("personas")
        .select(
          `
          *,
          historia_oral_persona!inner (
            historia_oral_id
          )
        `
        )
        .eq("historia_oral_persona.historia_oral_id", historiaOralId)
        .eq("is_deleted", false)
        .order("nombre", { ascending: true });

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
        details: { operation: "getByHistoriaOral", historiaOralId, error },
      });
    }
  }

  async getByNoticia(
    noticiaId: string
  ): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!noticiaId) {
        return createError({
          name: "ValidationError",
          message: "Noticia ID is required",
          code: "VALIDATION_ERROR",
          details: { noticiaId },
        });
      }

      const { data, error } = await supabase
        .from("personas")
        .select(
          `
          *,
          noticia_persona!inner (
            noticia_id
          )
        `
        )
        .eq("noticia_persona.noticia_id", noticiaId)
        .eq("is_deleted", false)
        .order("nombre", { ascending: true });

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
        details: { operation: "getByNoticia", noticiaId, error },
      });
    }
  }

  async getByTemaId(temaId: string): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!temaId)
        return createError({
          name: "ValidationError",
          message: "Tema ID is required",
          code: "VALIDATION_ERROR",
        });

      const { data, error } = await supabase
        .from("personas")
        .select("*, persona_tema!inner(tema_id)")
        .eq("persona_tema.tema_id", temaId)
        .eq("is_deleted", false);

      if (error) throw error;
      return createSuccess(data);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching personas by tema",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getByCategoria(categoria: any): Promise<ServiceResult<Persona[]>> {
    try {
      if (!categoria) {
        return createError({
          name: "ValidationError",
          message: "Categoria is required",
          code: "VALIDATION_ERROR",
          details: { categoria },
        });
      }

      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("categoria_principal", categoria)
        .eq("is_deleted", false)
        .eq("activo", true)
        .order("apellido", { ascending: true });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching personas by categoria",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getAdmins(): Promise<ServiceResult<Persona[]>> {
    try {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("es_admin", true)
        .eq("is_deleted", false)
        .eq("activo", true)
        .order("apellido", { ascending: true });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching admin personas",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getEstudiantesYExAlumnos(): Promise<ServiceResult<Persona[]>> {
    try {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .in("categoria_principal", ["estudiante_cet", "ex_alumno_cet"])
        .eq("is_deleted", false)
        .eq("activo", true)
        .order("apellido", { ascending: true });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching estudiantes y ex-alumnos",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getTutoresDisponibles(): Promise<ServiceResult<Persona[]>> {
    try {
      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .in("categoria_principal", [
          "docente_cet",
          "tutor_invitado",
          "profesional_externo",
        ])
        .eq("is_deleted", false)
        .eq("activo", true)
        .order("apellido", { ascending: true });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching tutores disponibles",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getByEmail(email: string): Promise<ServiceResult<Persona | null>> {
    try {
      if (!email) {
        return createError({
          name: "ValidationError",
          message: "Email is required",
          code: "VALIDATION_ERROR",
          details: { email },
        });
      }

      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("email", email)
        .eq("is_deleted", false)
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
        message: "Error fetching persona by email",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
}

export const personasService = new PersonasService();
