// /src/components/admin/AdminSidebar.tsx - MEJORADO
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Database } from "@/lib/supabase/types/database.types";
import { MobileSidebar } from "./MobileSidebar";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Newspaper,
  BookOpen,
  Building,
  Tag,
  GraduationCap,
  Briefcase,
  Settings,
  LogOut,
  Home,
  ExternalLink,
} from "lucide-react";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

const sidebarLinks = [
  {
    id: "dashboard",
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "people",
    href: "/admin/personas",
    label: "Comunidad",
    icon: Users,
  },
  {
    id: "projects",
    href: "/admin/proyectos",
    label: "Proyectos",
    icon: FolderOpen,
  },
  {
    id: "news",
    href: "/admin/noticias",
    label: "Noticias",
    icon: Newspaper,
  },
  {
    id: "histories",
    href: "#",
    label: "Historias Orales",
    icon: BookOpen,
  },
  {
    id: "organizations",
    href: "/admin/organizaciones",
    label: "Organizaciones",
    icon: Building,
  },
  {
    id: "topics",
    href: "/admin/temas",
    label: "Temáticas",
    icon: Tag,
  },
  {
    id: "courses",
    href: "#",
    label: "Cursos",
    icon: GraduationCap,
  },
  {
    id: "bolsa",
    href: "#",
    label: "Bolsa de Trabajo",
    icon: Briefcase,
  },
  {
    id: "settings",
    href: "#",
    label: "Configuración",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  user: Persona | null;
  onSignOut: () => Promise<void>;
  // Nuevas props para mobile
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

  const handleLinkClick = (href: string) => {
    if (href === "#") return;
    onLinkClick?.(); // Cerrar mobile sidebar al navegar
  };

  return (
    <div className="flex h-full max-h-screen flex-col">
      {/* Header principal con nombre del sitio */}
      <div className="flex flex-col border-b px-4 py-4 lg:px-6">
        {/* Nombre del sitio */}
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-primary">
              La Técnica no se Olvida
            </h1>
            <p className="text-xs text-muted-foreground">
              Panel Administrativo
            </p>
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
      <div className="flex-1 pt-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.id}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === link.href && "bg-muted text-primary",
                  link.href === "#" && "cursor-not-allowed opacity-50"
                )}
                onClick={(e) => {
                  if (link.href === "#") {
                    e.preventDefault();
                  } else {
                    handleLinkClick(link.href);
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

      {/* Footer con info del usuario */}
      <div className="mt-auto p-4 border-t">
        <div className="text-sm font-medium text-muted-foreground mb-2 truncate">
          {user?.nombre && user?.apellido
            ? `${user.nombre} ${user.apellido}`
            : user?.email}
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
    </div>
  );
}

export function AdminSidebar({
  user,
  onSignOut,
  isMobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-background md:block">
        <SidebarContent user={user} onSignOut={onSignOut} />
      </aside>

      {/* Mobile Sidebar */}
      {onMobileClose && (
        <MobileSidebar
          isOpen={isMobileOpen}
          onClose={onMobileClose}
          user={user}
          onSignOut={onSignOut}
        />
      )}
    </>
  );
}
