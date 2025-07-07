// /src/components/public/common/PublicHeader.tsx 
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
  DropdownMenuSubContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
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
  ChevronDown,
  Building,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Navegación principal unificada con submenu
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
  // Comunidad ahora es un submenu
  {
    href: "/red",
    label: "Nuestra red",
    icon: Users,
    public: true,
    submenu: [
      {
        href: "/comunidad",
        label: "Comunidad",
        icon: UserCheck,
        description: "Miembros de la comunidad",
      },
      {
        href: "/organizaciones",
        label: "Organizaciones",
        icon: Building,
        description: "Organizaciones colaboradoras",
      },
    ],
  },
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

  // Helper para determinar si una ruta está activa
  const isRouteActive = (href: string, submenu?: any[]) => {
    if (submenu) {
      // Para submenus, verificar si alguna subruta está activa
      return submenu.some((item) => pathname?.startsWith(item.href));
    }
    return pathname === href || (href !== "/" && pathname?.startsWith(href));
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
            const isActive = isRouteActive(item.href, item.submenu);

            // Si tiene submenu, renderizar dropdown
            if (item.submenu) {
              return (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-foreground/80",
                        isActive ? "text-foreground" : "text-foreground/60"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {item.submenu.map((subitem) => {
                      const SubIcon = subitem.icon;
                      return (
                        <DropdownMenuItem key={subitem.href} asChild>
                          <Link
                            href={subitem.href}
                            className="flex items-center gap-2 w-full"
                          >
                            <SubIcon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{subitem.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {subitem.description}
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            // Navegación normal sin submenu
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
                    const isActive = isRouteActive(item.href, item.submenu);

                    // Si tiene submenu, renderizar grupo expandido
                    if (item.submenu) {
                      return (
                        <div key={item.href} className="space-y-1">
                          {/* Header del grupo */}
                          <div
                            className={cn(
                              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>

                          {/* Subitems */}
                          <div className="ml-4 space-y-1">
                            {item.submenu.map((subitem) => {
                              const SubIcon = subitem.icon;
                              const isSubActive = pathname?.startsWith(
                                subitem.href
                              );

                              return (
                                <button
                                  key={subitem.href}
                                  onClick={() =>
                                    handleMobileNavClick(subitem.href)
                                  }
                                  className={cn(
                                    "flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                                    isSubActive
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-muted text-foreground"
                                  )}
                                >
                                  <SubIcon className="h-4 w-4" />
                                  <div className="text-left">
                                    <div className="font-medium">
                                      {subitem.label}
                                    </div>
                                    <div className="text-xs opacity-70">
                                      {subitem.description}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // Item normal sin submenu
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleMobileNavClick(item.href)}
                        className={cn(
                          "flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* User section in mobile */}
                {user && (
                  <>
                    <div className="border-t pt-6">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Mi Cuenta
                      </h4>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleMobileNavClick("/perfil")}
                          className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted text-foreground"
                        >
                          <User className="h-4 w-4" />
                          <span>Mi Perfil</span>
                        </button>

                        {needsDashboard && (
                          <button
                            onClick={() => handleMobileNavClick("/dashboard")}
                            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted text-foreground"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Mi Dashboard</span>
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleMobileNavClick(
                                isInAdminArea ? "/" : "/admin"
                              )
                            }
                            className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted text-foreground"
                          >
                            <Shield className="h-4 w-4" />
                            <span>
                              {isInAdminArea
                                ? "Salir del Admin"
                                : "Panel Admin"}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            closeMobileMenu();
                            handleSignOut();
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted text-foreground"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
