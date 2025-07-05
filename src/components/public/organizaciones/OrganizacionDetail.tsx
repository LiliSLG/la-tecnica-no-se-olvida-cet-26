// src/components/public/organizaciones/OrganizacionDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OrganizacionRow } from "@/lib/supabase/services/organizacionesService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface OrganizacionDetailProps {
  organizacion: OrganizacionRow;
}

// Helper para obtener info del tipo
const getTipoInfo = (tipo: string | null) => {
  const tipos = {
    empresa: {
      label: "Empresa",
      icon: "🏢",
      color: "bg-blue-100 text-blue-800",
      description: "Entidad comercial o empresarial",
    },
    institucion_educativa: {
      label: "Institución Educativa",
      icon: "🎓",
      color: "bg-purple-100 text-purple-800",
      description: "Institución dedicada a la educación y formación",
    },
    ONG: {
      label: "ONG",
      icon: "🤝",
      color: "bg-green-100 text-green-800",
      description: "Organización No Gubernamental",
    },
    establecimiento_ganadero: {
      label: "Establecimiento Ganadero",
      icon: "🐄",
      color: "bg-orange-100 text-orange-800",
      description: "Establecimiento dedicado a la actividad ganadera",
    },
    organismo_gubernamental: {
      label: "Organismo Gubernamental",
      icon: "🏛️",
      color: "bg-indigo-100 text-indigo-800",
      description: "Entidad del sector público",
    },
    cooperativa: {
      label: "Cooperativa",
      icon: "👥",
      color: "bg-yellow-100 text-yellow-800",
      description: "Organización cooperativa de productores o servicios",
    },
    otro: {
      label: "Otro",
      icon: "📋",
      color: "bg-gray-100 text-gray-800",
      description: "Otro tipo de organización",
    },
  };
  return tipos[tipo as keyof typeof tipos] || tipos.otro;
};

// Helper para formatear fecha
const formatearFecha = (fecha: string | null) => {
  if (!fecha) return "Fecha no disponible";
  return new Date(fecha).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function OrganizacionDetail({ organizacion }: OrganizacionDetailProps) {
  const tipoInfo = getTipoInfo(organizacion.tipo);
  const router = useRouter();
  const [showDashboardLink, setShowDashboardLink] = useState(false);

  useEffect(() => {
    // Detectar si viene del dashboard
    const referrer = document.referrer;
    const isDashboardReferrer = referrer.includes("/dashboard/organizaciones");
    setShowDashboardLink(isDashboardReferrer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Botón volver inteligente */}
      {showDashboardLink ? (
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>
      ) : (
        <Button
          variant="ghost"
          onClick={() => router.push("/organizaciones")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Organizaciones
        </Button>
      )}

      {/* Header principal */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Logo y información básica */}
            <div className="flex-shrink-0">
              {organizacion.logo_url ? (
                <img
                  src={organizacion.logo_url}
                  alt={`Logo de ${organizacion.nombre_oficial}`}
                  className="w-24 h-24 object-contain rounded-lg border bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-3xl border">
                  {tipoInfo.icon}
                </div>
              )}
            </div>

            {/* Información principal */}
            <div className="flex-1 space-y-4">
              {/* Badges de estado y tipo */}
              <div className="flex flex-wrap gap-2">
                <Badge className={tipoInfo.color}>
                  {tipoInfo.icon} {tipoInfo.label}
                </Badge>

                {organizacion.estado_verificacion === "verificada" && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verificada
                  </Badge>
                )}

                {organizacion.abierta_a_colaboraciones && (
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-200"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Abierta a colaboraciones
                  </Badge>
                )}
              </div>

              {/* Nombre y descripción tipo */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  {organizacion.nombre_oficial}
                </h1>
                {organizacion.nombre_fantasia && (
                  <p className="text-xl text-muted-foreground mb-3">
                    {organizacion.nombre_fantasia}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {tipoInfo.description}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Descripción principal */}
        {organizacion.descripcion && (
          <CardContent>
            <div className="space-y-4">
              <Separator />
              <div>
                <h2 className="text-lg font-semibold mb-3">
                  Sobre la organización
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {organizacion.descripcion}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Información de contacto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacto */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Información de Contacto
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizacion.email_contacto && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${organizacion.email_contacto}`}
                    className="text-blue-600 hover:underline break-all"
                  >
                    {organizacion.email_contacto}
                  </a>
                </div>
              </div>
            )}

            {organizacion.telefono_contacto && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <a
                    href={`tel:${organizacion.telefono_contacto}`}
                    className="text-blue-600 hover:underline"
                  >
                    {organizacion.telefono_contacto}
                  </a>
                </div>
              </div>
            )}

            {organizacion.sitio_web && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Sitio web</p>
                  <a
                    href={organizacion.sitio_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all flex items-center gap-1"
                  >
                    {organizacion.sitio_web.replace(/^https?:\/\//, "")}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {!organizacion.email_contacto &&
              !organizacion.telefono_contacto &&
              !organizacion.sitio_web && (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay información de contacto pública disponible</p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información Adicional
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fecha de registro */}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p className="font-medium">
                  {formatearFecha(organizacion.created_at)}
                </p>
              </div>
            </div>

            {/* Estado de verificación */}
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <div className="flex items-center gap-2">
                  {organizacion.estado_verificacion === "verificada" ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        Verificada
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">
                        En revisión
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Colaboraciones */}
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Colaboraciones</p>
                <p className="font-medium">
                  {organizacion.abierta_a_colaboraciones
                    ? "Abierta a nuevas colaboraciones"
                    : "No disponible actualmente"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Áreas de interés */}
      {organizacion.areas_de_interes &&
        organizacion.areas_de_interes.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Áreas de Interés</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {organizacion.areas_de_interes.map((area) => (
                  <Badge key={area} variant="secondary" className="px-3 py-1">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Call to action para colaborar */}
      {organizacion.abierta_a_colaboraciones && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-900">
                  ¿Interesado en colaborar?
                </h3>
                <p className="text-blue-700">
                  Esta organización está abierta a nuevas colaboraciones con el
                  CET N°26
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {organizacion.email_contacto && (
                  <Button asChild>
                    <a href={`mailto:${organizacion.email_contacto}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar email
                    </a>
                  </Button>
                )}

                {organizacion.telefono_contacto && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${organizacion.telefono_contacto}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
