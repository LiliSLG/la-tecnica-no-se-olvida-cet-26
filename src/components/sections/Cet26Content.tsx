
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, History, Target, Users, BookOpen, Shield, Users2, CalendarCheck, Briefcase, Info, ArrowRight } from 'lucide-react'; 

export default function Cet26Content() {
  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/latecnicanoseolvidacet26.firebasestorage.app/o/fotos_cet%2Flogo%20cet%2026.jpg?alt=media&token=f4211fe2-9702-4b63-9032-fdcf0ba44672";

  return (
    <div className="space-y-12">
      <header className="text-center py-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl shadow-lg">
        <div className="relative h-24 w-24 mx-auto mb-4"> {/* Container for logo */}
          <Image
            src={logoUrl}
            alt="Logo CET N°26"
            fill
            style={{ objectFit: "contain" }}
            priority
            data-ai-hint="CET 26 logo"
          />
        </div>
        <h1 className="text-5xl font-extrabold text-primary mb-3">El CET N°26</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Conociendo la institución que da origen a "La técnica no se olvida".
        </p>
      </header>

      {/* Introductory Card - Content moved from ProjectIntroContent */}
      <Card className="shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <Image
              src="https://placehold.co/800x600.png"
              alt="Instalaciones del CET N°26 o actividad escolar"
              data-ai-hint="school building jacobacci"
              width={800}
              height={600}
              className="object-cover w-full h-64 md:h-full"
            />
          </div>
          <div className="md:w-1/2 flex flex-col justify-center">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl text-primary flex items-center gap-2">
                <Info className="h-8 w-8" />
                Sobre el CET N°26
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">
                El Centro de Educación Técnica N°26 "Ingeniero Jacobacci" es una institución comprometida con la formación técnica de excelencia, arraigada en los valores y necesidades de nuestra comunidad rural.
              </p>
              <p className="text-foreground/80">
                Este proyecto, "La técnica no se olvida", nace del esfuerzo conjunto de estudiantes y docentes para valorar y proteger nuestro patrimonio cultural y técnico.
              </p>
              <Button asChild variant="link" className="text-primary p-0 h-auto text-base">
                <Link href="https://cet26ingjacobacci.negocio.site/" target="_blank" rel="noopener noreferrer">
                  Conocer más sobre la escuela <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="h-7 w-7" /> Misión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>
              Nuestra misión es [Placeholder para la misión del CET N°26, extraída del PEI]. Buscamos formar técnicos competentes y ciudadanos comprometidos con el desarrollo sostenible de nuestra región.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <History className="h-7 w-7" /> Historia del Colegio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
             <Image
              src="https://placehold.co/600x400.png"
              alt="Foto histórica del CET N°26 o de Ingeniero Jacobacci"
              data-ai-hint="old school photo"
              width={600}
              height={400}
              className="rounded-md mb-4 shadow-sm"
            />
            <p>
              Fundado en [Año de Fundación], el CET N°26 ha sido un pilar en la educación técnica de Ingeniero Jacobacci. [Placeholder para un breve resumen de la historia, hitos importantes, evolución de sus especialidades, etc.].
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CalendarCheck className="h-7 w-7" /> Proyectos Anuales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground/80">
            <p>
              Cada año, el CET N°26 se embarca en diversos proyectos institucionales y comunitarios. Para el ciclo lectivo actual, los proyectos destacados incluyen: [Placeholder para lista o descripción de proyectos, ej: Ferias de ciencia, Proyectos productivos, Vinculación con el medio].
            </p>
            <Button variant="outline" size="sm" disabled>Ver más detalles (Próximamente)</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-2">
            <BookOpen className="h-8 w-8" /> Proyecto Educativo Institucional (PEI)
          </CardTitle>
          <CardDescription>Pilares fundamentales que guían nuestra labor educativa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-primary/90">
                  <Briefcase className="h-6 w-6" /> Estructura Institucional
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">
                <p>[Placeholder para la descripción de la estructura institucional: organigrama, departamentos, coordinaciones, etc.].</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-primary/90">
                  <Users className="h-6 w-6" /> Equipo Directivo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">
                <p>[Placeholder para los nombres y roles del equipo directivo: Director/a, Vice-Director/a, Secretarios/as, etc.].</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-primary/90">
                  <Users2 className="h-6 w-6" /> Centro de Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">
                <p>[Placeholder para información sobre el centro de estudiantes: objetivos, representantes, actividades, forma de contacto.].</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-primary/90">
                  <Shield className="h-6 w-6" /> Consejo de Convivencia
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/70">
                <p>[Placeholder para información sobre el consejo de convivencia: funciones, miembros, normativas relevantes.].</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-accent/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-accent-foreground">
                    <Info className="h-6 w-6" /> Otros Apartados Relevantes del PEI
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-accent-foreground/90">
                <p>[Placeholder para otros aspectos importantes del PEI, como régimen académico, normativas específicas, programas especiales, etc. Puede ser una lista o párrafos descriptivos.].</p>
                <Button variant="link" className="p-0 h-auto text-accent-foreground/80 mt-2" disabled>
                    Descargar PEI Completo (Próximamente) <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
}
