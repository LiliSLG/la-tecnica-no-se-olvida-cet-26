// /src/app/consulta-ia/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  MessageSquare,
  Send,
  Info,
  BookOpen,
  HelpCircle,
  Sparkles,
  Coffee,
  Wrench,
  UserPlus,
  Lock,
  MessageCircle,
  Cpu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";

export default function ConsultaIAPage() {
  const { user, isLoading } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [mockConversation, setMockConversation] = useState<
    Array<{
      type: "user" | "ai";
      text: string;
      timestamp: Date;
    }>
  >([]);

  // Estados para accordion manual
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Límite de preguntas para usuarios no registrados
  const MAX_ANONYMOUS_QUESTIONS = 2;
  const canAsk = user || questionsAsked < MAX_ANONYMOUS_QUESTIONS;

  // Simular preguntas para demo
  const handleAskQuestion = () => {
    if (!currentQuestion.trim() || !canAsk) return;

    const newConversation = [
      ...mockConversation,
      {
        type: "user" as const,
        text: currentQuestion,
        timestamp: new Date(),
      },
      {
        type: "ai" as const,
        text: "¡Excelente pregunta! Una vez que esta funcionalidad esté lista, te podré ayudar con información específica sobre los proyectos del CET 26. 🤖",
        timestamp: new Date(),
      },
    ];

    setMockConversation(newConversation);
    setCurrentQuestion("");
    setQuestionsAsked((prev) => prev + 1);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const QuestionLimitAlert = () => {
    if (user || questionsAsked < MAX_ANONYMOUS_QUESTIONS) return null;

    return (
      <Alert className="mb-4 border-amber-200 bg-amber-50">
        <UserPlus className="h-4 w-4" />
        <AlertTitle>¡Has alcanzado el límite de preguntas!</AlertTitle>
        <AlertDescription>
          <span className="block mb-2">
            Para seguir consultando, necesitas registrarte. Es gratis y te
            permite:
          </span>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Preguntas ilimitadas a la IA</li>
            <li>Participar en proyectos</li>
            <li>Guardar consultas favoritas</li>
          </ul>
          <Link href="/login">
            <Button className="mt-3" size="sm">
              Registrarme Gratis
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  };

  interface AccordionSectionProps {
    value: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
  }

  const AccordionSection = ({
    value,
    title,
    icon: Icon,
    children,
  }: AccordionSectionProps) => {
    const isOpen = openSection === value;

    return (
      <Card className="border rounded-xl shadow-sm bg-card overflow-hidden">
        <button
          onClick={() => toggleSection(value)}
          className="w-full p-6 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium text-primary/90">
                {title}
              </span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {isOpen && (
          <div className="px-6 pb-6 text-foreground/80">{children}</div>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Contenido principal */}
      <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <header className="text-center py-12 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-2xl shadow-lg relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
          <BrainCircuit className="h-24 w-24 text-primary mx-auto mb-6 drop-shadow-sm" />
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Pregúntale a la IA del CET 26
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-4xl mx-auto leading-relaxed">
            Explora el conocimiento preservado de nuestros proyectos técnicos y
            la sabiduría rural de nuestra comunidad
          </p>

          {/* Status badges */}
          <div className="flex justify-center gap-3 mt-6">
            <Badge variant="secondary" className="px-4 py-2">
              <Cpu className="h-4 w-4 mr-2" />
              IA en Desarrollo
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <BookOpen className="h-4 w-4 mr-2" />
              Conocimiento Rural
            </Badge>
          </div>
        </header>

        {/* Estado de desarrollo */}
        <Alert
          variant="default"
          className="max-w-4xl mx-auto bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300"
        >
          <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-semibold">
            Funcionalidad en Desarrollo Activo
          </AlertTitle>
          <AlertDescription>
            Estamos trabajando en la integración de IA para consultas sobre el
            contenido de la plataforma. ¡Pronto podrás hacer preguntas reales y
            obtener respuestas basadas en nuestro conocimiento!
          </AlertDescription>
        </Alert>

        {/* Chat Interface */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-xl bg-card border-2">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                <CardTitle className="flex items-center justify-between text-2xl text-primary">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-7 w-7" />
                    Asistente IA del CET 26
                  </div>
                  {!user && (
                    <Badge variant="outline" className="text-xs">
                      {MAX_ANONYMOUS_QUESTIONS - questionsAsked} preguntas
                      restantes
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Conversa con nuestra IA sobre proyectos, técnicas rurales y
                  conocimiento preservado
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Limite de preguntas */}
                <QuestionLimitAlert />

                {/* Chat Area */}
                <div className="min-h-[300px] max-h-[400px] p-4 border rounded-lg bg-background/50 overflow-y-auto space-y-4">
                  {mockConversation.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                      <MessageCircle className="h-12 w-12" />
                      <div className="text-center">
                        <p className="font-medium">
                          ¡Hola! Soy el asistente IA del CET 26
                        </p>
                        <p className="text-sm">
                          Pregúntame sobre nuestros proyectos y conocimiento
                          rural
                        </p>
                      </div>
                    </div>
                  ) : (
                    mockConversation.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground border"
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Pregunta sobre proyectos, técnicas rurales, historia del CET..."
                    rows={2}
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    className="flex-grow shadow-sm resize-none"
                    disabled={!canAsk}
                  />
                  <Button
                    onClick={handleAskQuestion}
                    disabled={!currentQuestion.trim() || !canAsk}
                    className="self-end shadow-md px-6 py-2 h-auto"
                  >
                    <Send className="h-5 w-5 mr-0 md:mr-2" />
                    <span className="hidden md:inline">Preguntar</span>
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/30 border-t">
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <p>
                    Las respuestas se basan en proyectos y conocimiento de la
                    plataforma
                  </p>
                  {!user && (
                    <Link href="/login">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto"
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Registrarse para acceso completo
                      </Button>
                    </Link>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar con info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Ejemplos de Consultas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "¿Qué proyectos usan energía solar?",
                  "¿Cómo se hace yogur artesanal?",
                  "¿Hay proyectos sobre plantas nativas?",
                  "¿Qué técnicas de riego mencionan?",
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-3 text-wrap"
                    onClick={() => setCurrentQuestion(example)}
                    disabled={!canAsk}
                  >
                    "{example}"
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  ¿Cómo Funciona?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>La IA analiza:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Proyectos técnicos documentados</li>
                  <li>Historias orales preservadas</li>
                  <li>Conocimiento rural compartido</li>
                  <li>Técnicas y procedimientos</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Accordion Sections (Manual) */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center text-primary mb-8">
            Conoce Más Sobre Nuestro Asistente
          </h2>
          <div className="space-y-4">
            <AccordionSection
              value="item-1"
              title="¿Cómo Funcionará Nuestro Asistente?"
              icon={HelpCircle}
            >
              <div className="space-y-3">
                <p>
                  Nuestro asistente inteligente procesará toda la información de
                  los <strong>Proyectos Técnicos</strong> y las
                  <strong> Entrevistas de Historia Oral</strong> cargados en la
                  plataforma.
                </p>
                <p>
                  Es como tener una biblioteca viviente que conoce todos los
                  secretos, técnicas y sabiduría preservada de nuestra comunidad
                  rural. ¡Cuanto más contenido tengamos, más inteligente será!
                </p>
              </div>
            </AccordionSection>

            <AccordionSection
              value="item-2"
              title="Ejemplos de Consultas Poderosas"
              icon={Sparkles}
            >
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">
                      📋 Proyectos Técnicos
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>"¿Qué proyectos usan energías renovables?"</li>
                      <li>"¿Hay ideas para conservar agua?"</li>
                      <li>"¿Cómo se desarrolló el proyecto de biodigestor?"</li>
                    </ul>
                  </div>
                  <div className="bg-accent/5 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">
                      🌾 Sabiduría Rural
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>"¿Cómo conservaban carne sin freezer?"</li>
                      <li>"¿Qué plantas medicinales mencionan?"</li>
                      <li>"¿Cómo predecían el clima los antiguos?"</li>
                    </ul>
                  </div>
                </div>
                <p className="text-center font-medium pt-2 text-primary/90">
                  ¡Y miles de preguntas más sobre nuestra rica cultura técnica y
                  rural!
                </p>
              </div>
            </AccordionSection>

            <AccordionSection
              value="item-3"
              title="Un Esfuerzo Comunitario: ¡Gracias!"
              icon={Coffee}
            >
              <div className="space-y-3">
                <p>
                  Esta plataforma es posible gracias al trabajo de{" "}
                  <strong>estudiantes del CET 26</strong> que documentan sus
                  proyectos, las <strong>familias rurales</strong> que comparten
                  generosamente su sabiduría ancestral, y todos los{" "}
                  <strong>docentes y colaboradores</strong> que apoyan esta
                  iniciativa.
                </p>
                <p className="font-medium text-primary">
                  'La técnica no se olvida' se construye con el aporte de cada
                  uno, creando un legado para las futuras generaciones. ¡Gracias
                  por ser parte de esta hermosa misión!
                </p>
              </div>
            </AccordionSection>
          </div>
        </section>
      </div>
    </div>
  );
}
