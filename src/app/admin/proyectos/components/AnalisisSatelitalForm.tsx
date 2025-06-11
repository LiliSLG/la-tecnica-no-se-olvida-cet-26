'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
  resumen: z.string().min(1, 'El resumen es requerido'),
  imagen_grafico_url: z.string().url('Debe ser una URL válida'),
  datos_tabla: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    'Debe ser un JSON válido'
  ),
});

interface AnalisisSatelitalFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  projectId: string;
}

export function AnalisisSatelitalForm({ onSubmit, projectId }: AnalisisSatelitalFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      resumen: '',
      imagen_grafico_url: '',
      datos_tabla: '{}',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título del análisis" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resumen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resumen</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Resumen del análisis"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagen_grafico_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Gráfico</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="datos_tabla"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datos Tabulares (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"key": "value"}'
                  className="min-h-[150px] font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit">Guardar Análisis</Button>
        </div>
      </form>
    </Form>
  );
} 