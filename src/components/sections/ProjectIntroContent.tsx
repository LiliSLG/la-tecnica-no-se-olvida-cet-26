
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Archive, BookOpen, Lightbulb, ArrowRight, Building, Handshake, Briefcase, BookCopy, MapPin } from 'lucide-react';
import type { Curso, NivelCurso } from '@/lib/types'; 
import CourseCard from '@/components/cards/CourseCard'; 

// Seleccionamos algunos cursos para mostrar en la homepage, incluyendo uno de la municipalidad y el nuevo de la cooperativa de agua.
const homepageMockCursos: Curso[] = [
  {
    id: 'c6', // Curso de la Municipalidad
    titulo: 'Gestión de Emprendimientos Productivos Locales (Municipalidad de Jacobacci)',
    descripcionCorta: 'Herramientas y estrategias para iniciar y gestionar emprendimientos productivos en el ámbito local.',
    instructor: 'Área de Producción, Municipalidad de Ing. Jacobacci',
    imagenURL: 'https://placehold.co/600x400.png?text=Emprendimientos',
    dataAiHint: "local business startup",
    duracion: '6 semanas',
    nivel: 'todos',
    linkMasInfo: '/cursos', 
    temas: ['Emprendedurismo', 'Desarrollo Local', 'Gestión'],
    fechaInicio: '2024-09-10',
    modalidad: 'presencial',
    puntosOtorgados: 180,
  },
  {
    id: 'c2', // Curso de INTA
    titulo: 'Manejo Sanitario Ovino (INTA)',
    descripcionCorta: 'Curso intensivo sobre prevención y tratamiento de enfermedades en ovinos, ofrecido por INTA.',
    instructor: 'Equipo Técnico INTA Jacobacci',
    imagenURL: 'https://placehold.co/600x400.png?text=Ganaderia+Ovina',
    dataAiHint: "sheep farming veterinary",
    duracion: '20 horas',
    nivel: 'intermedio',
    linkMasInfo: '/cursos',
    temas: ['Sanidad Animal', 'Producción Ovina'],
    modalidad: 'presencial',
    puntosOtorgados: 150,
  },
  {
    id: 'c5', // Curso de la Cooperativa de Agua
    titulo: 'Uso Eficiente y Sostenible del Agua (Cooperativa de Agua Jacobacci)',
    descripcionCorta: 'Aprende técnicas para el ahorro de agua en el hogar y en la producción, y la importancia de este recurso vital.',
    instructor: 'Equipo Técnico, Cooperativa de Agua de Jacobacci',
    imagenURL: 'https://placehold.co/600x400.png?text=Agua+Sostenible',
    dataAiHint: "water conservation sustainable",
    duracion: '3 talleres',
    nivel: 'todos',
    linkMasInfo: '/cursos',
    temas: ['Recursos Hídricos', 'Sostenibilidad', 'Consumo Responsable'],
    modalidad: 'presencial',
    puntosOtorgados: 100,
  }
];


