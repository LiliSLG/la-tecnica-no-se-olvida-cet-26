"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tipoAnalisisEnum = z.enum([
  "NDVI",
  "NDWI",
  "NDMI",
  "EVI",
  "SAVI",
  "MSAVI",
  "NDSI",
  "NDBI",
]);

const analisisSatelitalSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  tipo_analisis: tipoAnalisisEnum,
  resumen: z.string().optional(),
  imagen_grafico_url: z.string().url("Debe ser una URL válida").optional(),
  datos_tabla: z.string().min(1, "Los datos de la tabla son requeridos"),
});

type AnalisisSatelitalFormData = z.infer<typeof analisisSatelitalSchema>;

interface Props {
  onSubmit: (data: AnalisisSatelitalFormData) => void;
  projectId: string;
}

export function AnalisisSatelitalForm({ onSubmit, projectId }: Props) {
  const form = useForm<AnalisisSatelitalFormData>({
    resolver: zodResolver(analisisSatelitalSchema),
    defaultValues: {
      titulo: "",
      tipo_analisis: undefined,
      resumen: "",
      imagen_grafico_url: "",
      datos_tabla: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingrese el título del análisis"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_analisis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de análisis</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo de análisis" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[
                    "NDVI",
                    "NDWI",
                    "NDMI",
                    "EVI",
                    "SAVI",
                    "MSAVI",
                    "NDSI",
                    "NDBI",
                  ].map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Ingrese un resumen del análisis"
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
                <Input
                  placeholder="https://ejemplo.com/grafico.png"
                  {...field}
                />
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
              <FormLabel>Datos de la Tabla (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"columna1": "valor1", "columna2": "valor2"}'
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Crear Análisis
        </Button>
      </form>
    </Form>
  );
}
