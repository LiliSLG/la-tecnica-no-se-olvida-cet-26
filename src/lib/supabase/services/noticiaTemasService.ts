// /src/lib/supabase/services/noticiaTemasService.ts
import { Database } from "../types/database.types";
import {
  ServiceResult,
  createSuccessResult,
  createErrorResult,
} from "../types/serviceResult";
import { supabase } from "../client";

type NoticiaTema = Database["public"]["Tables"]["noticia_tema"]["Row"];
type CreateNoticiaTema = Database["public"]["Tables"]["noticia_tema"]["Insert"];

class NoticiaTemasService {
  // Obtener temas de una noticia
  async getTemasForNoticia(
    noticiaId: string
  ): Promise<ServiceResult<string[]>> {
    try {
      const { data, error } = await supabase
        .from("noticia_tema")
        .select("tema_id")
        .eq("noticia_id", noticiaId);

      if (error) throw error;
      return createSuccessResult(data?.map((item) => item.tema_id) || []);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error fetching temas for noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // Actualizar las relaciones de una noticia (reemplaza todas)
  async updateTemasForNoticia(
    noticiaId: string,
    temaIds: string[]
  ): Promise<ServiceResult<boolean>> {
    try {
      // 1. Eliminar relaciones existentes
      const { error: deleteError } = await supabase
        .from("noticia_tema")
        .delete()
        .eq("noticia_id", noticiaId);

      if (deleteError) throw deleteError;

      // 2. Si hay temas nuevos, insertarlos
      if (temaIds.length > 0) {
        const newRelations: CreateNoticiaTema[] = temaIds.map((temaId) => ({
          noticia_id: noticiaId,
          tema_id: temaId,
        }));

        const { error: insertError } = await supabase
          .from("noticia_tema")
          .insert(newRelations);

        if (insertError) throw insertError;
      }

      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error updating temas for noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // Agregar un tema a una noticia
  async addTemaToNoticia(
    noticiaId: string,
    temaId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase.from("noticia_tema").insert({
        noticia_id: noticiaId,
        tema_id: temaId,
      });

      if (error) throw error;
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error adding tema to noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // Remover un tema de una noticia
  async removeTemaFromNoticia(
    noticiaId: string,
    temaId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase
        .from("noticia_tema")
        .delete()
        .eq("noticia_id", noticiaId)
        .eq("tema_id", temaId);

      if (error) throw error;
      return createSuccessResult(true);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error removing tema from noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // Obtener noticias de un tema
  async getNoticiasForTema(temaId: string): Promise<ServiceResult<any[]>> {
    try {
      const { data, error } = await supabase
        .from("noticia_tema")
        .select(
          `
          noticia_id,
          noticias:noticia_id (
            id,
            titulo,
            subtitulo,
            tipo,
            imagen_url,
            esta_publicada,
            es_destacada,
            fecha_publicacion,
            created_at
          )
        `
        )
        .eq("tema_id", temaId);

      if (error) throw error;

      // Transformar la respuesta para que sea más fácil de usar
      const noticias = data?.map((item) => item.noticias).filter(Boolean) || [];
      return createSuccessResult(noticias);
    } catch (error) {
      return createErrorResult({
        name: "ServiceError",
        message: "Error fetching noticias for tema",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
}

export const noticiaTemasService = new NoticiaTemasService();