export default function ProjectIntroContent() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl shadow-lg">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-extrabold text-primary mb-6">
          Bienvenidos a <br></br>
          <b>"La técnica no se olvida"</b>
          </h1>
          <h3 className="text-3xl text-primary mb-6">
          CET N°26 de Ingeniero Jacobacci
          </h3>
          <p className="text-xl text-foreground/80 mb-2 max-w-3xl mx-auto">
          Estamos construyendo, junto a estudiantes y docentes, una inteligencia artificial que pondrá en valor los proyectos y saberes rurales del CET N°26.<br></br>
          Un proyecto para preservar y compartir la historia, el conocimiento técnico y la cultura de nuestra comunidad.          </p>
        </div>
      </section>

      <section className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-primary mb-10">Nuestros Objetivos</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Archive className="h-6 w-6" /> Preservar Proyectos
              </CardTitle>
              <CardDescription>Catalogar y dar visibilidad a los innovadores proyectos técnicos de nuestros estudiantes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Desde soluciones agrícolas hasta desarrollos tecnológicos, cada proyecto es un testimonio del ingenio local.</p>
              <Button asChild size="lg" className="mt-4 w-full shadow-md hover:shadow-lg transition-shadow">
              <Link href="/proyectos">
                Explorar Proyectos <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="h-6 w-6" /> Compartir Sabiduría Rural
              </CardTitle>
              <CardDescription>Recopilar y difundir las valiosas experiencias y conocimientos de las familias rurales.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>A través de entrevistas, capturamos la riqueza cultural y las tradiciones de nuestra comunidad.</p>
              <Button asChild size="lg" className="mt-4 w-full shadow-md hover:shadow-lg transition-shadow">
              <Link href="/interviews">
                Escuchar Historias <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BookOpen className="h-6 w-6" /> Potenciar el Acceso con IA
              </CardTitle>
              <CardDescription>
              Usar inteligencia artificial para facilitar la consulta de proyectos, entrevistas y saberes rurales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
              Nuestra IA convierte este archivo en un recurso vivo e interactivo para estudiantes, docentes y la comunidad.
              </p>
              <Button asChild size="lg" className="mt-4 w-full shadow-md hover:shadow-lg transition-shadow">
              <Link href="/ai-kb">
                Consultar a la IA <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="container mx-auto px-6 py-10 bg-card rounded-xl shadow-lg">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2">
             <Image
              src="https://placehold.co/600x400.png"
              alt="Estudiantes del CET N°26 colaborando"
              data-ai-hint="students collaboration education"
              width={600}
              height={400}
              className="rounded-lg shadow-md object-cover"
            />
          </div>
          <div className="lg:w-1/2 space-y-4">
            <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Building className="h-8 w-8" /> El Corazón del Proyecto: CET N°26
            </h2>
            <p className="text-foreground/80">
              "La técnica no se olvida" es un proyecto que nace en el Centro de Educación Técnica N°26 de Ingeniero Jacobacci.
              Impulsado por sus estudiantes y docentes, busca ser un puente entre el conocimiento técnico generado en sus aulas
              y la invaluable sabiduría de la comunidad rural.
            </p>
            <Button asChild variant="default" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
              <Link href="/cet-26">
                Conocer más sobre el CET N°26 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

       <section className="container mx-auto px-6 py-10">
        <Card className="shadow-xl overflow-hidden bg-gradient-to-r from-accent/10 to-primary/10">
          <div className="md:flex items-center">
            <div className="md:w-2/5 p-6 flex justify-center">
              <Image
                src="https://placehold.co/400x300.png"
                alt="Red de colaboración y mentoría"
                data-ai-hint="mentorship guidance network"
                width={400}
                height={300}
                className="rounded-lg shadow-md object-cover"
              />
            </div>
            <div className="md:w-3/5 p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-3xl text-primary flex items-center gap-2">
                  <Handshake className="h-8 w-8" />
                  Conocé la Red de Tutores y Acompañantes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <p className="text-foreground/80">
                  Descubrí a las personas e instituciones dispuestas a compartir su conocimiento y experiencia para impulsar los proyectos técnicos de nuestra comunidad educativa.
                </p>
                <Button asChild variant="default" size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90">
                  <Link href="/red-de-tutores">
                    Explorar la Red <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </div>
          </div>
        </Card>
      </section>

      <section className="container mx-auto px-6 py-10 bg-card rounded-xl shadow-lg">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                <BookCopy className="h-8 w-8" />
                Descubrí Cursos y Capacitaciones
            </h2>
            <p className="text-lg text-foreground/80 mt-3 max-w-2xl mx-auto">
                Amplía tus conocimientos con formaciones ofrecidas por el CET N°26, la Municipalidad, cooperativas y otras organizaciones de nuestra comunidad.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {homepageMockCursos.map(curso => (
              <CourseCard key={curso.id} curso={curso} />
            ))}
        </div>
        <div className="text-center mt-10">
            <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                <Link href="/cursos">
                    Ver Todos los Cursos <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <Card className="shadow-xl overflow-hidden bg-gradient-to-r from-primary/5 via-background to-accent/5">
          <div className="md:flex items-center flex-row-reverse"> 
            <div className="md:w-2/5 p-6 flex justify-center">
              <Image
                src="https://placehold.co/400x300.png" 
                alt="Oportunidades laborales y profesionales"
                data-ai-hint="job opportunities career"
                width={400}
                height={300}
                className="rounded-lg shadow-md object-cover"
              />
            </div>
            <div className="md:w-3/5 p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-3xl text-primary flex items-center gap-2">
                  <Briefcase className="h-8 w-8" />
                  Descubrí Oportunidades Laborales
                </CardTitle>            <Button asChild variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
              <Link href="/interviews">
                Escuchar Historias <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <p className="text-foreground/80">
                  Explora nuestra Bolsa de Trabajo para encontrar pasantías, ofertas laborales y proyectos freelance relacionados con las especialidades técnicas y el ámbito rural.
                </p>
                <Button asChild variant="default" size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90">
                  <Link href="/bolsa-de-trabajo">
                    Explorar Bolsa de Trabajo <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </div>
          </div>
        </Card>
      </section>

      <section className="text-center py-12">
        <h2 className="text-3xl font-bold text-primary mb-6">¿Querés saber más? Preguntale a nuestra IA</h2>
        <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
        Podés consultarla para descubrir ideas de proyectos, aprender saberes rurales, o conocer la historia y el presente de nuestra escuela y su comunidad.        </p>
        <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/ai-kb">
            Consultar a la IA <Lightbulb className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
