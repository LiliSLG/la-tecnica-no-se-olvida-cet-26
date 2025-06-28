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
   * VERSIÓN INCREMENTAL: Solo consulta tablas implementadas completamente
   */
  async getUserStats(userId: string): Promise<
    ServiceResult<{
      misProyectos: number;
      misNoticias: number;
      misNoticiasBorradores: number;
      colaboraciones: number;
      temasInteres: number;
    }>
  > {
    try {
      // ✅ NOTICIAS - Consulta real de publicadas y borradores
      let misNoticiasCount = 0;
      let misNoticiasBorradoresCount = 0;

      try {
        // Noticias publicadas
        const publicadasResult = await supabase
          .from("noticias")
          .select("id", { count: "exact", head: true })
          .eq("created_by_uid", userId)
          .eq("is_deleted", false)
          .eq("esta_publicada", true);

        // Noticias borradores
        const borradoresResult = await supabase
          .from("noticias")
          .select("id", { count: "exact", head: true })
          .eq("created_by_uid", userId)
          .eq("is_deleted", false)
          .eq("esta_publicada", false);

        misNoticiasCount = publicadasResult.count || 0;
        misNoticiasBorradoresCount = borradoresResult.count || 0;

        console.log("✅ Noticias publicadas:", misNoticiasCount);
        console.log("✅ Noticias borradores:", misNoticiasBorradoresCount);
      } catch (error) {
        console.warn("⚠️ Error loading noticias:", error);
      }

      // 🔄 PROYECTOS - Tabla básica implementada (25%)
      let misProyectosCount = 0;
      try {
        const misProyectosResult = await supabase
          .from("proyectos")
          .select("id", { count: "exact", head: true })
          .eq("created_by_uid", userId)
          .eq("is_deleted", false);

        if (misProyectosResult.error) {
          console.warn(
            "⚠️ Server: Error loading user proyectos:",
            misProyectosResult.error
          );
        } else {
          misProyectosCount = misProyectosResult.count || 0;
          console.log("✅ Server: User proyectos count:", misProyectosCount);
        }
      } catch (error) {
        console.log(
          "ℹ️ Server: Proyectos stats not fully available yet, using 0"
        );
      }

      // ❌ COLABORACIONES - Tabla relacional no implementada
      // TODO: Implementar cuando proyecto_persona_rol esté listo
      const colaboracionesCount = 0;
      console.log(
        "ℹ️ Server: Colaboraciones stats not implemented yet, using 0"
      );

      // ❌ TEMAS DE INTERÉS - Tabla relacional no implementada
      // TODO: Implementar cuando persona_tema esté listo
      const temasInteresCount = 0;
      console.log(
        "ℹ️ Server: Temas interés stats not implemented yet, using 0"
      );

      const userStats = {
        misProyectos: misProyectosCount,
        misNoticias: misNoticiasCount,
        misNoticiasBorradores: misNoticiasBorradoresCount,
        colaboraciones: colaboracionesCount,
        temasInteres: temasInteresCount,
      };

      console.log("📊 Server: User stats loaded successfully:", userStats);
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

  /**
   * FUTURO: Método para agregar estadísticas de colaboraciones
   * cuando proyecto_persona_rol esté implementado
   */
  private async getUserCollaborations(userId: string): Promise<number> {
    try {
      const result = await supabase
        .from("proyecto_persona_rol")
        .select("id", { count: "exact", head: true })
        .eq("persona_id", userId)
        .eq("is_deleted", false);

      if (result.error) throw result.error;
      return result.count || 0;
    } catch (error) {
      console.log("ℹ️ Server: Colaboraciones table not ready:", error);
      return 0;
    }
  }

  /**
   * FUTURO: Método para agregar estadísticas de temas de interés
   * cuando persona_tema esté implementado
   */
  private async getUserTopicsOfInterest(userId: string): Promise<number> {
    try {
      const result = await supabase
        .from("persona_tema")
        .select("id", { count: "exact", head: true })
        .eq("persona_id", userId)
        .eq("is_deleted", false);

      if (result.error) throw result.error;
      return result.count || 0;
    } catch (error) {
      console.log("ℹ️ Server: Persona_tema table not ready:", error);
      return 0;
    }
  }
}

export const statsService = new StatsService();
