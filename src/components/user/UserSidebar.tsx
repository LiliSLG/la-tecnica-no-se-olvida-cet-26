// /src/components/user/UserSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Database } from "@/lib/supabase/types/database.types";
import { MobileUserSidebar } from "./MobileUserSidebar";
import {
  LayoutDashboard,
  Newspaper,
  FolderOpen,
  User,
  Eye,
  BookOpen,
  Settings,
  LogOut,
  Home,
  ExternalLink,
  GraduationCap,
  PlusCircle,
  Building,
} from "lucide-react";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

// Links específicos para usuarios
const userSidebarLinks = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Mi Dashboard",
    icon: LayoutDashboard,
    section: "personal",
  },
  {
    id: "mis-noticias",
    href: "/dashboard/noticias",
    label: "Mis Noticias",
    icon: Newspaper,
    section: "content",
  },
  {
    id: "mis-proyectos",
    href: "/dashboard/proyectos",
    label: "Mis Proyectos",
    icon: FolderOpen,
    section: "content",
  },
  {
    id: "mis-organizaciones",
    href: "/dashboard/organizaciones",
    label: "Mis Organizaciones",
    icon: Building,
    section: "content",
  },
  {
    id: "mi-perfil",
    href: "/dashboard/perfil",
    label: "Mi Perfil",
    icon: User,
    section: "personal",
  },
  {
    id: "explorar-noticias",
    href: "/noticias",
    label: "Noticias Comunidad",
    icon: Eye,
    section: "explore",
  },
  {
    id: "explorar-historias",
    href: "/historias",
    label: "Historias Orales",
    icon: BookOpen,
    section: "explore",
    disabled: true,
  },
  {
    id: "configuracion",
    href: "/dashboard/configuracion",
    label: "Configuración",
    icon: Settings,
    section: "personal",
    disabled: true,
  },
];

interface UserSidebarProps {
  user: Persona | null;
  onSignOut: () => Promise<void>;
  // Props para mobile
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({
  user,
  onSignOut,
  onLinkClick,
}: {
  user: Persona | null;
  onSignOut: () => Promise<void>;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();

  const handleLinkClick = (href: string, disabled?: boolean) => {
    if (disabled || href === "#") return;
    onLinkClick?.(); // Cerrar mobile sidebar al navegar
  };

  // Formatear categoría del usuario
  const formatCategoria = (categoria: string) => {
    const categorias: Record<string, string> = {
      estudiante_cet: "Estudiante CET",
      ex_alumno_cet: "Ex Alumno CET",
      docente_cet: "Docente CET",
      comunidad_activa: "Comunidad Activa",
      comunidad_general: "Comunidad General",
    };
    return categorias[categoria] || categoria;
  };

  // Verificar si puede crear proyectos
  const canCreateProjects = Boolean(
    user?.categoria_principal === "estudiante_cet" ||
      user?.categoria_principal === "ex_alumno_cet" ||
      user?.categoria_principal === "docente_cet"
  );

  // Agrupar links por sección
  const contentLinks = userSidebarLinks.filter(
    (link) => link.section === "content"
  );
  const personalLinks = userSidebarLinks.filter(
    (link) => link.section === "personal"
  );
  const exploreLinks = userSidebarLinks.filter(
    (link) => link.section === "explore"
  );

  return (
    <div className="flex h-full max-h-screen flex-col">
      {/* Header principal */}
      <div className="flex flex-col border-b px-4 py-4 lg:px-6">
        {/* Nombre del sitio */}
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-primary">
              La Técnica no se Olvida
            </h1>
            <p className="text-xs text-muted-foreground">Mi Espacio Personal</p>
          </div>
        </div>

        {/* Link para ir al sitio público */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
          onClick={() => handleLinkClick("/")}
        >
          <Home className="h-4 w-4" />
          <span>Ir al sitio</span>
          <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
        </Link>
      </div>

      {/* Navegación principal */}
      <div className="flex-1 pt-2 space-y-4">
        {/* Sección: Mi Contenido */}
        <div className="px-2 lg:px-4">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Mi Contenido
          </h3>
          <nav className="grid items-start text-sm font-medium">
            {contentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const isDisabled = link.disabled;

              return (
                <Link
                  key={link.id}
                  href={isDisabled ? "#" : link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive && "bg-muted text-primary",
                    isDisabled && "cursor-not-allowed opacity-50",
                    !isActive && !isDisabled && "text-muted-foreground"
                  )}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    } else {
                      handleLinkClick(link.href, isDisabled);
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}

            {/* Botón crear proyecto (condicional) */}
            {canCreateProjects && (
              <Link
                href="/proyectos/new"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary bg-primary/5 border border-primary/20"
                onClick={() => handleLinkClick("/proyectos/new")}
              >
                <PlusCircle className="h-4 w-4" />
                Crear Proyecto
              </Link>
            )}
          </nav>
        </div>

        {/* Sección: Personal */}
        <div className="px-2 lg:px-4">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Personal
          </h3>
          <nav className="grid items-start text-sm font-medium">
            {personalLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const isDisabled = link.disabled;

              return (
                <Link
                  key={link.id}
                  href={isDisabled ? "#" : link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive && "bg-muted text-primary",
                    isDisabled && "cursor-not-allowed opacity-50",
                    !isActive && !isDisabled && "text-muted-foreground"
                  )}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    } else {
                      handleLinkClick(link.href, isDisabled);
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sección: Explorar */}
        <div className="px-2 lg:px-4">
          <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Explorar
          </h3>
          <nav className="grid items-start text-sm font-medium">
            {exploreLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const isDisabled = link.disabled;

              return (
                <Link
                  key={link.id}
                  href={isDisabled ? "#" : link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive && "bg-muted text-primary",
                    isDisabled && "cursor-not-allowed opacity-50",
                    !isActive && !isDisabled && "text-muted-foreground"
                  )}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    } else {
                      handleLinkClick(link.href, isDisabled);
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer con info del usuario */}
      <div className="mt-auto p-4 border-t">
        <div className="text-sm space-y-2">
          {/* Nombre del usuario */}
          <div className="font-medium text-muted-foreground truncate">
            {user?.nombre && user?.apellido
              ? `${user.nombre} ${user.apellido}`
              : user?.email}
          </div>

          {/* Categoría del usuario */}
          {user?.categoria_principal && (
            <div className="text-xs text-muted-foreground truncate">
              {formatCategoria(user.categoria_principal)}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          onClick={onSignOut}
          className="w-full justify-start text-sm mt-3"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}

export function UserSidebar({
  user,
  onSignOut,
  isMobileOpen = false,
  onMobileClose,
}: UserSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-background md:block">
        <SidebarContent user={user} onSignOut={onSignOut} />
      </aside>

      {/* Mobile Sidebar */}
      {onMobileClose && (
        <MobileUserSidebar
          isOpen={isMobileOpen}
          onClose={onMobileClose}
          user={user}
          onSignOut={onSignOut}
        />
      )}
    </>
  );
}
