
"use client";

import type { Interview } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, PlayCircle, FileText, Mic, Wrench } from 'lucide-react'; // Added Wrench
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert imports

// Mock Data
const mockInterviews: Interview[] = [
  { id: '1', title: 'Memorias de la Tierra: Don José', intervieweeName: 'José Hernández', type: 'audio', mediaUrl: '#', summary: 'Un relato conmovedor sobre las tradiciones agrícolas y los cambios en el campo a lo largo de 70 años.', imageUrl: 'https://placehold.co/600x400.png?b=1', date: '2023-05-15', dataAiHint: 'elderly farmer' },
  { id: '2', title: 'El Arte de Tejer en la Patagonia: Doña María', intervieweeName: 'María Silva', type: 'video', mediaUrl: '#', summary: 'Demostración y explicación de las técnicas ancestrales de tejido de lana, un legado familiar.', imageUrl: 'https://placehold.co/600x400.png?b=2', date: '2023-07-22', dataAiHint: 'woman weaving' },
  { id: '3', title: 'Vida y Oficios Rurales: Familia González', intervieweeName: 'Familia González', type: 'text', content: 'Transcripción de una charla profunda sobre los desafíos y satisfacciones de la vida rural, abarcando múltiples generaciones y oficios.', summary: 'Una mirada multigeneracional a los oficios y la vida cotidiana en el campo.', imageUrl: 'https://placehold.co/600x400.png?b=3', date: '2023-09-10', dataAiHint: 'rural family' },
  { id: '4', title: 'Sabores de Antaño: Recetas Tradicionales', intervieweeName: 'Carmen Rodriguez', type: 'video', mediaUrl: '#', summary: 'Doña Carmen comparte recetas familiares transmitidas de generación en generación, cocinando platos típicos de la región.', imageUrl: 'https://placehold.co/600x400.png?b=4', date: '2024-01-20', dataAiHint: 'traditional cooking' },
];

const InterviewCard = ({ interview }: { interview: Interview & {dataAiHint?: string} }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (interview.date) {
      const parts = interview.date.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date
        const day = parseInt(parts[2], 10);
        
        const dateObj = new Date(Date.UTC(year, month, day));
        
        setFormattedDate(dateObj.toLocaleDateString());
      } else {
        setFormattedDate('Fecha inválida');
      }
    }
  }, [interview.date]);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {interview.imageUrl && (
        <div className="relative h-56 w-full">
          <Image 
            src={interview.imageUrl} 
            alt={interview.title} 
            layout="fill" 
            objectFit="cover"
            data-ai-hint={interview.dataAiHint || "rural person"}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl text-primary">{interview.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Entrevista con: {interview.intervieweeName} - {formattedDate !== null ? formattedDate : 'Cargando fecha...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <p className="text-foreground/80 text-sm h-20 overflow-hidden">{interview.summary}</p>
        <Badge variant={
          interview.type === 'audio' ? 'default' :
          interview.type === 'video' ? 'destructive' : 
          'secondary'
        } className="capitalize inline-flex items-center gap-1">
          {interview.type === 'audio' && <Mic className="h-3 w-3" />}
          {interview.type === 'video' && <PlayCircle className="h-3 w-3" />}
          {interview.type === 'text' && <FileText className="h-3 w-3" />}
          {interview.type}
        </Badge>
      </CardContent>
      <CardFooter>
        {interview.mediaUrl || interview.content ? (
          <Button asChild variant="default" className="w-full">
            <Link href={interview.mediaUrl || `/interviews/${interview.id}`}> 
              {interview.type === 'text' ? 'Leer Más' : 'Escuchar/Ver'}
            </Link>
          </Button>
        ) : (
          <Button variant="default" className="w-full" disabled>Contenido Próximamente</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default function OralHistoryContent() {
  return (
    <div className="space-y-8">
      <header className="text-center py-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg shadow">
        <Users className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-primary mb-2">Archivo de Historia Oral</h1>
        <p className="text-lg text-foreground/80">Voces y relatos que tejen la memoria de nuestra comunidad rural.</p>
      </header>

      <Alert variant="default" className="max-w-3xl mx-auto bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300">
        <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="font-semibold">Funcionalidad en Desarrollo</AlertTitle>
        <AlertDescription>
          Esta sección se encuentra en desarrollo activo. Algunas funcionalidades o la totalidad del contenido podrían no estar disponibles aún. ¡Gracias por tu paciencia!
        </AlertDescription>
      </Alert>

      {mockInterviews.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockInterviews.map(interview => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-10">Aún no hay entrevistas disponibles. Vuelve pronto.</p>
      )}
    </div>
  );
}
