"use client";

import { useState, useEffect } from 'react';
import { Persona } from '@/types/persona';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const personasService = new PersonasService();

export default function EgresadosEstudiantesContent() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      const result = await personasService.getPublic();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setPersonas(result.data || []);
    } catch (error) {
      console.error('Error loading personas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los egresados y estudiantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadPersonas();
      return;
    }

    try {
      setLoading(true);
      const result = await personasService.search(searchTerm);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setPersonas(result.data || []);
    } catch (error) {
      console.error('Error searching personas:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar egresados y estudiantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Egresados y Estudiantes</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nombre..."
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
      ) : personas.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No se encontraron egresados o estudiantes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <Card key={persona.id}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={persona.avatarUrl || ''} alt={persona.nombre} />
                    <AvatarFallback>
                      {persona.nombre?.charAt(0)}
                      {persona.apellido?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {persona.nombre} {persona.apellido}
                    </CardTitle>
                    <CardDescription>{persona.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {persona.telefono && (
                    <p className="text-sm text-muted-foreground">
                      Teléfono: {persona.telefono}
                    </p>
                  )}
                  <Badge variant="outline" className="capitalize">
                    {persona.tipo}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

    