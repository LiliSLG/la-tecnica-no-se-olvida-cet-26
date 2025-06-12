import { Database } from "../types/database.types";
import { ServiceResult } from "../types/serviceResult";
import {
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { supabase } from "../client";

type PersonaTema = Database["public"]["Tables"]["persona_tema"]["Row"];
type CreatePersonaTema = Database["public"]["Tables"]["persona_tema"]["Insert"];

class PersonaTemaService {
  async addTemaToPersona(
    personaId: string,
    temaId: string
  ): Promise<ServiceResult<PersonaTema | null>> {
    try {
      if (!personaId || !temaId) {
        return createError({
          name: "ValidationError",
          message: "Both Persona ID and Tema ID are required",
          code: "VALIDATION_ERROR",
          details: { personaId, temaId },
        });
      }
      const { data, error } = await supabase
        .from("persona_tema")
        .insert({
          persona_id: personaId,
          tema_id: temaId,
        })
        .select()
        .single();

      if (error) throw error;
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

  async removeTemaFromPersona(
    personaId: string,
    temaId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      if (!personaId || !temaId) {
        return createError({
          name: "ValidationError",
          message: "Both Persona ID and Tema ID are required",
          code: "VALIDATION_ERROR",
          details: { personaId, temaId },
        });
      }
      const { error } = await supabase
        .from("persona_tema")
        .delete()
        .eq("persona_id", personaId)
        .eq("tema_id", temaId);

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

  async getTemasByPersonaId(
    personaId: string
  ): Promise<ServiceResult<PersonaTema[] | null>> {
    try {
      if (!personaId) {
        return createError({
          name: "ValidationError",
          message: "Persona ID is required",
          code: "VALIDATION_ERROR",
          details: { personaId },
        });
      }
      const { data, error } = await supabase
        .from("persona_tema")
        .select("*")
        .eq("persona_id", personaId);

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

  async getPersonasByTemaId(
    temaId: string
  ): Promise<ServiceResult<PersonaTema[] | null>> {
    try {
      if (!temaId) {
        return createError({
          name: "ValidationError",
          message: "Tema ID is required",
          code: "VALIDATION_ERROR",
          details: { temaId },
        });
      }
      const { data, error } = await supabase
        .from("persona_tema")
        .select("*")
        .eq("tema_id", temaId);

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
}

export const personaTemaService = new PersonaTemaService();
