"use client";

import "@/app/globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function AdminDashboard() {
  const contentManagementSections = [
    {
      title: "Comunidad",
      //description: "Gestión de Comunidad",
      description: "Gestionar las personas que integran la comunidad: estudiantes, ex estudiantes, tutores, colaboradores, docentes e invitados.",
      href: "/admin/gestion-personas",
      isActive: true
    },
    {
      title: "Proyectos",
      //description: "Gestión de Proyectos",
      description: "Gestionar los proyectos desarrollados por la comunidad y sus participantes asociados.",
      href: "/admin/gestion-proyectos",
      isActive: false
    },
    {
      title: "Noticias",
      //description: "Gestión de Noticias",
      description: "Administrar las noticias y novedades que se mostrarán en la web",
      href: "/admin/gestion-noticias",
      isActive: false
    },
    {
      title: "Historias Orales",
      //description: "Gestión de Historias Orales",
      description: "Gestionar las historias orales y testimonios recopilados por la comunidad.",
      href: "/admin/gestion-historias-orales",
      isActive: false
    },
    {
      title: "Organizaciones Vinculadas",
      //description: "Gestión de Organizaciones Vinculadas",
      description: "Administrar las organizaciones que colaboran o se vinculan con la comunidad.",
      href: "/admin/gestion-organizaciones",
      isActive: false
    },
    {
      title: "Temáticas / Ejes",
      //description: "Gestión de Temáticas / Ejes",
      description: "Definir y gestionar las temáticas o ejes que estructuran los contenidos y proyectos de la comunidad.",
      href: "/admin/temas",
      isActive: true
    },
    {
      title: "Cursos",
      //description: "Gestión de Cursos",
      description: "Gestionar los cursos ofrecidos a los alumnos del CET, así como sus detalles y participantes.",
      href: "/admin/gestion-cursos",
      isActive: false
    },
    {
      title: "Bolsa de Trabajo",
      //description: "Gestión de Ofertas de trabajo",
      description: "Gestión de Ofertas de trabajo para los alumnos del CET",
      href: "/admin/gestion-ofertasTrabajo",
      isActive: false
    }
  ];

  const generalAdminSections = [
    {
      title: "Gestión de Usuarios y Roles",
      description: "A completar",
      href: "#",
      isActive: false
    },
    {
      title: "Estadísticas",
      description: "A completar",
      href: "#",
      isActive: false
    },
    {
      title: "Configuración del Sitio",
      description: "A completar",
      href: "#",
      isActive: false
    },
    {
      title: "Registros y Auditoría",
      description: "A completar",
      href: "#",
      isActive: false
    }
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Gestión de contenidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentManagementSections.map((section) => (
            <Card key={section.title} className="flex flex-col">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button
                  variant="default"
                  className="w-full"
                  asChild
                  disabled={!section.isActive}
                >
                  <Link href={section.href}>
                    {section.isActive ? "Gestionar" : "Próximamente"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4"> Administración General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generalAdminSections.map((section) => (
            <Card key={section.title} className="flex flex-col">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto">
                <Button
                  variant="default"
                  className="w-full"
                  asChild
                  disabled={!section.isActive}
                >
                  <Link href={section.href}>
                    {section.isActive ? "Gestionar" : "Próximamente"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
} 