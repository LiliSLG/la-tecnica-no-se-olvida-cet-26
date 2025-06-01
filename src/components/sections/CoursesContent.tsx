
"use client";

import type { Curso, NivelCurso } from '@/lib/types';
import CourseCard from '@/components/cards/CourseCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookCopy, Search, Filter, XIcon, Info, Wrench } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const mockCursos: Curso[] = [
  {
    id: 'c1',
    titulo: 'Introducción a la Horticultura Orgánica',
    descripcionCorta: 'Aprende los principios básicos para cultivar tus propios alimentos de forma orgánica y sostenible. Ideal para principiantes.',
    instructor: 'Ing. Agr. Laura Campos (Profesional Independiente)',
    imagenURL: 'https://placehold.co/600x400.png?text=Horticultura',
    dataAiHint: "organic gardening vegetables",
    duracion: '4 semanas',
    nivel: 'principiante',
    linkMasInfo: '#',
    temas: ['Agroecología', 'Huerta', 'Sostenibilidad'],
    fechaInicio: '2024-09-01',
    modalidad: 'online',
    puntosOtorgados: 100,
  },
  {
    id: 'c2',
    titulo: 'Manejo Sanitario en Ganadería Ovina (INTA Jacobacci)',
    descripcionCorta: 'Curso intensivo sobre prevención, diagnóstico y tratamiento de las principales enfermedades en ovinos.',
    instructor: 'Equipo Técnico INTA Jacobacci',
    imagenURL: 'https://placehold.co/600x400.png?text=Ganaderia+Ovina',
    dataAiHint: "sheep farming veterinary",
    duracion: '20 horas',
    nivel: 'intermedio',
    linkMasInfo: '#',
    temas: ['Sanidad Animal', 'Producción Ovina', 'Manejo Ganadero'],
    modalidad: 'presencial',
    puntosOtorgados: 150,
  },
  {
    id: 'c3',
    titulo: 'Tecnologías de Riego Eficiente (Ofrecido por CET N°26)',
    descripcionCorta: 'Explora las últimas tecnologías y técnicas para optimizar el uso del agua en sistemas de riego agrícola.',
    instructor: 'Tec. Sup. Ricardo Montes (Docente CET N°26)',
    imagenURL: 'https://placehold.co/600x400.png?text=Riego+Eficiente',
    dataAiHint: "irrigation technology water",
    duracion: '6 semanas',
    nivel: 'avanzado',
    linkMasInfo: '#',
    temas: ['Tecnología Agrícola', 'Recursos Hídricos', 'Riego'],
    fechaInicio: '2024-10-15',
    modalidad: 'hibrido',
    puntosOtorgados: 200,
  },
  {
    id: 'c4',
    titulo: 'Buenas Prácticas en Apicultura (Cooperativa Apícola Local)',
    descripcionCorta: 'Conoce las mejores prácticas para el manejo de colmenas, producción de miel y salud de las abejas.',
    instructor: 'Miembros de la Cooperativa Apícola',
    imagenURL: 'https://placehold.co/600x400.png?text=Apicultura',
    dataAiHint: "beekeeping honey hives",
    duracion: '3 fines de semana',
    nivel: 'todos',
    linkMasInfo: '#',
    temas: ['Apicultura', 'Producción sostenible'],
    modalidad: 'presencial',
    puntosOtorgados: 120,
  },
  {
    id: 'c5',
    titulo: 'Uso Eficiente y Sostenible del Agua (Cooperativa de Agua Jacobacci)',
    descripcionCorta: 'Aprende técnicas para el ahorro de agua en el hogar y en la producción, y la importancia de este recurso vital.',
    instructor: 'Equipo Técnico, Cooperativa de Agua de Jacobacci',
    imagenURL: 'https://placehold.co/600x400.png?text=Agua+Sostenible',
    dataAiHint: "water conservation sustainable",
    duracion: '3 talleres',
    nivel: 'todos',
    linkMasInfo: '#',
    temas: ['Recursos Hídricos', 'Sostenibilidad', 'Consumo Responsable'],
    modalidad: 'presencial',
    puntosOtorgados: 100,
  },
  {
    id: 'c6',
    titulo: 'Gestión de Emprendimientos Productivos Locales (Municipalidad de Jacobacci)',
    descripcionCorta: 'Herramientas y estrategias para iniciar y gestionar emprendimientos productivos en el ámbito local, con foco en recursos regionales.',
    instructor: 'Área de Producción, Municipalidad de Ing. Jacobacci',
    imagenURL: 'https://placehold.co/600x400.png?text=Emprendimientos',
    dataAiHint: "local business startup",
    duracion: '6 semanas',
    nivel: 'todos',
    linkMasInfo: '#',
    temas: ['Emprendedurismo', 'Desarrollo Local', 'Gestión'],
    fechaInicio: '2024-09-10',
    modalidad: 'presencial',
    puntosOtorgados: 180,
  },
  {
    id: 'c7',
    titulo: 'Herramientas Digitales para la Comunidad (Municipalidad de Jacobacci)',
    descripcionCorta: 'Capacitación en el uso de herramientas informáticas básicas, internet y plataformas digitales para trámites y comunicación.',
    instructor: 'Secretaría de Modernización, Municipalidad de Ing. Jacobacci',
    imagenURL: 'https://placehold.co/600x400.png?text=Herramientas+Digitales',
    dataAiHint: "digital literacy computer",
    duracion: '4 encuentros',
    nivel: 'principiante',
    linkMasInfo: '#',
    temas: ['Alfabetización Digital', 'Tecnología', 'Comunidad'],
    modalidad: 'presencial',
    puntosOtorgados: 90,
  }
];

