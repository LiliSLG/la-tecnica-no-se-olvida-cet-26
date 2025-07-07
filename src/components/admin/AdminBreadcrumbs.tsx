// /src/components/admin/AdminBreadcrumbs.tsx
"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Mapeo de rutas a nombres legibles
const routeMap: Record<string, string> = {
  admin: "Dashboard",
  comunidad: "Comunidad",
  proyectos: "Proyectos",
  noticias: "Noticias",
  temas: "Temáticas",
  organizaciones: "Organizaciones",
  new: "Nuevo",
  edit: "Editar",
  historias: "Historias Orales",
  cursos: "Cursos",
  bolsa: "Bolsa de Trabajo",
  configuracion: "Configuración",
};

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface AdminBreadcrumbsProps {
  /** Título personalizado para la página actual (ej: nombre del tema, proyecto, etc.) */
  customTitle?: string;
  /** Forzar mostrar breadcrumbs incluso en dashboard */
  forceShow?: boolean;
}

function generateBreadcrumbs(
  pathname: string,
  params: any,
  customTitle?: string
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Siempre empezar con Dashboard
  breadcrumbs.push({
    label: "Dashboard",
    href: "/admin",
    isActive: false,
  });

  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Saltar el primer segmento si es "admin" (ya lo agregamos)
    if (segment === "admin") continue;

    const isLast = i === segments.length - 1;

    // Si es un ID (solo números o uuid), necesitamos tratamiento especial
    if (/^[0-9a-f-]{36}$|^\d+$/.test(segment)) {
      const parentSegment = segments[i - 1];
      const entityName = routeMap[parentSegment] || parentSegment;

      // Asegurar que existe el enlace a la entidad principal
      const entityPath = currentPath.replace(`/${segment}`, "");
      const entityExists = breadcrumbs.some((b) => b.href === entityPath);

      if (!entityExists) {
        breadcrumbs.push({
          label: entityName,
          href: entityPath,
          isActive: false,
        });
      }

      // Usar título personalizado si está disponible, sino usar formato genérico
      const detailLabel = customTitle || `Ver ${entityName}`;

      breadcrumbs.push({
        label: detailLabel,
        href: isLast ? undefined : currentPath,
        isActive: isLast,
      });
      continue;
    }

    // Mapear el segmento a un nombre legible
    const label =
      routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      isActive: isLast,
    });
  }

  return breadcrumbs;
}

export function AdminBreadcrumbs({
  customTitle,
  forceShow = false,
}: AdminBreadcrumbsProps) {
  const pathname = usePathname();
  const params = useParams();

  // Solo mostrar breadcrumbs en rutas que no sean el dashboard principal (a menos que se fuerce)
  if (!forceShow && pathname === "/admin") {
    return null;
  }

  const breadcrumbs = generateBreadcrumbs(pathname, params, customTitle);

  // Si solo hay Dashboard, no mostrar nada (a menos que se fuerce)
  if (!forceShow && breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}

            {index === 0 && <Home className="h-4 w-4 mr-2" />}

            {item.href && !item.isActive ? (
              <Link
                href={item.href}
                className={cn(
                  "hover:text-foreground transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  item.isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
