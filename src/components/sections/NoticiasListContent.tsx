
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicadasNoticias } from '@/lib/firebase/noticiasService';
import type { Noticia, Persona } from '@/lib/types'; // Import Persona
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { getPersonaById } from '@/lib/firebase/personasService'; // Import getPersonaById
import { useToast } from '@/hooks/use-toast';
import { Newspaper, CalendarDays, Link as LinkIconLucide, ChevronRight, RefreshCw, AlertTriangle, PlusCircle, Filter, XCircle } from 'lucide-react'; // Added PlusCircle, Filter, XCircle
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For filters
import { Label } from '@/components/ui/label'; // For filter labels
import { Switch } from '@/components/ui/switch'; // For esDestacada filter
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import Breadcrumbs from '@/components/ui/Breadcrumbs'; 

const NoticiaCard = ({ noticia }: { noticia: Noticia }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (noticia.fechaPublicacion) {
      const dateObj = noticia.fechaPublicacion instanceof Timestamp ? noticia.fechaPublicacion.toDate() : new Date(noticia.fechaPublicacion);
      setFormattedDate(dateObj.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
  }, [noticia.fechaPublicacion]);

  const linkProps = noticia.tipoContenido === 'enlace_externo' && noticia.urlExterna
    ? { href: noticia.urlExterna, target: "_blank", rel: "noopener noreferrer" }
    : { href: `/noticias/${noticia.id}` };

  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out group">
      {noticia.imagenPrincipalURL && (
        <div className="relative w-full h-48 bg-muted">
          <Image
            src={noticia.imagenPrincipalURL}
            alt={`Imagen de ${noticia.titulo}`}
            fill
            style={{objectFit:"cover"}}
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="news article image"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <Link {...linkProps} className="block">
            <CardTitle className="text-xl text-primary group-hover:underline">{noticia.titulo}</CardTitle>
        </Link>
        {noticia.subtitulo && <CardDescription className="text-sm text-muted-foreground pt-1">{noticia.subtitulo}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-3 pb-3">
        {noticia.tipoContenido === 'articulo_propio' && noticia.contenido && (
          <p className="text-sm text-foreground/80 h-16 overflow-hidden text-ellipsis">
            {noticia.contenido.substring(0, 120)}...
          </p>
        )}
        {noticia.tipoContenido === 'enlace_externo' && noticia.resumenOContextoInterno && (
          <p className="text-sm text-foreground/80 h-16 overflow-hidden text-ellipsis">
            {noticia.resumenOContextoInterno.substring(0, 120)}...
          </p>
        )}
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
          {formattedDate || 'Cargando fecha...'}
          {noticia.fuenteExterna && (
            <span className="ml-1 pl-1 border-l border-border">Fuente: {noticia.fuenteExterna}</span>
          )}
        </div>
        {noticia.categoriasNoticia && noticia.categoriasNoticia.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {noticia.categoriasNoticia.map(cat => <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>)}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Button asChild variant="link" className="p-0 h-auto text-primary text-sm font-medium">
          <Link {...linkProps}>
            Leer Más 
            {noticia.tipoContenido === 'enlace_externo' && <LinkIconLucide className="ml-1.5 h-3.5 w-3.5"/>}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function NoticiasListContent() {
  const { user } = useAuth();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [canCreateNoticias, setCanCreateNoticias] = useState(false);

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [selectedCategoriaFilter, setSelectedCategoriaFilter] = useState<string | 'all'>('all');
  const [esDestacadaFilter, setEsDestacadaFilter] = useState<'all' | boolean>('all');
  const [allUniqueCategorias, setAllUniqueCategorias] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const fetchPersonaData = async () => {
        const pData = await getPersonaById(user.uid);
        setPersona(pData);
        if (pData?.capacidadesPlataforma?.includes('es_admin_noticias')) {
          setCanCreateNoticias(true);
        } else {
          setCanCreateNoticias(false);
        }
      };
      fetchPersonaData();
    } else {
      setPersona(null);
      setCanCreateNoticias(false);
    }
  }, [user]);

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Noticias' }
  ];

  const fetchNoticias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const options: { limit?: number; esDestacada?: boolean | 'all'; categoria?: string | 'all' } = { limit: 20 }; // Limit inicial
      if (esDestacadaFilter !== 'all') options.esDestacada = esDestacadaFilter;
      if (selectedCategoriaFilter !== 'all') options.categoria = selectedCategoriaFilter;
      
      const fetchedNoticias = await getPublicadasNoticias(options);
      setNoticias(fetchedNoticias);

      // Extraer categorías únicas solo de las noticias publicadas inicialmente (sin filtros aplicados a la query)
      if (selectedCategoriaFilter === 'all' && esDestacadaFilter === 'all') {
        const uniqueCats = new Set<string>();
        fetchedNoticias.forEach(n => n.categoriasNoticia?.forEach(cat => uniqueCats.add(cat)));
        setAllUniqueCategorias(Array.from(uniqueCats).sort());
      }

    } catch (err) {
      console.error("Error fetching public noticias:", err);
      setError("No se pudieron cargar las noticias.");
      toast({ title: "Error", description: "No se pudieron cargar las noticias.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, esDestacadaFilter, selectedCategoriaFilter]);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  const resetFilters = () => {
    setSelectedCategoriaFilter('all');
    setEsDestacadaFilter('all');
  };

  if (loading) {
    return ( <div className="text-center py-20"> <RefreshCw className="h-10 w-10 mx-auto animate-spin text-primary mb-4" /> <p className="text-muted-foreground">Cargando noticias...</p> </div> );
  }

  if (error) {
    return ( <div className="text-center py-20"> <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" /> <p className="text-xl text-destructive mb-2">{error}</p> </div> );
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      <header className="pb-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
            <Newspaper className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-4xl font-bold text-primary">Noticias del CET N°26</h1>
                <p className="text-muted-foreground mt-1">
                    Aquí compartimos las historias, logros y novedades que construyen el día a día de nuestra escuela técnica y su comunidad.
                </p>
            </div>
        </div>
        {canCreateNoticias && (
          <Button asChild size="lg">
            <Link href="/admin/gestion-noticias/nueva">
              <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Noticia
            </Link>
          </Button>
        )}
      </header>

      <Card className="p-4 md:p-6 mb-8 shadow-md">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/>Filtrar Noticias</CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="categoria-filter-noticias" className="block text-sm font-medium text-muted-foreground mb-1">Categoría</Label>
            <Select value={selectedCategoriaFilter} onValueChange={setSelectedCategoriaFilter}>
              <SelectTrigger id="categoria-filter-noticias" className="shadow-sm"><SelectValue placeholder="Todas las Categorías" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {allUniqueCategorias.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-5">
            <Switch 
                id="destacada-filter" 
                checked={esDestacadaFilter === true}
                onCheckedChange={(checked) => setEsDestacadaFilter(checked ? true : 'all')}
            />
            <Label htmlFor="destacada-filter" className="text-sm font-medium text-muted-foreground">
                Mostrar solo Destacadas
            </Label>
          </div>
          <Button onClick={resetFilters} variant="outline" className="w-full lg:w-auto shadow-sm mt-4 md:mt-0">
            <XCircle className="mr-2 h-4 w-4" /> Limpiar Filtros
          </Button>
        </CardContent>
      </Card>

      {noticias.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            {selectedCategoriaFilter !== 'all' || esDestacadaFilter !== 'all' 
              ? "No hay noticias que coincidan con los filtros seleccionados." 
              : "Aún no hay noticias publicadas."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {selectedCategoriaFilter !== 'all' || esDestacadaFilter !== 'all' 
              ? "Intenta ajustar los filtros o vuelve más tarde." 
              : "Vuelve pronto para ver las últimas novedades."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {noticias.map((noticia) => (
            <NoticiaCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      )}
    </div>
  );
}
