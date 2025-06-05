"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProyectosService } from "@/lib/supabase/services/proyectosService";
import { TemasService } from "@/lib/supabase/services/temasService";
import type { Proyecto, Tema, TemaCategoria } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Archive,
  Search,
  ListFilter,
  LayoutGrid,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import ProjectCard from "@/components/cards/ProjectCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { temaCategoriaLabels } from "@/lib/schemas/temaSchema";
import { supabase } from '@/lib/supabase/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

const proyectosService = new ProyectosService(supabase);
const temasService = new TemasService(supabase);

export default function ProjectListContent() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<
    string | "all"
  >("all");
  const [selectedYear, setSelectedYear] = useState<string | "all">("all");
  const [selectedTemaCategoriaFilter, setSelectedTemaCategoriaFilter] =
    useState<TemaCategoria | "all">("all");

  const [allAvailableTemas, setAllAvailableTemas] = useState<Tema[]>([]);
  const [allYears, setAllYears] = useState<number[]>([]);
  const [projectTemasMap, setProjectTemasMap] = useState<
    Record<string, Tema[]>
  >({});
  const [availableTemaCategories, setAvailableTemaCategories] = useState<
    TemaCategoria[]
  >([]);

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Explorar", href: "/proyectos" },
    { label: "Proyectos Técnicos" },
  ];

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await proyectosService.getPublic();
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      const transformedProyectos = (result.data || []).map(p => ({
        id: p.id,
        titulo: p.titulo,
        descripcion: p.descripcion,
        archivoPrincipalUrl: p.archivo_principal_url,
        estado: p.status,
        activo: !p.esta_eliminado,
        creadoEn: p.created_at,
        actualizadoEn: p.updated_at,
        estaEliminado: p.esta_eliminado,
        eliminadoPorUid: p.eliminado_por_uid,
        eliminadoEn: p.eliminado_en
      })) as Proyecto[];

      setProyectos(transformedProyectos);
      setFilteredProjects(transformedProyectos);

      const allTemaIds = new Set<string>();
      result.data?.forEach(p => {
        if (p.temas) {
          p.temas.forEach(tema => allTemaIds.add(tema.id));
        }
      });

      if (allTemaIds.size > 0) {
        const temasResult = await temasService.getByIds(Array.from(allTemaIds));
        if (temasResult.data) {
          const temaMapById = temasResult.data.reduce((acc, tema) => {
            if (tema.id) acc[tema.id] = tema;
            return acc;
          }, {} as Record<string, Tema>);

          const newProjectTemasMap: Record<string, Tema[]> = {};
          transformedProyectos.forEach(p => {
            if (p.id) {
              newProjectTemasMap[p.id] = p.temas?.map(tema => temaMapById[tema.id]).filter(Boolean) || [];
            }
          });
          setProjectTemasMap(newProjectTemasMap);
        }
      }

      const uniqueCategories = Array.from(
        new Set(
          Object.values(projectTemasMap)
            .flat()
            .map(tema => tema.categoriaTema)
            .filter(Boolean) as TemaCategoria[]
        )
      ).sort();
      setAvailableTemaCategories(uniqueCategories);

      const years = new Set<number>();
      transformedProyectos.forEach(p => {
        if (p.anoProyecto) years.add(p.anoProyecto);
      });
      setAllYears(Array.from(years).sort((a, b) => b - a));

    } catch (err) {
      console.error("Error fetching proyectos:", err);
      setError("No se pudieron cargar los proyectos.");
      toast({ title: "Error", description: "No se pudieron cargar los proyectos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    let currentProjects = [...proyectos];

    if (searchTerm) {
      currentProjects = currentProjects.filter(
        (p) =>
          p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.descripcionGeneral
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (p.resumenEjecutivo &&
            p.resumenEjecutivo
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (p.palabrasClave &&
            p.palabrasClave.some((kw) =>
              kw.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    if (selectedTopicFilter !== "all") {
      currentProjects = currentProjects.filter(
        (p) =>
          p.temas && p.temas.some((tema) => tema.id === selectedTopicFilter)
      );
    }

    if (selectedYear !== "all") {
      currentProjects = currentProjects.filter(
        (p) => p.anoProyecto === parseInt(selectedYear)
      );
    }

    if (selectedTemaCategoriaFilter !== "all") {
      currentProjects = currentProjects.filter((p) => {
        const temasDelProyecto = p.id ? projectTemasMap[p.id] || [] : [];
        return temasDelProyecto.some(
          (tema) => tema.categoriaTema === selectedTemaCategoriaFilter
        );
      });
    }

    setFilteredProjects(currentProjects);
  }, [
    searchTerm,
    selectedTopicFilter,
    selectedYear,
    selectedTemaCategoriaFilter,
    proyectos,
    projectTemasMap,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTopicFilter("all");
    setSelectedYear("all");
    setSelectedTemaCategoriaFilter("all");
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await fetchInitialData();
      return;
    }

    try {
      setLoading(true);
      const result = await proyectosService.search(searchTerm);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setProyectos(result.data || []);
      setFilteredProjects(result.data || []);
    } catch (error) {
      console.error('Error searching proyectos:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar proyectos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        {" "}
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />{" "}
        <p className="text-muted-foreground">Cargando proyectos técnicos...</p>{" "}
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbItems} />
      <header className="pb-6 border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-10 w-10 text-primary" />
            <div>
              {" "}
              <h1 className="text-4xl font-bold text-primary">
                Proyectos Técnicos
              </h1>{" "}
              <p className="text-muted-foreground mt-1">
                Explora los trabajos desarrollados en el CET N°26.
              </p>{" "}
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 bg-card rounded-lg shadow-md space-y-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 items-end">
        <div className="min-w-[200px]">
          <label
            htmlFor="search-projects"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Buscar
          </label>
          <div className="relative">
            {" "}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />{" "}
            <Input
              id="search-projects"
              type="text"
              placeholder="Título, descripción, palabra clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 shadow-sm"
            />{" "}
          </div>
        </div>

        <div className="min-w-[150px]">
          <label
            htmlFor="topic-filter"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Tema Específico
          </label>
          <Select
            value={selectedTopicFilter}
            onValueChange={setSelectedTopicFilter}
          >
            <SelectTrigger id="topic-filter" className="shadow-sm">
              {" "}
              <SelectValue placeholder="Todos los Temas" />{" "}
            </SelectTrigger>
            <SelectContent>
              {" "}
              <SelectItem value="all">
                Todos los Temas Específicos
              </SelectItem>{" "}
              {allAvailableTemas.map((tema) => (
                <SelectItem key={tema.id} value={tema.id!}>
                  {tema.nombre}
                </SelectItem>
              ))}{" "}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[150px]">
          <label
            htmlFor="tema-categoria-filter"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Categoría de Tema
          </label>
          <Select
            value={selectedTemaCategoriaFilter}
            onValueChange={(value) =>
              setSelectedTemaCategoriaFilter(value as TemaCategoria | "all")
            }
          >
            <SelectTrigger id="tema-categoria-filter" className="shadow-sm">
              {" "}
              <SelectValue placeholder="Todas las Categorías" />{" "}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Categorías de Temas</SelectItem>
              {availableTemaCategories.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {temaCategoriaLabels[categoria] || categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[120px]">
          <label
            htmlFor="year-filter"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Año
          </label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger id="year-filter" className="shadow-sm">
              {" "}
              <SelectValue placeholder="Todos los Años" />{" "}
            </SelectTrigger>
            <SelectContent>
              {" "}
              <SelectItem value="all">Todos los Años</SelectItem>{" "}
              {allYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}{" "}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={resetFilters}
          variant="outline"
          className="w-full md:col-span-2 lg:col-span-1 lg:w-auto shadow-sm"
        >
          {" "}
          <ListFilter className="mr-2 h-4 w-4" /> Limpiar Filtros{" "}
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          {" "}
          <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />{" "}
          <p className="text-xl text-muted-foreground">
            {" "}
            No hay proyectos que coincidan con tu búsqueda o filtros.{" "}
          </p>{" "}
          <p className="text-sm text-muted-foreground mt-2">
            Intenta con otros términos o ajusta los filtros.
          </p>{" "}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.titulo}</CardTitle>
                <CardDescription>
                  {format(new Date(project.fechaCreacion), 'PPP', { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.descripcionGeneral}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="capitalize">
                      {project.estadoActual}
                    </Badge>
                    <Button variant="link" asChild>
                      <Link href={`/proyectos/${project.id}`}>
                        Ver detalles
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
