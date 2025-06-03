
"use client";

import { useEffect, useState, useCallback } from 'react';
import { getPublicadasEntrevistas } from '@/lib/supabase/entrevistasService';
import type { Entrevista, Tema } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { getPersonaById } from '@/lib/supabase/personasService';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, CalendarDays, Filter, XCircle, RefreshCw, AlertTriangle, PlusCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EntrevistaCard from '@/components/cards/EntrevistaCard';
import { getAllTemasActivos } from '@/lib/supabase/temasService';
import Link from 'next/link';

export default function HistoriaOralListContent() {
  const { user } = useAuth();
  const [persona, setPersona] = useState<any>(null); 
  const [canCreateEntrevistas, setCanCreateEntrevistas] = useState(false);

  const [fetchedEntrevistas, setFetchedEntrevistas] = useState<Entrevista[]>([]);
  const [displayEntrevistas, setDisplayEntrevistas] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [allTemas, setAllTemas] = useState<Tema[]>([]);
  const [temasMap, setTemasMap] = useState<Map<string, string>>(new Map());
  const [loadingTemas, setLoadingTemas] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemaFilter, setSelectedTemaFilter] = useState<string | 'all'>('all');
  const [selectedAmbitoFilter, setSelectedAmbitoFilter] = useState<string | 'all'>('all');
  const [allUniqueAmbitos, setAllUniqueAmbitos] = useState<string[]>([]);



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

  const fetchEntrevistasYTemas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedEntrevistasData, fetchedTemasData] = await Promise.all([
        getPublicadasEntrevistas({ temaId: selectedTemaFilter, ambito: selectedAmbitoFilter }),
        getAllTemasActivos()
      ]);
      
      setFetchedEntrevistas(fetchedEntrevistasData);
      setAllTemas(fetchedTemasData);

      const map = new Map<string, string>();
      fetchedTemasData.forEach(tema => map.set(tema.id!, tema.nombre));
      setTemasMap(map);

      const uniqueAmbitos = new Set<string>();
      fetchedEntrevistasData.forEach(e => { if (e.ambitoSaber) uniqueAmbitos.add(e.ambitoSaber); });
      
      if(selectedAmbitoFilter === 'all' && selectedTemaFilter === 'all') { 
          const allPublic = await getPublicadasEntrevistas();
          const allAmbitos = new Set<string>();
          allPublic.forEach(e => { if (e.ambitoSaber) allAmbitos.add(e.ambitoSaber); });
          setAllUniqueAmbitos(Array.from(allAmbitos).sort());
      }


    } catch (err) {
      console.error("Error fetching data:", err);
      setError("No se pudieron cargar las entrevistas o temas.");
      toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingTemas(false);
    }
  }, [toast, selectedTemaFilter, selectedAmbitoFilter]);

  useEffect(() => {
    fetchEntrevistasYTemas();
  }, [fetchEntrevistasYTemas]);

  useEffect(() => {
    let filtered = [...fetchedEntrevistas];
    if (searchTerm) {
        filtered = filtered.filter(e => 
            e.tituloSaber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.descripcionSaber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.fuentesInformacion && e.fuentesInformacion.some(f => f.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }
    setDisplayEntrevistas(filtered);
  }, [searchTerm, fetchedEntrevistas]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTemaFilter('all');
    setSelectedAmbitoFilter('all');
    // Refetching will happen due to selectedTemaFilter/selectedAmbitoFilter changing
  };

  if (loading || loadingTemas) {
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
            <Select value={selectedTemaFilter} onValueChange={setSelectedTemaFilter}>
              <SelectTrigger id="tema-filter-entrevistas" className="shadow-sm"><SelectValue placeholder="Todos los Temas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Temas</SelectItem>
                {allTemas.map(tema => <SelectItem key={tema.id} value={tema.id!}>{tema.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label htmlFor="ambito-filter-entrevistas" className="block text-sm font-medium text-muted-foreground mb-1">Ámbito del Saber</Label>
            <Select value={selectedAmbitoFilter} onValueChange={setSelectedAmbitoFilter}>
              <SelectTrigger id="ambito-filter-entrevistas" className="shadow-sm"><SelectValue placeholder="Todos los Ámbitos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Ámbitos</SelectItem>
                {allUniqueAmbitos.map(ambito => <SelectItem key={ambito} value={ambito}>{ambito}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={resetFilters} variant="outline" className="w-full lg:w-auto shadow-sm mt-4 md:mt-0">
            <XCircle className="mr-2 h-4 w-4" /> Limpiar Filtros
          </Button>
        </CardContent>
      </Card>

      {displayEntrevistas.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            {searchTerm || selectedTemaFilter !== 'all' || selectedAmbitoFilter !== 'all'
              ? "No hay entrevistas que coincidan con los filtros seleccionados."
              : "Aún no hay entrevistas publicadas."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
             Vuelve pronto para ver las últimas novedades o ajusta tus filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {displayEntrevistas.map((entrevista) => (
            <EntrevistaCard key={entrevista.id} entrevista={entrevista} temasMap={temasMap} />
          ))}
        </div>
      )}
    </div>
  );
}
