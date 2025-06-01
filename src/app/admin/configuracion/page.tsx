
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Construction } from "lucide-react";

export default function AdminConfiguracionPage() {
  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-primary">Configuración General</h1>
        <p className="text-muted-foreground mt-1">Ajustes globales de la plataforma de administración.</p>
      </header>
      <Card className="border-dashed border-amber-500 bg-amber-50/50">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Construction className="h-8 w-8 text-amber-600" />
            <div>
                <CardTitle className="text-amber-700">Página en Construcción</CardTitle>
                <CardDescription className="text-amber-600">
                Las opciones de configuración general estarán disponibles próximamente.
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Desde esta sección podrás ajustar parámetros generales del sitio, configuraciones de correo,
            integraciones, y otros aspectos administrativos de la plataforma.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
