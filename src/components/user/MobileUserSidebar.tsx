// /src/components/user/MobileUserSidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type Database } from "@/lib/supabase/types/database.types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  FolderOpen,
  User,
  Eye,
  BookOpen,
  Settings,
  LogOut,
  PlusCircle,
  GraduationCap,
} from "lucide-react";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

// Links para mobile (mismos que desktop)
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

interface MobileUserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: Persona | null;
  onSignOut: () => Promise<void>;
}

export function MobileUserSidebar({
  isOpen,
  onClose,
  user,
  onSignOut,
}: MobileUserSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    onClose(); // Cerrar sidebar al navegar
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <div className="text-left">
              <SheetTitle className="text-primary">
                La Técnica no se Olvida
              </SheetTitle>
              <SheetDescription>Mi Espacio Personal</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Navegación mobile */}
        <div className="mt-6 space-y-6">
          {/* Sección: Mi Contenido */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Mi Contenido
            </h3>
            <nav className="space-y-1">
              {contentLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                const isDisabled = link.disabled;

                return (
                  <Link
                    key={link.id}
                    href={isDisabled ? "#" : link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      isActive && "bg-muted text-primary",
                      isDisabled && "cursor-not-allowed opacity-50",
                      !isActive && !isDisabled && "text-muted-foreground"
                    )}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                      } else {
                        handleLinkClick();
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary bg-primary/5 border border-primary/20"
                  onClick={handleLinkClick}
                >
                  <PlusCircle className="h-4 w-4" />
                  Crear Proyecto
                </Link>
              )}
            </nav>
          </div>

          {/* Sección: Personal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Personal
            </h3>
            <nav className="space-y-1">
              {personalLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                const isDisabled = link.disabled;

                return (
                  <Link
                    key={link.id}
                    href={isDisabled ? "#" : link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      isActive && "bg-muted text-primary",
                      isDisabled && "cursor-not-allowed opacity-50",
                      !isActive && !isDisabled && "text-muted-foreground"
                    )}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                      } else {
                        handleLinkClick();
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
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Explorar
            </h3>
            <nav className="space-y-1">
              {exploreLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                const isDisabled = link.disabled;

                return (
                  <Link
                    key={link.id}
                    href={isDisabled ? "#" : link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      isActive && "bg-muted text-primary",
                      isDisabled && "cursor-not-allowed opacity-50",
                      !isActive && !isDisabled && "text-muted-foreground"
                    )}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                      } else {
                        handleLinkClick();
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
        <div className="absolute bottom-4 left-4 right-4 border-t pt-4">
          <div className="text-sm space-y-2 mb-3">
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
            className="w-full justify-start text-sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
