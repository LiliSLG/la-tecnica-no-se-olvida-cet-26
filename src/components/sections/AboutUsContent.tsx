
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, School, MessageSquare, Zap, BookOpen, ArrowRight } from 'lucide-react'; // Zap for spark/motivation, BookOpen for documentation
import { Button } from '@/components/ui/button';

export default function AboutUsContent() {
  // Placeholder student data - this should be updated with actual information
  const students = [
    { name: 'Camila Franco' },
    { name: 'Martina Hernandez' },
    { name: 'Jazmin' },
  ];
  const schoolYear = '2025'; // Placeholder, update as needed

  return (
    <div className="space-y-12">
      <header className="text-center py-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl shadow-lg">
        <Users className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-extrabold text-primary mb-3">Sobre Nosotras</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Conocé al equipo detrás de "La técnica no se olvida" y nuestra misión.
        </p>
      </header>

      <Card className="shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <Image
              src="https://placehold.co/800x600.png"
              alt="Equipo de estudiantes del CET N°26"
              data-ai-hint="student team"
              width={800}
              height={600}
              className="object-cover w-full h-64 md:h-full"
            />
          </div>
          <div className="md:w-1/2">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl text-primary flex items-center gap-2">
                <School className="h-8 w-8" />
                Nuestro Equipo
              </CardTitle>
              <CardDescription className="text-md">
                Estudiantes del CET N°26, Ingeniero Jacobacci.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">
                Este proyecto fue concebido y desarrollado por un grupo de estudiantes dedicados del 
                CET N°26 de Ingeniero Jacobacci como parte de nuestro trabajo final de la promoción {schoolYear}.
              </p>
              <div>
                <h3 className="font-semibold text-lg text-primary/90 mb-2">Integrantes (Ejemplos):</h3>
                <ul className="list-disc list-inside text-foreground/70 space-y-1">
                  {students.map((student, index) => (
                    <li key={index}>{student.name}</li>
                  ))}
                  <li>Y otros compañeros que colaboraron en diversas etapas.</li>
                </ul>
              </div>
              <p className="text-foreground/80 pt-2">
                Nos sentimos orgullosas de presentar "La técnica no se olvida" una plataforma pensada para el futuro.
              </p>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Zap className="h-7 w-7" />
            Nuestra Motivación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/80">
          <p>
            Decidimos construir "La técnica no se olvida" impulsadas por un profundo respeto y admiración por el conocimiento técnico 
            que se genera en nuestra escuela y la invaluable sabiduría de las familias rurales de nuestra región. 
            Observamos que muchos proyectos estudiantiles, llenos de ingenio y soluciones prácticas, corrían el riesgo de 
            quedar en el olvido una vez finalizado el ciclo lectivo. De igual manera, las historias y técnicas 
            transmitidas oralmente en el campo son un tesoro cultural que merece ser preservado.
          </p>
          <p>
            Nuestra meta es que esta plataforma sirva como un puente entre generaciones, un archivo vivo que no solo 
            documente estos saberes, sino que también inspire a futuros estudiantes y miembros de la comunidad a valorar, 
            continuar y enriquecer este legado. Creemos que la técnica no se olvida si se comparte y se pone al alcance de todos.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg bg-accent/10">
        <CardHeader>
          <CardTitle className="text-2xl text-accent-foreground flex items-center gap-2">
            <MessageSquare className="h-7 w-7" />
            Un Proyecto para el Futuro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-accent-foreground/90">
          <p>
            "La técnica no se olvida" es más que un requisito académico; es nuestra contribución para asegurar que el esfuerzo y la 
            creatividad invertidos en cada proyecto técnico y cada historia rural perduren en el tiempo.
          </p>
          <p>
            Este proyecto ha sido diseñado con la visión de ser continuado y mejorado por las futuras promociones de 
            estudiantes del CET N°26. Esperamos que encuentren en esta base una herramienta útil y una fuente de 
            inspiración para sus propios trabajos, añadiendo nuevas capas de conocimiento y manteniendo viva la llama 
            de la innovación y la tradición en Ingeniero Jacobacci.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <BookOpen className="h-7 w-7" />
            Documentación del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-foreground/80">
          <p>
            Para entender mejor cómo funciona la plataforma, cómo contribuir o cómo continuar su desarrollo,
            te invitamos a consultar nuestra documentación detallada.
          </p>
          <Button asChild variant="default">
            <Link href="/documentation">
              Ir a la Documentación <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
