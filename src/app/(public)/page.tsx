// src/app/(public)/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
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
  BookOpen,
  GraduationCap,
  Lightbulb,
  Target,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  // Secciones principales del portal
  const mainSections = [
    {
      title: "Proyectos",
      description:
        "Explora proyectos técnicos y de investigación desarrollados por la comunidad del CET N°26",
      icon: FolderOpen,
      href: "/noticias", // Temporal hasta que tengamos /proyectos público
      color: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600",
      stats: "50+ proyectos",
    },
    {
      title: "Noticias",
      description:
        "Mantente al día con las últimas novedades, eventos y logros de nuestra comunidad educativa",
      icon: Newspaper,
      href: "/noticias",
      color: "bg-purple-50 hover:bg-purple-100",
      iconColor: "text-purple-600",
      stats: "Últimas noticias",
    },
    {
      title: "Comunidad",
      description:
        "Conoce a estudiantes, docentes, ex-alumnos y colaboradores que forman parte de nuestra red",
      icon: Users,
      href: "/noticias", // Temporal hasta que tengamos /comunidad
      color: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600",
      stats: "200+ miembros",
    },
    {
      title: "Historias Orales",
      description:
        "Testimonios y experiencias de la comunidad rural que preservan nuestro conocimiento local",
      icon: BookOpen,
      href: "/noticias", // Temporal hasta que tengamos /historias
      color: "bg-orange-50 hover:bg-orange-100",
      iconColor: "text-orange-600",
      stats: "30+ testimonios",
    },
  ];

  // Llamadas a acción según tipo de usuario
  const getCallToActions = () => {
    if (!user) {
      return [
        {
          title: "Únete a la Comunidad",
          description:
            "Regístrate para acceder a contenido exclusivo y conectar con la red del CET N°26",
          action: "Registrarse",
          href: "/login",
          variant: "default",
        },
        {
          title: "Explora sin Registrarte",
          description:
            "Descubre proyectos y noticias públicas de nuestra comunidad",
          action: "Explorar",
          href: "/noticias",
          variant: "outline",
        },
      ];
    }

    if (isAdmin) {
      return [
        {
          title: "Panel de Administración",
          description:
            "Gestiona contenido, usuarios y configuración completa del sistema",
          action: "Ir al Panel Admin",
          href: "/admin",
          variant: "default",
        },
        {
          title: "Mi Dashboard Personal",
          description: "Accede también a tu vista personal de usuario",
          action: "Ver Mi Dashboard",
          href: "/dashboard",
          variant: "outline",
        },
      ];
    }

    // Usuario normal logueado
    const canCreateProjects =
      user.categoria_principal === "estudiante_cet" ||
      user.categoria_principal === "ex_alumno_cet";

    const actions = [
      {
        title: "Mi Dashboard",
        description:
          "Accede a tu panel personal para gestionar tu contenido y proyectos",
        action: "Ver Dashboard",
        href: "/dashboard",
        variant: "default",
      },
    ];

    // Crear proyecto como acción secundaria (menos prominente)
    if (canCreateProjects) {
      actions.push({
        title: "¿Necesitas crear un proyecto?",
        description:
          "Desde tu dashboard podrás iniciar tu proyecto de fin de curso cuando sea necesario",
        action: "Ir al Dashboard",
        href: "/dashboard",
        variant: "outline",
      });
    }

    return actions;
  };

  const callToActions = getCallToActions();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 sm:py-20 lg:py-24 -mx-4">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-primary/20"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                CET N°26 - Ingeniero Jacobacci
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                La Técnica{" "}
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  no se Olvida
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Preservamos y compartimos el conocimiento rural y técnico de
                nuestra comunidad educativa, conectando generaciones a través de
                proyectos, historias y experiencias.
              </p>
            </div>

            {/* Stats rápidas */}
            <div className="flex justify-center gap-8 pt-8">
              {[
                { label: "Proyectos", value: "50+", color: "text-blue-600" },
                { label: "Miembros", value: "200+", color: "text-green-600" },
                { label: "Historias", value: "30+", color: "text-orange-600" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Explora Nuestra Comunidad
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full mb-4"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubre proyectos innovadores, mantente informado con las últimas
              noticias, conecta con nuestra comunidad y escucha las historias
              que nos definen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card
                  key={section.title}
                  className={`cursor-pointer transition-all duration-300 ${section.color} border-0 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1`}
                  onClick={() => router.push(section.href)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-lg bg-white/80 backdrop-blur-sm">
                        <Icon className={`h-6 w-6 ${section.iconColor}`} />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-60" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className="w-fit text-xs bg-white/60"
                    >
                      {section.stats}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {section.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {user
                ? `¡Hola, ${user.nombre || user.email}!`
                : "Comienza tu Experiencia"}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full mb-4"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {user
                ? "Accede a tu contenido personalizado y contribuye a nuestra comunidad educativa"
                : "Únete a nuestra comunidad y forma parte de la preservación del conocimiento técnico y rural"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {callToActions.map((cta, index) => (
              <Card
                key={index}
                className="text-center bg-background/80 backdrop-blur-sm border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-lg">
                    {cta.title}
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {cta.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={cta.variant as "default" | "outline"}
                    size="lg"
                    className="w-full"
                    onClick={() => router.push(cta.href)}
                  >
                    {cta.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Nuestra Misión",
                description:
                  "Preservar y transmitir el conocimiento técnico y rural de Ingeniero Jacobacci, conectando generaciones de estudiantes y profesionales.",
                color: "text-blue-600",
              },
              {
                icon: Lightbulb,
                title: "Innovación",
                description:
                  "Fomentamos el desarrollo de proyectos innovadores que aborden desafíos reales de nuestra comunidad rural y técnica.",
                color: "text-yellow-600",
              },
              {
                icon: Users,
                title: "Comunidad",
                description:
                  "Creamos una red colaborativa donde estudiantes, docentes, ex-alumnos y profesionales comparten experiencias y conocimientos.",
                color: "text-green-600",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                    <Icon className={`h-8 w-8 ${item.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">
              CET N°26 - Centro de Educación Técnica
            </h3>
            <p className="text-sm text-muted-foreground">
              Ingeniero Jacobacci, Río Negro, Argentina
            </p>
            <p className="text-xs text-muted-foreground">
              © 2024 La Técnica no se Olvida. Preservando el conocimiento de
              nuestra comunidad.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
