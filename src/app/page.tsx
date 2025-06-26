// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layouts/PublicLayout";
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
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="outline" className="mb-4">
              <MapPin className="h-3 w-3 mr-1" />
              Ingeniero Jacobacci, Río Negro
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              La Técnica no se Olvida
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Preservamos y compartimos el conocimiento técnico y rural del
              <strong className="text-foreground"> CET N°26</strong>,
              construyendo un archivo vivo de nuestra historia y proyectos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" asChild className="text-lg">
                <Link href="/proyectos">
                  <FolderOpen className="mr-2 h-5 w-5" />
                  Ver Proyectos
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild className="text-lg">
                <Link href="/comunidad">
                  <Users className="mr-2 h-5 w-5" />
                  Conocer la Comunidad
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explorá nuestro archivo digital
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma construida por y para nuestra comunidad técnica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-4">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Para desarrolladores y administradores
                  </Badge>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold">
                  ¿Querés gestionar el contenido?
                </h3>

                <p className="text-lg text-muted-foreground">
                  Accedé al panel de administración para gestionar proyectos,
                  noticias, comunidad y más.
                </p>

                <Button size="lg" asChild>
                  <Link href="/admin">
                    Panel Admin
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
