// src/components/public/organizaciones/OrganizacionCard.tsx
import Link from "next/link";
import { OrganizacionRow } from "@/lib/supabase/services/organizacionesService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface OrganizacionCardProps {
  organizacion: OrganizacionRow;
}

// Helper para obtener info del tipo
const getTipoInfo = (tipo: string | null) => {
  const tipos = {
    empresa: {
      label: "Empresa",
      icon: "🏢",
      color: "bg-blue-100 text-blue-800",
    },
    institucion_educativa: {
      label: "Institución Educativa",
      icon: "🎓",
      color: "bg-purple-100 text-purple-800",
    },
    ONG: { label: "ONG", icon: "🤝", color: "bg-green-100 text-green-800" },
    establecimiento_ganadero: {
      label: "Establecimiento Ganadero",
      icon: "🐄",
      color: "bg-orange-100 text-orange-800",
    },
    organismo_gubernamental: {
      label: "Organismo Gubernamental",
      icon: "🏛️",
      color: "bg-indigo-100 text-indigo-800",
    },
    cooperativa: {
      label: "Cooperativa",
      icon: "👥",
      color: "bg-yellow-100 text-yellow-800",
    },
    otro: { label: "Otro", icon: "📋", color: "bg-gray-100 text-gray-800" },
  };
  return tipos[tipo as keyof typeof tipos] || tipos.otro;
};

export function OrganizacionCard({ organizacion }: OrganizacionCardProps) {
  const tipoInfo = getTipoInfo(organizacion.tipo);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card overflow-hidden">
      <CardHeader className="pb-4">
        {/* Header con logo y tipo */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Logo/Avatar */}
            <div className="flex-shrink-0">
              {organizacion.logo_url ? (
                <img
                  src={organizacion.logo_url}
                  alt={`Logo de ${organizacion.nombre_oficial}`}
                  className="w-12 h-12 object-contain rounded-lg border bg-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl border">
                  {tipoInfo.icon}
                </div>
              )}
            </div>

            {/* Tipo de organización */}
            <Badge className={tipoInfo.color}>
              {tipoInfo.icon} {tipoInfo.label}
            </Badge>
          </div>

          {/* Indicador de colaboración */}
          {organizacion.abierta_a_colaboraciones && (
            <Badge
              variant="outline"
              className="text-green-600 border-green-200"
            >
              <Users className="w-3 h-3 mr-1" />
              Colabora
            </Badge>
          )}
        </div>

        {/* Nombre y descripción */}
        <div>
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {organizacion.nombre_oficial}
          </h3>
          {organizacion.nombre_fantasia && (
            <p className="text-sm text-muted-foreground mt-1">
              {organizacion.nombre_fantasia}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descripción */}
        {organizacion.descripcion && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {organizacion.descripcion}
          </p>
        )}

        {/* Información de contacto */}
        <div className="space-y-2">
          {organizacion.email_contacto && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a
                href={`mailto:${organizacion.email_contacto}`}
                className="text-blue-600 hover:underline truncate"
              >
                {organizacion.email_contacto}
              </a>
            </div>
          )}

          {organizacion.telefono_contacto && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a
                href={`tel:${organizacion.telefono_contacto}`}
                className="text-blue-600 hover:underline"
              >
                {organizacion.telefono_contacto}
              </a>
            </div>
          )}

          {organizacion.sitio_web && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a
                href={organizacion.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate flex items-center gap-1"
              >
                Sitio web
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Áreas de interés */}
        {organizacion.areas_de_interes &&
          organizacion.areas_de_interes.length > 0 && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Áreas de interés:
              </div>
              <div className="flex flex-wrap gap-1">
                {organizacion.areas_de_interes.slice(0, 3).map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
                {organizacion.areas_de_interes.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{organizacion.areas_de_interes.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}

        {/* Botón ver más */}
        <div className="pt-2 border-t">
          <Link href={`/organizaciones/${organizacion.id}`}>
            <Button
              variant="ghost"
              className="w-full justify-between group-hover:bg-primary/5 transition-colors"
            >
              <span>Ver detalles</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
