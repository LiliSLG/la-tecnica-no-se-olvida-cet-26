"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addTemaModalSchema, type AddTemaModalFormData, temaCategorias, temaCategoriaLabels } from '@/lib/schemas/temaSchema';
import type { Tema, TemaCategoria } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, Tag as TagIcon, TagsIcon, Text } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TemasService } from '@/lib/supabase/services/temasService';
import { supabase } from '@/lib/supabase/supabaseClient';

interface AddTemaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemaCreated: (newTema: Tema) => void;
}

const NINGUNA_CATEGORIA_VALUE = "_ninguna_categoria_";

const temasService = new TemasService(supabase);

export default function AddTemaModal({ open, onOpenChange, onTemaCreated }: AddTemaModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  const form = useForm<AddTemaModalFormData>({
    resolver: zodResolver(addTemaModalSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoriaTema: NINGUNA_CATEGORIA_VALUE as TemaCategoria | typeof NINGUNA_CATEGORIA_VALUE,
    },
  });
  const { control, handleSubmit: handleModalSubmit, reset: resetModalForm, formState: { errors: modalFormErrors } } = form;

  useEffect(() => {
    if (!open) {
      resetModalForm({
        nombre: '',
        descripcion: '',
        categoriaTema: NINGUNA_CATEGORIA_VALUE as TemaCategoria | typeof NINGUNA_CATEGORIA_VALUE,
      });
    }
  }, [open, resetModalForm]);

  const onSubmitModal = async (data: AddTemaModalFormData) => {
    console.log('AddTemaModal: onSubmitModal called. Data:', data);
    if (!user) {
      toast({ title: "Error", description: "Debes estar autenticado.", variant: "destructive" });
      return;
    }
    setIsSubmittingModal(true);

    try {
      const dataForService = { ...data };
      if (data.categoriaTema === NINGUNA_CATEGORIA_VALUE) {
        dataForService.categoriaTema = null;
      }

      const result = await temasService.create({
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        esta_eliminado: false,
        eliminado_por_uid: null,
        eliminado_en: null
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }

      if (!result.data) {
        toast({
          title: "Error",
          description: "No se pudo crear el tema",
          variant: "destructive",
        });
        return;
      }

      onTemaCreated(result.data);
      handleCloseModal(true);
    } catch (error) {
      console.error("Modal: Error creating tema:", error);
      toast({ title: "Error", description: `No se pudo crear el tema. ${(error as Error).message}`, variant: "destructive" });
    } finally {
      setIsSubmittingModal(false);
    }
  };
  
  const handleCloseModal = (submittedSuccessfully: boolean = false) => {
    if (!submittedSuccessfully) { 
        resetModalForm({
            nombre: '',
            descripcion: '',
            categoriaTema: NINGUNA_CATEGORIA_VALUE as TemaCategoria | typeof NINGUNA_CATEGORIA_VALUE,
        });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCloseModal(); else onOpenChange(true); }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagsIcon className="h-6 w-6 text-primary" />
            Añadir Nuevo Tema
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleModalSubmit(onSubmitModal)(e);
            }} 
            className="space-y-6 py-4"
          >
            <FormField
              control={control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><TagIcon className="h-4 w-4"/> Nombre del Tema *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Text className="h-4 w-4"/> Descripción (Opcional)</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ''} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="categoriaTema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><TagsIcon className="h-4 w-4"/> Categoría del Tema (Opcional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value as TemaCategoria | typeof NINGUNA_CATEGORIA_VALUE)}
                    value={field.value || NINGUNA_CATEGORIA_VALUE}
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione una categoría" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={NINGUNA_CATEGORIA_VALUE}>Ninguna</SelectItem>
                      {temaCategorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{temaCategoriaLabels[cat]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => handleCloseModal()}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmittingModal}>
                {isSubmittingModal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Tema
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
