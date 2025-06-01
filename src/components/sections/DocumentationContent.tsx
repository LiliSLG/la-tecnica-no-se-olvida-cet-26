
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Wrench, Lightbulb, Download } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DocumentationContent() {
  return (
    <div className="space-y-8">
      <header className="text-center py-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg shadow">
        <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-primary mb-2">Documentación del Proyecto</h1>
        <p className="text-lg text-foreground/80">Guía para el uso, mantenimiento y desarrollo futuro de "La técnica no se olvida".</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary"><Users className="h-6 w-6" /> Para Usuarios</CardTitle>
            <CardDescription>Cómo navegar y utilizar las funcionalidades del sitio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Navegación General</AccordionTrigger>
                <AccordionContent>
                  <p>El sitio web "La técnica no se olvida" está organizado en varias secciones principales accesibles desde la barra de navegación superior:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-foreground/80">
                    <li><strong>Inicio:</strong> Página principal con la introducción al proyecto.</li>
                    <li><strong>Proyectos:</strong> Catálogo de proyectos técnicos de los estudiantes (requiere inicio de sesión).</li>
                    <li><strong>Entrevistas:</strong> Archivo de historia oral con entrevistas a familias rurales.</li>
                    <li><strong>Mapas:</strong> Visualizaciones geográficas y ecológicas.</li>
                    <li><strong>Documentación:</strong> Esta sección que estás viendo.</li>
                    <li><strong>Consultas IA:</strong> Herramienta de preguntas y respuestas basada en IA (requiere inicio de sesión).</li>
                    <li><strong>Sobre Nosotros:</strong> Información sobre las creadoras y el proyecto.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Acceso a Contenido Protegido</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-foreground/80">Para acceder al catálogo de proyectos y a la herramienta de consultas IA, necesitarás registrarte e iniciar sesión con tu correo electrónico y contraseña.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Uso de Filtros (Proyectos)</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-foreground/80">En la sección de Proyectos, puedes usar los filtros por año y tema, así como la barra de búsqueda, para encontrar proyectos específicos de tu interés.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary"><Wrench className="h-6 w-6" /> Cómo seguir construyendo</CardTitle>
            <CardDescription>Guía para la continuidad y evolución del proyecto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80">
              La carga de proyectos y entrevistas está automatizada, por lo tanto no es necesario modificar la estructura técnica para continuar usando la plataforma.
            </p>
            <p className="text-foreground/80">
              En caso de que se desee realizar cambios estructurales o técnicos, se debe contactar previamente a las creadoras del proyecto.
            </p>
            <p className="text-foreground/80">
              A continuación se muestra un resumen técnico del sistema, solo a modo informativo, para que quienes mantengan la plataforma en el futuro sepan cómo está construida. El objetivo es que cualquier estudiante o docente pueda seguir utilizando y alimentando la plataforma sin preocuparse por el código.
            </p>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-tech-summary">
                <AccordionTrigger>Resumen Técnico del Sistema</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <p>Este proyecto está construido con una combinación de tecnologías modernas para asegurar su funcionalidad y escalabilidad. El objetivo es que la carga de contenido sea lo más automatizada posible, minimizando la necesidad de intervención directa en el código para tareas rutinarias.</p>
                  
                  <div>
                    <h4 className="font-semibold mt-3 mb-1 text-primary/90">Componentes Clave:</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
                      <li><strong>Frontend y UI:</strong>
                          <ul className="list-disc pl-5 space-y-0.5 mt-1">
                              <li><strong>Next.js:</strong> Framework de React para la estructura de la aplicación.</li>
                              <li><strong>TypeScript:</strong> Para un desarrollo robusto y tipado.</li>
                              <li><strong>Tailwind CSS & ShadCN UI:</strong> Para el diseño de la interfaz de usuario.</li>
                          </ul>
                      </li>
                      <li><strong>Backend y Autenticación:</strong>
                          <ul className="list-disc pl-5 space-y-0.5 mt-1">
                              <li><strong>Firebase:</strong> Utilizado principalmente para la autenticación de usuarios (Email/Password).</li>
                          </ul>
                      </li>
                      <li><strong>Inteligencia Artificial (Consultas IA):</strong>
                          <ul className="list-disc pl-5 space-y-0.5 mt-1">
                              <li><strong>Genkit (Google AI):</strong> Potencia la base de conocimientos IA, permitiendo responder preguntas sobre el proyecto.</li>
                              <li><strong>RAG (Retrieval Augmented Generation):</strong> La arquitectura de la IA se basa en RAG, donde la información se recupera de fuentes de documentación para generar respuestas. El <code>documentationTool</code> en <code>src/ai/flows/answer-questions-about-project.ts</code> es un componente de este sistema.</li>
                          </ul>
                      </li>
                      <li><strong>Gestión y Carga de Datos (Proyectos y Entrevistas):</strong>
                          <ul className="list-disc pl-5 space-y-0.5 mt-1">
                              <li><strong>Automatización (conceptual):</strong> La visión es que la carga de proyectos y entrevistas sea automatizada. Esto podría involucrar:
                                  <ul className="list-disc pl-5 space-y-0.5 mt-1">
                                      <li><strong>Google Sheets:</strong> Como posible fuente centralizada para ingresar y gestionar los datos de proyectos y entrevistas.</li>
                                      <li><strong>Scripts de Sincronización:</strong> Procesos que lean desde Google Sheets (u otra fuente) y actualicen la plataforma.</li>
                                      <li><strong>FAISS (o similar):</strong> Para la creación y consulta eficiente de índices vectoriales si la información textual de proyectos/entrevistas se usa para búsquedas semánticas avanzadas o para alimentar el sistema RAG de forma más directa.</li>
                                  </ul>
                              </li>
                              <li><strong>Estado Actual (Datos de Ejemplo):</strong> Actualmente, los datos de proyectos y entrevistas son "mock data" (datos de ejemplo) en los archivos de componentes (ej. <code>src/components/sections/ProjectCatalogContent.tsx</code>). La transición a un sistema automatizado es una mejora futura clave.</li>
                          </ul>
                      </li>
                      <li><strong>Estructura del Proyecto:</strong> Organizada en directorios como <code>src/app</code> (rutas), <code>src/components</code>, <code>src/lib</code>, y <code>src/ai</code>. El <code>README.md</code> ofrece una visión general.</li>
                    </ul>
                  </div>
                  <p className="mt-3 text-sm text-foreground/80">
                    Este resumen es informativo. Para detalles de implementación específicos sobre la automatización de datos (conexión a Google Sheets, uso de FAISS/RAG para contenido específico), o para proponer cambios técnicos, es esencial contactar a las creadoras originales del proyecto.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary"><Lightbulb className="h-6 w-6" /> Ideas para el Futuro</CardTitle>
          <CardDescription>Posibles expansiones y mejoras para "La técnica no se olvida".</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-foreground/80">
            <li>Integración completa de un sistema de gestión de contenidos (CMS) o base de datos (ej. Firebase Firestore) para proyectos y entrevistas, eliminando los "mock data".</li>
            <li>Implementación de la carga automatizada de datos desde Google Sheets o similar.</li>
            <li>Desarrollo de roles de usuario (ej. administrador, docente) para la gestión de contenido.</li>
            <li>Foro de discusión para estudiantes y docentes.</li>
            <li>Funcionalidades avanzadas de búsqueda y filtrado semántico utilizando RAG y FAISS con el contenido de proyectos y entrevistas.</li>
            <li>Internacionalización para alcanzar una audiencia más amplia.</li>
            <li>Expansión de la base de conocimiento de la IA, incluyendo más fuentes de datos y la posibilidad de que los usuarios contribuyan (con moderación).</li>
            <li>Integración de visualizaciones interactivas en la sección "Mapas" utilizando Google Earth Engine.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center py-6">
        <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
          {/* Replace with actual link to repository or downloadable guide if available */}
          <Link href="#" download> 
            <Download className="mr-2 h-5 w-5" /> Descargar Guía Completa (Próximamente)
          </Link>
        </Button>
      </div>
    </div>
  );
}

    