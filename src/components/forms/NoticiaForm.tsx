
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noticiaSchema, type NoticiaFormData, tipoContenidoNoticia, tipoContenidoNoticiaLabels } from '@/lib/schemas/noticiaSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Link as LinkIcon, TextIcon, CalendarDays, Tag, Image as ImageIcon, UploadCloud, Trash2, Loader2, PlusCircle, ChevronsUpDown, Check, X } from 'lucide-react';
import NextImage from 'next/image';
import { storage } from '@/lib/firebase/config';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import UnsavedChangesModal from '@/components/modals/UnsavedChangesModal';
import { useRouter } from 'next/navigation';
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import type { Tema } from '@/lib/types';
import { getAllTemasActivos } from '@/lib/firebase/temasService';
import AddTemaModal from './AddTemaModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface NoticiaFormProps {
  onSubmit: (data: NoticiaFormData) => Promise<boolean>;
  initialData?: NoticiaFormData;
  isSubmitting: boolean;
  volverAPath: string;
}

const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  try { const newUrl = new URL(url); return ['http:', 'https:', 'blob:'].includes(newUrl.protocol); }
  catch (e) { return false; }
};

export default function NoticiaForm({ onSubmit: parentOnSubmit, initialData, isSubmitting: parentIsSubmitting, volverAPath }: NoticiaFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSvgPreview, setIsSvgPreview] = useState<boolean>(false);

  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [navigationAction, setNavigationAction] = useState<(() => void) | null>(null);

  const [allActiveTemas, setAllActiveTemas] = useState<Tema[]>([]);
  const [selectedTemaObjects, setSelectedTemaObjects] = useState<Tema[]>([]);
  const [loadingTemas, setLoadingTemas] = useState(true);
  const [isAddTemaModalOpen, setIsAddTemaModalOpen] = useState(false);

  const formDefaultValues: NoticiaFormData = {
    tipoContenido: 'articulo_propio',
    titulo: '',
    subtitulo: '',
    contenido: '',
    urlExterna: '',
    fuenteExterna: '',
    resumenOContextoInterno: '',
    fechaPublicacion: new Date(),
    autorNoticia: '',
    imagenPrincipalURL: '',
    idsTemas: [],
    esDestacada: false,
    estaPublicada: false,
  };

  const form = useForm<NoticiaFormData>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: initialData || formDefaultValues,
  });
  const { control, handleSubmit, formState: { errors, isDirty: formHookIsDirty }, reset, setValue, watch, trigger, getValues } = form;

  const currentImagenURL = watch('imagenPrincipalURL');
  const tipoContenido = watch('tipoContenido');
  const currentIdsTemas = watch('idsTemas'); 

  const isFormEffectivelyDirty = formHookIsDirty || (JSON.stringify((initialData?.idsTemas || []).sort()) !== JSON.stringify((currentIdsTemas || []).sort()));


  useEffect(() => {
    async function fetchTemas() {
      setLoadingTemas(true);
      try {
        const temasData = await getAllTemasActivos();
        setAllActiveTemas(temasData);
        if (initialData?.idsTemas) {
          setSelectedTemaObjects(temasData.filter(t => initialData.idsTemas!.includes(t.id!)));
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los temas.", variant: "destructive" });
      } finally {
        setLoadingTemas(false);
      }
    }
    fetchTemas();
  }, [toast, initialData?.idsTemas]); 

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.imagenPrincipalURL && isValidImageUrl(initialData.imagenPrincipalURL)) {
        setPreviewURL(initialData.imagenPrincipalURL);
        setIsSvgPreview(initialData.imagenPrincipalURL.toLowerCase().endsWith('.svg'));
      } else { setPreviewURL(null); setIsSvgPreview(false); }
      
      if (initialData.idsTemas && allActiveTemas.length > 0) {
        setSelectedTemaObjects(allActiveTemas.filter(t => initialData.idsTemas!.includes(t.id!)));
      }
    } else {
      reset(formDefaultValues);
      setPreviewURL(null); setIsSvgPreview(false); setSelectedFile(null);
      setSelectedTemaObjects([]);
    }
  }, [initialData, reset, allActiveTemas]);


  useEffect(() => {
    if (currentIdsTemas && allActiveTemas.length > 0) {
      setSelectedTemaObjects(allActiveTemas.filter(t => currentIdsTemas.includes(t.id!)));
    } else {
      setSelectedTemaObjects([]);
    }
  }, [currentIdsTemas, allActiveTemas]);


  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    if (selectedFile) {
      if (previewURL && previewURL.startsWith('blob:')) objectUrlToRevoke = previewURL;
      const newObjectUrl = URL.createObjectURL(selectedFile);
      setPreviewURL(newObjectUrl);
      setIsSvgPreview(selectedFile.type === 'image/svg+xml');
    } else if (currentImagenURL && isValidImageUrl(currentImagenURL) && currentImagenURL !== 'PENDING_UPLOAD') {
      if (previewURL && previewURL.startsWith('blob:')) objectUrlToRevoke = previewURL;
      setPreviewURL(currentImagenURL);
      setIsSvgPreview(currentImagenURL.toLowerCase().endsWith('.svg'));
    } else if (!currentImagenURL && !selectedFile) {
      if (previewURL && previewURL.startsWith('blob:')) objectUrlToRevoke = previewURL;
      setPreviewURL(null); setIsSvgPreview(false);
    }
    return () => { if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke); };
  }, [selectedFile, currentImagenURL, previewURL]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('imagenPrincipalURL', 'PENDING_UPLOAD', { shouldDirty: true });
      setSelectedFile(file); setUploadProgress(0);
    } else {
      setSelectedFile(null);
      if (watch('imagenPrincipalURL') === 'PENDING_UPLOAD') {
        setValue('imagenPrincipalURL', initialData?.imagenPrincipalURL || '', { shouldDirty: true });
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null); setValue('imagenPrincipalURL', '', { shouldDirty: true });
    setUploadProgress(0); toast({ title: "Imagen Quitada" });
  };

  const handleTemaCreatedFromModal = (newTema: Tema) => {
    setAllActiveTemas(prev => [...prev, newTema].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    const currentSelectedIds = getValues('idsTemas') || [];
    if (!currentSelectedIds.includes(newTema.id!)) {
      const newIds = [...currentSelectedIds, newTema.id!];
      setValue('idsTemas', newIds, {
        shouldDirty: JSON.stringify(newIds.sort()) !== JSON.stringify((initialData?.idsTemas || []).sort())
      });
      setSelectedTemaObjects(prev => [...prev, newTema].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    }
    trigger('idsTemas');
  };

  const handleMainSubmit = async (dataFromHookForm: NoticiaFormData) => {
    let processedImagenURL: string | null | undefined = dataFromHookForm.imagenPrincipalURL;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const uniqueFileName = `noticias_imagenes/${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
        const fileRef = storageRef(storage, uniqueFileName);
        const metadata = { contentType: selectedFile.type };
        const uploadTask = uploadBytesResumable(fileRef, selectedFile, metadata);
        processedImagenURL = await new Promise<string>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            (error) => { toast({ title: "Error de Subida", description: error.message, variant: "destructive" }); reject(error); },
            async () => { try { const url = await getDownloadURL(uploadTask.snapshot.ref); resolve(url); } catch (e) { reject(e); } }
          );
        });
      } catch (error) { setIsUploading(false); return false; }
    } else if (dataFromHookForm.imagenPrincipalURL === 'PENDING_UPLOAD') {
      processedImagenURL = initialData?.imagenPrincipalURL || null;
    } else if (dataFromHookForm.imagenPrincipalURL === '') {
      processedImagenURL = null;
    }

    const finalDataForParent: NoticiaFormData = { ...dataFromHookForm, imagenPrincipalURL: processedImagenURL };
    const success = await parentOnSubmit(finalDataForParent);
    setIsUploading(false);
    if (success) {
      setSelectedFile(null);
      if (!initialData) { reset(formDefaultValues); setPreviewURL(null); setSelectedTemaObjects([]); }
      else { reset(finalDataForParent); setPreviewURL(finalDataForParent.imagenPrincipalURL); }
    }
    return success;
  };

  const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (isFormEffectivelyDirty) { setNavigationAction(() => () => router.push(volverAPath)); setIsUnsavedChangesModalOpen(true); }
    else { router.push(volverAPath); }
  };

  const triggerSubmitAndNavigate = async () => {
    const isValid = await trigger();
    if (isValid) { const success = await handleSubmit(handleMainSubmit)(); if (success && navigationAction) navigationAction(); }
    else { toast({ title: "Error de Validación", variant: "destructive" }); }
    setIsUnsavedChangesModalOpen(false);
  };

  const discardChangesAndExit = () => {
    reset(initialData || formDefaultValues); setSelectedFile(null);
    setPreviewURL(initialData?.imagenPrincipalURL || null);
    setIsSvgPreview(initialData?.imagenPrincipalURL?.toLowerCase().endsWith('.svg') || false);
    if (initialData?.idsTemas && allActiveTemas.length > 0) {
      setSelectedTemaObjects(allActiveTemas.filter(t => initialData.idsTemas!.includes(t.id!)));
    } else {
      setSelectedTemaObjects([]);
    }
    if (navigationAction) navigationAction();
    setIsUnsavedChangesModalOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleMainSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5 text-primary"/>Tipo y Título</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={control} name="tipoContenido" render={({ field }) => (
              <FormItem> <FormLabel>Tipo de Contenido *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                  <SelectContent>{tipoContenidoNoticia.map(tipo => <SelectItem key={tipo} value={tipo}>{tipoContenidoNoticiaLabels[tipo]}</SelectItem>)}</SelectContent>
                </Select> <FormMessage />
              </FormItem>
            )}/>
            <FormField control={control} name="titulo" render={({ field }) => (<FormItem><FormLabel>Título *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={control} name="subtitulo" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Subtítulo (Opcional)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
          </CardContent>
        </Card>

        {tipoContenido === 'articulo_propio' && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TextIcon className="h-5 w-5 text-primary"/>Contenido del Artículo</CardTitle></CardHeader>
            <CardContent>
              <FormField control={control} name="contenido" render={({ field }) => (<FormItem><FormLabel>Contenido *</FormLabel><FormControl><Textarea {...field} value={field.value || ''} rows={10} placeholder="Escribe aquí el cuerpo de la noticia..."/></FormControl><FormMessage /></FormItem>)}/>
            </CardContent>
          </Card>
        )}

        {tipoContenido === 'enlace_externo' && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5 text-primary"/>Información del Enlace Externo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={control} name="urlExterna" render={({ field }) => (<FormItem><FormLabel>URL Externa *</FormLabel><FormControl><Input type="url" {...field} value={field.value || ''} placeholder="https://ejemplo.com/noticia"/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={control} name="fuenteExterna" render={({ field }) => (<FormItem><FormLabel>Fuente (Nombre del medio)</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="Ej: Diario Río Negro"/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={control} name="resumenOContextoInterno" render={({ field }) => (<FormItem><FormLabel>Resumen/Contexto Interno *</FormLabel><FormControl><Textarea {...field} value={field.value || ''} rows={5} placeholder="Breve resumen o contexto sobre la noticia enlazada (importante para IA)."/></FormControl><FormDescription>Este texto ayudará a la IA a entender de qué trata el enlace.</FormDescription><FormMessage /></FormItem>)}/>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary"/>Detalles Adicionales</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={control} name="fechaPublicacion" render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Publicación *</FormLabel>
                <Popover><PopoverTrigger asChild><FormControl>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                  </Button></FormControl></PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/></PopoverContent>
                </Popover><FormMessage />
              </FormItem>
            )}/>
            <FormField control={control} name="autorNoticia" render={({ field }) => (<FormItem><FormLabel>Autor/Fuente Original (Opcional)</FormLabel><FormControl><Input {...field} value={field.value || ''} placeholder="Ej: Juan Pérez, INTA Noticias"/></FormControl><FormMessage /></FormItem>)}/>

            <FormField
              control={control}
              name="idsTemas"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel className="flex items-center gap-1"><Tag className="h-4 w-4"/>Temas</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAddTemaModalOpen(true);}}> <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Tema </Button>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" className={cn("w-full justify-between h-auto min-h-10 py-2", !selectedTemaObjects.length && "text-muted-foreground")}>
                          <span className="flex flex-wrap gap-1">
                            {selectedTemaObjects.length > 0 ? selectedTemaObjects.map(t => <Badge key={t.id} variant="secondary">{t.nombre}</Badge>) : "Seleccionar temas..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar tema..." disabled={loadingTemas} />
                        <CommandList>
                          {loadingTemas && <CommandEmpty>Cargando temas...</CommandEmpty>}
                          {!loadingTemas && allActiveTemas.length === 0 && <CommandEmpty>No hay temas disponibles.</CommandEmpty>}
                          <CommandGroup>
                            <ScrollArea className="max-h-48">
                              {allActiveTemas.map((tema) => (
                                <CommandItem key={tema.id} value={tema.nombre}
                                  onSelect={() => {
                                    const currentSelectedIds = field.value || [];
                                    const isSelected = currentSelectedIds.includes(tema.id!);
                                    const newSelectedIds = isSelected ? currentSelectedIds.filter(id => id !== tema.id) : [...currentSelectedIds, tema.id!];
                                    field.onChange(newSelectedIds);
                                    trigger('idsTemas');
                                  }}>
                                  <Checkbox className="mr-2" checked={(field.value || []).includes(tema.id!)} id={`tema-${tema.id}`} />
                                  <label htmlFor={`tema-${tema.id}`} className="cursor-pointer flex-1">{tema.nombre}</label>
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                  {selectedTemaObjects.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <FormDescription className="text-xs">Temas Seleccionados:</FormDescription>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemaObjects.map((tema) => (
                          <Badge key={tema.id} variant="secondary" className="flex items-center gap-1 pr-1">
                            {tema.nombre}
                            <button type="button" aria-label={`Quitar tema ${tema.nombre}`}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation();
                                const newSelectedIds = (field.value || []).filter(id => id !== tema.id);
                                field.onChange(newSelectedIds); trigger('idsTemas');
                              }}
                              className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormItem className="md:col-span-2"><FormLabel>Imagen Principal (Opcional)</FormLabel>
              {previewURL && isValidImageUrl(previewURL) && (<div className="my-2"><NextImage src={previewURL} alt="Vista previa" width={200} height={150} className="rounded-md object-cover border shadow-sm" unoptimized={isSvgPreview && previewURL && !previewURL.startsWith('blob:')}/></div>)}
              <FormField control={control} name="imagenPrincipalURL" render={() => (
                  <FormItem><FormControl><Input id="imagen-upload" type="file" accept="image/*" onChange={handleFileChange} className="text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/></FormControl><FormMessage /></FormItem>
              )}/>
              {isUploading && (<div className="mt-1 space-y-1"><Progress value={uploadProgress} className="w-full h-1.5" /><p className="text-xs text-muted-foreground text-center">Subiendo: {uploadProgress.toFixed(0)}%</p></div>)}
              {(previewURL || currentImagenURL === 'PENDING_UPLOAD' || selectedFile) && !isUploading && (<Button type="button" variant="outline" size="xs" onClick={handleRemoveImage} className="mt-1 text-destructive hover:text-destructive"><Trash2 className="mr-1 h-3 w-3" /> Quitar Imagen</Button>)}
            </FormItem>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-lg">Configuración de Visibilidad</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={control} name="estaPublicada" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Publicar Noticia</FormLabel><FormDescription className="text-xs">Hacer visible en el sitio público.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={control} name="esDestacada" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Noticia Destacada</FormLabel><FormDescription className="text-xs">Mostrar en secciones especiales.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
            </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCancelClick} disabled={parentIsSubmitting || isUploading}>Cancelar</Button>
            <Button type="submit" disabled={parentIsSubmitting || isUploading || (!!initialData && !isFormEffectivelyDirty && !selectedFile)} className="min-w-[150px]">
                {(parentIsSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {parentIsSubmitting || isUploading ? (isUploading ? 'Subiendo imagen...' : (initialData ? 'Actualizando...' : 'Creando...')) : (initialData ? 'Actualizar Noticia' : 'Crear Noticia')}
            </Button>
        </div>
      </form>
      <UnsavedChangesModal isOpen={isUnsavedChangesModalOpen} onClose={() => setIsUnsavedChangesModalOpen(false)} onConfirmSaveAndExit={triggerSubmitAndNavigate} onConfirmDiscardAndExit={discardChangesAndExit} />
      {isAddTemaModalOpen && <AddTemaModal open={isAddTemaModalOpen} onOpenChange={setIsAddTemaModalOpen} onTemaCreated={handleTemaCreatedFromModal} />}
    </Form>
  );
}
    
