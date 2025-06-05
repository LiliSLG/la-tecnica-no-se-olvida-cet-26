"use client";

import { useState, useEffect } from 'react';
import { Entrevista } from '@/types/entrevista';
import { EntrevistasService } from '@/lib/supabase/services/entrevistasService';
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

const entrevistasService = new EntrevistasService();

export default function AdminEntrevistaList() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadEntrevistas();
  }, []);

  const loadEntrevistas = async () => {
    try {
      setLoading(true);
      const result = await entrevistasService.getAll();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setEntrevistas(result.data || []);
    } catch (error) {
      console.error('Error loading entrevistas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las entrevistas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadEntrevistas();
      return;
    }

    try {
      setLoading(true);
      const result = await entrevistasService.search(searchTerm);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setEntrevistas(result.data || []);
    } catch (error) {
      console.error('Error searching entrevistas:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar entrevistas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Entrevista>[] = [
    {
      accessorKey: 'titulo',
      header: 'Título',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.titulo}</div>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.estado}
        </Badge>
      ),
    },
    {
      accessorKey: 'fechaEntrevista',
      header: 'Fecha de entrevista',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {format(new Date(row.original.fechaEntrevista), 'PPP', { locale: es })}
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
            <Link href={`/admin/gestion-entrevistas/editar/${row.original.id}`}>
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
        <h1 className="text-2xl font-bold">Gestión de Entrevistas</h1>
        <Button asChild>
          <Link href="/admin/gestion-entrevistas/nueva">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Entrevista
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Buscar por título..."
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
        data={entrevistas}
        loading={loading}
      />
    </div>
  );
}

    