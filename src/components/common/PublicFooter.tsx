// /src/components/common/PublicFooter.tsx
import Link from "next/link";
import { Mail, MapPin, Phone, Github, Facebook, Instagram } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Inicio", href: "/" },
    { label: "Proyectos", href: "/proyectos" },
    { label: "Noticias", href: "/noticias" },
    { label: "Comunidad", href: "/comunidad" },
    { label: "Historias", href: "/historias" },
  ];

  const aboutLinks = [
    { label: "Nuestra Historia", href: "/historia" },
    { label: "Qué es el CET", href: "/que-es-cet" },
    { label: "Contacto", href: "/contacto" },
    { label: "Colaborar", href: "/colaborar" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Github, href: "https://github.com/tu-repo", label: "GitHub" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre el proyecto */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">
              La Técnica no se Olvida
            </h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              Plataforma digital para preservar y compartir el conocimiento
              rural y los proyectos técnicos de los estudiantes del CET N°26 de
              Ingeniero Jacobacci, Río Negro.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>Ingeniero Jacobacci, Río Negro, Argentina</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>info@latecnicanoseolvida.edu.ar</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>+54 (2944) 498-XXX</span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="font-semibold text-white mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sobre nosotros */}
          <div>
            <h4 className="font-semibold text-white mb-4">Sobre Nosotros</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-sm text-slate-500">
            © {currentYear} CET N°26 Ingeniero Jacobacci. Todos los derechos
            reservados.
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Síguenos:</span>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="text-slate-500 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <IconComponent className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            Este proyecto es desarrollado con 💚 por la comunidad del CET N°26
            para preservar nuestro conocimiento técnico y rural.
          </p>
        </div>
      </div>
    </footer>
  );
}
