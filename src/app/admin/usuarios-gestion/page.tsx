
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Construction, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminUsuariosGestionPage() {
  return (
    <div className="space-y-6">
      <header className="pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-primary">Gestión de Participantes (Anteriormente Usuarios)</h1>
        <p className="text-muted-foreground mt-1">La gestión de perfiles y roles de participantes se ha movido.</p>
      </header>
      <Card className="border-dashed border-blue-500 bg-blue-50/50">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
                <CardTitle className="text-blue-700">Sección Actualizada</CardTitle>
                <CardDescription className="text-blue-600">
                La gestión de usuarios ahora es "Gestión de Participantes" y se encuentra en una nueva ubicación.
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Desde la nueva sección "Gestión de Participantes" podrás visualizar todos los perfiles,
            modificar sus roles (incluyendo administradores), gestionar categorías, capacidades
            y otros detalles de los perfiles en la colección "personas".
          </p>
          <Button asChild>
            <Link href="/admin/gestion-participantes">
              Ir a Gestión de Participantes <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
