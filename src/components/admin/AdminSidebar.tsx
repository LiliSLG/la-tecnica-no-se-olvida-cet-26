// /src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { type Database } from "@/lib/supabase/types/database.types";
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
    href: "#",
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
    onLinkClick?.();
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-semibold"
          onClick={() => handleLinkClick("/admin")}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="flex-1">
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
  );
}

export function AdminSidebar({ user, onSignOut }: AdminSidebarProps) {
  return (
    <aside className="hidden border-r bg-background md:block">
      <SidebarContent user={user} onSignOut={onSignOut} />
    </aside>
  );
}
