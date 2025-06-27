import { Database } from "../types/database.types";
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { supabase } from "../client";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];
type CreateNoticia = Database["public"]["Tables"]["noticias"]["Insert"];
type UpdateNoticia = Database["public"]["Tables"]["noticias"]["Update"];

type NoticiaPublica = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  fecha_publicacion: string | null;
  tipo: "articulo_propio" | "enlace_externo";
  autor_noticia: string | null;
  fuente_externa: string | null;
  url_externa: string | null;
  contenido: string | null;
  imagen_url: string | null;
  es_destacada: boolean; // ✅ Volver a boolean puro (convertimos el null)
  created_by_persona: {
    nombre: string | null;
    apellido: string | null;
  } | null;
  // ✨ INCLUIR TEMAS
  temas: {
    id: string;
    nombre: string;
    categoria_tema: string | null;
  }[];
};

// 🔄 Tipo con campos reales: nombre + apellido
export type NoticiaWithAuthor = Noticia & {
  created_by_persona?: {
    nombre: string;
    apellido: string | null;
    email: string | null;
  } | null;
};
class NoticiasService {
  // --- Standard CRUD Methods ---

  async create(data: CreateNoticia): Promise<ServiceResult<Noticia | null>> {
    try {
      const { data: newNoticia, error } = await supabase
        .from("noticias")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(newNoticia);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error creating noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async update(
    id: string,
    data: UpdateNoticia
  ): Promise<ServiceResult<Noticia>> {
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
        .from("noticias")
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
        message: "Error updating noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getById(id: string): Promise<ServiceResult<Noticia | null>> {
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
        .from("noticias")
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
        details: { operation: "getById", id, error },
      });
    }
  }

  async getAll(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<Noticia[] | null>> {
    try {
      console.log(
        "🔍 NoticiasService.getAll called with includeDeleted:",
        includeDeleted
      );

      let query = supabase.from("noticias").select();
      console.log("📝 Base query created");

      if (!includeDeleted) {
        query = query.eq("is_deleted", false);
        console.log("📝 Added filter: is_deleted = false");
      }

      console.log("⏳ Executing query...");
      const { data, error } = await query;

      console.log("📥 Query result:", { data, error });
      console.log("📊 Data length:", data?.length);

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      console.log("✅ Returning success result");
      return createSuccess(data);
    } catch (error) {
      console.error("❌ Service error:", error);
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias",
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
        .from("noticias")
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
        message: "Error deleting noticia",
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
        .from("noticias")
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

  async getDestacadas(): Promise<ServiceResult<Noticia[]>> {
    try {
      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("es_destacada", true)
        .eq("is_deleted", false)
        .order("fecha_publicacion", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias destacadas",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getByTipo(tipo: any): Promise<ServiceResult<Noticia[]>> {
    try {
      if (!tipo || !["articulo", "link"].includes(tipo)) {
        return createError({
          name: "ValidationError",
          message: "Valid tipo is required (articulo or link)",
          code: "VALIDATION_ERROR",
          details: { tipo },
        });
      }

      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("tipo", tipo)
        .eq("is_deleted", false)
        .order("fecha_publicacion", { ascending: false });

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias by tipo",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getRecientes(limit: number = 10): Promise<ServiceResult<Noticia[]>> {
    try {
      if (limit < 1 || limit > 100) {
        return createError({
          name: "ValidationError",
          message: "Limit must be between 1 and 100",
          code: "VALIDATION_ERROR",
          details: { limit },
        });
      }

      const { data, error } = await supabase
        .from("noticias")
        .select("*")
        .eq("is_deleted", false)
        .order("fecha_publicacion", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return createSuccess(data || []);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias recientes",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async toggleDestacada(id: string): Promise<ServiceResult<Noticia>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      // Primero obtenemos el estado actual
      const getCurrentResult = await this.getById(id);
      if (!getCurrentResult.success || !getCurrentResult.data) {
        return createError({
          name: "NotFoundError",
          message: "Noticia not found",
          code: "NOT_FOUND",
          details: { id },
        });
      }

      const currentState = getCurrentResult.data.es_destacada;

      const { data, error } = await supabase
        .from("noticias")
        .update({
          es_destacada: !currentState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return createSuccess(data);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error toggling noticia destacada",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  async getAllWithAuthor(
    includeDeleted: boolean = false
  ): Promise<ServiceResult<NoticiaWithAuthor[] | null>> {
    try {
      console.log(
        "🔍 NoticiasService.getAllWithAuthor called with includeDeleted:",
        includeDeleted
      );

      // 🎯 SINTAXIS EXPLÍCITA: Especificar tabla!columna directamente
      let query = supabase.from("noticias").select(`
          *,
          created_by_persona:personas!created_by_uid (
            nombre,
            apellido,
            email
          )
        `);

      if (!includeDeleted) {
        query = query.eq("is_deleted", false);
      }

      query = query.order("created_at", { ascending: false });

      console.log("⏳ Executing query with explicit syntax...");
      const { data, error } = await query;

      console.log("📥 Query result:", { data: data?.length, error });

      if (error) {
        console.error("❌ Supabase error:", error);
        throw error;
      }

      // 🔄 Cast temporal para evitar errores TypeScript
      const result = data as any[];
      const transformedData: NoticiaWithAuthor[] = result.map((item) => ({
        ...item,
        created_by_persona: item.created_by_persona || null,
      }));

      console.log("✅ Returning success result with author data");
      return createSuccess(transformedData);
    } catch (error) {
      console.error("❌ Service error:", error);
      return createError({
        name: "ServiceError",
        message: "Error fetching noticias with author",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // 🔄 CORREGIDO: getById con sintaxis explícita
  async getByIdWithAuthor(
    id: string
  ): Promise<ServiceResult<NoticiaWithAuthor | null>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      // 🎯 SINTAXIS EXPLÍCITA
      const { data, error } = await supabase
        .from("noticias")
        .select(
          `
          *,
          created_by_persona:personas!created_by_uid (
            nombre,
            apellido,
            email
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return createSuccess(null);
        }
        throw error;
      }

      // 🔄 Transformación explícita
      const result = data as any;
      const transformedData: NoticiaWithAuthor = {
        ...result,
        created_by_persona: result.created_by_persona || null,
      };

      return createSuccess(transformedData);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Error fetching noticia with author",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // --- Relationship Methods ---
  /*
  async getByTemaId(temaId: string): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!temaId) return createError({ name: 'ValidationError', message: 'Tema ID is required', code: 'VALIDATION_ERROR' });

      const { data, error } = await supabase
        .from('noticias')
        .select('*, noticia_tema!inner(tema_id)')
        .eq('noticia_tema.tema_id', temaId)
        .eq('is_deleted', false);

      if (error) throw error;
      return createSuccess(data);
    } catch (error) {
      return createError({ name: 'ServiceError', message: 'Error fetching noticias by tema', code: 'DB_ERROR', details: error });
    }
  }
  */

  // ===== MÉTODOS PARA PÁGINAS PÚBLICAS =====

  // ✨ Obtener todas las noticias publicadas (para página pública)
  async getAllPublished(): Promise<ServiceResult<NoticiaPublica[]>> {
    try {
      console.log("🔍 Server Public: Loading published noticias");

      const { data, error } = await supabase
        .from("noticias")
        .select(
          `
        id, titulo, subtitulo, fecha_publicacion, tipo,
        autor_noticia, fuente_externa, url_externa, contenido,
        imagen_url, es_destacada,
        created_by_persona:personas!created_by_uid (
          nombre,
          apellido
        ),
        noticia_tema (
          temas (
            id,
            nombre,
            categoria_tema
          )
        )
      `
        )
        .eq("esta_publicada", true)
        .eq("is_deleted", false)
        .order("fecha_publicacion", { ascending: false });

      if (error) throw error;

      // Transformar datos para incluir temas directamente
      const transformedData: NoticiaPublica[] =
        data?.map((item) => {
          const { noticia_tema, ...rest } = item;
          return {
            ...rest,
            temas: noticia_tema?.map((nt) => nt.temas).filter(Boolean) || [],
          };
        }) || [];

      console.log(
        "📊 Server Public: Loaded published noticias:",
        transformedData.length
      );
      return createSuccess(transformedData);
    } catch (error) {
      console.error(
        "❌ Server Public: Error loading published noticias:",
        error
      );
      return createError({
        name: "ServiceError",
        message: "Error fetching published noticias",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✨ Obtener noticia publicada por ID (para página de detalle)
  async getPublishedById(
    id: string
  ): Promise<ServiceResult<NoticiaPublica | null>> {
    try {
      if (!id) {
        return createError({
          name: "ValidationError",
          message: "ID is required",
          code: "VALIDATION_ERROR",
          details: { id },
        });
      }

      console.log("🔍 Server Public: Loading published noticia:", id);

      const { data, error } = await supabase
        .from("noticias")
        .select(
          `
        id, titulo, subtitulo, fecha_publicacion, tipo,
        autor_noticia, fuente_externa, url_externa, contenido,
        imagen_url, es_destacada,
        created_by_persona:personas!created_by_uid (
          nombre,
          apellido
        ),
        noticia_tema (
          temas (
            id,
            nombre,
            categoria_tema
          )
        )
      `
        )
        .eq("id", id)
        .eq("esta_publicada", true)
        .eq("is_deleted", false)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return createSuccess(null);
        }
        throw error;
      }

      // Transformar datos para incluir temas directamente
      const { noticia_tema, ...rest } = data;
      const transformedData: NoticiaPublica = {
        ...rest,
        temas: noticia_tema?.map((nt) => nt.temas).filter(Boolean) || [],
      };

      console.log(
        "📊 Server Public: Found published noticia:",
        transformedData.titulo
      );
      return createSuccess(transformedData);
    } catch (error) {
      console.error(
        "❌ Server Public: Error loading published noticia:",
        error
      );
      return createError({
        name: "ServiceError",
        message: "Error fetching published noticia",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  // ✨ Obtener noticias destacadas (para homepage o sección especial)
  async getFeaturedPublished(): Promise<ServiceResult<NoticiaPublica[]>> {
    try {
      console.log("🔍 Server Public: Loading featured noticias");

      const { data, error } = await supabase
        .from("noticias")
        .select(
          `
        id, titulo, subtitulo, fecha_publicacion, tipo,
        autor_noticia, fuente_externa, url_externa, contenido,
        imagen_url, es_destacada,
        created_by_persona:personas!created_by_uid (
          nombre,
          apellido
        ),
        noticia_tema (
          temas (
            id,
            nombre,
            categoria_tema
          )
        )
      `
        )
        .eq("esta_publicada", true)
        .eq("es_destacada", true)
        .eq("is_deleted", false)
        .order("fecha_publicacion", { ascending: false })
        .limit(6);

      if (error) throw error;

      // Transformar datos para incluir temas directamente
      const transformedData: NoticiaPublica[] =
        data?.map((item) => {
          const { noticia_tema, ...rest } = item;
          return {
            ...rest,
            temas: noticia_tema?.map((nt) => nt.temas).filter(Boolean) || [],
          };
        }) || [];

      console.log(
        "📊 Server Public: Loaded featured noticias:",
        transformedData.length
      );
      return createSuccess(transformedData);
    } catch (error) {
      console.error(
        "❌ Server Public: Error loading featured noticias:",
        error
      );
      return createError({
        name: "ServiceError",
        message: "Error fetching featured noticias",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
}

export const noticiasService = new NoticiasService();
