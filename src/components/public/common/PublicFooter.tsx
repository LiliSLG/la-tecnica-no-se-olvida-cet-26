// /src/components/public/common/PublicFooter.tsx
import Link from "next/link";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Información del CET */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  CET
                </span>
              </div>
              <div>
                <div className="font-bold">CET N°26</div>
                <div className="text-sm text-muted-foreground">
                  Ing. Jacobacci
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Centro de Educación Técnica preservando y compartiendo
              conocimiento rural y técnico de la Patagonia.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Ingeniero Jacobacci, Río Negro</span>
            </div>
          </div>

          {/* Enlaces de navegación */}
          <div className="space-y-4">
            <h4 className="font-semibold">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/noticias"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Noticias
                </Link>
              </li>
              <li>
                <Link
                  href="/proyectos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Proyectos
                </Link>
              </li>
              <li>
                <Link
                  href="/personas"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Comunidad
                </Link>
              </li>
              <li>
                <Link
                  href="/historias"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Historias Orales
                </Link>
              </li>
            </ul>
          </div>

          {/* Para la comunidad */}
          <div className="space-y-4">
            <h4 className="font-semibold">Comunidad</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Unirse a la comunidad
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Mi Dashboard
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">Crear proyectos</span>
              </li>
              <li>
                <span className="text-muted-foreground">
                  Compartir conocimiento
                </span>
              </li>
            </ul>
          </div>

          {/* Contacto y enlaces */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">info@cet26.edu.ar</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">(0294) XXX-XXXX</span>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Sitio oficial CET</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador y copyright */}
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} CET N°26 Ingeniero Jacobacci. Todos los derechos
            reservados.
          </div>
          <div className="text-sm text-muted-foreground">
            "La Técnica no se Olvida" - Preservando conocimiento rural
          </div>
        </div>
      </div>
    </footer>
  );
}
