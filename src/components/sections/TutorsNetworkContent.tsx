
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Persona, Organizacion, CategoriaPrincipalPersona, TipoOrganizacion } from '@/lib/types';
import { getPublicTutoresYColaboradores } from '@/lib/supabase/personasService';
import { getPublicOrganizaciones } from '@/lib/supabase/organizacionesService';
import { useToast } from '@/hooks/use-toast';
import PersonaCard from '@/components/cards/PersonaCard';
import OrganizacionCard from '@/components/cards/OrganizacionCard';
import { Handshake, Users, Building, Loader2, Info, Search, Filter as FilterIcon, XCircle } from 'lucide-react';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  categoriasPrincipalesPersonaLabels 
} from '@/lib/schemas/personaSchema';
import { 
  organizacionTipos, 
  organizacionTipoLabels 
} from '@/lib/schemas/organizacionSchema';

const tutorNetworkPersonaCategorias: Array<{ value: CategoriaPrincipalPersona; label: string }> = [
  { value: 'docente_cet', label: categoriasPrincipalesPersonaLabels['docente_cet'] },
  { value: 'productor_rural', label: categoriasPrincipalesPersonaLabels['productor_rural'] },
  { value: 'profesional_externo', label: categoriasPrincipalesPersonaLabels['profesional_externo'] },
  { value: 'investigador', label: categoriasPrincipalesPersonaLabels['investigador'] },
  { value: 'ex_alumno_cet', label: categoriasPrincipalesPersonaLabels['ex_alumno_cet'] },
  { value: 'otro', label: categoriasPrincipalesPersonaLabels['otro'] },
  // Se excluye 'estudiante_cet', 'comunidad_general', 'ninguno_asignado' de las opciones de filtro para tutores/colaboradores
];

const tutorNetworkCategoriaValues = tutorNetworkPersonaCategorias.map(cat => cat.value);

