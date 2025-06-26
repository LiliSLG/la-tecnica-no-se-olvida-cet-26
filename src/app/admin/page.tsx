// src/app/admin/page.tsx
"use client";

import "@/app/globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import {
  Users,
  FolderOpen,
  Newspaper,
  BookOpen,
  Building,
  Tags,
  GraduationCap,
  Briefcase,
  Settings,
  BarChart3,
  Shield,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  const contentManagementSections = [
    {
      title: "Comunidad",
      description:
        "Gestionar las personas que integran la comunidad: estudiantes, ex estudiantes, tutores, colaboradores, docentes e invitados.",
      href: "/admin/personas",
      isActive: true,
      icon: Users,
      stats: { total: "24", new: "3" },
    },
    {
      title: "Proyectos",
      description:
        "Gestionar los proyectos desarrollados por la comunidad y sus participantes asociados.",
      href: "/admin/proyectos",
      isActive: true,
      icon: FolderOpen,
      stats: { total: "12", new: "2" },
    },
    {
      title: "Noticias",
      description:
        "Administrar las noticias y novedades que se mostrarán en la web",
      href: "/admin/noticias",
      isActive: true,
      icon: Newspaper,
      stats: { total: "18", new: "1" },
    },
    {
      title: "Historias Orales",
      description:
        "Gestionar las historias orales y testimonios recopilados por la comunidad.",
      href: "/admin/historias-orales",
      isActive: false,
      icon: BookOpen,
      stats: { total: "0", new: "0" },
    },
    {
      title: "Organizaciones Vinculadas",
      description:
        "Administrar las organizaciones que colaboran o se vinculan con la comunidad.",
      href: "/admin/organizaciones",
      isActive: false,
      icon: Building,
      stats: { total: "0", new: "0" },
    },
    {
      title: "Temáticas / Ejes",
      description:
        "Definir y gestionar las temáticas o ejes que estructuran los contenidos y proyectos de la comunidad.",
      href: "/admin/temas",
      isActive: true,
      icon: Tags,
      stats: { total: "8", new: "0" },
    },
    {
      title: "Cursos",
      description:
        "Gestionar los cursos ofrecidos a los alumnos del CET, así como sus detalles y participantes.",
      href: "/admin/cursos",
      isActive: false,
      icon: GraduationCap,
      stats: { total: "0", new: "0" },
    },
    {
      title: "Bolsa de Trabajo",
      description: "Gestión de Ofertas de trabajo para los alumnos del CET",
      href: "/admin/ofertasTrabajo",
      isActive: false,
      icon: Briefcase,
      stats: { total: "0", new: "0" },
    },
  ];

  const generalAdminSections = [
    {
      title: "Gestión de Usuarios y Roles",
      description: "Administrar permisos y roles de usuarios del sistema",
      href: "#",
      isActive: false,
      icon: Shield,
    },
    {
      title: "Estadísticas",
      description: "Visualizar métricas y estadísticas del sitio",
      href: "#",
      isActive: false,
      icon: BarChart3,
    },
    {
      title: "Configuración del Sitio",
      description: "Ajustes generales y configuración de la plataforma",
      href: "#",
      isActive: false,
      icon: Settings,
    },
    {
      title: "Registros y Auditoría",
      description: "Revisar logs y actividad del sistema",
      href: "#",
      isActive: false,
      icon: FileText,
    },
  ];

  // Estadísticas rápidas (placeholder data)
  const quickStats = [
    {
      title: "Total Contenidos",
      value: "62",
      change: "+12%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Publicaciones Activas",
      value: "45",
      change: "+8%",
      icon: CheckCircle,
      trend: "up",
    },
    {
      title: "Pendientes Revisión",
      value: "5",
      change: "-2",
      icon: Clock,
      trend: "down",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">
          Bienvenido/a, {user?.nombre || user?.email || "Administrador"}.
          Gestiona el contenido y configuración de la plataforma.
        </p>
      </div>

      {/* Quick Stats */}
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
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <Badge
                      variant={stat.trend === "up" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className="opacity-20">
                  <stat.icon className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">
            Gestión de Contenidos
          </h2>
          <Badge variant="outline" className="hidden sm:inline-flex">
            {contentManagementSections.filter((s) => s.isActive).length} de{" "}
            {contentManagementSections.length} activos
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contentManagementSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.title}
                className={`group flex flex-col transition-all duration-200 ${
                  section.isActive
                    ? "hover:shadow-md border-border"
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          section.isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base sm:text-lg leading-tight">
                          {section.title}
                        </CardTitle>
                        {section.isActive && section.stats && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{section.stats.total} total</span>
                            {parseInt(section.stats.new) > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1.5 py-0"
                              >
                                +{section.stats.new}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {!section.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Próximamente
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm leading-relaxed mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-0 mt-auto">
                  <Button
                    variant={section.isActive ? "default" : "secondary"}
                    className="w-full text-sm"
                    asChild={section.isActive}
                    disabled={!section.isActive}
                  >
                    {section.isActive ? (
                      <Link href={section.href}>Gestionar</Link>
                    ) : (
                      <span>Próximamente</span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* General Administration */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">
          Administración General
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {generalAdminSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.title}
                className="group flex flex-col opacity-60 hover:opacity-80 transition-opacity"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base leading-tight">
                      {section.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-0 mt-auto">
                  <Button
                    variant="secondary"
                    className="w-full text-sm"
                    disabled
                  >
                    Próximamente
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
