"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersonasService } from "@/lib/supabase/services/personasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Database } from "@/lib/supabase/types/database.types";

type Persona = Database['public']['Tables']['personas']['Row'];

const personasService = new PersonasService(supabase);

export default function PersonasListPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const result = await personasService.getAll();
        if (!result.success) {
          throw new Error(result.error?.message || "Error al cargar las personas");
        }
        setPersonas(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar las personas");
        toast.error("Error al cargar las personas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const getCETStatus = (persona: Persona) => {
    if (persona.es_ex_alumno_cet) return "Exalumno CET";
    if (persona.categoria_principal === "estudiante_cet") return "Alumno CET";
    return "-";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Cargando personas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Personas</h1>
        <Button onClick={() => router.push("/admin/gestion-personas/nueva")}>
          Nueva Persona
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Apellido</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Alumno/Exalumno</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No hay personas registradas
                </TableCell>
              </TableRow>
            ) : (
              personas.map((persona) => (
                <TableRow key={persona.id}>
                  <TableCell>
                    {persona.foto_url ? (
                      <img
                        src={persona.foto_url}
                        alt={`Foto de ${persona.nombre}`}
                        width={40}
                        height={40}
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-[40px] h-[40px] bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Sin foto</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{persona.nombre}</TableCell>
                  <TableCell>{persona.apellido}</TableCell>
                  <TableCell>{persona.email || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        persona.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {persona.activo ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell>{getCETStatus(persona)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/gestion-personas/editar/${persona.id}`}>
                        Editar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 