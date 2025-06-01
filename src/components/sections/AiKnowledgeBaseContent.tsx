
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Lightbulb, BrainCircuit, MessageSquare, Send, Users, Info, Zap, BookOpen, HelpCircle, Sparkles, Coffee, Construction, Wrench } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AiKnowledgeBaseContent() {
  // No chat state or handlers needed for this placeholder version

  return (
    <div className="space-y-12">
      <header className="text-center py-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl shadow-lg">
        <BrainCircuit className="h-20 w-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
          Explora el Conocimiento del CET 26 con Inteligencia Artificial
        </h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto px-4">
          Pregunta y descubre los secretos de nuestros proyectos y la sabiduría de nuestra tierra.
        </p>
      </header>

      {/* Placeholder for future AI Chat - This will be a separate component */}
      <Alert variant="default" className="max-w-3xl mx-auto bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300">
        <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" /> {/* Using Wrench as Construction might not be available in all icon sets easily */}
        <AlertTitle className="font-semibold">Funcionalidad en Desarrollo</AlertTitle>
        <AlertDescription>
          La capacidad de interactuar con el asistente de IA para consultas sobre el contenido del proyecto se encuentra en desarrollo activo. ¡Pronto podrás hacer tus preguntas!
        </AlertDescription>
      </Alert>

      {/* Chat Placeholder Section */}
      <Card className="shadow-xl max-w-2xl mx-auto bg-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
            <MessageSquare className="h-7 w-7" />
            Pregúntale al Asistente del CET 26
          </CardTitle>
          <CardDescription className="text-center">
          Muy pronto podrás conversar con nuestro asistente para aprender sobre los proyectos, la historia y la sabiduría rural del CET 26.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="h-48 p-4 border rounded-md bg-background space-y-4 flex flex-col items-center justify-center text-muted-foreground">
            <p>(Aquí se mostrará la conversación con el asistente)</p>
          </div>
          <div className="flex gap-3">
            <Textarea
              placeholder="Escribe aquí tu pregunta ..."
              rows={2}
              className="flex-grow shadow-sm resize-none"
              disabled
            />
            <Button
              disabled
              className="self-end shadow-md px-6 py-2 h-auto bg-primary/70 hover:bg-primary/70 text-primary-foreground/80 cursor-not-allowed"
            >
              <Send className="h-5 w-5 mr-0 md:mr-2" />
              <span className="hidden md:inline">Preguntar (Próximamente)</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            La IA está en desarrollo. Las respuestas se basarán en la documentación cargada en nuestra plataforma.
          </p>
        </CardFooter>
      </Card>

      {/* Accordion Sections */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-center text-primary mb-6">Conoce Más Sobre Nuestro Asistente</h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="border rounded-lg shadow-sm bg-card overflow-hidden">
            <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline text-primary/90 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              ¿Cómo Funcionará Nuestro Asistente?
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 text-foreground/80">
              <p>
                Nuestro asistente inteligente usará la información de los Proyectos Técnicos y las Entrevistas de Historia Oral cargados en la plataforma 'La técnica no se olvida'. Cuanto más contenido valioso de nuestra comunidad tengamos, ¡mejores y más completas serán sus respuestas! Es un archivo vivo que se construye entre todos.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border rounded-lg shadow-sm bg-card overflow-hidden">
            <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline text-primary/90 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Podés preguntarle cosas como:
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 text-foreground/80 space-y-3">
              <div>
                <h4 className="font-semibold text-primary/80 mb-1">Sobre Proyectos Técnicos:</h4>
                <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                  <li>"¿Qué proyectos de energías renovables se hicieron?"</li>
                  <li>"¿Hay ideas para el uso de plantas autóctonas?"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary/80 mb-1">Sobre Historia Oral y Vida Rural:</h4>
                <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                  <li>"¿Cómo se conservaban alimentos antes de la electricidad?"</li>
                  <li>"¿Qué remedios caseros se usaban para el resfrío?"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary/80 mb-1">Sobre Curiosidades y Aplicaciones:</h4>
                <ul className="list-disc list-inside pl-4 space-y-1 text-sm">
                  <li>"¿Cómo se hace el yogur artesanal del CET?"</li>
                  <li>"¿Qué proyectos se relacionan con el cuidado del agua?"</li>
                </ul>
              </div>
              <p className="text-center font-medium pt-2 text-primary/90">¡Y muchas preguntas más!</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border rounded-lg shadow-sm bg-card overflow-hidden">
            <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline text-primary/90 flex items-center gap-2">
              <Coffee className="h-5 w-5" /> {/* Changed from Users to Coffee/Thanks icon */}
              Un Esfuerzo Comunitario: ¡Gracias!
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 text-foreground/80">
              <p>
                Esta plataforma y su futura inteligencia artificial son posibles gracias al invaluable trabajo de los estudiantes del CET 26 que documentan sus proyectos, a las familias y miembros de la comunidad rural que comparten generosamente sus saberes ancestrales, y a todos los docentes y colaboradores que apoyan esta iniciativa. 'La técnica no se olvida' se construye con el aporte de cada uno, creando un legado para las futuras generaciones. ¡Gracias por ser parte!
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

    </div>
  );
}
