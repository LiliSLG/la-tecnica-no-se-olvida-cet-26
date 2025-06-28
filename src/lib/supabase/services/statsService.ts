// /src/lib/supabase/services/statsService.ts
import { supabase } from "../client";
import { ServiceResult } from "../types/serviceResult";
import {
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";

export interface PlatformStats {
  totalProyectos: number;
  proyectosFinalizados: number;
  totalNoticias: number;
  noticiasPublicadas: number;
  totalPersonas: number;
  personasActivas: number;
  totalTemas: number;
  // Futuro: totalHistoriasOrales cuando esté implementado
}

class StatsService {
  /**
   * Obtener estadísticas generales de la plataforma para páginas públicas
   */
  async getPlatformStats(): Promise<ServiceResult<PlatformStats>> {
    try {
      console.log("🔍 Server: Loading platform statistics");

      // Ejecutar todas las consultas en paralelo para mejor performance
      const [
        proyectosResult,
        proyectosFinalizadosResult,
        noticiasResult,
        noticiasPublicadasResult,
        personasResult,
        personasActivasResult,
        temasResult,
      ] = await Promise.all([
        // Total proyectos (no eliminados)
        supabase
          .from("proyectos")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false),

        // Proyectos finalizados
        supabase
          .from("proyectos")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .in("estado_actual", ["finalizado", "presentado"]),

        // Total noticias (no eliminadas)
        supabase
          .from("noticias")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false),

        // Noticias publicadas
        supabase
          .from("noticias")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("esta_publicada", true),

        // Total personas (no eliminadas)
        supabase
          .from("personas")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false),

        // Personas activas
        supabase
          .from("personas")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false)
          .eq("activo", true),

        // Total temas
        supabase
          .from("temas")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false),
      ]);

      // Verificar errores en las consultas
      const results = [
        proyectosResult,
        proyectosFinalizadosResult,
        noticiasResult,
        noticiasPublicadasResult,
        personasResult,
        personasActivasResult,
        temasResult,
      ];

      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }

      // Construir objeto de estadísticas
      const stats: PlatformStats = {
        totalProyectos: proyectosResult.count || 0,
        proyectosFinalizados: proyectosFinalizadosResult.count || 0,
        totalNoticias: noticiasResult.count || 0,
        noticiasPublicadas: noticiasPublicadasResult.count || 0,
        totalPersonas: personasResult.count || 0,
        personasActivas: personasActivasResult.count || 0,
        totalTemas: temasResult.count || 0,
      };

      console.log("📊 Server: Platform stats loaded:", stats);
      return createSuccess(stats);
    } catch (error) {
      console.error("❌ Server: Error loading platform stats:", error);
      return createError({
        name: "ServiceError",
        message: "Error loading platform statistics",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  /**
   * Obtener estadísticas rápidas para mostrar en cards o headers
   */
  async getQuickStats(): Promise<
    ServiceResult<{
      proyectos: number;
      noticias: number;
      comunidad: number;
      historias: number;
    }>
  > {
    try {
      const platformResult = await this.getPlatformStats();

      if (!platformResult.success || !platformResult.data) {
        throw new Error("Could not load platform stats");
      }

      // Intentar obtener historias orales (puede fallar si la tabla no existe)
      let historiasCount = 0;
      try {
        const historiasResult = await supabase
          .from("historias_orales")
          .select("id", { count: "exact", head: true })
          .eq("is_deleted", false);

        historiasCount = historiasResult.count || 0;
      } catch (historiasError) {
        console.log("ℹ️ Server: historias_orales table not found, using 0");
        historiasCount = 0;
      }

      const stats = platformResult.data;

      // Estadísticas simplificadas para mostrar públicamente
      const quickStats = {
        proyectos: stats.totalProyectos,
        noticias: stats.noticiasPublicadas, // Solo las publicadas
        comunidad: stats.personasActivas, // Solo las activas
        historias: historiasCount, // Historias orales
      };

      console.log("📊 Server: Quick stats:", quickStats);
      return createSuccess(quickStats);
    } catch (error) {
      console.error("❌ Server: Error loading quick stats:", error);
      return createError({
        name: "ServiceError",
        message: "Error loading quick statistics",
        code: "DB_ERROR",
        details: error,
      });
    }
  }

  /**
   * Obtener estadísticas para el dashboard de un usuario específico
   */
  async getUserStats(userId: string): Promise<
    ServiceResult<{
      misProyectos: number;
      misNoticias: number;
      colaboraciones: number;
      temasInteres: number;
    }>
  > {
    try {
      console.log("🔍 Server: Loading user stats for:", userId);

      const [
        misProyectosResult,
        misNoticiasResult,
        colaboracionesResult,
        temasInteresResult,
      ] = await Promise.all([
        // Proyectos creados por el usuario
        supabase
          .from("proyectos")
          .select("id", { count: "exact", head: true })
          .eq("created_by_uid", userId)
          .eq("is_deleted", false),

        // Noticias creadas por el usuario
        supabase
          .from("noticias")
          .select("id", { count: "exact", head: true })
          .eq("created_by_uid", userId)
          .eq("is_deleted", false),

        // Colaboraciones activas (proyectos donde participa)
        supabase
          .from("proyecto_persona_rol")
          .select("id", { count: "exact", head: true })
          .eq("persona_id", userId)
          .eq("is_deleted", false),

        // Temas de interés del usuario
        supabase
          .from("persona_tema")
          .select("id", { count: "exact", head: true })
          .eq("persona_id", userId)
          .eq("is_deleted", false),
      ]);

      const results = [
        misProyectosResult,
        misNoticiasResult,
        colaboracionesResult,
        temasInteresResult,
      ];

      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }

      const userStats = {
        misProyectos: misProyectosResult.count || 0,
        misNoticias: misNoticiasResult.count || 0,
        colaboraciones: colaboracionesResult.count || 0,
        temasInteres: temasInteresResult.count || 0,
      };

      console.log("📊 Server: User stats:", userStats);
      return createSuccess(userStats);
    } catch (error) {
      console.error("❌ Server: Error loading user stats:", error);
      return createError({
        name: "ServiceError",
        message: "Error loading user statistics",
        code: "DB_ERROR",
        details: error,
      });
    }
  }
}

export const statsService = new StatsService();
