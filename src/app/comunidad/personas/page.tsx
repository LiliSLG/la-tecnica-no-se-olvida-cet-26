"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { useDataTableState } from "@/lib/hooks/useDataTableState";
import { PersonasService, MappedPersona } from "@/lib/supabase/services/personasService";
import { TemasService, MappedTema } from "@/lib/supabase/services/temasService";
import { supabase } from "@/lib/supabase/supabaseClient";

const personasService = new PersonasService(supabase);
const temasService = new TemasService(supabase);

export default function PersonasPublicPage() {
  const [personas, setPersonas] = useState<MappedPersona[]>([]);
  const [temas, setTemas] = useState<MappedTema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tableState = useDataTableState<MappedPersona>({
    data: personas,
    searchFields: ['nombre', 'apellido'],
    filterFields: [
      {
        key: 'categoriaPrincipal',
        label: 'Tipo de alumno',
        type: 'select',
        options: [
          { value: 'estudiante_cet', label: 'Alumno CET' },
          { value: 'exalumno_cet', label: 'Ex-alumno CET' },
          { value: 'ninguno', label: 'No es alumno' },
        ],
      },
      {
        key: 'temas',
        label: 'Temas',
        type: 'select',
        options: temas.map(tema => ({
          value: tema.id,
          label: tema.nombre,
        })),
      },
    ],
    sortableColumns: ['nombre', 'apellido'],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch temas first
        const temasResult = await temasService.getPublicMapped();
        if (!temasResult.success) {
          throw new Error(temasResult.error?.message || "Error al cargar los temas");
        }
        setTemas(temasResult.data || []);

        // Fetch personas with tema filter if selected
        const selectedTemaId = tableState.filters.temas;
        const personasResult = await personasService.getPublicMapped({
          temaId: selectedTemaId !== 'all' ? selectedTemaId : undefined
        });
        if (!personasResult.success) {
          throw new Error(personasResult.error?.message || "Error al cargar las personas");
        }
        setPersonas(personasResult.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tableState.filters.temas]); // Re-fetch when tema filter changes

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const getCETStatus = (persona: MappedPersona) => {
    if (persona.esExAlumnoCET) return "Exalumno CET";
    if (persona.categoriaPrincipal === "estudiante_cet") return "Alumno CET";
    return "-";
  };

  const columns = [
    {
      key: 'fotoUrl' as keyof MappedPersona,
      label: 'Foto',
      className: 'w-[60px]',
      render: (persona: MappedPersona) => (
        <Avatar className="h-10 w-10">
          {persona.fotoUrl ? (
            <AvatarImage
              src={persona.fotoUrl}
              alt={`Foto de ${persona.nombre}`}
            />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground">
              {persona.nombre && persona.apellido
                ? `${persona.nombre[0]}${persona.apellido[0]}`
                : persona.nombre
                ? persona.nombre[0]
                : "?"}
            </AvatarFallback>
          )}
        </Avatar>
      ),
    },
    {
      key: 'nombre' as keyof MappedPersona,
      label: 'Nombre',
      sortable: true,
      className: 'min-w-[120px] font-medium',
    },
    {
      key: 'apellido' as keyof MappedPersona,
      label: 'Apellido',
      sortable: true,
      className: 'min-w-[120px]',
    },
    {
      key: 'categoriaPrincipal' as keyof MappedPersona,
      label: 'Tipo de alumno',
      className: 'min-w-[120px] text-sm text-muted-foreground',
      render: (persona: MappedPersona) => getCETStatus(persona),
    },
    {
      key: 'id' as keyof MappedPersona,
      label: 'Acciones',
      className: 'w-[60px] text-right',
      render: (persona: MappedPersona) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="hover:bg-muted focus:ring-2 focus:ring-offset-2 h-8 w-8"
          >
            <Link href={`/comunidad/personas/${persona.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver</span>
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      title="Comunidad"
      data={personas}
      columns={columns}
      config={{
        searchFields: ['nombre', 'apellido'],
        filterFields: [
          {
            key: 'categoriaPrincipal',
            label: 'Tipo de alumno',
            type: 'select',
            options: [
              { value: 'estudiante_cet', label: 'Alumno CET' },
              { value: 'exalumno_cet', label: 'Ex-alumno CET' },
              { value: 'ninguno', label: 'No es alumno' },
            ],
          },
          {
            key: 'temas',
            label: 'Temas',
            type: 'select',
            options: temas.map(tema => ({
              value: tema.id,
              label: tema.nombre,
            })),
          },
        ],
        sortableColumns: ['nombre', 'apellido'],
      }}
      state={tableState}
      emptyState={{
        title: "No hay personas registradas",
        description: "No hay personas disponibles en este momento",
      }}
    />
  );
} 