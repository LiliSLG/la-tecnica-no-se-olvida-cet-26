"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Entrevista } from '@/types/entrevista';
import { HistoriasOralesService } from '@/lib/supabase/services/historiasOralesService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/supabaseClient';

const historiasOralesService = new HistoriasOralesService(supabase);

export default function EntrevistaDetailContent() {
  const params = useParams();
  const { toast } = useToast();
  const [entrevista, setEntrevista] = useState<Entrevista | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntrevista();
  }, [params.id]);

  const loadEntrevista = async () => {
    try {
      setLoading(true);
      const result = await historiasOralesService.getById(params.id as string);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setEntrevista(result.data);
    } catch (error) {
      console.error('Error loading entrevista:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la entrevista',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!entrevista) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Entrevista no encontrada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{entrevista.titulo}</CardTitle>
              <CardDescription>
                {format(new Date(entrevista.fechaEntrevista), 'PPP', { locale: es })}
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {entrevista.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <h3>Descripción</h3>
            <p>{entrevista.descripcion}</p>
          </div>
          <div className="prose max-w-none">
            <h3>Preguntas y Respuestas</h3>
            {entrevista.preguntas?.map((pregunta, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-lg font-medium">{pregunta.pregunta}</h4>
                <p className="text-muted-foreground">{pregunta.respuesta}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/entrevistas">Volver a entrevistas</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
