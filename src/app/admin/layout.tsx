'use client';

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

const sidebarLinks = [
  { id: 'dashboard', href: "/admin", label: "Dashboard" },
  { id: 'people', href: "/admin/gestion-personas", label: "Comunidad" },
  { id: 'projects', href: "#", label: "Proyectos" },
  { id: 'news', href: "#", label: "Noticias" },
  { id: 'histories', href: "#", label: "Historias Orales" },
  { id: 'organizations', href: "#", label: "Organizaciones" },
  { id: 'topics', href: "/admin/gestion-temas", label: "Temáticas" },
  { id: 'courses', href: "#", label: "Cursos" },
  { id: 'bolsa', href: "#", label: "Bolsa de Trabajo" },
  { id: 'settings', href: "#", label: "Configuración" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirectedFrom=/admin');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="h-16 border-b flex items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-lg font-semibold">Panel de administrador</div>
        </div>
      </header>

      <div className="flex">
        <aside 
          className={cn(
            "w-64 border-r p-4 bg-background flex flex-col justify-between",
            "fixed md:static inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
            "md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="space-y-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  "hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-200",
                  link.href === "#" && "opacity-50 cursor-not-allowed",
                  link.href === pathname && "bg-accent text-accent-foreground"
                )}
                aria-current={link.href === pathname ? "page" : undefined}
                aria-disabled={link.href === "#" ? "true" : undefined}
                role={link.href === "#" ? "link" : undefined}
                tabIndex={link.href === "#" ? -1 : undefined}
                onClick={(e) => {
                  if (link.href === "#") {
                    e.preventDefault();
                  }
                  setIsSidebarOpen(false);
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {user?.email}
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start text-sm"
            >
              Logout
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 