
"use client";

// Tipos necesarios para los datos mockeados y el componente
type TipoContratoOferta =
  | "jornada_completa"
  | "media_jornada"
  | "freelance"
  | "pasantia"
  | "voluntariado"
  | "otro";

interface OfertaTrabajoMock { // Tipo para los datos mockeados, simplificado
  id: string;
  titulo: string;
  publicadoPorNombre: string;
  esEmpresa: boolean;
  descripcion: string;
  descripcionCorta?: string;
  ubicacionTexto: string;
  tipoContrato: TipoContratoOferta;
  idsTemasRequeridos?: string[]; // Array de IDs de temas
  categoriaOferta?: string; // Podría usarse para filtrar más adelante
  fechaPublicacion: string; // Mantener como string para el mock
  // Otros campos de mockOfertas que no se usan directamente en la card pueden omitirse aquí
}

interface TemaMock { // Tipo para los temas mockeados
  id: string;
  nombre: string;
}

// Componentes UI de Shadcn (solo los que se usan realmente para el layout básico)
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Iconos (solo los que se usan)
import { Briefcase, MapPin, CalendarDays, Tag, Building, User, Wrench, Filter, Search, PlusCircle } from 'lucide-react';

import Link from 'next/link'; // Para el botón "Ver Detalles"
import { useState, useEffect, useMemo } from 'react'; // Hooks de React
import { Input } from '@/components/ui/input'; // Para filtros
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Para filtros


// --- DATOS MOCKEADOS ---
const mockOfertas: OfertaTrabajoMock[] = [
  {
    id: "1",
    titulo: "Personal para Mantenimiento y Desarrollo de Predio",
    publicadoPorNombre: "Cooperativa de Agua de Ing. Jacobacci",
    esEmpresa: true, // Las cooperativas suelen considerarse entidades tipo empresa para estos fines
    descripcion:
      "La Cooperativa de Agua local busca personal proactivo para tareas de mantenimiento general de instalaciones y desarrollo del predio. Las responsabilidades incluyen reparaciones menores, cuidado de espacios verdes, apoyo en proyectos de expansión de infraestructura y asistencia en operaciones diarias. Se valorará experiencia previa en mantenimiento, plomería, albañilería o jardinería.",
    descripcionCorta:
      "Personal para mantenimiento general de instalaciones y desarrollo del predio de la Cooperativa de Agua.",
    ubicacionTexto: "Ing. Jacobacci, Río Negro",
    tipoContrato: "jornada_completa",
    idsTemasRequeridos: ["mantenimiento", "infraestructura", "servicios_publicos"], // IDs de temas ejemplo
    categoriaOferta: "Mantenimiento y Oficios",
    fechaPublicacion: "2024-07-28", // Fecha actualizada
  },
  {
    id: "2",
    titulo: "Técnico de Campo para Relevamiento de Suelos",
    publicadoPorNombre: 'Estancia "La Esperanza"',
    esEmpresa: true,
    descripcion:
      "Se necesita técnico agrónomo o estudiante avanzado para realizar relevamiento de suelos y seguimiento de cultivos en estancia ubicada en la zona de Jacobacci. Movilidad propia excluyente.",
    descripcionCorta:
      "Técnico agrónomo para relevamiento de suelos y seguimiento de cultivos.",
    ubicacionTexto: "Ing. Jacobacci, Río Negro",
    tipoContrato: "media_jornada",
    idsTemasRequeridos: ["manejo_suelo", "agropecuario"],
    categoriaOferta: "Trabajo de Campo",
    fechaPublicacion: "2024-07-20",
  },
  {
    id: "3",
    titulo: "Pasantía en Administración Rural",
    publicadoPorNombre: "Cooperativa Agropecuaria Jacobacci Ltda.",
    esEmpresa: true,
    descripcion:
      "Ofrecemos una pasantía rentada para estudiantes de carreras afines a la administración de empresas agropecuarias. El pasante colaborará en tareas administrativas, contables y de gestión de proyectos.",
    descripcionCorta:
      "Pasantía rentada para estudiantes de administración de empresas agropecuarias.",
    ubicacionTexto: "Ing. Jacobacci, Río Negro",
    tipoContrato: "pasantia",
    idsTemasRequeridos: ["social", "agropecuario"],
    categoriaOferta: "Administración",
    fechaPublicacion: "2024-07-22",
  },
];

