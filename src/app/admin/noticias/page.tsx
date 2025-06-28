// src/app/admin/noticias/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiasListPage } from "@/components/shared/list-pages/NoticiasListPage";
import { AdminDataTableSkeleton } from "@/components/shared/data-tables/AdminDataTableSkeleton";
import { Database } from "@/lib/supabase/types/database.types";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

export default function NoticiasPage() {
  const { isAdmin, isLoading } = useAuth();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticias() {
      if (isLoading) return;
      if (isAdmin === undefined) return;

      try {
        console.log("🔍 Fetching noticias, isAdmin:", isAdmin);

        const result = await noticiasService.getAll(isAdmin);

        if (result.success && result.data) {
          console.log("📊 Server noticias:", result.data.length);
          setNoticias(result.data);
        } else {
          console.error("Error fetching noticias:", result.error);
        }
      } catch (error) {
        console.error("Error in fetchNoticias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, [isAdmin, isLoading]);

  // Show skeleton while loading
  if (isLoading || loading) {
    return (
      <AdminDataTableSkeleton
        title="Gestión de Noticias"
        addLabel="Nueva Noticia"
        rows={8}
        columns={4}
      />
    );
  }

  return <NoticiasListPage allNoticias={noticias} />;
}
