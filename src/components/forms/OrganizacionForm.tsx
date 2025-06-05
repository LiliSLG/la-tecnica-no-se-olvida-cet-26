"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  organizacionSchema,
  type OrganizacionFormData,
  organizacionTipos,
  organizacionTipoLabels,
  convertSupabaseDataToFormOrganizacion,
} from "@/lib/schemas/organizacionSchema";
import { uploadFile } from "@/lib/supabase/supabaseStorage";
import type { Organizacion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  LinkIcon,
  Mail,
  MapPin,
  Phone,
  Type,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import NextImage from "next/image"; // Renamed to avoid conflict with lucide-react Image icon

import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { OrganizacionesService } from "@/lib/supabase/services/organizacionesService";
import { supabase } from "@/lib/supabase/supabaseClient";

interface OrganizacionFormProps {
  onSubmit: (data: OrganizacionFormData) => Promise<void>;
  initialData?: Partial<Organizacion>;
  isSubmitting: boolean;
}

const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  try {
    const newUrl = new URL(url);
    return ["http:", "https:", "blob:"].includes(newUrl.protocol);
  } catch (e) {
    return false;
  }
};

const organizacionesService = new OrganizacionesService(supabase);

export default function OrganizacionForm({
  onSubmit,
  initialData,
  isSubmitting,
}: OrganizacionFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isSvgPreview, setIsSvgPreview] = useState<boolean>(false); // For SVG handling
  const { toast } = useToast();

  const formDefaultValues = initialData
    ? convertSupabaseDataToFormOrganizacion(initialData)
    : {
        nombreOficial: "",
        nombreFantasia: "",
        tipo: organizacionTipos[0],
        descripcion: "",
        logoURL: "",
        sitioWeb: "",
        emailContacto: "",
        telefonoContacto: "",
        ubicacion: {
          latitud: null,
          longitud: null,
          direccionTextoCompleto: "",
          calleYNumero: "",
          localidad: "",
          parajeORural: "",
          provincia: "",
          pais: "",
          referenciasAdicionales: "",
          mapaLink: "",
        },
      };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty: formIsDirty },
    reset,
    setValue,
    watch,
  } = useForm<OrganizacionFormData>({
    resolver: zodResolver(organizacionSchema),
    defaultValues: formDefaultValues,
  });

  const currentLogoURL = watch("logoURL");

  useEffect(() => {
    if (initialData) {
      reset(convertSupabaseDataToFormOrganizacion(initialData));
    } else {
      reset(formDefaultValues);
    }
  }, [initialData, reset]);

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;

    if (selectedFile) {
      objectUrlToRevoke =
        previewURL && previewURL.startsWith("blob:") ? previewURL : null;
      const newObjectUrl = URL.createObjectURL(selectedFile);
      setPreviewURL(newObjectUrl);
      setIsSvgPreview(selectedFile.type === "image/svg+xml");
    } else if (currentLogoURL && isValidImageUrl(currentLogoURL)) {
      if (previewURL && previewURL.startsWith("blob:")) {
        objectUrlToRevoke = previewURL;
      }
      setPreviewURL(currentLogoURL);
      setIsSvgPreview(
        currentLogoURL.toLowerCase().endsWith(".svg") ||
          currentLogoURL.includes("data:image/svg+xml")
      );
    } else {
      if (previewURL && previewURL.startsWith("blob:")) {
        objectUrlToRevoke = previewURL;
      }
      setPreviewURL(null);
      setIsSvgPreview(false);
    }

    return () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [selectedFile, currentLogoURL]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "No hay archivo seleccionado para subir.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const publicUrl = await uploadFile(
        selectedFile,
        "organization-logos",
        (percent) => {
          setUploadProgress(percent);
        }
      );
      setUploadedUrl(publicUrl);
      setValue("logoURL", publicUrl, { shouldDirty: true });
      toast({ title: "Imagen subida", description: "Se subió correctamente." });
    } catch (err: any) {
      toast({
        title: "Error de subida",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setValue("logoURL", "", { shouldDirty: true }); // Clear the RHF logoURL
    // previewURL and isSvgPreview will be reset by useEffect
    setUploadProgress(0);
    toast({
      title: "Logo Quitado",
      description: "El logo ha sido quitado del formulario.",
    });
  };

  const handleFormSubmit = async (data: OrganizacionFormData) => {
    await onSubmit(data); // The logoURL in data is from RHF, already set by upload or removal
    if (!initialData) {
      // Only reset if it's a create form
      reset(formDefaultValues);
      setSelectedFile(null);
      setUploadProgress(0);
      // previewURL and isSvgPreview will be reset by useEffect
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6 text-primary" /> Información Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="nombreOficial">Nombre Oficial *</Label>
            <Input id="nombreOficial" {...register("nombreOficial")} />
            {errors.nombreOficial && (
              <p className="text-sm text-destructive mt-1">
                {errors.nombreOficial.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="nombreFantasia">Nombre de Fantasía</Label>
            <Input id="nombreFantasia" {...register("nombreFantasia")} />
            {errors.nombreFantasia && (
              <p className="text-sm text-destructive mt-1">
                {errors.nombreFantasia.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="tipo" className="flex items-center gap-1">
              <Type className="h-4 w-4" /> Tipo *
            </Label>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizacionTipos.map((option) => (
                      <SelectItem key={option} value={option}>
                        {organizacionTipoLabels[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo && (
              <p className="text-sm text-destructive mt-1">
                {errors.tipo.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" {...register("descripcion")} rows={3} />
            {errors.descripcion && (
              <p className="text-sm text-destructive mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-primary" /> Contacto y Enlaces
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="sitioWeb" className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" /> Sitio Web
            </Label>
            <Input
              id="sitioWeb"
              type="url"
              {...register("sitioWeb")}
              placeholder="https://ejemplo.com"
            />
            {errors.sitioWeb && (
              <p className="text-sm text-destructive mt-1">
                {errors.sitioWeb.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="emailContacto" className="flex items-center gap-1">
              <Mail className="h-4 w-4" /> Email de Contacto
            </Label>
            <Input
              id="emailContacto"
              type="email"
              {...register("emailContacto")}
              placeholder="contacto@ejemplo.com"
            />
            {errors.emailContacto && (
              <p className="text-sm text-destructive mt-1">
                {errors.emailContacto.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="telefonoContacto"
              className="flex items-center gap-1"
            >
              <Phone className="h-4 w-4" /> Teléfono de Contacto
            </Label>
            <Input id="telefonoContacto" {...register("telefonoContacto")} />
            {errors.telefonoContacto && (
              <p className="text-sm text-destructive mt-1">
                {errors.telefonoContacto.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" /> Logo de la
            Organización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {previewURL && isValidImageUrl(previewURL) && (
            <div className="my-2 flex flex-col items-center">
              <NextImage
                src={previewURL}
                alt="Vista previa del logo"
                width={150}
                height={150}
                className="rounded-md object-contain border shadow-sm"
                unoptimized={Boolean(
                  isSvgPreview && previewURL && !previewURL.startsWith("blob:")
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="logo-upload">
              {previewURL ? "Cambiar Logo" : "Seleccionar Archivo de Logo"}
            </Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          {selectedFile && !isUploading && (
            <Button
              type="button"
              onClick={handleUploadImage}
              className="w-full mt-2"
            >
              <UploadCloud className="mr-2 h-4 w-4" /> Subir Imagen Seleccionada
            </Button>
          )}
          {isUploading && (
            <div className="mt-2 space-y-1">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Subiendo: {uploadProgress.toFixed(0)}%
              </p>
            </div>
          )}
          {(previewURL || currentLogoURL) && !isUploading && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveLogo}
              className="w-full mt-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Quitar Logo Actual
            </Button>
          )}
          {errors.logoURL && (
            <p className="text-sm text-destructive mt-1">
              {errors.logoURL.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" /> Ubicación (Opcional)
          </CardTitle>
          <CardDescription>
            Detalles sobre la ubicación física de la organización.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="ubicacion.latitud">Latitud</Label>
              <Input
                id="ubicacion.latitud"
                type="number"
                step="any"
                {...register("ubicacion.latitud")}
              />
              {errors.ubicacion?.latitud && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacion.latitud.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ubicacion.longitud">Longitud</Label>
              <Input
                id="ubicacion.longitud"
                type="number"
                step="any"
                {...register("ubicacion.longitud")}
              />
              {errors.ubicacion?.longitud && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacion.longitud.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="ubicacion.direccionTextoCompleto">
              Dirección (Texto Completo)
            </Label>
            <Input
              id="ubicacion.direccionTextoCompleto"
              {...register("ubicacion.direccionTextoCompleto")}
            />
            {errors.ubicacion?.direccionTextoCompleto && (
              <p className="text-sm text-destructive mt-1">
                {errors.ubicacion.direccionTextoCompleto.message}
              </p>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="ubicacion.calleYNumero">Calle y Número</Label>
              <Input
                id="ubicacion.calleYNumero"
                {...register("ubicacion.calleYNumero")}
              />
              {errors.ubicacion?.calleYNumero && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacion.calleYNumero.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ubicacion.localidad">Localidad</Label>
              <Input
                id="ubicacion.localidad"
                {...register("ubicacion.localidad")}
              />
              {errors.ubicacion?.localidad && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacion.localidad.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ubicacion.parajeORural">
                Paraje o Zona Rural
              </Label>
              <Input
                id="ubicacion.parajeORural"
                {...register("ubicacion.parajeORural")}
              />
              {errors.ubicacion?.parajeORural && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacion.parajeORural.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ubicacion.provincia">Provincia</Label>
              <Input
                id="ubicacion.provincia"
                {...register("ubicacion.provincia")}
              />
              {errors.ubicacion?.provincia && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacion.provincia.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ubicacion.pais">País</Label>
              <Input id="ubicacion.pais" {...register("ubicacion.pais")} />
              {errors.ubicacion?.pais && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacion.pais.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="ubicacion.mapaLink">
                Enlace al Mapa (Google Maps, etc.)
              </Label>
              <Input
                id="ubicacion.mapaLink"
                type="url"
                {...register("ubicacion.mapaLink")}
              />
              {errors.ubicacion?.mapaLink && (
                <p className="text-sm text-destructive mt-1">
                  {errors.ubicacion.mapaLink.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="ubicacion.referenciasAdicionales">
              Referencias Adicionales
            </Label>
            <Textarea
              id="ubicacion.referenciasAdicionales"
              {...register("ubicacion.referenciasAdicionales")}
              rows={2}
            />
            {errors.ubicacion?.referenciasAdicionales && (
              <p className="text-sm text-destructive mt-1">
                {errors.ubicacion.referenciasAdicionales.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={
          isSubmitting || (!!initialData && !formIsDirty) || isUploading
        }
        className="w-full md:w-auto text-lg py-3 px-6"
      >
        {isSubmitting
          ? initialData
            ? "Actualizando..."
            : "Creando..."
          : initialData
          ? "Actualizar Organización"
          : "Crear Organización"}
      </Button>
    </form>
  );
}
