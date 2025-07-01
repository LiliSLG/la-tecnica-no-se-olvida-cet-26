// src/app/admin/organizaciones/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { OrganizacionForm } from "@/components/admin/organizaciones/OrganizacionForm";
import { DataTableSkeleton } from "@/components/shared/data-tables/DataTableSkeleton";

export default function NewOrganizacionPage() {
  const { isAdmin, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  // Loading state
  if (isLoading || loading) {
    return (
      <DataTableSkeleton
        title="Nueva Organización"
        addLabel=""
        rows={8}
        columns={2}
      />
    );
  }

  // No admin access
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <OrganizacionForm redirectPath="/admin/organizaciones" />
    </div>
  );
}
