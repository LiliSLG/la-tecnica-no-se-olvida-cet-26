"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  School,
  Users,
  Lightbulb,
  LogIn,
  LogOut,
  Info,
  Menu,
  Building,
  LayoutDashboard,
  Compass,
  ChevronDown,
  Handshake,
  FileText,
  Briefcase,
  Users2,
  BookCopy,
  MapPin,
  Loader2,
  Newspaper, 
  MessageCircle // Icono para Historia Oral (Entrevistas)
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Persona } from '@/lib/types/persona';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const personasService = new PersonasService();

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-2 flex-shrink-0">
    <School className="h-10 w-10 text-primary" data-ai-hint="app logo placeholder" />
    <div className="leading-tight">
      <span className="block text-primary font-bold">La técnica</span>
      <span className="block text-primary">no se olvida</span>
    </div>
  </Link>
);

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  onLinkClick?: () => void;
  className?: string;
}

const NavLink = ({ href, children, icon, onLinkClick, className: propClassName }: NavLinkProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pathname) {
      const active = href === '/' ? pathname === href : pathname.startsWith(href);
      setIsActive(active);
    } else {
      setIsActive(false);
    }
  }, [mounted, pathname, href]);

  return (
    <Link
      href={href}
      onClick={onLinkClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
        isActive && mounted ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent/50 hover:text-accent-foreground",
        propClassName
      )}
    >
      {icon}
      {children}
    </Link>
  );
};

const exploreLinksRaw = [
  { href: "/proyectos", icon: <FileText className="h-4 w-4" />, text: "Proyectos Técnicos" },
  { href: "/explorar/historia-oral", icon: <MessageCircle className="h-4 w-4" />, text: "Historia Oral" },
  { href: "/cursos", icon: <BookCopy className="h-4 w-4" />, text: "Cursos y Capacitaciones" },
  { href: "/red-de-tutores", icon: <Handshake className="h-4 w-4" />, text: "Red de Tutores" },
  { href: "/explorar/red-egresados-cet26", icon: <Users2 className="h-4 w-4" />, text: "Red de Egresados CET26" },
  { href: "/bolsa-de-trabajo", icon: <Briefcase className="h-4 w-4" />, text: "Bolsa de Trabajo" },
];

const ExploreDropdown = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isTriggerActive, setIsTriggerActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pathname) {
      const active = exploreLinksRaw.some(link => pathname.startsWith(link.href));
      setIsTriggerActive(active);
    } else {
      setIsTriggerActive(false);
    }
  }, [mounted, pathname]);

  // Always render DropdownMenu root and trigger for Radix context stability
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors select-none whitespace-nowrap",
            isTriggerActive && mounted ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent/50 hover:text-accent-foreground",
            "focus-visible:ring-0 focus-visible:ring-offset-0"
          )}
        >
          <Compass className="h-4 w-4" />
          Explorar
          <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      {mounted && ( // Conditionally render content only after mount
        <DropdownMenuContent align="start" className="w-64">
          {exploreLinksRaw.map(link => (
            <DropdownMenuItem key={link.href} asChild className="cursor-pointer p-0">
              <NavLink href={link.href} icon={link.icon}>
                {link.text}
              </NavLink>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

const ExploreAccordion = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isTriggerActive, setIsTriggerActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pathname) {
      const active = exploreLinksRaw.some(link => pathname.startsWith(link.href));
      setIsTriggerActive(active);
    } else {
      setIsTriggerActive(false);
    }
  }, [mounted, pathname]);

  // Always render Accordion root and trigger for Radix context stability
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-explore" className="border-none">
        <AccordionTrigger className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors w-full text-left hover:no-underline whitespace-nowrap",
           isTriggerActive && mounted ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-accent/50 hover:text-accent-foreground"
        )}>
          <Compass className="h-4 w-4" />
          Explorar Contenido
        </AccordionTrigger>
        {mounted && ( // Conditionally render content only after mount
          <AccordionContent className="pt-0.5 pb-0 pl-7">
            <div className="flex flex-col gap-0.5">
              {exploreLinksRaw.map(link => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  icon={link.icon}
                  onLinkClick={onLinkClick}
                  className="py-1.5"
                >
                  {link.text}
                </NavLink>
              ))}
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    </Accordion>
  );
};


