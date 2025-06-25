// REEMPLAZAR COMPLETO: /src/app/admin/noticias/page.tsx
// ===================================================

import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiasListPage } from "@/components/admin/noticias/NoticiasListPage";

export default async function NoticiasPage() {
  console.log("🔍 Server: Loading noticias with author data");

  // 🔄 CAMBIO: Usar el nuevo método con JOIN
  const result = await noticiasService.getAllWithAuthor(true);

  if (!result.success) {
    console.error("❌ Server: Error loading noticias:", result.error);
    return (
      <div className="p-6">
        <div className="text-red-600">
          Error cargando noticias: {result.error?.message}
        </div>
      </div>
    );
  }

  const noticias = result.data || [];
  console.log("📊 Server: Loaded noticias with authors:", noticias.length);

  return <NoticiasListPage allNoticias={noticias} />;
}
