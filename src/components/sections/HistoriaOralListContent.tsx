"use client";

import { useEffect, useState, useCallback } from 'react';
import { getPublicadasEntrevistas } from '@/lib/supabase/services/entrevistasService';
import type { Entrevista, Tema } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { getPersonaById } from '@/lib/supabase/services/personasService';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, CalendarDays, Filter, XCircle, RefreshCw, AlertTriangle, PlusCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EntrevistaCard from '@/components/cards/EntrevistaCard';
import { getAllTemasActivos } from '@/lib/supabase/services/temasService';
import Link from 'next/link';
import { EntrevistasService } from '@/lib/supabase/services/entrevistasService';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { TemasService } from '@/lib/supabase/services/temasService';
import { supabase } from '@/lib/supabase/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/types/database.types';

type EntrevistaRow = Database['public']['Tables']['entrevistas']['Row'];
type TemaRow = Database['public']['Tables']['temas']['Row'];

export default function HistoriaOralListContent() {
  const { user } = useAuth();
  const [persona, setPersona] = useState<any>(null); 
  const [canCreateEntrevistas, setCanCreateEntrevistas] = useState(false);

  const [entrevistas, setEntrevistas] = useState<EntrevistaRow[]>([]);
  const [temas, setTemas] = useState<TemaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTema, setSelectedTema] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchPersonaData = async () => {
        const pData = await getPersonaById(user.id);
        setPersona(pData);
        if (pData?.capacidadesPlataforma?.includes('es_admin_entrevistas')) {
          setCanCreateEntrevistas(true);
        } else {
          setCanCreateEntrevistas(false);
        }
      };
      fetchPersonaData();
    } else {
      setPersona(null);
      setCanCreateEntrevistas(false);
    }
  }, [user]);

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Explorar', href: '#' }, 
    { label: 'Historia Oral' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entrevistasService = new EntrevistasService(supabase);
        const temasService = new TemasService(supabase);

        const [entrevistasResult, temasResult] = await Promise.all([
          entrevistasService.getPublicadas(),
          temasService.getAllActivos()
        ]);

        if (entrevistasResult.error) throw entrevistasResult.error;
        if (temasResult.error) throw temasResult.error;

        setEntrevistas(entrevistasResult.data || []);
        setTemas(temasResult.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Error al cargar los datos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredEntrevistas = entrevistas.filter(entrevista => {
    const matchesSearch = entrevista.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entrevista.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesTema = !selectedTema || entrevista.status === selectedTema;
    return matchesSearch && matchesTema;
  });

  if (loading) {
    return ( <div className="text-center py-20"> <RefreshCw className="h-10 w-10 mx-auto animate-spin text-primary mb-4" /> <p className="text-muted-foreground">Cargando archivo de historia oral...</p> </div> );
  }

  if (error) {
    return ( <div className="text-center py-20"> <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" /> <p className="text-xl text-destructive mb-2">{error}</p> </div> );
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      <header className="pb-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
            <MessageSquare className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-4xl font-bold text-primary">Archivo de Historia Oral</h1>
                <p className="text-muted-foreground mt-1">
                    Voces y relatos que tejen la memoria de nuestra comunidad rural.
                </p>
            </div>
        </div>
        {canCreateEntrevistas && (
          <Button asChild size="lg">
            <Link href="/admin/gestion-entrevistas/nueva">
              <PlusCircle className="mr-2 h-5 w-5" /> Añadir Nueva Entrevista
            </Link>
          </Button>
        )}
      </header>
      
      <Card className="p-4 md:p-6 mb-8 shadow-md">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/>Filtrar Entrevistas</CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="search-entrevistas" className="block text-sm font-medium text-muted-foreground mb-1">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="search-entrevistas" type="text" placeholder="Título, entrevistado, descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 shadow-sm" />
            </div>
          </div>
          <div>
            <Label htmlFor="tema-filter-entrevistas" className="block text-sm font-medium text-muted-foreground mb-1">Tema del Saber</Label>
            <Select value={selectedTema} onValueChange={setSelectedTema}>
              <SelectTrigger id="tema-filter-entrevistas" className="shadow-sm"><SelectValue placeholder="Todos los Temas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los Temas</SelectItem>
                {temas.map(tema => <SelectItem key={tema.id} value={tema.id}>{tema.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => router.push('/admin/entrevistas/nueva')} variant="outline" className="w-full lg:w-auto shadow-sm mt-4 md:mt-0">
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nueva Entrevista
          </Button>
        </CardContent>
      </Card>

      {filteredEntrevistas.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            {searchTerm || selectedTema !== ''
              ? "No hay entrevistas que coincidan con los filtros seleccionados."
              : "Aún no hay entrevistas publicadas."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
             Vuelve pronto para ver las últimas novedades o ajusta tus filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {filteredEntrevistas.map((entrevista) => (
            <Card key={entrevista.id}>
              <CardHeader>
                <CardTitle>{entrevista.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {entrevista.descripcion || 'Sin descripción'}
                </p>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/entrevistas/${entrevista.id}`)}
                  >
                    Ver detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
