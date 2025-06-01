
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Construction } from "lucide-react";

export default function AdminEstadisticasPage() {
  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-primary">Estadísticas</h1>
        <p className="text-muted-foreground mt-1">Visualiza datos y métricas de uso de la plataforma.</p>
      </header>
      <Card className="border-dashed border-amber-500 bg-amber-50/50">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Construction className="h-8 w-8 text-amber-600" />
            <div>
                <CardTitle className="text-amber-700">Página en Construcción</CardTitle>
                <CardDescription className="text-amber-600">
                Esta funcionalidad para visualizar estadísticas estará disponible próximamente.
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Próximamente, aquí encontrarás gráficos y datos sobre el número de proyectos, usuarios activos,
            visitas a páginas, y otras métricas relevantes para entender el impacto y uso de la plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
