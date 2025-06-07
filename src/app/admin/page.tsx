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
      title: "Manage People",
      description: "Manage personas, their profiles, and related information",
      href: "/admin/gestion-personas",
      isActive: true
    },
    {
      title: "Manage Projects",
      description: "Manage projects and their details",
      href: "/admin/gestion-proyectos",
      isActive: true
    },
    {
      title: "Manage News",
      description: "Manage news articles and announcements",
      href: "/admin/gestion-noticias",
      isActive: true
    },
    {
      title: "Manage Oral Histories",
      description: "Manage oral history recordings and transcripts",
      href: "/admin/gestion-historias-orales",
      isActive: true
    },
    {
      title: "Manage Organizations",
      description: "Manage organizations and their details",
      href: "/admin/gestion-organizaciones",
      isActive: true
    },
    {
      title: "Manage Topics",
      description: "Manage topics and their relationships",
      href: "/admin/gestion-temas",
      isActive: true
    },
    {
      title: "Manage Courses",
      description: "Manage courses and their details",
      href: "/admin/gestion-cursos",
      isActive: true
    }
  ];

  const generalAdminSections = [
    {
      title: "Users & Roles",
      description: "To be completed",
      href: "#",
      isActive: false
    },
    {
      title: "Statistics",
      description: "To be completed",
      href: "#",
      isActive: false
    },
    {
      title: "Site Settings",
      description: "To be completed",
      href: "#",
      isActive: false
    },
    {
      title: "Logs / Audit",
      description: "To be completed",
      href: "#",
      isActive: false
    }
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Content Management</h2>
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
                    {section.isActive ? "Manage" : "Coming Soon"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">General Administration</h2>
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
                    {section.isActive ? "Manage" : "Coming Soon"}
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