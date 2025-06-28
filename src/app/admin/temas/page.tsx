// src/app/admin/temas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { temasService } from "@/lib/supabase/services/temasService";
import { TemasListPage } from "@/components/admin/temas/TemasListPage";
import { DataTableSkeleton } from "@/components/shared/data-tables/DataTableSkeleton";
import { Database } from "@/lib/supabase/types/database.types";

type Tema = Database["public"]["Tables"]["temas"]["Row"];

export default function TemasPage() {
  const { isAdmin, isLoading } = useAuth();
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemas() {
      if (isLoading) return;

      try {
        console.log("🔍 Fetching temas, isAdmin:", isAdmin);

        const result = await temasService.getAll(isAdmin);

        if (result.success && result.data) {
          console.log("📊 Server temas:", result.data.length);
          setTemas(result.data);
        } else {
          console.error("Error fetching temas:", result.error);
        }
      } catch (error) {
        console.error("Error in fetchTemas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemas();
  }, [isAdmin, isLoading]);

  // Show skeleton while loading
  if (isLoading || loading) {
    return (
      <DataTableSkeleton
        title="Gestión de Temáticas"
        addLabel="Nueva Temática"
        rows={6}
        columns={2}
      />
    );
  }

  return <TemasListPage allTemas={temas} />;
}
