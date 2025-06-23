// src/app/admin/temas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { temasService } from "@/lib/supabase/services/temasService";
import { TemasListPage } from "@/components/admin/temas/TemasListPage";
import { Database } from "@/lib/supabase/types/database.types";

type Tema = Database["public"]["Tables"]["temas"]["Row"];

export default function TemasPage() {
  const { isAdmin, isLoading } = useAuth(); // ✅ Usar isLoading en lugar de loading
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemas() {
      if (isLoading) return; // ✅ Esperar a que auth se resuelva

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
  }, [isAdmin, isLoading]); // ✅ Incluir isLoading en dependencias

  if (isLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Cargando temas...</div>
        </div>
      </div>
    );
  }

  return <TemasListPage allTemas={temas} />;
}
