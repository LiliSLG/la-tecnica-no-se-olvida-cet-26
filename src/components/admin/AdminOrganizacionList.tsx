"use client";

import { useState, useEffect } from 'react';
import { Organizacion } from '@/types/organizacion';
import { OrganizacionesService } from '@/lib/supabase/services/organizacionesService';
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

const organizacionesService = new OrganizacionesService();

export default function AdminOrganizacionList() {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizaciones();
  }, []);

  const loadOrganizaciones = async () => {
    try {
      setLoading(true);
      const result = await organizacionesService.getAll();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setOrganizaciones(result.data || []);
    } catch (error) {
      console.error('Error loading organizaciones:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las organizaciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadOrganizaciones();
      return;
    }

    try {
      setLoading(true);
      const result = await organizacionesService.search(searchTerm);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setOrganizaciones(result.data || []);
    } catch (error) {
      console.error('Error searching organizaciones:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar organizaciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Organizacion>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.nombre}</div>
      ),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.tipo}
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
            <Link href={`/admin/organizaciones-gestion/editar/${row.original.id}`}>
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
        <h1 className="text-2xl font-bold">Gestión de Organizaciones</h1>
        <Button asChild>
          <Link href="/admin/organizaciones-gestion/nueva">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Organización
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
        data={organizaciones}
        loading={loading}
      />
    </div>
  );
}

    