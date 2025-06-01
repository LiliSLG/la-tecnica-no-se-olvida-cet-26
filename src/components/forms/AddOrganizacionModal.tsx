
"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addOrganizacionModalSchema, type AddOrganizacionModalFormData, organizacionTipos, organizacionTipoLabels } from '@/lib/schemas/organizacionSchema';
import type { Organizacion, TipoOrganizacion } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addOrganizacion } from '@/lib/firebase/organizacionesService';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface AddOrganizacionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizacionCreated: (newOrganizacion: { id: string; nombreOficial: string; tipo: TipoOrganizacion }) => void;
}

export default function AddOrganizacionModal({ open, onOpenChange, onOrganizacionCreated }: AddOrganizacionModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  const form = useForm<AddOrganizacionModalFormData>({
    resolver: zodResolver(addOrganizacionModalSchema),
    defaultValues: {
      nombreOficial: '',
      tipo: organizacionTipos[0], // Default to the first type
      nombreFantasia: '',
      emailContacto: '',
      sitioWeb: '',
    },
  });
  const { control, handleSubmit, reset: resetModalForm, formState: { errors: modalFormErrors } } = form;

  useEffect(() => {
    if (!open) {
      resetModalForm({
        nombreOficial: '',
        tipo: organizacionTipos[0],
        nombreFantasia: '',
        emailContacto: '',
        sitioWeb: '',
      });
    }
  }, [open, resetModalForm]);

  const onSubmitModal = async (data: AddOrganizacionModalFormData) => {
    console.log('AddOrganizacionModal: onSubmitModal called. Data:', data);
    console.log('AddOrganizacionModal: Zod errors:', JSON.stringify(modalFormErrors, null, 2));

    if (!user) {
      toast({ title: "Error", description: "Debes estar autenticado.", variant: "destructive" });
      return;
    }
    setIsSubmittingModal(true);

    try {
      // Prepare a minimal dataset suitable for addOrganizacion
      // The addOrganizacion service should handle setting defaults for other fields
      const dataForService = {
        nombreOficial: data.nombreOficial,
        tipo: data.tipo,
        nombreFantasia: data.nombreFantasia || null,
        emailContacto: data.emailContacto || null,
        sitioWeb: data.sitioWeb || null,
        // Let addOrganizacion handle audit fields, estaEliminada, etc.
      };

      const orgId = await addOrganizacion(dataForService as OrganizacionFormData, user.uid); // Cast if addOrganizacion expects more fields
      
      toast({ title: "Éxito", description: `${data.nombreOficial} añadida como nueva organización.` });
      onOrganizacionCreated({ id: orgId, nombreOficial: data.nombreOficial, tipo: data.tipo });
      handleCloseModal(true);
    } catch (error) {
      console.error("Modal: Error creating organizacion placeholder:", error);
      toast({ title: "Error", description: `No se pudo crear la organización. ${(error as Error).message}`, variant: "destructive" });
    } finally {
      setIsSubmittingModal(false);
    }
  };
  
  const handleCloseModal = (submittedSuccessfully: boolean = false) => {
    // Reset form only if not a successful submission (where useEffect on 'open' will handle it)
    // or if explicitly closing via Cancel.
    if (!submittedSuccessfully) { 
        resetModalForm({
            nombreOficial: '',
            tipo: organizacionTipos[0],
            nombreFantasia: '',
            emailContacto: '',
            sitioWeb: '',
        });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCloseModal(); else onOpenChange(true); }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" />
            Añadir Nueva Organización
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(onSubmitModal)(e);
            }} 
            className="space-y-6 py-4"
          >
            <FormField
              control={control}
              name="nombreOficial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Oficial *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {organizacionTipos.map(option => (
                        <SelectItem key={option} value={option}>{organizacionTipoLabels[option]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={control}
              name="nombreFantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Fantasía (Opcional)</FormLabel>
                  <FormControl><Input {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="emailContacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de Contacto (Opcional)</FormLabel>
                  <FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="sitioWeb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio Web (Opcional)</FormLabel>
                  <FormControl><Input type="url" {...field} value={field.value || ''} /></FormControl>
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
                Crear Organización
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
