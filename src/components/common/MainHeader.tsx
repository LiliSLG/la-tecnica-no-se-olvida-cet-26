"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/AuthProvider";
import { useProjectRoles } from "@/hooks/useProjectRoles";
import {
  User,
  Settings,
  LogOut,
  Shield,
  Menu,
  BookOpen,
  Users,
  Newspaper,
  FolderOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Definir rutas de navegación principales
const mainNavigation = [
  {
    href: "/proyectos",
    label: "Proyectos",
    icon: FolderOpen,
    public: true,
  },
  {
    href: "/noticias",
    label: "Noticias",
    icon: Newspaper,
    public: true,
  },
  {
    href: "/comunidad",
    label: "Comunidad",
    icon: Users,
    public: true,
  },
  {
    href: "/historias",
    label: "Historias",
    icon: BookOpen,
    public: true,
  },
];

interface MainHeaderProps {
  className?: string;
}

export function MainHeader({ className }: MainHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { hasActiveRoles, isLoading: rolesLoading } = useProjectRoles();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determinar si estamos en área admin
  const isInAdminArea = pathname?.startsWith("/admin");

  // Determinar si el usuario necesita dashboard
  const needsDashboard = user && (isAdmin || hasActiveRoles);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getUserInitials = (email: string | null) => {
    if (!email) return "??";
    return email.substring(0, 2).toUpperCase();
  };

  const handleMobileNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <header
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center px-6 lg:px-8">
        {/* Logo / Brand */}
        <div className="mr-6 hidden md:flex">
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              La Técnica no se Olvida
            </span>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="flex md:hidden mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-sm">La Técnica</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="mr-4 md:hidden">
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
                {mainNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleMobileNavClick(item.href)}
                      className={cn(
                        "flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm transition-colors",
                        pathname?.startsWith(item.href)
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
                        {isInAdminArea ? "Ir a Homepage" : "Panel Admin"}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}

              {/* Login/Register for anonymous users */}
              {!user && !isLoading && !rolesLoading && (
                <div className="space-y-1 border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Cuenta
                  </h4>

                  <button
                    onClick={() => handleMobileNavClick("/login")}
                    className="flex items-center justify-center w-full px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Iniciar Sesión
                  </button>

                  <button
                    onClick={() => handleMobileNavClick("/registro")}
                    className="flex items-center justify-center w-full px-3 py-2 rounded-md text-sm border border-input hover:bg-muted transition-colors"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80 flex items-center space-x-2 py-2",
                  pathname?.startsWith(item.href)
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Desktop User Menu */}
          {!isLoading && !rolesLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getUserInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.nombre || "Usuario"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => router.push("/perfil")}>
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </DropdownMenuItem>

                    {/* Si está en admin, mostrar Dashboard Usuario, si no, mostrar según permisos */}
                    {isInAdminArea ? (
                      <DropdownMenuItem
                        onClick={() => router.push("/dashboard")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard Usuario
                      </DropdownMenuItem>
                    ) : (
                      needsDashboard && (
                        <DropdownMenuItem
                          onClick={() => router.push("/dashboard")}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Mi Dashboard
                        </DropdownMenuItem>
                      )
                    )}

                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        {isInAdminArea ? (
                          <DropdownMenuItem onClick={() => router.push("/")}>
                            <Shield className="mr-2 h-4 w-4" />
                            Ir a Homepage
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => router.push("/admin")}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Panel Admin
                          </DropdownMenuItem>
                        )}
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/login")}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button size="sm" onClick={() => router.push("/registro")}>
                    Registrarse
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