const mockTemas: TemaMock[] = [
  { id: "tecnologico", nombre: "Tecnológico" },
  { id: "agropecuario", nombre: "Agropecuario" },
  { id: "manejo_suelo", nombre: "Manejo de Suelo" },
  { id: "social", nombre: "Social" },
];
// --- FIN DATOS MOCKEADOS ---


const tipoContratoLabels: Record<TipoContratoOferta, string> = {
  jornada_completa: 'Jornada Completa',
  media_jornada: 'Media Jornada',
  freelance: 'Freelance / Por Proyecto',
  pasantia: 'Pasantía',
  voluntariado: 'Voluntariado',
  otro: 'Otro',
};

interface OfertaCardProps {
  oferta: OfertaTrabajoMock;
  temasMap: Map<string, string>;
}

const OfertaCard = ({ oferta, temasMap }: OfertaCardProps) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (oferta.fechaPublicacion) {
      const dateObj = new Date(oferta.fechaPublicacion);
      setFormattedDate(dateObj.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
  }, [oferta.fechaPublicacion]);

  const temasDeOferta = useMemo(() => {
    return oferta.idsTemasRequeridos?.map(id => temasMap.get(id)).filter(Boolean) as string[] || [];
  }, [oferta.idsTemasRequeridos, temasMap]);

  const descripcionCorta = oferta.descripcionCorta || oferta.descripcion.substring(0, 150) + (oferta.descripcion.length > 150 ? '...' : '');

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-primary group-hover:underline">{oferta.titulo}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5 mb-1">
            {oferta.esEmpresa ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
            {oferta.publicadoPorNombre}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> Publicado: {formattedDate || 'Cargando fecha...'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-foreground/80 text-sm min-h-[5rem] overflow-hidden">
          {descripcionCorta}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary/80" /> {oferta.ubicacionTexto}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 text-primary/80" /> {tipoContratoLabels[oferta.tipoContrato] || oferta.tipoContrato}
          </div>
        </div>
        {temasDeOferta.length > 0 && (
          <div className="pt-2 space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Tag className="h-3.5 w-3.5" />Temas relacionados:</h4>
            <div className="flex flex-wrap gap-1.5">
              {temasDeOferta.slice(0, 3).map((temaNombre) => (
                <Badge key={temaNombre} variant="secondary" className="text-xs">{temaNombre}</Badge>
              ))}
              {temasDeOferta.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="default" className="w-full" disabled={!oferta.id}>
          {/* El link puede ser # o una ruta genérica por ahora */}
          <Link href={`/bolsa-de-trabajo/${oferta.id}`}>
            Ver Detalles y Aplicar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function JobBoardContent() {
  // Estado para los datos mockeados y filtros
  const [ofertas, setOfertas] = useState<OfertaTrabajoMock[]>(mockOfertas);
  const [temasMap, setTemasMap] = useState<Map<string, string>>(new Map());
  const [allAvailableTemas, setAllAvailableTemas] = useState<TemaMock[]>(mockTemas);

  const [filteredOfertas, setFilteredOfertas] = useState<OfertaTrabajoMock[]>(ofertas);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemaFilter, setSelectedTemaFilter] = useState<string | 'all'>('all');
  const [selectedTipoContratoFilter, setSelectedTipoContratoFilter] = useState<TipoContratoOferta | 'all'>('all');

  // Simular la carga de temas en un mapa para el componente OfertaCard
  useEffect(() => {
    const map = new Map<string, string>();
    mockTemas.forEach(tema => map.set(tema.id, tema.nombre));
    setTemasMap(map);
  }, []); // Se ejecuta una vez

  // Lógica de filtrado (simplificada para datos mock)
  useEffect(() => {
    let currentOfertas = [...ofertas]; // Usar los datos mock originales
    if (searchTerm) {
      currentOfertas = currentOfertas.filter(o =>
        o.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.publicadoPorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedTemaFilter !== 'all') {
      currentOfertas = currentOfertas.filter(o => o.idsTemasRequeridos?.includes(selectedTemaFilter));
    }
    if (selectedTipoContratoFilter !== 'all') {
      currentOfertas = currentOfertas.filter(o => o.tipoContrato === selectedTipoContratoFilter);
    }
    setFilteredOfertas(currentOfertas);
  }, [searchTerm, selectedTemaFilter, selectedTipoContratoFilter, ofertas]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTemaFilter('all');
    setSelectedTipoContratoFilter('all');
  };

  return (
    <div className="space-y-10">
      <header className="text-center py-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl shadow-lg">
        <Briefcase className="h-20 w-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Bolsa de Trabajo</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto px-4">
          Conectando talentos y oportunidades en nuestra comunidad técnica y rural.
        </p>
      </header>

      {/* El Alerta de "Funcionalidad en Desarrollo" se mantiene */}
      <Alert variant="default" className="max-w-3xl mx-auto bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300">
        <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="font-semibold">Funcionalidad en Desarrollo</AlertTitle>
        <AlertDescription>
          Esta sección se encuentra en desarrollo activo. Algunas funcionalidades o la totalidad del contenido podrían no estar disponibles aún. ¡Gracias por tu paciencia!
        </AlertDescription>
      </Alert>

      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-primary">Explorar Ofertas</h2>
          {/* El botón de Publicar puede llevar a una ruta genérica o # por ahora */}
          <Button asChild size="lg">
            <Link href="/bolsa-de-trabajo/nueva">
              <PlusCircle className="mr-2 h-5 w-5" /> Publicar Nueva Oferta
            </Link>
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4 md:p-6 mb-8 shadow-md">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl flex items-center gap-2"><Filter className="h-5 w-5 text-primary" />Filtrar Ofertas</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 items-end">
            <div>
              <label htmlFor="search-ofertas" className="block text-sm font-medium text-muted-foreground mb-1">Buscar por palabra clave</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search-ofertas" type="text" placeholder="Título, empresa, descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 shadow-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="tema-filter-ofertas" className="block text-sm font-medium text-muted-foreground mb-1">Tema</label>
              <Select value={selectedTemaFilter} onValueChange={setSelectedTemaFilter}>
                <SelectTrigger id="tema-filter-ofertas" className="shadow-sm"><SelectValue placeholder="Todos los Temas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Temas</SelectItem>
                  {allAvailableTemas.map(tema => <SelectItem key={tema.id} value={tema.id!}>{tema.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="tipo-contrato-filter" className="block text-sm font-medium text-muted-foreground mb-1">Tipo de Contrato</label>
              <Select value={selectedTipoContratoFilter} onValueChange={(value) => setSelectedTipoContratoFilter(value as TipoContratoOferta | 'all')}>
                <SelectTrigger id="tipo-contrato-filter" className="shadow-sm"><SelectValue placeholder="Todos los Tipos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  {(Object.keys(tipoContratoLabels) as TipoContratoOferta[]).map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipoContratoLabels[tipo]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={resetFilters} variant="outline" className="w-full md:col-span-2 lg:col-span-1 lg:w-auto shadow-sm mt-4 md:mt-0">
              Limpiar Filtros
            </Button>
          </CardContent>
        </Card>

        {/* Renderizado de las tarjetas */}
        {filteredOfertas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {filteredOfertas.map(oferta => (
              <OfertaCard key={oferta.id} oferta={oferta} temasMap={temasMap} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No hay ofertas de trabajo que coincidan con tu búsqueda o filtros.</p>
            <p className="text-sm text-muted-foreground mt-2">Intenta con otros términos o ajusta los filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
