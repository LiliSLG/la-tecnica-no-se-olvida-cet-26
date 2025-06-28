// /src/app/(public)/dashboard/page.tsx - CON STATS REALES
"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useProjectRoles } from "@/hooks/useProjectRoles";
import { statsService } from "@/lib/supabase/services/statsService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderOpen,
  Newspaper,
  Users,
  PlusCircle,
  Eye,
  BookOpen,
  Activity,
  Settings,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardPageProps {
  // Props si necesitas pasar data desde un Server Component padre
}

// Server Component wrapper que carga las stats del usuario
export default function DashboardPage() {
  // Nota: En una implementación real, necesitarías obtener el userId del servidor
  // Por ahora, es un Client Component que maneja todo

  return <DashboardContent />;
}

// Client Component que maneja la UI y auth
function DashboardContent() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const { hasActiveRoles } = useProjectRoles();

  // Estados para stats del usuario
  const [userStats, setUserStats] = useState<{
    misProyectos: number;
    misNoticias: number;
    colaboraciones: number;
    temasInteres: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Cargar stats del usuario
  useEffect(() => {
    async function loadUserStats() {
      if (!user?.id) return;

      try {
        const result = await statsService.getUserStats(user.id);
        if (result.success && result.data) {
          setUserStats(result.data);
        }
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setStatsLoading(false);
      }
    }

    loadUserStats();
  }, [user?.id]);

  // Redirects
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  // Verificar permisos para crear proyectos
  const canCreateProjects = Boolean(
    user.categoria_principal === "estudiante_cet" ||
      user.categoria_principal === "ex_alumno_cet" ||
      user.categoria_principal === "docente_cet" ||
      isAdmin
  );

  // Estadísticas con datos reales y comentarios (con null safety)
  const quickStats = [
    {
      title: "Mis Proyectos",
      value: userStats?.misProyectos?.toString() || "0",
      change:
        (userStats?.misProyectos || 0) > 0
          ? (userStats?.misProyectos || 0) === 1
            ? "proyecto activo"
            : "proyectos activos"
          : "sin proyectos",
      icon: FolderOpen,
      trend: (userStats?.misProyectos || 0) > 0 ? "up" : "neutral",
      description: "Participando activamente",
    },
    {
      title: "Mis Noticias",
      value: userStats?.misNoticias?.toString() || "0",
      change:
        (userStats?.misNoticias || 0) > 0 ? "publicadas" : "crear primera",
      icon: Newspaper,
      trend: (userStats?.misNoticias || 0) > 0 ? "up" : "neutral",
      description: "Contenido compartido",
    },
    {
      title: "Colaboraciones",
      value: userStats?.colaboraciones?.toString() || "0",
      change:
        (userStats?.colaboraciones || 0) > 0
          ? (userStats?.colaboraciones || 0) === 1
            ? "colaboración"
            : "colaboraciones"
          : "únete a proyectos",
      icon: Users,
      trend: (userStats?.colaboraciones || 0) > 0 ? "up" : "neutral",
      description: "En proyectos",
    },
  ];

  // Secciones principales mejoradas
  const userSections = [
    {
      title: "Mis Proyectos",
      description:
        "Gestiona los proyectos donde participas como autor, tutor o colaborador",
      icon: FolderOpen,
      href: "/dashboard/proyectos",
      stats: userStats
        ? {
            active:
              (userStats.misProyectos || 0) > 0
                ? (userStats.misProyectos || 0).toString()
                : "0",
            total: (userStats.misProyectos || 0).toString(),
          }
        : null,
      isActive: true,
      badge: "Activo",
    },
    ...(canCreateProjects
      ? [
          {
            title: "Crear Proyecto",
            description:
              "Inicia un nuevo proyecto de fin de curso o investigación",
            icon: PlusCircle,
            href: "/proyectos/new",
            stats: null,
            isActive: true,
            badge: "Nuevo",
          },
        ]
      : []),
    {
      title: "Mis Noticias",
      description:
        "Administra las noticias que has creado o en las que colaboras",
      icon: Newspaper,
      href: "/dashboard/noticias",
      stats: userStats
        ? {
            published: (userStats.misNoticias || 0).toString(),
            drafts: "0", // Esto lo podríamos calcular si tuviéramos campo de borradores
          }
        : null,
      isActive: true,
      badge: "Contenido",
    },
    {
      title: "Mi Perfil",
      description:
        "Actualiza tu información personal, categoría y preferencias",
      icon: Users,
      href: "/perfil",
      stats: userStats
        ? {
            temas:
              (userStats.temasInteres || 0).toString() + " temas de interés",
          }
        : null,
      isActive: true,
      badge: "Perfil",
    },
  ];

  // Secciones de exploración
  const exploreSections = [
    {
      title: "Noticias Comunidad",
      description: "Explora todas las noticias publicadas por la comunidad",
      icon: Eye,
      href: "/noticias",
      isActive: true,
    },
    {
      title: "Historias Orales",
      description: "Descubre testimonios y sabiduría de nuestra región",
      icon: BookOpen,
      href: "/historias",
      isActive: false,
    },
    {
      title: "Mi Actividad",
      description: "Revisa tu actividad reciente en la plataforma",
      icon: Activity,
      href: "/dashboard/actividad",
      isActive: false,
    },
    {
      title: "Configuración",
      description: "Ajusta tus preferencias y notificaciones",
      icon: Settings,
      href: "/dashboard/configuracion",
      isActive: false,
    },
  ];

  // Formatear categoría
  const formatCategoria = (categoria: string) => {
    const categorias: Record<string, string> = {
      estudiante_cet: "Estudiante CET",
      ex_alumno_cet: "Ex Alumno CET",
      docente_cet: "Docente CET",
      tutor_invitado: "Tutor Invitado",
      colaborador_invitado: "Colaborador",
      productor_rural: "Productor Rural",
      profesional_externo: "Profesional Externo",
      investigador: "Investigador",
      comunidad_general: "Comunidad General",
    };
    return categorias[categoria] || categoria;
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* Header personalizado */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Mi Dashboard</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Bienvenido/a, {user.nombre || user.email}</span>
              <MapPin className="h-4 w-4" />
              <span className="text-sm">CET N°26</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30"
            >
              {formatCategoria(user.categoria_principal || "")}
            </Badge>
            {isAdmin && (
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 border-orange-200"
              >
                Administrador
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-center gap-2">
                    {statsLoading ? (
                      <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-2xl font-bold">{stat.value}</p>
                    )}
                    <Badge
                      variant={stat.trend === "up" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className="opacity-20">
                  <stat.icon className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resto del contenido igual... */}
      {/* Secciones principales */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Gestión Personal</h2>
          <Badge variant="outline" className="hidden sm:inline-flex">
            {userSections.filter((s) => s.isActive).length} secciones
            disponibles
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {userSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.title}
                className="group flex flex-col cursor-pointer transition-all duration-200 hover:shadow-md border-border"
                onClick={() => router.push(section.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base sm:text-lg leading-tight">
                          {section.title}
                        </CardTitle>
                        {section.stats && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {section.stats.active && (
                              <span>{section.stats.active} activos</span>
                            )}
                            {section.stats.total && (
                              <span>• {section.stats.total} total</span>
                            )}
                            {section.stats.published && (
                              <span>{section.stats.published} publicadas</span>
                            )}
                            {section.stats.drafts && (
                              <span>• {section.stats.drafts} borradores</span>
                            )}
                            {section.stats.temas && (
                              <span>{section.stats.temas}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {section.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-0 mt-auto">
                  <Button variant="default" className="w-full text-sm">
                    {section.title.includes("Crear")
                      ? "Crear Nuevo"
                      : "Acceder"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Explorar comunidad */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">Explorar Comunidad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {exploreSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.title}
                className={`group flex flex-col cursor-pointer transition-opacity ${
                  section.isActive
                    ? "hover:shadow-md border-border"
                    : "opacity-60 hover:opacity-80"
                }`}
                onClick={() => section.isActive && router.push(section.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        section.isActive
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base leading-tight">
                      {section.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-0 mt-auto">
                  <Button
                    variant={section.isActive ? "default" : "secondary"}
                    disabled={!section.isActive}
                    className="w-full text-sm"
                  >
                    {section.isActive ? "Explorar" : "Próximamente"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
