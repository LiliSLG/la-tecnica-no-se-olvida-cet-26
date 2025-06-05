"use client";

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormAuthor } from '@/lib/types';
import { addPersonaModalSchema, type AddPersonaModalFormData, categoriasPrincipalesPersonaLabels, type CategoriaPrincipalPersona, type CapacidadPlataforma } from '@/lib/schemas/personaSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { UploadCloud, Image as ImageIcon, Trash2, Loader2, UserPlus, Tags } from 'lucide-react';
import NextImage from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle as ModalCardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { personasService } from '@/lib/supabase/services/personasService';
import { uploadFile, getPublicUrl } from '@/lib/supabase/supabaseStorage';

interface AddPersonaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonaCreated: (newFormAuthor: FormAuthor) => void;
  roleToAssign: CapacidadPlataforma;
  opcionesCategoriaPrincipal: Array<{ value: CategoriaPrincipalPersona; label: string; }>;
}

const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  try {
    const newUrl = new URL(url);
    return ['http:', 'https:', 'blob:'].includes(newUrl.protocol);
  } catch (e) {
    return false;
  }
};

export default function AddPersonaModal({ open, onOpenChange, onPersonaCreated, roleToAssign, opcionesCategoriaPrincipal }: AddPersonaModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSvgPreview, setIsSvgPreview] = useState<boolean>(false);

  const form = useForm<AddPersonaModalFormData>({
    resolver: zodResolver(addPersonaModalSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      fotoURL: '',
      categoriaPrincipal: opcionesCategoriaPrincipal[0]?.value || 'ninguno_asignado', // Default to first option or a safe fallback
    },
  });
  const { control, handleSubmit, setValue, watch, reset: resetModalForm, formState: { errors: modalFormErrors } } = form;
  const currentFotoURL = watch('fotoURL');

  useEffect(() => {
    if (!open) {
      // Reset image-related state when modal closes
      setSelectedFile(null);
      setPreviewURL(null);
      setIsUploading(false);
      setUploadProgress(0);
      setIsSvgPreview(false);
      // Consider resetting the form if modal is re-used for different contexts without re-mounting
      resetModalForm({
        nombre: '', apellido: '', email: '', fotoURL: '',
        categoriaPrincipal: opcionesCategoriaPrincipal[0]?.value || 'ninguno_asignado'
      });
    } else {
      // When modal opens, ensure default category is set if form values were stale
      setValue('categoriaPrincipal', opcionesCategoriaPrincipal[0]?.value || 'ninguno_asignado');
    }
  }, [open, resetModalForm, opcionesCategoriaPrincipal, setValue]);

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;

    if (selectedFile) {
      if (previewURL && previewURL.startsWith('blob:')) {
        objectUrlToRevoke = previewURL;
      }
      const newObjectUrl = URL.createObjectURL(selectedFile);
      setPreviewURL(newObjectUrl);
      setIsSvgPreview(selectedFile.type === 'image/svg+xml');
    } else if (currentFotoURL && isValidImageUrl(currentFotoURL) && currentFotoURL !== 'PENDING_UPLOAD_MODAL') {
      if (previewURL && previewURL.startsWith('blob:')) {
        objectUrlToRevoke = previewURL;
      }
      setPreviewURL(currentFotoURL);
      setIsSvgPreview(currentFotoURL.toLowerCase().endsWith('.svg') || currentFotoURL.includes('data:image/svg+xml'));
    } else if (!currentFotoURL && !selectedFile) {
      if (previewURL && previewURL.startsWith('blob:')) {
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
  }, [selectedFile, currentFotoURL]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('fotoURL', 'PENDING_UPLOAD_MODAL', { shouldDirty: true });
      setSelectedFile(file);
      setUploadProgress(0);
    } else {
      setSelectedFile(null);
      if (watch('fotoURL') === 'PENDING_UPLOAD_MODAL') {
        setValue('fotoURL', '', { shouldDirty: true });
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setValue('fotoURL', '', { shouldDirty: true });
    setUploadProgress(0);
  };

  const onSubmitModal = async (data: AddPersonaModalFormData) => {
    console.log('Modal: onSubmitModal called. Data:', data);
    console.log('Modal Form Zod errors:', JSON.stringify(modalFormErrors, null, 2));

    if (!user) {
      toast({ title: "Error", description: "Debes estar autenticado.", variant: "destructive" });
      return;
    }
    setIsSubmittingModal(true);
    let finalModalFotoURL: string | null = data.fotoURL as string | null;

    if (selectedFile) {
      setIsUploading(true);
      console.log('Modal: Attempting to upload profile picture:', selectedFile.name);
      try {
        const uniqueFileName = `fotos_perfil_placeholders/${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
        finalModalFotoURL = await uploadFile(selectedFile, 'profile-pictures', (progress) => setUploadProgress(progress));
      } catch (error) {
        console.error("Modal: Upload error:", error);
        toast({ title: "Error de Subida (Modal)", description: `No se pudo subir la imagen. ${(error as Error).message}`, variant: "destructive" });
        setIsUploading(false);
        setIsSubmittingModal(false);
        return;
      } finally {
        setIsUploading(false);
      }
    } else if (finalModalFotoURL === 'PENDING_UPLOAD_MODAL') {
      finalModalFotoURL = null;
    } else if (finalModalFotoURL === '') {
      finalModalFotoURL = null;
    }

    try {
      const now = new Date().toISOString();
      const newPersonaData = {
        nombre: `${data.nombre} ${data.apellido}`.trim(),
        email: data.email || null,
        foto_url: finalModalFotoURL || null,
        capacidades_plataforma: [roleToAssign],
        categoria_principal: data.categoriaPrincipal,
        biografia: null,
        es_admin: false,
        created_at: now,
        updated_at: now,
        esta_eliminada: false,
        eliminado_por_uid: null,
        eliminado_en: null
      };

      console.log('Modal: Calling personasService.create with:', newPersonaData);
      const result = await personasService.create(newPersonaData);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create persona');
      }

      const createdPersona = result.data;
      if (!createdPersona) {
        throw new Error('No persona data returned from create');
      }

      console.log('Modal: Persona created in Supabase:', createdPersona);

      // Split the full name back into nombre and apellido for the frontend
      const [nombre, ...apellidoParts] = createdPersona.nombre.split(' ');
      const apellido = apellidoParts.join(' ');

      const newFormAuthorForParent: FormAuthor = {
        id: createdPersona.id,
        nombre,
        apellido,
        email: createdPersona.email || null,
        fotoURL: createdPersona.foto_url || null,
        isNewPlaceholder: true as const
      };

      console.log('Modal: Calling onPersonaCreated with:', newFormAuthorForParent);
      onPersonaCreated(newFormAuthorForParent);

      toast({ title: "Éxito", description: `${data.nombre} ${data.apellido} añadido como perfil placeholder.` });
      handleCloseModal(true);
    } catch (error) {
      console.error("Modal: Error creating persona:", error);
      toast({ title: "Error", description: `No se pudo crear el perfil placeholder. ${(error as Error).message}`, variant: "destructive" });
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleCloseModal = (submittedSuccessfully: boolean = false) => {
    resetModalForm({
      nombre: '', apellido: '', email: '', fotoURL: '',
      categoriaPrincipal: opcionesCategoriaPrincipal[0]?.value || 'ninguno_asignado'
    });
    setSelectedFile(null);
    setPreviewURL(null);
    setIsSvgPreview(false);
    setUploadProgress(0);
    setIsUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCloseModal(); else onOpenChange(true); }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Añadir Nueva Persona
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(onSubmitModal)(e);
            }}
            className="space-y-6 py-4"
          >
            <FormField
              control={control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="apellido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opcional)</FormLabel>
                  <FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="categoriaPrincipal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1"><Tags className="h-4 w-4" /> Categoría Principal *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  // defaultValue={opcionesCategoriaPrincipal[0]?.value || 'ninguno_asignado'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {opcionesCategoriaPrincipal.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="border-dashed">
              <CardHeader className="p-4">
                <ModalCardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Foto de Perfil (Opcional)</ModalCardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {previewURL && isValidImageUrl(previewURL) && (
                  <div className="my-2 flex flex-col items-center">
                    <NextImage src={previewURL} alt="Vista previa de foto" width={100} height={100} className="rounded-full object-cover border-2 border-primary/30 shadow-sm h-24 w-24" unoptimized={!!(isSvgPreview && previewURL && !previewURL.startsWith('blob:'))}
                    />
                  </div>
                )}
                <FormField
                  control={control}
                  name="fotoURL"
                  render={() => (
                    <FormItem>
                      <FormLabel htmlFor="foto-upload-modal" className="sr-only">Seleccionar Foto</FormLabel>
                      <FormControl>
                        <Input
                          id="foto-upload-modal"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isUploading && (
                  <div className="mt-2 space-y-1">
                    <Progress value={uploadProgress} className="w-full h-2" />
                    <p className="text-xs text-muted-foreground text-center">Subiendo: {uploadProgress.toFixed(0)}%</p>
                  </div>
                )}
                {(previewURL || currentFotoURL === 'PENDING_UPLOAD_MODAL' || selectedFile) && !isUploading && (
                  <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage} className="w-full mt-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50"><Trash2 className="mr-2 h-3.5 w-3.5" /> Quitar Foto</Button>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => handleCloseModal()}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmittingModal || isUploading}>
                {(isSubmittingModal || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Perfil Placeholder
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
