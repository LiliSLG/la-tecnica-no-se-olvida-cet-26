// /src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Database } from "@/lib/supabase/types/database.types";

type Persona = Database['public']['Tables']['personas']['Row'];

const sidebarLinks = [
  { id: 'dashboard', href: "/admin", label: "Dashboard" },
  { id: 'people', href: "/admin/personas", label: "Comunidad" },
  { id: 'projects', href: "/admin/proyectos", label: "Proyectos" },
  { id: 'news', href: "#", label: "Noticias" },
  { id: 'histories', href: "#", label: "Historias Orales" },
  { id: 'organizations', href: "#", label: "Organizaciones" },
  { id: 'topics', href: "/admin/temas", label: "Temáticas" },
  { id: 'courses', href: "#", label: "Cursos" },
  { id: 'bolsa', href: "#", label: "Bolsa de Trabajo" },
  { id: 'settings', href: "#", label: "Configuración" },
];

interface AdminSidebarProps {
  user: Persona | null;
  onSignOut: () => Promise<void>;
}

export function AdminSidebar({ user, onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r bg-background md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            {/* Aquí podrías poner un logo */}
            <span className="">Panel Admin</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {sidebarLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === link.href && "bg-muted text-primary",
                  link.href === "#" && "cursor-not-allowed opacity-50"
                )}
                onClick={(e) => link.href === "#" && e.preventDefault()}
              >
                {link.label}
              </Link>
            ))}
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
              Cerrar Sesión
            </Button>
        </div>
      </div>
    </aside>
  );
}