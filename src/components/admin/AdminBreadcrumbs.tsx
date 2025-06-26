// /src/components/admin/AdminBreadcrumbs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

// Mapeo de rutas a breadcrumbs
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  // Dashboard principal
  "/admin": [{ label: "Dashboard", href: "/admin", isActive: true }],

  // Noticias
  "/admin/noticias": [
    { label: "Dashboard", href: "/admin" },
    { label: "Noticias", href: "/admin/noticias", isActive: true },
  ],
  "/admin/noticias/new": [
    { label: "Dashboard", href: "/admin" },
    { label: "Noticias", href: "/admin/noticias" },
    { label: "Crear Nueva", isActive: true },
  ],

  // Proyectos
  "/admin/proyectos": [
    { label: "Dashboard", href: "/admin" },
    { label: "Proyectos", href: "/admin/proyectos", isActive: true },
  ],
  "/admin/proyectos/new": [
    { label: "Dashboard", href: "/admin" },
    { label: "Proyectos", href: "/admin/proyectos" },
    { label: "Crear Nuevo", isActive: true },
  ],

  // Personas/Comunidad
  "/admin/personas": [
    { label: "Dashboard", href: "/admin" },
    { label: "Comunidad", href: "/admin/personas", isActive: true },
  ],
  "/admin/personas/new": [
    { label: "Dashboard", href: "/admin" },
    { label: "Comunidad", href: "/admin/personas" },
    { label: "Crear Persona", isActive: true },
  ],

  // Temáticas
  "/admin/temas": [
    { label: "Dashboard", href: "/admin" },
    { label: "Temáticas", href: "/admin/temas", isActive: true },
  ],

  // Organizaciones
  "/admin/organizaciones": [
    { label: "Dashboard", href: "/admin" },
    { label: "Organizaciones", href: "/admin/organizaciones", isActive: true },
  ],
  "/admin/organizaciones/new": [
    { label: "Dashboard", href: "/admin" },
    { label: "Organizaciones", href: "/admin/organizaciones" },
    { label: "Crear Organización", isActive: true },
  ],
};

// Función para generar breadcrumbs dinámicos para rutas con parámetros
function getDynamicBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // Para rutas de edición: /admin/noticias/[id]/edit
  if (pathname.includes("/edit")) {
    const segments = pathname.split("/");
    const section = segments[2]; // noticias, proyectos, etc.
    const id = segments[3];

    return [
      { label: "Dashboard", href: "/admin" },
      { label: getSectionLabel(section), href: `/admin/${section}` },
      { label: `Editar ${getSectionLabel(section, true)}`, isActive: true },
    ];
  }

  // Para rutas de detalle: /admin/proyectos/[id]
  if (pathname.match(/\/admin\/\w+\/[^/]+$/)) {
    const segments = pathname.split("/");
    const section = segments[2];

    return [
      { label: "Dashboard", href: "/admin" },
      { label: getSectionLabel(section), href: `/admin/${section}` },
      { label: `Ver ${getSectionLabel(section, true)}`, isActive: true },
    ];
  }

  return [];
}

function getSectionLabel(section: string, singular = false): string {
  const labels: Record<string, { plural: string; singular: string }> = {
    noticias: { plural: "Noticias", singular: "Noticia" },
    proyectos: { plural: "Proyectos", singular: "Proyecto" },
    personas: { plural: "Comunidad", singular: "Persona" },
    temas: { plural: "Temáticas", singular: "Temática" },
    organizaciones: { plural: "Organizaciones", singular: "Organización" },
  };

  const label = labels[section];
  if (!label) return section;

  return singular ? label.singular : label.plural;
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  // Debug: vamos a ver qué está pasando
  console.log("🍞 AdminBreadcrumbs - pathname:", pathname);

  // Si no es una ruta admin, no mostrar breadcrumbs
  if (!pathname.startsWith("/admin")) {
    console.log("❌ No es ruta admin, no mostrando breadcrumbs");
    return null;
  }

  // Buscar breadcrumbs exactos primero
  let breadcrumbs = routeBreadcrumbs[pathname];
  console.log("🔍 Breadcrumbs exactos encontrados:", breadcrumbs);

  // Si no encuentra breadcrumbs exactos, generar dinámicos
  if (!breadcrumbs) {
    breadcrumbs = getDynamicBreadcrumbs(pathname);
    console.log("🔧 Breadcrumbs dinámicos generados:", breadcrumbs);
  }

  // Si aún no hay breadcrumbs, mostrar solo Dashboard
  if (!breadcrumbs || breadcrumbs.length === 0) {
    breadcrumbs = [{ label: "Dashboard", href: "/admin", isActive: true }];
    console.log("📌 Usando breadcrumbs por defecto:", breadcrumbs);
  }

  console.log("✅ Renderizando breadcrumbs:", breadcrumbs);

  return (
    <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-md mb-4">
      <p className="text-sm text-yellow-800 mb-2">
        🔧 DEBUG: Ruta actual: {pathname}
      </p>
      <nav
        className="flex items-center space-x-1 text-sm text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Home className="h-4 w-4" />

        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4" />

            {item.href && !item.isActive ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn("font-medium", item.isActive && "text-primary")}
              >
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
