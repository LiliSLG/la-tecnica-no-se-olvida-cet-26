// /src/components/admin/MobileSidebar.tsx
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
} from "lucide-react";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

// Links sin Dashboard (ya está en el header)
const sidebarLinks = [
  {
    id: "people",
    href: "/admin/comunidad",
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: Persona | null;
  onSignOut: () => Promise<void>;
}

export function MobileSidebar({
  isOpen,
  onClose,
  user,
  onSignOut,
}: MobileSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = (href: string) => {
    if (href === "#") return;
    onClose(); // Cerrar el sheet al navegar
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="p-0 w-[280px]">
        <SheetHeader className="sr-only">
          <SheetTitle>Panel de Navegación</SheetTitle>
          <SheetDescription>
            Navegación principal del panel administrativo
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col">
          {/* Header simplificado - sin Dashboard duplicado */}
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-semibold"
              onClick={() => handleLinkClick("/admin")}
            >
              <span>Panel Admin</span>
            </Link>
          </div>

          {/* Links de navegación */}
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4">
              {sidebarLinks.map((link) => {
                const IconComponent = link.icon;
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
                    <IconComponent className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer con info del usuario */}
          <div className="mt-auto p-4 border-t">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {user?.email}
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
      </SheetContent>
    </Sheet>
  );
}
