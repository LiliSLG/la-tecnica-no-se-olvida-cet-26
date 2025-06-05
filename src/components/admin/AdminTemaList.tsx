"use client";

import { useState, useEffect } from 'react';
import { Tema } from '@/types/tema';
import { TemasService } from '@/lib/supabase/services/temasService';
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

const temasService = new TemasService();

export default function AdminTemaList() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTemas();
  }, []);

  const loadTemas = async () => {
    try {
      setLoading(true);
      const result = await temasService.getAll();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setTemas(result.data || []);
    } catch (error) {
      console.error('Error loading temas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los temas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadTemas();
      return;
    }

    try {
      setLoading(true);
      const result = await temasService.search(searchTerm);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setTemas(result.data || []);
    } catch (error) {
      console.error('Error searching temas:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar temas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Tema>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.nombre}</div>
      ),
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="text-muted-foreground line-clamp-2">
          {row.original.descripcion}
        </div>
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
            <Link href={`/admin/gestion-temas/editar/${row.original.id}`}>
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
        <h1 className="text-2xl font-bold">Gestión de Temas</h1>
        <Button asChild>
          <Link href="/admin/gestion-temas/nueva">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tema
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
        data={temas}
        loading={loading}
      />
    </div>
  );
}