interface NavLinksListProps {
  userLoggedIn: boolean;
  onLinkClick?: () => void;
}

const NavLinksList = ({ userLoggedIn, onLinkClick }: NavLinksListProps) => {
  const [internalMounted, setInternalMounted] = useState(false);
  const { toast } = useToast();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setInternalMounted(true);
    loadPersona();
  }, []);

  const loadPersona = async () => {
    try {
      setLoading(true);
      const result = await personasService.getCurrentUser();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setPersona(result.data);
    } catch (error) {
      console.error('Error loading current user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del usuario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await personasService.logout();
      if (result.error) {
        throw new Error(result.error.message);
      }
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión',
        variant: 'destructive',
      });
    }
  };

  const baseLinks = [
    { href: "/cet-26", icon: <Building className="h-4 w-4" />, text: "El CET 26" },
  ];

  const secondaryLinks = [
    { href: "/ai-kb", icon: <Lightbulb className="h-4 w-4" />, text: "Consultas IA" },
    { href: "/noticias", icon: <Newspaper className="h-4 w-4" />, text: "Noticias" }, 
    { href: "/about-us", icon: <Info className="h-4 w-4" />, text: "Nosotros" },
  ];

  const panelLink = { href: "/management-panel", icon: <LayoutDashboard className="h-4 w-4" />, text: "Panel" };

  if (!internalMounted) {
    return null;
  }

  if (onLinkClick) { // Mobile view (inside Sheet)
    return (
      <nav className="flex flex-col gap-1 p-4">
        {baseLinks.map(link => (
            <NavLink key={link.href} href={link.href} icon={link.icon} onLinkClick={onLinkClick} className="w-full text-left py-1.5">
              {link.text}
            </NavLink>
        ))}
        <ExploreAccordion onLinkClick={onLinkClick} />
        {secondaryLinks.map(link => (
            <NavLink key={link.href} href={link.href} icon={link.icon} onLinkClick={onLinkClick} className="w-full text-left py-1.5">
              {link.text}
            </NavLink>
        ))}
        {userLoggedIn && (
          <NavLink href={panelLink.href} icon={panelLink.icon} onLinkClick={onLinkClick} className="w-full text-left py-1.5">
            {panelLink.text}
          </NavLink>
        )}
      </nav>
    );
  }

  // Desktop view
  return (
    <div className={cn("hidden md:flex flex-1 min-w-0 items-center justify-center flex-wrap gap-x-1 lg:gap-x-2")}>
      {baseLinks.map(link => (
        <NavLink key={link.href} href={link.href} icon={link.icon}>
          {link.text}
        </NavLink>
      ))}
      <ExploreDropdown />
      {secondaryLinks.map(link => (
        <NavLink key={link.href} href={link.href} icon={link.icon}>
          {link.text}
        </NavLink>
      ))}
      {userLoggedIn && (
        <NavLink href={panelLink.href} icon={panelLink.icon}>
          {panelLink.text}
        </NavLink>
      )}
    </div>
  );
};

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const handleAuthAction = () => {
    setMobileSheetOpen(false);
    if (user) {
      signOut();
    } else {
      router.push('/login');
    }
  };

  return (
    <nav className="bg-card shadow-md sticky top-0 z-50" style={{ '--navbar-height': '60px' } as React.CSSProperties}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo />
          <NavLinksList
            userLoggedIn={!loading && !!user}
          />
          <div className="flex items-center flex-shrink-0"> {/* Auth buttons area */}
            {loading ? (
              <Button variant="outline" size="icon" disabled aria-label="Cargando">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Hola, {user.displayName?.split(' ')[0] || 'Usuario'}</span>
                <Button variant="outline" size="icon" onClick={handleAuthAction} aria-label="Salir">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm" onClick={handleAuthAction}>
                <LogIn className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Ingresar</span>
              </Button>
            )}
            <div className="md:hidden ml-2">
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle><Logo /></SheetTitle>
                  </SheetHeader>
                  <NavLinksList
                    userLoggedIn={!loading && !!user}
                    onLinkClick={() => setMobileSheetOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

    