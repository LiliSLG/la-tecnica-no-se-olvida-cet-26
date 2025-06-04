"use client";

import { useEffect, useState, useCallback } from "react";
import { getPublicProjects } from "@/lib/supabase/services/proyectosService";
import {
  getTemasByIds as getTemasByIdsService,
  getAllTemasActivos,
} from "@/lib/supabase/services/temasService";
import type { Proyecto, Tema, TemaCategoria } from "@/lib/types"; // Added TemaCategoria
import { useToast } from "@/hooks/use-toast";
import {
  Archive,
  Search,
  ListFilter,
  LayoutGrid,
  RefreshCw,
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
import { temaCategoriaLabels } from "@/lib/schemas/temaSchema"; // Import labels

export default function ProjectListContent() {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<
    string | "all"
  >("all");
  const [selectedYear, setSelectedYear] = useState<string | "all">("all");
  const [selectedTemaCategoriaFilter, setSelectedTemaCategoriaFilter] =
    useState<TemaCategoria | "all">("all"); // New filter state

  const [allAvailableTemas, setAllAvailableTemas] = useState<Tema[]>([]);
  const [allYears, setAllYears] = useState<number[]>([]);
  const [projectTemasMap, setProjectTemasMap] = useState<
    Record<string, Tema[]>
  >({});
  const [availableTemaCategories, setAvailableTemaCategories] = useState<
    TemaCategoria[]
  >([]); // State for unique categories

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Explorar", href: "/proyectos" },
    { label: "Proyectos Técnicos" },
  ];

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProjects, activeTemas] = await Promise.all([
        getPublicProjects(),
        getAllTemasActivos(),
      ]);

      setProjects(fetchedProjects);
      setFilteredProjects(fetchedProjects);
      setAllAvailableTemas(activeTemas);

      const years = new Set<number>();
      fetchedProjects.forEach((p) => {
        if (p.anoProyecto) years.add(p.anoProyecto);
      });
      setAllYears(Array.from(years).sort((a, b) => b - a));

      const uniqueCategories = Array.from(
        new Set(
          activeTemas
            .map((tema) => tema.categoriaTema)
            .filter(Boolean) as TemaCategoria[]
        )
      ).sort();
      setAvailableTemaCategories(uniqueCategories);

      const allTemaIds = new Set<string>();
      fetchedProjects.forEach((p) =>
        p.temas?.forEach((tema) => allTemaIds.add(tema.id))
      );

      if (allTemaIds.size > 0) {
        const temaObjects = await getTemasByIdsService(Array.from(allTemaIds));
        const temaMapById = temaObjects.reduce((acc, tema) => {
          if (tema.id) acc[tema.id] = tema;
          return acc;
        }, {} as Record<string, Tema>);

        const newProjectTemasMap: Record<string, Tema[]> = {};
        fetchedProjects.forEach((p) => {
          if (p.id) {
            newProjectTemasMap[p.id] =
              p.temas?.map((tema) => temaMapById[tema.id]).filter(Boolean) ||
              [];
          }
        });
        setProjectTemasMap(newProjectTemasMap);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("No se pudieron cargar los datos iniciales.");
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    let currentProjects = [...projects];

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
    projects,
    projectTemasMap,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedTopicFilter("all");
    setSelectedYear("all");
    setSelectedTemaCategoriaFilter("all");
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        {" "}
        <RefreshCw className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />{" "}
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
            <ProjectCard
              key={project.id}
              project={project}
              temaObjects={project.id ? projectTemasMap[project.id] || [] : []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
