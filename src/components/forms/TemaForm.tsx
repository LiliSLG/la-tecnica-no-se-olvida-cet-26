
"use client";

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { temaSchema, type TemaFormData, temaCategorias, temaCategoriaLabels } from '@/lib/schemas/temaSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TagsIcon, Text, Tag as CategoryTagIcon, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import UnsavedChangesModal from '@/components/modals/UnsavedChangesModal';
import { useRouter } from 'next/navigation'; // For router.back()

interface TemaFormProps {
  onSubmit: (data: TemaFormData) => Promise<boolean>; // Returns promise for success/failure
  initialData?: TemaFormData;
  isSubmitting: boolean;
  volverAPath: string; // Path to navigate to on cancel or successful submission
}

const NINGUNA_CATEGORIA_VALUE = "_ninguna_categoria_"; // Special value for "Ninguna"

export default function TemaForm({ onSubmit, initialData, isSubmitting, volverAPath }: TemaFormProps) {
  const router = useRouter();
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [navigationAction, setNavigationAction] = useState<(() => void) | null>(null);

  const form = useForm<TemaFormData>({
    resolver: zodResolver(temaSchema),
    defaultValues: initialData || {
      nombre: '',
      descripcion: '',
      categoriaTema: null, // Default to null for "Ninguna"
    },
  });
  const { control, handleSubmit, formState: { errors, isDirty }, reset, trigger, getValues } = form;

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ nombre: '', descripcion: '', categoriaTema: null });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: TemaFormData) => {
    const success = await onSubmit(data);
    if (success) {
      // Redirection is handled by parent page
    }
  };

  const triggerSubmitAndNavigate = async () => {
    const isValid = await trigger(); 
    if (isValid) {
      // Use form.getValues() to get the latest data processed by onValueChange
      const success = await onSubmit(getValues()); 
      if (success && navigationAction) {
        navigationAction(); 
      }
    }
    setIsUnsavedChangesModalOpen(false);
  };

  const discardChangesAndExit = () => {
    reset(initialData || { nombre: '', descripcion: '', categoriaTema: null });
    if (navigationAction) {
      navigationAction();
    }
    setIsUnsavedChangesModalOpen(false);
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setNavigationAction(() => () => router.push(volverAPath));
      setIsUnsavedChangesModalOpen(true);
    } else {
      router.push(volverAPath);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TagsIcon className="h-6 w-6 text-primary" /> Información del Tema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><Text className="h-4 w-4"/> Nombre del Tema *</FormLabel>
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
                    <FormLabel className="flex items-center gap-1"><CategoryTagIcon className="h-4 w-4"/> Categoría del Tema (Opcional)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value === NINGUNA_CATEGORIA_VALUE) {
                          field.onChange(null); // Update react-hook-form state to null
                        } else {
                          field.onChange(value as TemaFormData['categoriaTema']);
                        }
                      }}
                      value={field.value || NINGUNA_CATEGORIA_VALUE} // If field.value is null/undefined, select "Ninguna"
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
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancelClick} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || (!!initialData && !isDirty)} className="min-w-[120px]">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Actualizar Tema' : 'Crear Tema'}
            </Button>
          </div>
        </form>
      </Form>
      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onClose={() => setIsUnsavedChangesModalOpen(false)}
        onConfirmSaveAndExit={triggerSubmitAndNavigate}
        onConfirmDiscardAndExit={discardChangesAndExit}
      />
    </>
  );
}
