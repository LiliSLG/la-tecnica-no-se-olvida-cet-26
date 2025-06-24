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
      if (isAdmin === undefined) return;

      try {
        const result = await temasService.getAll();
        if (result.success && result.data) {
          setTemas(result.data);
        }
      } catch (error) {
        console.error("Error fetching temas:", error);
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
          <div className="text-sm text-muted-foreground">
            Cargando temáticas...
          </div>
        </div>
      </div>
    );
  }

  return <TemasListPage allTemas={temas} />;
}
