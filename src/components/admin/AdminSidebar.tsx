
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderKanban, Users, Building, BarChart3, Settings, BookOpen, MessageSquare, TagsIcon, Newspaper } from 'lucide-react'; // Added Newspaper
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


const mainNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/proyectos-gestion', label: 'Proyectos', icon: FolderKanban },
  { href: '/admin/entrevistas-gestion', label: 'Entrevistas', icon: MessageSquare },
  { href: '/admin/gestion-participantes', label: 'Participantes', icon: Users }, 
  { href: '/admin/organizaciones-gestion', label: 'Organizaciones', icon: Building },
  { href: '/admin/gestion-temas', label: 'Temas', icon: TagsIcon }, 
  { href: '/admin/gestion-noticias', label: 'Noticias', icon: Newspaper }, 
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3 },
];

const settingsNavLinks = [
  { href: '/admin/configuracion', label: 'Configuración General', icon: Settings },
];

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};


export default function AdminSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-lg">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg text-sidebar-primary">
          <BookOpen className="h-6 w-6" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 text-sm font-medium">
        {mainNavLinks.map(link => <NavLink key={link.href} {...link} />)}
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-config" className="border-none">
            <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline [&[data-state=open]>svg]:text-sidebar-accent-foreground">
                <Settings className="h-4 w-4" />
                Configuración
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0 pl-7">
                <div className="flex flex-col gap-1">
                {settingsNavLinks.map(link => <NavLink key={link.href} {...link} />)}
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </nav>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <Link 
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
            <Home className="h-4 w-4" />
            Volver al Sitio Principal
        </Link>
      </div>
    </aside>
  );
}

    
