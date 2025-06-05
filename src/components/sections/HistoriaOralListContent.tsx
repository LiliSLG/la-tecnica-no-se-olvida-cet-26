"use client";

import { useState, useEffect } from 'react';
import { HistoriaOral } from '@/types/historiaOral';
import { HistoriasOralesService } from '@/lib/supabase/services/historiasOralesService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

const historiasOralesService = new HistoriasOralesService();

export default function HistoriaOralListContent() {
  const [historias, setHistorias] = useState<HistoriaOral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadHistorias();
  }, []);

  const loadHistorias = async () => {
    try {
      setLoading(true);
      const result = await historiasOralesService.getPublic();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setHistorias(result.data || []);
    } catch (error) {
      console.error('Error loading historias orales:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las historias orales',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadHistorias();
      return;
    }

    try {
      setLoading(true);
      const result = await historiasOralesService.search(searchTerm);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setHistorias(result.data || []);
    } catch (error) {
      console.error('Error searching historias orales:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar historias orales',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Historias Orales</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-64"
          />
          <Button
            variant="outline"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : historias.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron historias orales</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historias.map((historia) => (
            <Card key={historia.id}>
              <CardHeader>
                <CardTitle>{historia.titulo}</CardTitle>
                <CardDescription>
                  {format(new Date(historia.fechaEntrevista), 'PPP', { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {historia.descripcion}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="capitalize">
                      {historia.estado}
                    </Badge>
                    <Button variant="link" asChild>
                      <Link href={`/historias-orales/${historia.id}`}>
                        Leer más
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
