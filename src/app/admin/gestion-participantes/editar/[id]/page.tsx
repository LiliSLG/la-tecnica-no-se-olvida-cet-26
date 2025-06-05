"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Persona } from '@/types/persona';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const personasService = new PersonasService();

interface EditParticipantePageProps {
  params: {
    id: string;
  };
}

export default function EditParticipantePage({ params }: EditParticipantePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    estado: 'activo',
  });

  useEffect(() => {
    loadPersona();
  }, [params.id]);

  const loadPersona = async () => {
    try {
      setLoading(true);
      const result = await personasService.getById(params.id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      const persona = result.data;
      if (!persona) {
        throw new Error('Persona no encontrada');
      }
      setPersona(persona);
      setFormData({
        nombre: persona.nombre || '',
        apellido: persona.apellido || '',
        email: persona.email || '',
        telefono: persona.telefono || '',
        estado: persona.estado || 'activo',
      });
    } catch (error) {
      console.error('Error loading persona:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del participante',
        variant: 'destructive',
      });
      router.push('/admin/gestion-participantes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await personasService.update(params.id, formData);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast({
        title: 'Éxito',
        description: 'Participante actualizado correctamente',
      });
      router.push('/admin/gestion-participantes');
    } catch (error) {
      console.error('Error updating persona:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el participante',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Editar Participante</CardTitle>
          <CardDescription>
            Actualiza la información del participante
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/gestion-participantes')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
