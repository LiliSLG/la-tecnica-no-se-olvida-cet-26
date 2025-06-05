"use client";

import { useState, useEffect } from 'react';
import { Proyecto } from '@/types/proyecto';
import { ProyectosService } from '@/lib/supabase/services/proyectosService';
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

const proyectosService = new ProyectosService();

export default function AdminProjectList() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    try {
      setLoading(true);
      const result = await proyectosService.getAll();
      if (result.error) {
        throw new Error(result.error.message);
      }
      setProyectos(result.data || []);
    } catch (error) {
      console.error('Error loading proyectos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los proyectos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadProyectos();
      return;
    }

    try {
      setLoading(true);
      const result = await proyectosService.search(searchTerm);
      if (result.error) {
        throw new Error(result.error.message);
      }
      setProyectos(result.data || []);
    } catch (error) {
      console.error('Error searching proyectos:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar proyectos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Proyecto>[] = [
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
            <Link href={`/admin/gestion-proyectos/editar/${row.original.id}`}>
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
        <h1 className="text-2xl font-bold">Gestión de Proyectos</h1>
        <Button asChild>
          <Link href="/admin/gestion-proyectos/nueva">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
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
        data={proyectos}
        loading={loading}
      />
    </div>
  );
}

    