const nivelOptions: Array<{value: NivelCurso | 'all', label: string}> = [
  { value: 'all', label: 'Todos los Niveles' },
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
  { value: 'todos', label: 'Para Todos (General)' },
];

export default function CoursesContent() {
  const [cursos, setCursos] = useState<Curso[]>(mockCursos);
  const [filteredCursos, setFilteredCursos] = useState<Curso[]>(mockCursos);
  const [loading, setLoading] = useState(false); 

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivelFilter, setSelectedNivelFilter] = useState<NivelCurso | 'all'>('all');
  const [selectedTemaFilter, setSelectedTemaFilter] = useState<string | 'all'>('all');

  const allAvailableTemas = useMemo(() => {
    const temasSet = new Set<string>();
    mockCursos.forEach(curso => curso.temas?.forEach(tema => temasSet.add(tema)));
    return Array.from(temasSet).sort();
  }, []); 

  useEffect(() => {
    let currentCursos = [...cursos];
    if (searchTerm) {
      currentCursos = currentCursos.filter(c =>
        c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descripcionCorta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedNivelFilter !== 'all') {
      currentCursos = currentCursos.filter(c => c.nivel === selectedNivelFilter);
    }
    if (selectedTemaFilter !== 'all') {
      currentCursos = currentCursos.filter(c => c.temas?.includes(selectedTemaFilter));
    }
    setFilteredCursos(currentCursos);
  }, [searchTerm, selectedNivelFilter, selectedTemaFilter, cursos]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedNivelFilter('all');
    setSelectedTemaFilter('all');
  };

  return (
    <div className="space-y-10">
      <header className="text-center py-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl shadow-lg">
        <BookCopy className="h-20 w-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Cursos y Capacitaciones</h1>
        <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto px-4">
          Descubre oportunidades de aprendizaje ofrecidas por el CET N°26, la Municipalidad de Ingeniero Jacobacci, cooperativas locales y otras organizaciones colaboradoras. Un espacio para ampliar tus conocimientos y habilidades técnicas y comunitarias.
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
        <Card className="p-4 md:p-6 mb-8 shadow-md">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl flex items-center gap-2"><Filter className="h-5 w-5 text-primary"/>Filtrar Cursos</CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="search-cursos" className="block text-sm font-medium text-muted-foreground mb-1">Buscar por palabra clave</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search-cursos" type="text" placeholder="Título, instructor, descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 shadow-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="nivel-filter-cursos" className="block text-sm font-medium text-muted-foreground mb-1">Nivel</label>
              <Select value={selectedNivelFilter} onValueChange={(value) => setSelectedNivelFilter(value as NivelCurso | 'all')}>
                <SelectTrigger id="nivel-filter-cursos" className="shadow-sm"><SelectValue placeholder="Todos los Niveles" /></SelectTrigger>
                <SelectContent>
                  {nivelOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="tema-filter-cursos" className="block text-sm font-medium text-muted-foreground mb-1">Tema</label>
              <Select value={selectedTemaFilter} onValueChange={setSelectedTemaFilter}>
                <SelectTrigger id="tema-filter-cursos" className="shadow-sm"><SelectValue placeholder="Todos los Temas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Temas</SelectItem>
                  {allAvailableTemas.map(tema => <SelectItem key={tema} value={tema}>{tema}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={resetFilters} variant="outline" className="w-full md:col-span-2 lg:col-span-1 lg:w-auto shadow-sm mt-4 md:mt-0">
              <XIcon className="mr-2 h-4 w-4" /> Limpiar Filtros
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center text-muted-foreground py-10">Cargando cursos...</p>
        ) : filteredCursos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {filteredCursos.map(curso => (
              <CourseCard key={curso.id} curso={curso} />
            ))}
          </div>
        ) : (
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="font-semibold">No se encontraron cursos</AlertTitle>
            <AlertDescription>
              Actualmente no hay cursos que coincidan con tu búsqueda o filtros. Intenta con otros términos o vuelve más tarde.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}


    