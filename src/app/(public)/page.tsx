// src/app/(public)/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  FolderOpen,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: FolderOpen,
      title: "Proyectos Técnicos",
      description:
        "Descubre los proyectos innovadores desarrollados por nuestros estudiantes y egresados.",
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description:
        "Conecta con estudiantes, egresados, docentes y colaboradores de nuestra comunidad.",
    },
    {
      icon: BookOpen,
      title: "Historias Orales",
      description:
        "Preservamos la sabiduría rural y las experiencias de nuestra región.",
    },
  ];

  return (
    <>
      {/* Hero Section - Proporciones refinadas */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="outline" className="mb-4 text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Ingeniero Jacobacci, Río Negro
            </Badge>

            {/* Título más proporcional */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
              La Técnica no se Olvida
            </h1>

            {/* Descripción más balanceada */}
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Preservamos y compartimos el conocimiento técnico y rural del
              <strong className="text-foreground"> CET N°26</strong>,
              construyendo un archivo vivo de nuestra historia y proyectos.
            </p>

            {/* Botones más proporcionados */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button size="default" asChild className="font-medium">
                <Link href="/proyectos">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Ver Proyectos
                </Link>
              </Button>

              <Button
                variant="outline"
                size="default"
                asChild
                className="font-medium"
              >
                <Link href="/comunidad">
                  <Users className="mr-2 h-4 w-4" />
                  Conocer la Comunidad
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Más compacta */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Explorá nuestro archivo digital
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Una plataforma construida por y para nuestra comunidad técnica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group hover:shadow-lg transition-all duration-300 border-border"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-3 p-2.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors w-fit">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-center leading-relaxed text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - Más sutil */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-sm">
            <CardContent className="p-8 md:p-10 text-center">
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-3 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Para desarrolladores y administradores
                  </Badge>
                </div>

                <h3 className="text-xl md:text-2xl font-bold">
                  ¿Querés gestionar el contenido?
                </h3>

                <p className="text-base text-muted-foreground">
                  Accedé al panel de administración para gestionar proyectos,
                  noticias, comunidad y más.
                </p>

                <Button size="default" asChild className="font-medium">
                  <Link href="/admin">
                    Panel Admin
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
