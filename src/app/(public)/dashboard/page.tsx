// src/app/(public)/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useProjectRoles } from "@/hooks/useProjectRoles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Newspaper,
  Users,
  PlusCircle,
  BookOpen,
  Eye,
  Settings,
  BarChart,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();
  const { hasActiveRoles, isLoading: rolesLoading } = useProjectRoles();

  // NO redirigir admins automáticamente - déjalos ver su dashboard personal también
  // Solo redirigir si no tienen acceso al dashboard
  useEffect(() => {
    if (!isLoading && !rolesLoading && user && !isAdmin) {
      if (!hasActiveRoles) {
        router.push("/");
      }
    }
  }, [user, isAdmin, hasActiveRoles, isLoading, rolesLoading, router]);

  // Loading states
  if (isLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Access guard for non-admin users - admins también pueden ver su dashboard personal
  if (!user || (!isAdmin && !hasActiveRoles)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-pulse w-12 h-12 bg-muted rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  // Determinar permisos
  const canCreateProjects =
    user &&
    (user.categoria_principal === "estudiante_cet" ||
      user.categoria_principal === "ex_alumno_cet");

  // Secciones del dashboard de usuario
  const userSections = [
    // Mis Proyectos - donde participa
    {
      title: "Mis Proyectos",
      description: "Proyectos donde soy autor, tutor o colaborador",
      icon: FolderOpen,
      href: "/dashboard/proyectos",
      color: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      iconColor: "text-blue-600",
      count: "-- proyectos", // Placeholder para futuro
      badge: "Gestión",
    },

    // Crear Proyecto - Solo para autores potenciales
    ...(canCreateProjects
      ? [
          {
            title: "Crear Proyecto",
            description: "Iniciar un nuevo proyecto de fin de curso",
            icon: PlusCircle,
            href: "/proyectos/new",
            color: "bg-gradient-to-br from-green-50 to-green-100/50",
            iconColor: "text-green-600",
            count: null,
            badge: "Nuevo",
          },
        ]
      : []),

    // Mis Noticias
    {
      title: "Mis Noticias",
      description: "Noticias que he creado o en las que colaboro",
      icon: Newspaper,
      href: "/dashboard/noticias",
      color: "bg-gradient-to-br from-purple-50 to-purple-100/50",
      iconColor: "text-purple-600",
      count: "-- noticias",
      badge: "Contenido",
    },

    // Mi Perfil
    {
      title: "Mi Perfil",
      description: "Actualizar información personal y preferencias",
      icon: Users,
      href: "/perfil",
      color: "bg-gradient-to-br from-orange-50 to-orange-100/50",
      iconColor: "text-orange-600",
      count: null,
      badge: "Perfil",
    },
  ];

  // Secciones de exploración
  const exploreSections = [
    {
      title: "Explorar Noticias",
      description: "Ver todas las noticias publicadas de la comunidad",
      icon: Eye,
      href: "/noticias",
      color: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Historias Orales",
      description: "Descubrir testimonios de la comunidad rural",
      icon: BookOpen,
      href: "/historias",
      color: "bg-gradient-to-br from-teal-50 to-teal-100/50",
      iconColor: "text-teal-600",
    },
    {
      title: "Actividad",
      description: "Ver mi actividad reciente en la plataforma",
      icon: Clock,
      href: "/dashboard/actividad",
      color: "bg-gradient-to-br from-gray-50 to-gray-100/50",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Mi Dashboard
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
        </div>
        <p className="text-muted-foreground">
          Bienvenido/a,{" "}
          <span className="font-medium text-foreground">
            {user.nombre || user.email}
          </span>
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Categoría:</span>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            {user.categoria_principal?.replace("_", " ") || "Usuario"}
          </Badge>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Proyectos",
            value: "--",
            icon: FolderOpen,
            color: "text-blue-600",
          },
          {
            label: "Noticias",
            value: "--",
            icon: Newspaper,
            color: "text-purple-600",
          },
          {
            label: "Colaboraciones",
            value: "--",
            icon: Users,
            color: "text-green-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="text-center bg-gradient-to-br from-background to-primary/5"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secciones Principales */}
      <section>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Gestión Personal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.title}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 ${section.color} border-primary/10`}
                onClick={() => router.push(section.href)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-lg">
                      <Icon className={`h-6 w-6 ${section.iconColor}`} />
                    </div>
                    {section.badge && (
                      <Badge variant="outline" className="bg-white/60 text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {section.title}
                    {section.count && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {section.count}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/60 hover:bg-white/80"
                  >
                    {section.title.startsWith("Crear") ? "Crear" : "Acceder"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Secciones de Exploración */}
      <section>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Explorar Comunidad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exploreSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.title}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 ${section.color} border-0`}
                onClick={() => router.push(section.href)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-white/80 backdrop-blur-sm rounded-lg w-fit">
                    <Icon className={`h-6 w-6 ${section.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full">
                    Explorar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Info del usuario */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
        <div className="text-center space-y-3">
          <h3 className="font-semibold text-primary mb-2">
            📚 Tu espacio personal en La Técnica no se Olvida
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Este dashboard te permite gestionar tu contenido, participar en
            proyectos y colaborar con la comunidad. También puedes explorar
            noticias e historias orales publicadas por otros miembros.
          </p>
          <div className="flex items-center justify-center gap-4 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/noticias")}
              className="bg-white/60 hover:bg-white/80"
            >
              Ver Noticias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/perfil")}
              className="bg-white/60 hover:bg-white/80"
            >
              Editar Perfil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
