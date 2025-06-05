"use client";

import { useState, useEffect } from 'react';
import { Persona } from '@/types/persona';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const personasService = new PersonasService();

export default function AdminParticipanteList() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      const result = await personasService.getAll();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setPersonas(result.data || []);
    } catch (error) {
      console.error('Error loading personas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los participantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadPersonas();
      return;
    }

    try {
      setLoading(true);
      const result = await personasService.search(searchTerm);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setPersonas(result.data || []);
    } catch (error) {
      console.error('Error searching personas:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar participantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Persona>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.nombre}</div>
      ),
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.rol}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha de creación',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {format(new Date(row.original.created_at), 'PPP', { locale: es })}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/admin/gestion-personas/editar/${row.original.id}`}>
              Editar
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Participantes</h1>
        <Button asChild>
          <Link href="/admin/gestion-personas/nueva">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Participante
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button
          variant="outline"
          onClick={handleSearch}
        >
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={personas}
        loading={loading}
      />
    </div>
  );
}

    