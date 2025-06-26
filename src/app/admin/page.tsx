// src/app/admin/page.tsx
"use client";

import "@/app/globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import {
  Users,
  FolderOpen,
  Newspaper,
  BookOpen,
  Building,
  Tag,
  GraduationCap,
  Briefcase,
  Shield,
  BarChart,
  Settings,
  FileText,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

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
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Proyectos",
      description:
        "Gestionar los proyectos desarrollados por la comunidad y sus participantes asociados.",
      href: "/admin/proyectos",
      isActive: true,
      icon: FolderOpen,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
    },
    {
      title: "Noticias",
      description:
        "Administrar las noticias y novedades que se mostrarán en la web",
      href: "/admin/noticias",
      isActive: true,
      icon: Newspaper,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
    },
    {
      title: "Historias Orales",
      description:
        "Gestionar las historias orales y testimonios recopilados por la comunidad.",
      href: "/admin/historias-orales",
      isActive: false,
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
    },
    {
      title: "Organizaciones Vinculadas",
      description:
        "Administrar las organizaciones que colaboran o se vinculan con la comunidad.",
      href: "/admin/organizaciones",
      isActive: false,
      icon: Building,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
    },
    {
      title: "Temáticas / Ejes",
      description:
        "Definir y gestionar las temáticas o ejes que estructuran los contenidos y proyectos de la comunidad.",
      href: "/admin/temas",
      isActive: true,
      icon: Tag,
      color: "text-pink-600",
      bgColor: "bg-pink-50 hover:bg-pink-100",
    },
    {
      title: "Cursos",
      description:
        "Gestionar los cursos ofrecidos a los alumnos del CET, así como sus detalles y participantes.",
      href: "/admin/cursos",
      isActive: false,
      icon: GraduationCap,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 hover:bg-cyan-100",
    },
    {
      title: "Bolsa de Trabajo",
      description: "Gestión de Ofertas de trabajo para los alumnos del CET",
      href: "/admin/ofertasTrabajo",
      isActive: false,
      icon: Briefcase,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 hover:bg-yellow-100",
    },
  ];

  const generalAdminSections = [
    {
      title: "Gestión de Usuarios y Roles",
      description: "Administrar permisos y roles de usuarios del sistema",
      href: "#",
      isActive: false,
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50 hover:bg-red-100",
    },
    {
      title: "Estadísticas",
      description: "Ver métricas y analytics de la plataforma",
      href: "#",
      isActive: false,
      icon: BarChart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
    },
    {
      title: "Configuración del Sitio",
      description: "Configurar parámetros generales de la aplicación",
      href: "#",
      isActive: false,
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-50 hover:bg-gray-100",
    },
    {
      title: "Registros y Auditoría",
      description: "Revisar logs y actividad del sistema",
      href: "#",
      isActive: false,
      icon: FileText,
      color: "text-slate-600",
      bgColor: "bg-slate-50 hover:bg-slate-100",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header del Dashboard - más compacto */}
      <div className="text-center space-y-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
        </div>
        <p className="text-sm text-muted-foreground">
          Bienvenido/a,{" "}
          <span className="font-medium text-foreground">
            {user?.nombre || user?.email}
          </span>
        </p>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 text-xs"
        >
          <Shield className="w-3 h-3 mr-1" />
          Administrador
        </Badge>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Proyectos Activos",
            value: "--",
            icon: FolderOpen,
            color: "text-green-600",
          },
          {
            label: "Noticias Publicadas",
            value: "--",
            icon: Newspaper,
            color: "text-purple-600",
          },
          {
            label: "Usuarios Activos",
            value: "--",
            icon: Users,
            color: "text-blue-600",
          },
          {
            label: "Temas Definidos",
            value: "--",
            icon: Tag,
            color: "text-pink-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-gradient-to-br from-background to-primary/5 border-primary/10"
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gestión de contenidos */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
            <FolderOpen className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Gestión de Contenidos
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentManagementSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.title}
                className={`flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${section.bgColor} border-0`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-lg">
                      <Icon className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <Badge
                      variant={section.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {section.isActive ? "Activo" : "Próximamente"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <Button
                    variant={section.isActive ? "default" : "secondary"}
                    className="w-full"
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

      {/* Administración General */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Administración General
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {generalAdminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.title}
                className={`flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${section.bgColor} border-0`}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-white/80 backdrop-blur-sm rounded-lg w-fit">
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={!section.isActive}
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
