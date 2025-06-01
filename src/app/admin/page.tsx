
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FolderKanban, Users, BarChart3, Settings, MessageSquare, Building, PlusCircle, TagsIcon } from 'lucide-react';

export default function AdminDashboardPage() {
  const quickLinks = [
    { href: '/proyectos/nuevo', label: 'Crear Nuevo Proyecto', icon: PlusCircle, description: 'Registrar un nuevo proyecto técnico.' },
    { href: '/admin/proyectos-gestion', label: 'Gestionar Proyectos', icon: FolderKanban, description: 'Ver, editar y eliminar proyectos.' },
    { href: '/admin/entrevistas-gestion', label: 'Gestionar Entrevistas', icon: MessageSquare, description: 'Administrar historia oral.' },
    { href: '/admin/gestion-participantes', label: 'Gestionar Participantes', icon: Users, description: 'Administrar perfiles y roles.' },
    { href: '/admin/organizaciones-gestion', label: 'Gestionar Organizaciones', icon: Building, description: 'Organizaciones colaboradoras.' },
    { href: '/admin/gestion-temas', label: 'Gestionar Temas', icon: TagsIcon, description: 'Administrar categorías temáticas.' },
    { href: '/admin/estadisticas', label: 'Ver Estadísticas', icon: BarChart3, description: 'Visualizar datos de uso.' },
    { href: '/admin/configuracion', label: 'Configuración General', icon: Settings, description: 'Ajustes de la plataforma.' },
  ];

  return (
    <div className="space-y-8">
      <header className="pb-6 border-b border-border">
        <h1 className="text-4xl font-bold text-primary">Panel de Administración</h1>
        <p className="text-muted-foreground mt-1">Bienvenido al panel de control de "La técnica no se olvida".</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Navega directamente a las secciones más importantes o crea contenido nuevo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Button key={link.href} variant="outline" className="justify-start h-auto py-3 text-left" asChild>
              <Link href={link.href} className="flex items-center gap-3">
                <link.icon className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-medium">{link.label}</span>
                  {link.description && <p className="text-xs text-muted-foreground">{link.description}</p>}
                </div>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Placeholder for future dashboard widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Contenido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">(Próximamente: Número de proyectos, entrevistas, usuarios activos, etc.)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">(Próximamente: Últimas ediciones, nuevos registros, etc.)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
