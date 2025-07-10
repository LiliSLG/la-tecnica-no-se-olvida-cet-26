// src/components/public/comunidad/PersonaCard.tsx
"use client";

import { PersonaPublica } from "@/lib/supabase/services/personasService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Globe,
  CheckCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

interface PersonaCardProps {
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
      return <Github className="h-4 w-4" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "twitter":
      return <Twitter className="h-4 w-4" />;
    case "website":
      return <Globe className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
};

export function PersonaCard({ persona }: PersonaCardProps) {
  const nombreCompleto = `${persona.nombre} ${persona.apellido}`.trim();
  const categoriaInfo = getCategoriaInfo(
    persona.categoria_principal || "comunidad_general"
  );


  // Generar iniciales para avatar
  const iniciales = `${persona.nombre?.[0] || ""}${
    persona.apellido?.[0] || ""
  }`.toUpperCase();

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={persona.foto_url || undefined}
              alt={`Foto de ${nombreCompleto}`}
            />
            <AvatarFallback className="text-lg font-semibold">
              {iniciales}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Nombre y categoría */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg leading-tight">
                {nombreCompleto}
              </h3>
              {persona.disponible_para_proyectos && (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              )}
            </div>

            {/* Badge de categoría */}
            <Badge className={`text-xs ${categoriaInfo.color}`}>
              {categoriaInfo.icon} {categoriaInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descripción */}
        {persona.descripcion_personal_o_profesional && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {persona.descripcion_personal_o_profesional}
          </p>
        )}

        {/* Áreas de interés */}
        {persona.areas_de_interes_o_expertise &&
          persona.areas_de_interes_o_expertise.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Áreas de interés:
              </p>
              <div className="flex flex-wrap gap-1">
                {persona.areas_de_interes_o_expertise
                  .slice(0, 3)
                  .map((area, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs px-2 py-1"
                    >
                      {area}
                    </Badge>
                  ))}
                {persona.areas_de_interes_o_expertise.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1 text-muted-foreground"
                  >
                    +{persona.areas_de_interes_o_expertise.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}

        {/* Links profesionales */}
        {persona.links_profesionales && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(persona.links_profesionales)
              .filter(
                ([_, url]) =>
                  url && typeof url === "string" && url.trim() !== ""
              )
              .slice(0, 4)
              .map(([platform, url]) => (
                <Button
                  key={platform}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <a
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${platform} de ${nombreCompleto}`}
                  >
                    {getLinkIcon(platform)}
                  </a>
                </Button>
              ))}
          </div>
        )}

        {/* Indicador de disponibilidad */}
        {persona.disponible_para_proyectos && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Disponible para proyectos</span>
          </div>
        )}

        {/* Botón ver perfil */}
        <div className="pt-2">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/comunidad/${persona.id}`}>
              <Users className="h-4 w-4 mr-2" />
              Ver perfil completo
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
