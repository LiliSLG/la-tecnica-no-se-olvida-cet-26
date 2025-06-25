// CREAR: /src/lib/supabase/services/noticiaTemasService.ts
// ================================================================

import { Database } from "../types/database.types";
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { supabase } from "../client";

type NoticiaTema = Database["public"]["Tables"]["noticia_tema"]["Row"];
type CreateNoticiaTema = Database["public"]["Tables"]["noticia_tema"]["Insert"];

class NoticiaTemasService {
  // ✅ Obtener temas de una noticia
  async getTemasForNoticia(
    noticiaId: string
  ): Promise<ServiceResult<string[]>> {
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
        .from("noticia_tema")
        .select("tema_id")
        .eq("noticia_id", noticiaId);

      if (error) throw error;

      const temaIds = data?.map((item) => item.tema_id) || [];
      return createSuccess(temaIds);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching temas for noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✅ Obtener temas con información completa para una noticia
  async getTemasWithInfoForNoticia(
    noticiaId: string
  ): Promise<ServiceResult<any[]>> {
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
        .from("noticia_tema")
        .select(
          `
          tema_id,
          temas!noticia_tema_tema_id_fkey (
            id,
            nombre,
            descripcion,
            categoria_tema
          )
        `
        )
        .eq("noticia_id", noticiaId);

      if (error) throw error;

      // Transformar datos para extraer información del tema
      const temasConInfo =
        data?.map((item) => item.temas).filter(Boolean) || [];
      return createSuccess(temasConInfo);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching temas with info for noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✅ Obtener noticias de un tema
  async getNoticiasForTema(temaId: string): Promise<ServiceResult<string[]>> {
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
        .from("noticia_tema")
        .select("noticia_id")
        .eq("tema_id", temaId);

      if (error) throw error;

      const noticiaIds = data?.map((item) => item.noticia_id) || [];
      return createSuccess(noticiaIds);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias for tema",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✅ Actualizar temas de una noticia (reemplaza todas las relaciones)
  async updateTemasForNoticia(
    noticiaId: string,
    temaIds: string[]
  ): Promise<ServiceResult<boolean>> {
    try {
      if (!noticiaId) {
        return createError({
          name: "ValidationError",
          message: "Noticia ID is required",
          code: "VALIDATION_ERROR",
          details: { noticiaId },
        });
      }

      // 1. Eliminar todas las relaciones existentes
      const { error: deleteError } = await supabase
        .from("noticia_tema")
        .delete()
        .eq("noticia_id", noticiaId);

      if (deleteError) throw deleteError;

      // 2. Insertar nuevas relaciones si hay temas
      if (temaIds.length > 0) {
        const relaciones: CreateNoticiaTema[] = temaIds.map((temaId) => ({
          noticia_id: noticiaId,
          tema_id: temaId,
        }));

        const { error: insertError } = await supabase
          .from("noticia_tema")
          .insert(relaciones);

        if (insertError) throw insertError;
      }

      return createSuccess(true);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error updating temas for noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✅ Agregar un tema a una noticia
  async addTemaToNoticia(
    noticiaId: string,
    temaId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      if (!noticiaId || !temaId) {
        return createError({
          name: "ValidationError",
          message: "Both noticia ID and tema ID are required",
          code: "VALIDATION_ERROR",
          details: { noticiaId, temaId },
        });
      }

      // Verificar que la relación no existe ya
      const { data: existing } = await supabase
        .from("noticia_tema")
        .select("*")
        .eq("noticia_id", noticiaId)
        .eq("tema_id", temaId)
        .single();

      if (existing) {
        return createSuccess(true); // Ya existe, no hacer nada
      }

      const { error } = await supabase.from("noticia_tema").insert({
        noticia_id: noticiaId,
        tema_id: temaId,
      });

      if (error) throw error;
      return createSuccess(true);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error adding tema to noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✅ Quitar un tema de una noticia
  async removeTemaFromNoticia(
    noticiaId: string,
    temaId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      if (!noticiaId || !temaId) {
        return createError({
          name: "ValidationError",
          message: "Both noticia ID and tema ID are required",
          code: "VALIDATION_ERROR",
          details: { noticiaId, temaId },
        });
      }

      const { error } = await supabase
        .from("noticia_tema")
        .delete()
        .eq("noticia_id", noticiaId)
        .eq("tema_id", temaId);

      if (error) throw error;
      return createSuccess(true);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error removing tema from noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✅ Obtener estadísticas de uso de temas en noticias
  async getTemasStats(): Promise<ServiceResult<any[]>> {
    try {
      const { data, error } = await supabase.from("noticia_tema").select(`
          tema_id,
          temas!noticia_tema_tema_id_fkey (
            nombre,
            categoria_tema
          )
        `);

      if (error) throw error;

      // Contar uso por tema
      const stats = data?.reduce((acc: any, item) => {
        const temaId = item.tema_id;
        if (!acc[temaId]) {
          acc[temaId] = {
            tema_id: temaId,
            nombre: item.temas?.nombre || "Sin nombre",
            categoria: item.temas?.categoria_tema || null,
            count: 0,
          };
        }
        acc[temaId].count += 1;
        return acc;
      }, {});

      const statsArray = Object.values(stats || {});
      return createSuccess(statsArray);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching temas stats",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
}

export const noticiaTemasService = new NoticiaTemasService();
