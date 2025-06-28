// /src/components/public/common/PublicHeader.tsx - VERSIÓN COMPLETA
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useProjectRoles } from "@/hooks/useProjectRoles";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Menu,
  Home,
  Newspaper,
  FolderOpen,
  Users,
  BookOpen,
  BrainCircuit,
  LogIn,
  Settings,
  Shield,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Navegación principal unificada
const publicNavItems = [
  { href: "/", label: "Inicio", icon: Home, public: true },
  { href: "/noticias", label: "Noticias", icon: Newspaper, public: true },
  { href: "/proyectos", label: "Proyectos", icon: FolderOpen, public: true },
  {
    href: "/consulta-ia",
    label: "Consulta IA",
    icon: BrainCircuit,
    public: true,
  },
  { href: "/comunidad", label: "Comunidad", icon: Users, public: true },
  { href: "/historias", label: "Historias", icon: BookOpen, public: true },
];

export function PublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { hasActiveRoles, isLoading: rolesLoading } = useProjectRoles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determinar si estamos en área admin
  const isInAdminArea = pathname?.startsWith("/admin");

  // Determinar si el usuario necesita dashboard
  const needsDashboard = user && (isAdmin || hasActiveRoles);

  const getUserInitials = (email: string | null) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleMobileNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              CET
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-lg leading-tight">
              La Técnica no se Olvida
            </div>
            <div className="text-xs text-muted-foreground -mt-1">
              CET N°26 - Ing. Jacobacci
            </div>
          </div>
          <div className="sm:hidden">
            <div className="font-bold text-base">La Técnica</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {publicNavItems.map((item) => {
            // Mostrar solo rutas públicas, o todas si el usuario está logueado
            if (!item.public && !user) return null;

            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80",
                  isActive ? "text-foreground" : "text-foreground/60"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.nombre && user.apellido
                        ? `${user.nombre} ${user.apellido}`
                        : user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Perfil */}
                <DropdownMenuItem onClick={() => router.push("/perfil")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>

                {/* Dashboard según contexto */}
                {isInAdminArea ? (
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Dashboard Usuario</span>
                  </DropdownMenuItem>
                ) : (
                  needsDashboard && (
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Mi Dashboard</span>
                    </DropdownMenuItem>
                  )
                )}

                {/* Admin Panel */}
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={() => router.push(isInAdminArea ? "/" : "/admin")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>
                      {isInAdminArea ? "Salir del Admin" : "Panel Admin"}
                    </span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/login")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Ingresar
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left">Navegación</SheetTitle>
                <SheetDescription className="text-left">
                  Accede a todas las secciones de la plataforma
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Navigation Links */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Secciones
                  </h4>
                  {publicNavItems.map((item) => {
                    // Mostrar solo rutas públicas, o todas si el usuario está logueado
                    if (!item.public && !user) return null;

                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname?.startsWith(item.href));

                    return (
                      <button
                        key={item.href}
                        onClick={() => handleMobileNavClick(item.href)}
                        className={cn(
                          "flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* User Actions */}
                {user && (
                  <div className="space-y-1 border-t pt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Mi Cuenta
                    </h4>

                    <button
                      onClick={() => handleMobileNavClick("/perfil")}
                      className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Mi Perfil</span>
                    </button>

                    {/* Dashboard según contexto */}
                    {isInAdminArea ? (
                      <button
                        onClick={() => handleMobileNavClick("/dashboard")}
                        className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Dashboard Usuario</span>
                      </button>
                    ) : (
                      needsDashboard && (
                        <button
                          onClick={() => handleMobileNavClick("/dashboard")}
                          className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Mi Dashboard</span>
                        </button>
                      )
                    )}

                    {/* Admin Panel */}
                    {isAdmin && (
                      <button
                        onClick={() =>
                          handleMobileNavClick(isInAdminArea ? "/" : "/admin")
                        }
                        className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        <span>
                          {isInAdminArea ? "Salir del Admin" : "Panel Admin"}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* Login for non-authenticated users */}
                {!user && (
                  <div className="border-t pt-4">
                    <Button
                      onClick={() => handleMobileNavClick("/login")}
                      className="w-full"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Ingresar a la Plataforma
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
