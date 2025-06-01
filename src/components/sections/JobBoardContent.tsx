
"use client";

import type { OfertaTrabajo, TipoContratoOferta, Tema } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, CalendarDays, Tag, Search, Filter, PlusCircle, Building, User, Wrench } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllTemasActivos } from '@/lib/firebase/temasService';
import { Timestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock Data - Reemplazar con datos de Firestore
const mockOfertas: OfertaTrabajo[] = [
  {
    id: '1',
    titulo: 'Desarrollador Full-Stack para Proyecto AgroTech',
    publicadoPorNombre: 'AgroSoluciones S.A.',
    esEmpresa: true,
    descripcion: 'Buscamos un desarrollador full-stack con experiencia en Python y React para un innovador proyecto de tecnología aplicada al agro. Responsabilidades incluyen desarrollo frontend y backend, integración con APIs de sensores y manejo de bases de datos.',
    descripcionCorta: 'Desarrollador con experiencia en Python y React para proyecto AgroTech.',
    ubicacionTexto: 'Remoto (Argentina)',
    tipoContrato: 'jornada_completa',
    idsTemasRequeridos: ['tecnologico', 'agropecuario'], // IDs de temas
    categoriaOferta: 'Desarrollo de Software',
    requisitos: 'Experiencia de 3+ años en Python y React. Conocimiento de Docker. Experiencia con GIS es un plus.',
    beneficios: 'Salario competitivo. Obra Social. Capacitación continua. Horario flexible.',
    comoAplicar: 'Enviar CV y portfolio a rrhh@agrosoluciones.example.com',
    fechaPublicacion: Timestamp.fromDate(new Date('2024-07-15T09:00:00')),
    creadoPorUid: 'adminUserUid',
    creadoEn: Timestamp.now(),
    actualizadoEn: Timestamp.now(),
    estaActiva: true,
  },
  {
    id: '2',
    titulo: 'Técnico de Campo para Relevamiento de Suelos',
    publicadoPorNombre: 'Estancia "La Esperanza"',
    esEmpresa: true, // Estancia es una empresa/producción
    descripcion: 'Se necesita técnico agrónomo o estudiante avanzado para realizar relevamiento de suelos y seguimiento de cultivos en estancia ubicada en la zona de Jacobacci. Movilidad propia excluyente.',
    descripcionCorta: 'Técnico agrónomo para relevamiento de suelos y seguimiento de cultivos.',
    ubicacionTexto: 'Ing. Jacobacci, Río Negro',
    tipoContrato: 'media_jornada',
    idsTemasRequeridos: ['manejo_suelo', 'agropecuario'],
    categoriaOferta: 'Trabajo de Campo',
    requisitos: 'Título de Técnico Agrónomo o estudiante avanzado. Experiencia en muestreo de suelos. Carnet de conducir.',
    comoAplicar: 'Contactar al Sr.Perez al 294-4XXXXXX',
    fechaPublicacion: Timestamp.fromDate(new Date('2024-07-20T14:30:00')),
    creadoPorUid: 'adminUserUid',
    creadoEn: Timestamp.now(),
    actualizadoEn: Timestamp.now(),
    estaActiva: true,
  },
  {
    id: '3',
    titulo: 'Pasantía en Administración Rural',
    publicadoPorNombre: 'Cooperativa Agropecuaria Jacobacci Ltda.',
    esEmpresa: true,
    descripcion: 'Ofrecemos una pasantía rentada para estudiantes de carreras afines a la administración de empresas agropecuarias. El pasante colaborará en tareas administrativas, contables y de gestión de proyectos.',
    descripcionCorta: 'Pasantía rentada para estudiantes de administración de empresas agropecuarias.',
    ubicacionTexto: 'Ing. Jacobacci, Río Negro',
    tipoContrato: 'pasantia',
    idsTemasRequeridos: ['social', 'agropecuario'],
    categoriaOferta: 'Administración',
    requisitos: 'Estudiante regular de Administración, Economía o carreras afines. Buen manejo de Office. Proactividad.',
    comoAplicar: 'Presentar CV en las oficinas de la Cooperativa, Av. San Martín 123.',
    fechaPublicacion: Timestamp.fromDate(new Date('2024-07-22T11:00:00')),
    creadoPorUid: 'adminUserUid',
    creadoEn: Timestamp.now(),
    actualizadoEn: Timestamp.now(),
    estaActiva: true,
  },
];

const tipoContratoLabels: Record<TipoContratoOferta, string> = {
  jornada_completa: 'Jornada Completa',
  media_jornada: 'Media Jornada',
  freelance: 'Freelance / Por Proyecto',
  pasantia: 'Pasantía',
  voluntariado: 'Voluntariado',
  otro: 'Otro',
};


const OfertaCard = ({ oferta, temasMap }: { oferta: OfertaTrabajo; temasMap: Map<string, string> }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (oferta.fechaPublicacion) {
      const dateObj = oferta.fechaPublicacion instanceof Timestamp ? oferta.fechaPublicacion.toDate() : new Date(oferta.fechaPublicacion);
      setFormattedDate(dateObj.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
  }, [oferta.fechaPublicacion]);

  const temasDeOferta = useMemo(() => {
    return oferta.idsTemasRequeridos?.map(id => temasMap.get(id)).filter(Boolean) as string[] || [];
  }, [oferta.idsTemasRequeridos, temasMap]);

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
        <p className="text-foreground/80 text-sm h-20 overflow-hidden text-ellipsis">
          {oferta.descripcionCorta || oferta.descripcion.substring(0, 150) + (oferta.descripcion.length > 150 ? '...' : '')}
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
            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Tag className="h-3.5 w-3.5"/>Temas relacionados:</h4>
            <div className="flex flex-wrap gap-1.5">
              {temasDeOferta.slice(0, 3).map((tema) => (
                <Badge key={tema} variant="secondary" className="text-xs">{tema}</Badge>
              ))}
              {temasDeOferta.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="default" className="w-full" disabled={!oferta.id}>
          <Link href={`/bolsa-de-trabajo/${oferta.id}`}>
            Ver Detalles y Aplicar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function JobBoardContent() {
  const [ofertas, setOfertas] = useState<OfertaTrabajo[]>(mockOfertas); // Usar mock data por ahora
  const [filteredOfertas, setFilteredOfertas] = useState<OfertaTrabajo[]>(mockOfertas);
  const [loading, setLoading] = useState(false); // Cambiar a true cuando se cargue de Firestore
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemaFilter, setSelectedTemaFilter] = useState<string | 'all'>('all');
  const [selectedTipoContratoFilter, setSelectedTipoContratoFilter] = useState<TipoContratoOferta | 'all'>('all');
  
  const [allAvailableTemas, setAllAvailableTemas] = useState<Tema[]>([]);
  const [temasMap, setTemasMap] = useState<Map<string, string>>(new Map());


  useEffect(() => {
    // Simular carga de temas (reemplazar con llamada a Firestore)
    const fetchTemas = async () => {
      try {
        // const temasFromDb = await getAllTemasActivos(); // Descomentar cuando el servicio esté listo
        // setAllAvailableTemas(temasFromDb);
        // const map = new Map<string, string>();
        // temasFromDb.forEach(tema => map.set(tema.id!, tema.nombre));
        // setTemasMap(map);

        // Mock temas mientras tanto
        const mockTemas: Tema[] = [
          { id: 'tecnologico', nombre: 'Tecnológico', creadoEn: Timestamp.now(), actualizadoEn: Timestamp.now() },
          { id: 'agropecuario', nombre: 'Agropecuario', creadoEn: Timestamp.now(), actualizadoEn: Timestamp.now() },
          { id: 'manejo_suelo', nombre: 'Manejo de Suelo', creadoEn: Timestamp.now(), actualizadoEn: Timestamp.now() },
          { id: 'social', nombre: 'Social', creadoEn: Timestamp.now(), actualizadoEn: Timestamp.now() },
        ];
        setAllAvailableTemas(mockTemas);
        const map = new Map<string,string>();
        mockTemas.forEach(tema => map.set(tema.id!, tema.nombre));
        setTemasMap(map);

      } catch (error) {
        console.error("Error fetching temas for job board:", error);
      }
    };
    fetchTemas();
  }, []);

  useEffect(() => {
    // Lógica de filtrado
    let currentOfertas = [...ofertas];
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
            <Button asChild size="lg">
                <Link href="/bolsa-de-trabajo/nueva">
                    <PlusCircle className="mr-2 h-5 w-5" /> Publicar Nueva Oferta
                </Link>
            </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4 md:p-6 mb-8 shadow-md">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/>Filtrar Ofertas</CardTitle>
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

        {loading ? (
          <p className="text-center text-muted-foreground py-10">Cargando ofertas de trabajo...</p>
        ) : filteredOfertas.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {filteredOfertas.map(oferta => (
              <OfertaCard key={oferta.id} oferta={oferta} temasMap={temasMap} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No hay ofertas de trabajo que coincidan con tu búsqueda o filtros.</p>
            <p className="text-sm text-muted-foreground mt-2">Intenta con otros términos o ajusta los filtros, o vuelve más tarde.</p>
          </div>
        )}
      </div>
    </div>
  );
}


    