export default function TutorsNetworkContent() {
  const [allPersonas, setAllPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [allOrganizaciones, setAllOrganizaciones] = useState<Organizacion[]>([]);
  const [filteredOrganizaciones, setFilteredOrganizaciones] = useState<Organizacion[]>([]);
  
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [loadingOrganizaciones, setLoadingOrganizaciones] = useState(true);
  const { toast } = useToast();

  // Filters for Personas
  const [searchTermPersonas, setSearchTermPersonas] = useState('');
  const [selectedPersonaCategoriaFilter, setSelectedPersonaCategoriaFilter] = useState<CategoriaPrincipalPersona | 'all'>('all');

  // Filters for Organizaciones
  const [searchTermOrganizaciones, setSearchTermOrganizaciones] = useState('');
  const [selectedOrganizacionTipoFilter, setSelectedOrganizacionTipoFilter] = useState<TipoOrganizacion | 'all'>('all');

  const fetchPersonasData = useCallback(async () => {
    setLoadingPersonas(true);
    try {
      let fetchedPersonas = await getPublicTutoresYColaboradores();
      // Apply category filter here, after fetching from service
      // This filters for general categories suitable for this network
      let relevantPersonas = fetchedPersonas.filter(p => 
        tutorNetworkCategoriaValues.includes(p.categoriaPrincipal)
      );

      // Further refine: if an ex-student, ensure they have more than just 'es_autor_invitado'
      relevantPersonas = relevantPersonas.filter(p => {
        if (p.categoriaPrincipal === 'ex_alumno_cet') {
          const capacidades = p.capacidadesPlataforma || [];
          // Include if they have at least one capacity other than 'es_autor_invitado',
          // OR if they explicitly have 'es_tutor_invitado' or 'es_colaborador_invitado'.
          // Or, if their capacities list is empty/null but they are 'ex_alumno_cet' (less likely, but a fallback).
          const relevantCapacities = capacidades.filter(cap => cap !== 'es_autor_invitado');
          const isRelevantTutorOrCollaborator = capacidades.includes('es_tutor_invitado') || capacidades.includes('es_colaborador_invitado') || capacidades.includes('es_tutor') || capacidades.includes('es_colaborador');
          
          if (capacidades.length === 1 && capacidades.includes('es_autor_invitado')) {
            return false; // Exclude if ONLY 'es_autor_invitado'
          }
          // If they have other capacities, or are explicitly marked as tutor/collaborator, include them.
          // Or if they are an ex-student marked as available and no specific capacities, include them.
          return isRelevantTutorOrCollaborator || relevantCapacities.length > 0 || capacidades.length === 0;
        }
        return true; // Include other categories that passed the initial filter
      });

      setAllPersonas(relevantPersonas);
      setFilteredPersonas(relevantPersonas); 
    } catch (error) {
      console.error("Error fetching public personas for tutor network:", error);
      toast({
        title: "Error al cargar personas",
        description: "No se pudieron obtener los datos de colaboradores y tutores.",
        variant: "destructive",
      });
      setAllPersonas([]);
      setFilteredPersonas([]);
    } finally {
      setLoadingPersonas(false);
    }
  }, [toast]);

  const fetchOrganizacionesData = useCallback(async () => {
    setLoadingOrganizaciones(true);
    try {
      const fetchedOrganizaciones = await getPublicOrganizaciones();
      setAllOrganizaciones(fetchedOrganizaciones);
      setFilteredOrganizaciones(fetchedOrganizaciones);
    } catch (error) {
      console.error("Error fetching public organizaciones for tutor network:", error);
      toast({
        title: "Error al cargar organizaciones",
        description: "No se pudieron obtener los datos de organizaciones aliadas.",
        variant: "destructive",
      });
      setAllOrganizaciones([]);
      setFilteredOrganizaciones([]);
    } finally {
      setLoadingOrganizaciones(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPersonasData();
    fetchOrganizacionesData();
  }, [fetchPersonasData, fetchOrganizacionesData]);

  // Effect for filtering Personas based on UI filters
  useEffect(() => {
    let currentFiltered = [...allPersonas]; // Start with personas already filtered by relevant categories from fetch
    const term = searchTermPersonas.toLowerCase();

    if (term) {
      currentFiltered = currentFiltered.filter(p =>
        `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase().includes(term) ||
        (p.descripcionPersonalOProfesional?.toLowerCase() || '').includes(term) ||
        (p.areasDeInteresOExpertise && p.areasDeInteresOExpertise.some(area => area.toLowerCase().includes(term)))
      );
    }

    if (selectedPersonaCategoriaFilter !== 'all') {
      currentFiltered = currentFiltered.filter(p => p.categoriaPrincipal === selectedPersonaCategoriaFilter);
    }
    
    setFilteredPersonas(currentFiltered);
  }, [searchTermPersonas, selectedPersonaCategoriaFilter, allPersonas]);

  // Effect for filtering Organizaciones based on UI filters
  useEffect(() => {
    let currentFiltered = [...allOrganizaciones];
    const term = searchTermOrganizaciones.toLowerCase();

    if (term) {
      currentFiltered = currentFiltered.filter(o =>
        (o.nombreOficial?.toLowerCase() || '').includes(term) ||
        (o.nombreFantasia?.toLowerCase() || '').includes(term) ||
        (o.descripcion?.toLowerCase() || '').includes(term) ||
        (o.areasDeInteres && o.areasDeInteres.some(area => area.toLowerCase().includes(term)))
      );
    }

    if (selectedOrganizacionTipoFilter !== 'all') {
      currentFiltered = currentFiltered.filter(o => o.tipo === selectedOrganizacionTipoFilter);
    }
    
    setFilteredOrganizaciones(currentFiltered);
  }, [searchTermOrganizaciones, selectedOrganizacionTipoFilter, allOrganizaciones]);

  const resetPersonaFilters = () => {
    setSearchTermPersonas('');
    setSelectedPersonaCategoriaFilter('all');
  };

  const resetOrganizacionFilters = () => {
    setSearchTermOrganizaciones('');
    setSelectedOrganizacionTipoFilter('all');
  };

  return (
    <div className="space-y-12">
      <header className="text-center py-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <Handshake className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Red de Tutores y Acompañantes</h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto px-4">
            Este espacio reúne a las personas, instituciones y organizaciones que acompañaron proyectos técnicos en el CET 26 o desean hacerlo en el futuro. Aquí podrás conocer sus aportes, los temas en los que tienen experiencia y cómo podrían colaborar en nuevos proyectos.
          </p>
          <div className="mt-8 opacity-30 hidden md:block" data-ai-hint="teamwork collaboration">
            <Image
              src="https://placehold.co/1200x200.png"
              alt="Red de colaboración y apoyo"
              width={1200}
              height={200}
              className="w-full h-32 object-cover"
              priority
            />
          </div>
        </div>
      </header>

      {/* Personas Section */}
      <section className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-3">
              <Users className="h-8 w-8" />
              Nuestros Colaboradores y Tutores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters for Personas */}
            <div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 items-end">
              <div>
                <label htmlFor="search-personas" className="block text-sm font-medium text-muted-foreground mb-1">Buscar Persona</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="search-personas" type="text" placeholder="Nombre, apellido, área..." value={searchTermPersonas} onChange={(e) => setSearchTermPersonas(e.target.value)} className="pl-10 shadow-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="categoria-persona-filter" className="block text-sm font-medium text-muted-foreground mb-1">Categoría Profesional</label>
                <Select value={selectedPersonaCategoriaFilter} onValueChange={(value) => setSelectedPersonaCategoriaFilter(value as CategoriaPrincipalPersona | 'all')}>
                  <SelectTrigger id="categoria-persona-filter" className="shadow-sm"><SelectValue placeholder="Todas las Categorías" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    {tutorNetworkPersonaCategorias.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={resetPersonaFilters} variant="outline" className="w-full md:col-span-2 lg:col-span-1 lg:w-auto shadow-sm mt-4 md:mt-0">
                <XCircle className="mr-2 h-4 w-4" /> Limpiar Filtros (Personas)
              </Button>
            </div>

            {loadingPersonas ? (
              <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">Cargando perfiles de personas...</p>
              </div>
            ) : filteredPersonas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                {filteredPersonas.map(persona => (
                  <PersonaCard key={persona.id || persona.email} persona={persona} context="tutor_colaborador" />
                ))}
              </div>
            ) : (
              <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="font-semibold">No se encontraron colaboradores o tutores</AlertTitle>
                <AlertDescription>
                  Actualmente no hay personas que coincidan con tus filtros o no hay perfiles disponibles para esta sección.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      {/* Organizaciones Section */}
      <section className="space-y-8">
         <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-3">
                <Building className="h-8 w-8" />
                Organizaciones Aliadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters for Organizaciones */}
            <div className="mb-6 p-4 border rounded-lg bg-muted/50 space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 items-end">
              <div>
                <label htmlFor="search-organizaciones" className="block text-sm font-medium text-muted-foreground mb-1">Buscar Organización</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="search-organizaciones" type="text" placeholder="Nombre, descripción, área..." value={searchTermOrganizaciones} onChange={(e) => setSearchTermOrganizaciones(e.target.value)} className="pl-10 shadow-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="tipo-organizacion-filter" className="block text-sm font-medium text-muted-foreground mb-1">Tipo de Organización</label>
                <Select value={selectedOrganizacionTipoFilter} onValueChange={(value) => setSelectedOrganizacionTipoFilter(value as TipoOrganizacion | 'all')}>
                  <SelectTrigger id="tipo-organizacion-filter" className="shadow-sm"><SelectValue placeholder="Todos los Tipos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Tipos</SelectItem>
                    {organizacionTipos.map(tipo => <SelectItem key={tipo} value={tipo}>{organizacionTipoLabels[tipo]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={resetOrganizacionFilters} variant="outline" className="w-full md:col-span-2 lg:col-span-1 lg:w-auto shadow-sm mt-4 md:mt-0">
                <XCircle className="mr-2 h-4 w-4" /> Limpiar Filtros (Organizaciones)
              </Button>
            </div>

            {loadingOrganizaciones ? (
              <div className="flex flex-col items-center justify-center text-center py-10 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">Cargando organizaciones...</p>
              </div>
            ) : filteredOrganizaciones.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                {filteredOrganizaciones.map(org => (
                  <OrganizacionCard key={org.id} organizacion={org} />
                ))}
              </div>
            ) : (
              <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="font-semibold">No se encontraron organizaciones</AlertTitle>
                <AlertDescription>
                  Actualmente no hay organizaciones que coincidan con tus filtros o no hay organizaciones aliadas disponibles.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="text-center py-10 border-t mt-12">
        <h3 className="text-2xl font-semibold text-primary mb-4">¿Te interesa sumarte a la Red?</h3>
        <p className="text-foreground/80 mb-6 max-w-xl mx-auto">
            Si eres una persona, institución u organización con experiencia para compartir y deseas acompañar los proyectos técnicos de nuestros estudiantes, ¡nos encantaría conocerte!
        </p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md shadow-md transition-colors" onClick={() => toast({ title: 'Contacto', description: 'Funcionalidad de contacto próximamente disponible.'})}>
             Contáctanos
        </Button>
      </section>
    </div>
  );
}
