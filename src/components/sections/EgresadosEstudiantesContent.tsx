
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Persona, TemaCategoria } from '@/lib/types';
import { getPublicEgresadosYEstudiantes } from '@/lib/supabase/personasService';
import { useToast } from '@/hooks/use-toast';
import PersonaCard from '@/components/cards/PersonaCard';
import { Users2, Loader2, Info, Search, Filter, XIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { categoriasPrincipalesPersonaLabels } from '@/lib/schemas/personaSchema'; // For labels

// Define a relevant subset of categories for filtering this specific network
const relevantCategorias: Array<{ value: Persona['categoriaPrincipal']; label: string }> = [
  { value: 'ex_alumno_cet', label: categoriasPrincipalesPersonaLabels['ex_alumno_cet'] },
  { value: 'estudiante_cet', label: categoriasPrincipalesPersonaLabels['estudiante_cet'] },
];

const currentSchoolYear = new Date().getFullYear(); // Or get this from a config
const lastRelevantSchoolYear = 6; // Example: show students from 6th year. Adjust as needed.

export default function EgresadosEstudiantesContent() {
  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoriaFilter, setSelectedCategoriaFilter] = useState<Persona['categoriaPrincipal'] | 'all'>('all');
  const [selectedAnoEgresoFilter, setSelectedAnoEgresoFilter] = useState<number | 'all'>('all');
  const [buscandoOportunidadesFilter, setBuscandoOportunidadesFilter] = useState(false);
  // TODO: Add filter for areasDeInteresOExpertise if needed

  const uniqueAnosEgreso = Array.from(new Set(allPersonas.filter(p => p.esExAlumnoCET && p.anoEgresoCET).map(p => p.anoEgresoCET!))).sort((a,b) => b - a);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedPersonas = await getPublicEgresadosYEstudiantes();
      // Further client-side filtering for students in the last year if not done in service
      fetchedPersonas = fetchedPersonas.filter(p => {
        if (p.categoriaPrincipal === 'estudiante_cet') {
          return p.anoCursadaActualCET === lastRelevantSchoolYear;
        }
        return true; // Include all ex-alumnos fetched by the service
      });
      setAllPersonas(fetchedPersonas);
      setFilteredPersonas(fetchedPersonas); // Initialize filtered list
    } catch (error) {
      console.error("Error fetching egresados y estudiantes:", error);
      toast({
        title: "Error al cargar perfiles",
        description: "No se pudieron obtener los datos de egresados y estudiantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let currentFiltered = [...allPersonas];

    if (searchTerm) {
      currentFiltered = currentFiltered.filter(p =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.areasDeInteresOExpertise && p.areasDeInteresOExpertise.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (p.titulacionObtenidaCET && p.titulacionObtenidaCET.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategoriaFilter !== 'all') {
      currentFiltered = currentFiltered.filter(p => p.categoriaPrincipal === selectedCategoriaFilter);
    }

    if (selectedAnoEgresoFilter !== 'all') {
      currentFiltered = currentFiltered.filter(p => p.anoEgresoCET === selectedAnoEgresoFilter);
    }

    if (buscandoOportunidadesFilter) {
      currentFiltered = currentFiltered.filter(p => p.buscandoOportunidades === true);
    }
    
    setFilteredPersonas(currentFiltered);

  }, [searchTerm, selectedCategoriaFilter, selectedAnoEgresoFilter, buscandoOportunidadesFilter, allPersonas]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategoriaFilter('all');
    setSelectedAnoEgresoFilter('all');
    setBuscandoOportunidadesFilter(false);
  };

  return (
    <div className="space-y-12">
      <header className="text-center py-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl shadow-lg">
        <Users2 className="h-20 w-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Red de Egresados CET 26 y Estudiantes</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto px-4">
          Conecta con estudiantes actuales del último año y exalumnos del CET N°26. Descubre sus perfiles, experiencias y aspiraciones.
        </p>
      </header>

      {/* Filters Section */}
      <Card className="p-4 md:p-6 mb-8 shadow-md">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/>Filtrar Perfiles</CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="search-egresados" className="block text-sm font-medium text-muted-foreground mb-1">Buscar por Nombre, Email, Área</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="search-egresados" type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 shadow-sm" />
            </div>
          </div>
          <div>
            <Label htmlFor="categoria-filter-egresados" className="block text-sm font-medium text-muted-foreground mb-1">Categoría</Label>
            <Select value={selectedCategoriaFilter} onValueChange={(value) => setSelectedCategoriaFilter(value as Persona['categoriaPrincipal'] | 'all')}>
              <SelectTrigger id="categoria-filter-egresados" className="shadow-sm"><SelectValue placeholder="Todas las Categorías" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {relevantCategorias.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ano-egreso-filter" className="block text-sm font-medium text-muted-foreground mb-1">Año de Egreso (Exalumnos)</Label>
            <Select 
                value={selectedAnoEgresoFilter === 'all' ? 'all' : String(selectedAnoEgresoFilter)} 
                onValueChange={(value) => setSelectedAnoEgresoFilter(value === 'all' ? 'all' : Number(value))}
                disabled={selectedCategoriaFilter === 'estudiante_cet'}
            >
              <SelectTrigger id="ano-egreso-filter" className="shadow-sm"><SelectValue placeholder="Todos los Años" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Años</SelectItem>
                {uniqueAnosEgreso.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 pt-5">
                <Switch 
                    id="buscando-oportunidades-filter" 
                    checked={buscandoOportunidadesFilter} 
                    onCheckedChange={setBuscandoOportunidadesFilter}
                />
                <Label htmlFor="buscando-oportunidades-filter" className="text-sm font-medium text-muted-foreground">
                    Buscando Oportunidades
                </Label>
            </div>
            <Button onClick={resetFilters} variant="outline" className="w-full shadow-sm">
              <XIcon className="mr-2 h-4 w-4" /> Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>


      <section className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Cargando perfiles de egresados y estudiantes...</p>
          </div>
        ) : filteredPersonas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {filteredPersonas.map(persona => (
              <PersonaCard key={persona.email} persona={persona} context="egresado_estudiante" />
            ))}
          </div>
        ) : (
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="font-semibold">No se encontraron perfiles</AlertTitle>
            <AlertDescription>
              Actualmente no hay perfiles de egresados o estudiantes que coincidan con los filtros. Intenta ajustar tu búsqueda o vuelve más tarde.
            </AlertDescription>
          </Alert>
        )}
      </section>
    </div>
  );
}

    