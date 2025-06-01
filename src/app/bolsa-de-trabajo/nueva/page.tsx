
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Construction } from "lucide-react";

export default function CreateJobOfferPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <header className="text-center py-8">
        <Briefcase className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-primary mb-2">Publicar Nueva Oferta de Trabajo</h1>
        <p className="text-lg text-foreground/80">Comparte una oportunidad con nuestra comunidad.</p>
      </header>

      <Card className="max-w-2xl mx-auto border-dashed border-amber-500 bg-amber-50/50">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <Construction className="h-8 w-8 text-amber-600" />
          <div>
            <CardTitle className="text-amber-700">Página en Construcción</CardTitle>
            <CardDescription className="text-amber-600">
              El formulario para publicar nuevas ofertas de trabajo estará disponible próximamente.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Aquí podrás completar los detalles de tu oferta laboral para que sea visible en nuestra bolsa de trabajo.
            ¡Gracias por tu interés en conectar con los talentos del CET N°26 y la región!
          </p>
          <Button variant="outline" asChild>
            <Link href="/bolsa-de-trabajo">
              Volver al Listado de Ofertas
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
