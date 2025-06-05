"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Noticia } from '@/types/noticia';
import { NoticiasService } from '@/lib/supabase/services/noticiasService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/supabaseClient';

const noticiasService = new NoticiasService(supabase);

export default function NoticiaDetailContent() {
  const params = useParams();
  const { toast } = useToast();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNoticia();
  }, [params.id]);

  const loadNoticia = async () => {
    try {
      setLoading(true);
      const result = await noticiasService.getById(params.id as string);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setNoticia(result.data);
    } catch (error) {
      console.error('Error loading noticia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la noticia',
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

  if (!noticia) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Noticia no encontrada</p>
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
              <CardTitle className="text-2xl">{noticia.titulo}</CardTitle>
              <CardDescription>
                {format(new Date(noticia.fechaPublicacion), 'PPP', { locale: es })}
              </CardDescription>
            </div>
            <Badge variant="outline" className="capitalize">
              {noticia.categoria}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {noticia.imagenUrl && (
            <div className="relative w-full h-64">
              <img
                src={noticia.imagenUrl}
                alt={noticia.titulo}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          )}
          <div className="prose max-w-none">
            <p>{noticia.contenido}</p>
          </div>
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/noticias">Volver a noticias</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
