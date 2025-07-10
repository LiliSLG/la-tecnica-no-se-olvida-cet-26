// src/components/public/comunidad/PersonaDetail.tsx
"use client";

import { PersonaPublica } from "@/lib/supabase/services/personasService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Globe,
  CheckCircle,
  Users,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PersonaDetailProps {
  persona: PersonaPublica;
}

// Helper para obtener info de la categoría
const getCategoriaInfo = (categoria: string) => {
  const categorias = {
    estudiante_cet: {
      label: "Estudiante CET",
      icon: "🎓",
      color: "bg-blue-100 text-blue-800",
      description: "Estudiante actual del CET N°26",
    },
    ex_alumno_cet: {
      label: "Ex-Alumno CET",
      icon: "👨‍🎓",
      color: "bg-purple-100 text-purple-800",
      description: "Egresado del CET N°26",
    },
    docente_cet: {
      label: "Docente CET",
      icon: "👨‍🏫",
      color: "bg-green-100 text-green-800",
      description: "Docente del CET N°26",
    },
    comunidad_activa: {
      label: "Comunidad Activa",
      icon: "🤝",
      color: "bg-orange-100 text-orange-800",
      description: "Miembro activo de la comunidad",
    },
    comunidad_general: {
      label: "Comunidad",
      icon: "👥",
      color: "bg-gray-100 text-gray-800",
      description: "Miembro de la comunidad",
    },
    profesional_independiente: {
      label: "Profesional",
      icon: "💼",
      color: "bg-indigo-100 text-indigo-800",
      description: "Profesional independiente",
    },
    tecnico_especializado: {
      label: "Técnico",
      icon: "🔧",
      color: "bg-yellow-100 text-yellow-800",
      description: "Técnico especializado",
    },
  };

  return (
    categorias[categoria as keyof typeof categorias] || {
      label: categoria,
      icon: "👤",
      color: "bg-gray-100 text-gray-800",
      description: "Miembro de la comunidad",
    }
  );
};

// Helper para iconos de links profesionales
const getLinkIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "github":
      return <Github className="h-5 w-5" />;
    case "linkedin":
      return <Linkedin className="h-5 w-5" />;
    case "instagram":
      return <Instagram className="h-5 w-5" />;
    case "twitter":
      return <Twitter className="h-5 w-5" />;
    case "website":
      return <Globe className="h-5 w-5" />;
    default:
      return <ExternalLink className="h-5 w-5" />;
  }
};

// Helper para obtener nombre de plataforma
const getPlatformName = (platform: string) => {
  const names = {
    github: "GitHub",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    twitter: "Twitter",
    website: "Sitio Web",
  };
  return names[platform.toLowerCase() as keyof typeof names] || platform;
};

export function PersonaDetail({ persona }: PersonaDetailProps) {
  const router = useRouter();
  const nombreCompleto = `${persona.nombre} ${persona.apellido}`.trim();
  const categoriaInfo = getCategoriaInfo(
    persona.categoria_principal || "comunidad_general"
  );
  // Generar iniciales para avatar
  const iniciales = `${persona.nombre?.[0] || ""}${
    persona.apellido?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="space-y-8">
      {/* Navegación de regreso */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="text-sm text-muted-foreground">
          <Link href="/comunidad" className="hover:underline">
            Comunidad
          </Link>
          <span className="mx-2">•</span>
          <span>{nombreCompleto}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal - Información */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header con info básica */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar grande */}
                <Avatar className="h-24 w-24 mx-auto sm:mx-0">
                  <AvatarImage
                    src={persona.foto_url || undefined}
                    alt={`Foto de ${nombreCompleto}`}
                  />
                  <AvatarFallback className="text-2xl font-bold">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left">
                  {/* Nombre y categoría */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">
                        {nombreCompleto}
                      </h1>
                      <Badge className={`text-sm ${categoriaInfo.color}`}>
                        {categoriaInfo.icon} {categoriaInfo.label}
                      </Badge>
                    </div>

                    {/* Indicador de disponibilidad */}
                    {persona.disponible_para_proyectos && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">
                          Disponible para proyectos
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Descripción de categoría */}
                  <p className="text-muted-foreground">
                    {categoriaInfo.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            {/* Descripción personal/profesional */}
            {persona.descripcion_personal_o_profesional && (
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <Briefcase className="h-5 w-5" />
                    Acerca de {persona.nombre}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {persona.descripcion_personal_o_profesional}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Áreas de interés */}
          {persona.areas_de_interes_o_expertise &&
            persona.areas_de_interes_o_expertise.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Heart className="h-5 w-5" />
                    Áreas de Interés y Expertise
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {persona.areas_de_interes_o_expertise.map((area, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm px-3 py-1"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Columna lateral - Contacto y links */}
        <div className="space-y-6">
          {/* Links profesionales */}
          {persona.links_profesionales && (
            <Card>
              <CardHeader>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <ExternalLink className="h-5 w-5" />
                  Enlaces Profesionales
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(persona.links_profesionales)
                  .filter(
                    ([_, url]) =>
                      url && typeof url === "string" && url.trim() !== ""
                  )
                  .map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3"
                      >
                        {getLinkIcon(platform)}
                        <span>{getPlatformName(platform)}</span>
                        <ExternalLink className="h-4 w-4 ml-auto" />
                      </a>
                    </Button>
                  ))}
              </CardContent>
            </Card>
          )}

          {/* Info adicional */}
          <Card>
            <CardHeader>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                Información Adicional
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estado de disponibilidad */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Disponible para proyectos:
                </span>
                <div className="flex items-center gap-2">
                  {persona.disponible_para_proyectos ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Sí
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-4 w-4 rounded-full bg-gray-300" />
                      <span className="text-sm text-muted-foreground">
                        No disponible
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Enlace a comunidad */}
              <div className="text-center">
                <Button asChild variant="default" className="w-full">
                  <Link href="/comunidad">
                    <Users className="h-4 w-4 mr-2" />
                    Ver toda la comunidad
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Call to action para contacto */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold mb-2">¿Quieres colaborar?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Si estás interesado en colaborar con {persona.nombre} o el CET
                N°26, contáctanos a través de nuestros canales oficiales.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/contacto">
                  <Mail className="h-4 w-4 mr-2" />
                  Contactar
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
