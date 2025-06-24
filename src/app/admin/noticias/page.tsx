// src/app/admin/noticias/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiasListPage } from "@/components/admin/noticias/NoticiasListPage";
import { Database } from "@/lib/supabase/types/database.types";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

export default function NoticiasPage() {
  const { isAdmin, isLoading } = useAuth();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticias() {
      // ✅ ARREGLO: Solo ejecutar cuando auth esté resuelto
      if (isLoading) return;
      // ✅ ARREGLO: Esperar si isAdmin aún es undefined
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
  }, [isAdmin, isLoading]); // ✅ Incluir ambas dependencias

  if (isLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Cargando noticias...
          </div>
        </div>
      </div>
    );
  }

  return <NoticiasListPage allNoticias={noticias} />;
}
