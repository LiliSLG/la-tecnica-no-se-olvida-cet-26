
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Globe, Layers, BarChart3, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function GoogleEarthEngineContent() {
  return (
    <div className="space-y-8">
      <header className="text-center py-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg shadow">
        <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-primary mb-2">Google Earth Engine en "La técnica no se olvida"</h1>
        <p className="text-lg text-foreground/80">Explorando el contexto geográfico y ecológico de nuestros proyectos.</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary"><Map className="h-6 w-6" /> ¿Qué es esta sección?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground/80">
          <p>
            Google Earth Engine (GEE) es una plataforma de análisis geoespacial a escala planetaria que nos permite visualizar y analizar
            imágenes satelitales, datos climáticos, topográficos y otra información geográfica.
          </p>
          <p>
            En "La técnica no se olvida", utilizaremos GEE para complementar el archivo de conocimiento técnico y rural. Esta sección
            mostrará mapas interactivos, visualizaciones de datos ambientales y análisis espaciales que ayudarán a
            comprender mejor el contexto de los proyectos de los estudiantes y las historias de la comunidad.
          </p>
          <p>
            Por ejemplo, podremos visualizar cambios en el uso del suelo, analizar la vegetación, monitorear cuerpos de agua
            o entender patrones climáticos relevantes para la región de Ingeniero Jacobacci y los proyectos desarrollados en el CET N°26.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg bg-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary"><Layers className="h-6 w-6" /> Próximas Visualizaciones</CardTitle>
          <CardDescription>Ejemplos de lo que podrás encontrar aquí (contenido en desarrollo).</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="border p-4 rounded-md bg-card shadow">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Mapa de uso de suelo placeholder" 
              data-ai-hint="land use map"
              width={600} 
              height={400} 
              className="rounded mb-2"
            />
            <h3 className="font-semibold text-lg text-primary/90">Mapa Interactivo de Uso de Suelo</h3>
            <p className="text-sm text-muted-foreground">Visualiza los diferentes tipos de cobertura terrestre en la región.</p>
          </div>
          <div className="border p-4 rounded-md bg-card shadow">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Visualización de datos climáticos placeholder" 
              data-ai-hint="climate data chart"
              width={600} 
              height={400} 
              className="rounded mb-2"
            />
            <h3 className="font-semibold text-lg text-primary/90">Análisis de Tendencias Climáticas</h3>
            <p className="text-sm text-muted-foreground">Observa patrones de precipitación y temperatura a lo largo del tiempo.</p>
          </div>
           <div className="border p-4 rounded-md bg-card shadow">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Mapa de NDVI placeholder" 
              data-ai-hint="vegetation index map"
              width={600} 
              height={400} 
              className="rounded mb-2"
            />
            <h3 className="font-semibold text-lg text-primary/90">Índice de Vegetación (NDVI)</h3>
            <p className="text-sm text-muted-foreground">Monitorea la salud y densidad de la vegetación.</p>
          </div>
           <div className="border p-4 rounded-md bg-card shadow">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Modelo digital de elevación placeholder" 
              data-ai-hint="elevation model terrain"
              width={600} 
              height={400} 
              className="rounded mb-2"
            />
            <h3 className="font-semibold text-lg text-primary/90">Modelo Digital de Elevación</h3>
            <p className="text-sm text-muted-foreground">Explora la topografía y el relieve del área de estudio.</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-6">
        <Card className="inline-block p-6 shadow-md bg-amber-50 border-amber-200">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
            <p className="text-amber-700 font-medium">
              Esta sección se encuentra en desarrollo. ¡Vuelve pronto para ver más contenido!
            </p>
          </div>
        </Card>
      </div>

      <div className="text-center py-6">
        <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="https://earthengine.google.com/" target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-5 w-5" /> Aprende más sobre Google Earth Engine
          </Link>
        </Button>
      </div>
    </div>
  );
}
