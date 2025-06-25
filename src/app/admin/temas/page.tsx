"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { temasService } from "@/lib/supabase/services/temasService";
import { TemasListPage } from "@/components/admin/temas/TemasListPage";
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
        console.log("🔍 Client: Fetching temas, isAdmin:", isAdmin);

        const result = await temasService.getAll(isAdmin);

        if (result.success && result.data) {
          console.log("📊 Client: Loaded temas:", result.data.length);
          console.log(
            "📊 Client: Include deleted:",
            result.data.filter((t) => t.is_deleted).length
          );
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
