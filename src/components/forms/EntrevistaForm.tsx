
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entrevistaSchema, type EntrevistaFormData, tipoContenidoEntrevistaOptions, plataformaVideoPropioOptions, plataformaVideoExternoOptions } from '@/lib/schemas/entrevistaSchema';
import { stringToArrayZod } from '@/lib/schemas/projectSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Video, Link as LinkIcon, TextIcon, CalendarDays, Tag, Image as ImageIcon, UploadCloud, Trash2, Loader2, Users, UserCircle, PlusCircle, ChevronsUpDown, Check, X } from 'lucide-react';
import NextImage from 'next/image';
import { storage } from '@/lib/firebase/config';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import UnsavedChangesModal from '@/components/modals/UnsavedChangesModal';
import { useRouter } from 'next/navigation';
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { getAllTemasActivos } from '@/lib/firebase/temasService';
import type { Tema } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from '../ui/badge';
import AddTemaModal from './AddTemaModal';

interface EntrevistaFormProps {
  onSubmit: (data: EntrevistaFormData) => Promise<boolean>;
  initialData?: EntrevistaFormData;
  isSubmitting: boolean;
  volverAPath: string;
}

const isValidUrl = (url: string | null): boolean => {
  if (!url) return false;
  try { new URL(url); return true; } catch (e) { return false; }
};

export default function EntrevistaForm({ onSubmit: parentOnSubmit, initialData, isSubmitting: parentIsSubmitting, volverAPath }: EntrevistaFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [selectedMiniaturaFile, setSelectedMiniaturaFile] = useState<File | null>(null);
  const [previewMiniaturaURL, setPreviewMiniaturaURL] = useState<string | null>(null);
  const [uploadMiniaturaProgress, setUploadMiniaturaProgress] = useState<number>(0);
  const [isUploadingMiniatura, setIsUploadingMiniatura] = useState<boolean>(false);

  const [selectedTranscripcionFile, setSelectedTranscripcionFile] = useState<File | null>(null);
  const [uploadTranscripcionProgress, setUploadTranscripcionProgress] = useState<number>(0);
  const [isUploadingTranscripcion, setIsUploadingTranscripcion] = useState<boolean>(false);

  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [navigationAction, setNavigationAction] = useState<(() => void) | null>(null);

  const [allActiveTemas, setAllActiveTemas] = useState<Tema[]>([]);
  const [selectedTemaObjects, setSelectedTemaObjects] = useState<Tema[]>([]);
  const [loadingTemas, setLoadingTemas] = useState(true);
  const [isAddTemaModalOpen, setIsAddTemaModalOpen] = useState(false);

  const formDefaultValues: EntrevistaFormData = {
    tipoContenido: 'video_propio',
    tituloSaber: '',
    descripcionSaber: '',
    videoPropioURL: '',
    plataformaVideoPropio: null,
    urlVideoExterno: '',
    plataformaVideoExterno: null,
    fuenteVideoExterno: '',
    fechaGrabacionORecopilacion: new Date(),
    ambitoSaber: '',
    idsTemasSaber: [],
    palabrasClaveSaber: [],
    fuentesInformacion: [],
    recopiladoPorUids: [],
    transcripcionTextoCompleto: '',
    transcripcionFileURL: '',
    imagenMiniaturaURL: '',
    duracionMediaMinutos: undefined,
    estaPublicada: false,
  };

  const form = useForm<EntrevistaFormData>({
    resolver: zodResolver(entrevistaSchema),
    defaultValues: initialData || formDefaultValues,
  });
  const { control, handleSubmit, formState: { errors, isDirty: formHookIsDirty }, reset, setValue, watch, trigger, getValues } = form;

  const tipoContenido = watch('tipoContenido');
  const currentMiniaturaURL = watch('imagenMiniaturaURL');
  const currentTranscripcionURL = watch('transcripcionFileURL');
  const currentIdsTemasSaber = watch('idsTemasSaber');

  const isFormEffectivelyDirty = formHookIsDirty || (JSON.stringify((initialData?.idsTemasSaber || []).sort()) !== JSON.stringify((currentIdsTemasSaber || []).sort()));

  useEffect(() => {
    async function fetchTemas() {
      setLoadingTemas(true);
      try {
        const temasData = await getAllTemasActivos();
        setAllActiveTemas(temasData);
        if (initialData?.idsTemasSaber) {
          setSelectedTemaObjects(temasData.filter(t => initialData.idsTemasSaber!.includes(t.id!)));
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los temas.", variant: "destructive" });
      } finally {
        setLoadingTemas(false);
      }
    }
    fetchTemas();
  }, [toast, initialData?.idsTemasSaber]);


  useEffect(() => {
    if (initialData) {
      const dataForForm = {
        ...initialData,
        idsTemasSaber: Array.isArray(initialData.idsTemasSaber) ? initialData.idsTemasSaber : [],
        palabrasClaveSaber: Array.isArray(initialData.palabrasClaveSaber) ? initialData.palabrasClaveSaber : [],
        fuentesInformacion: Array.isArray(initialData.fuentesInformacion) ? initialData.fuentesInformacion : [],
        recopiladoPorUids: Array.isArray(initialData.recopiladoPorUids) ? initialData.recopiladoPorUids : [],
        plataformaVideoPropio: initialData.plataformaVideoPropio || null,
        plataformaVideoExterno: initialData.plataformaVideoExterno || null,
      };
      reset(dataForForm);
      if (initialData.imagenMiniaturaURL && isValidUrl(initialData.imagenMiniaturaURL)) {
        setPreviewMiniaturaURL(initialData.imagenMiniaturaURL);
      }
      if (initialData.idsTemasSaber && allActiveTemas.length > 0) {
        setSelectedTemaObjects(allActiveTemas.filter(t => initialData.idsTemasSaber!.includes(t.id!)));
      }
    } else {
      reset(formDefaultValues);
      setPreviewMiniaturaURL(null);
      setSelectedMiniaturaFile(null);
      setSelectedTranscripcionFile(null);
      setSelectedTemaObjects([]);
    }
  }, [initialData, reset, allActiveTemas]);

  useEffect(() => {
    if (currentIdsTemasSaber && allActiveTemas.length > 0) {
      setSelectedTemaObjects(allActiveTemas.filter(t => currentIdsTemasSaber.includes(t.id!)));
    } else {
      setSelectedTemaObjects([]);
    }
  }, [currentIdsTemasSaber, allActiveTemas]);

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    if (selectedMiniaturaFile) {
      objectUrlToRevoke = previewMiniaturaURL?.startsWith('blob:') ? previewMiniaturaURL : null;
      const newObjectUrl = URL.createObjectURL(selectedMiniaturaFile);
      setPreviewMiniaturaURL(newObjectUrl);
    } else if (currentMiniaturaURL && isValidUrl(currentMiniaturaURL) && currentMiniaturaURL !== 'PENDING_UPLOAD_MINIATURA') {
      if (previewMiniaturaURL?.startsWith('blob:')) objectUrlToRevoke = previewMiniaturaURL;
      setPreviewMiniaturaURL(currentMiniaturaURL);
    } else if (!currentMiniaturaURL && !selectedMiniaturaFile) {
      if (previewMiniaturaURL?.startsWith('blob:')) objectUrlToRevoke = previewMiniaturaURL;
      setPreviewMiniaturaURL(null);
    }
    return () => { if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke); };
  }, [selectedMiniaturaFile, currentMiniaturaURL, previewMiniaturaURL]);

  const handleMiniaturaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('imagenMiniaturaURL', 'PENDING_UPLOAD_MINIATURA', { shouldDirty: true });
      setSelectedMiniaturaFile(file); setUploadMiniaturaProgress(0);
    } else {
      setSelectedMiniaturaFile(null);
      if (watch('imagenMiniaturaURL') === 'PENDING_UPLOAD_MINIATURA') {
        setValue('imagenMiniaturaURL', initialData?.imagenMiniaturaURL || '', { shouldDirty: true });
      }
    }
  };

  const handleRemoveMiniatura = () => {
    setSelectedMiniaturaFile(null); setValue('imagenMiniaturaURL', '', { shouldDirty: true });
    setUploadMiniaturaProgress(0); toast({ title: "Miniatura Quitada" });
  };

  const handleTranscripcionFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('transcripcionFileURL', 'PENDING_UPLOAD_TRANSCRIPCION', { shouldDirty: true });
      setSelectedTranscripcionFile(file); setUploadTranscripcionProgress(0);
    } else {
      setSelectedTranscripcionFile(null);
      if (watch('transcripcionFileURL') === 'PENDING_UPLOAD_TRANSCRIPCION') {
        setValue('transcripcionFileURL', initialData?.transcripcionFileURL || '', { shouldDirty: true });
      }
    }
  };

  const handleRemoveTranscripcion = () => {
    setSelectedTranscripcionFile(null); setValue('transcripcionFileURL', '', { shouldDirty: true });
    setUploadTranscripcionProgress(0); toast({ title: "Archivo de Transcripción Quitado" });
  };

  const uploadFile = async (file: File, path: string, progressSetter: (val: number) => void): Promise<string> => {
    const uniqueFileName = `entrevistas/${path}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const fileRef = storageRef(storage, uniqueFileName);
    const metadata = { contentType: file.type };
    const uploadTask = uploadBytesResumable(fileRef, file, metadata);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => progressSetter((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => {
          toast({ title: `Error de Subida (${path})`, description: error.message, variant: "destructive" });
          reject(error);
        },
        async () => {
          try { resolve(await getDownloadURL(uploadTask.snapshot.ref)); }
          catch (e) { reject(e); }
        }
      );
    });
  };

  const handleTemaCreatedFromModal = (newTema: Tema) => {
    setAllActiveTemas(prev => [...prev, newTema].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    const currentSelectedIds = getValues('idsTemasSaber') || [];
    if (!currentSelectedIds.includes(newTema.id!)) {
      const newIds = [...currentSelectedIds, newTema.id!];
      setValue('idsTemasSaber', newIds, {
        shouldDirty: JSON.stringify(newIds.sort()) !== JSON.stringify((initialData?.idsTemasSaber || []).sort())
      });
      setSelectedTemaObjects(prev => [...prev, newTema].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    }
    trigger('idsTemasSaber');
  };


  const handleMainSubmit = async (dataFromHookForm: EntrevistaFormData) => {
    let finalData = { ...dataFromHookForm };

    if (selectedMiniaturaFile) {
      setIsUploadingMiniatura(true);
      try {
        finalData.imagenMiniaturaURL = await uploadFile(selectedMiniaturaFile, 'miniaturas', setUploadMiniaturaProgress);
      } catch { setIsUploadingMiniatura(false); return false; }
      setIsUploadingMiniatura(false);
    } else if (finalData.imagenMiniaturaURL === 'PENDING_UPLOAD_MINIATURA') {
      finalData.imagenMiniaturaURL = initialData?.imagenMiniaturaURL || '';
    }


    if (selectedTranscripcionFile) {
      setIsUploadingTranscripcion(true);
      try {
        finalData.transcripcionFileURL = await uploadFile(selectedTranscripcionFile, 'transcripciones', setUploadTranscripcionProgress);
      } catch { setIsUploadingTranscripcion(false); return false; }
      setIsUploadingTranscripcion(false);
    } else if (finalData.transcripcionFileURL === 'PENDING_UPLOAD_TRANSCRIPCION') {
      finalData.transcripcionFileURL = initialData?.transcripcionFileURL || '';
    }

    const success = await parentOnSubmit(finalData);
    if (success) {
      setSelectedMiniaturaFile(null); setSelectedTranscripcionFile(null);
      if (!initialData) { reset(formDefaultValues); setSelectedTemaObjects([]); }
      else { reset(finalData); }
      setPreviewMiniaturaURL(finalData.imagenMiniaturaURL || null);
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
    reset(initialData || formDefaultValues);
    setSelectedMiniaturaFile(null); setSelectedTranscripcionFile(null);
    setPreviewMiniaturaURL(initialData?.imagenMiniaturaURL || null);
    if (initialData?.idsTemasSaber && allActiveTemas.length > 0) {
      setSelectedTemaObjects(allActiveTemas.filter(t => initialData.idsTemasSaber!.includes(t.id!)));
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
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>Información General del Saber/Entrevista</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={control} name="tipoContenido" render={({ field }) => (
              <FormItem> <FormLabel>Tipo de Contenido *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo" /></SelectTrigger></FormControl>
                  <SelectContent>{tipoContenidoEntrevistaOptions.map(tipo => <SelectItem key={tipo} value={tipo}>{tipo.replace('_', ' ')}</SelectItem>)}</SelectContent>
                </Select> <FormMessage />
              </FormItem>
            )}/>
            <FormField control={control} name="tituloSaber" render={({ field }) => (<FormItem><FormLabel>Título del Saber/Entrevista *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={control} name="descripcionSaber" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Descripción/Resumen *</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Breve descripción del contenido..."/></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={control} name="fuentesInformacion" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-1"><Users className="h-4 w-4"/>Entrevistados/Fuentes (separados por coma) *</FormLabel>
                <FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={e => field.onChange(stringToArrayZod.parse(e.target.value))} placeholder="Ej: Juan Pérez, Familia Rodríguez"/></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
             <FormField control={control} name="recopiladoPorUids" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-1"><UserCircle className="h-4 w-4"/>Recopilado por (UIDs separados por coma, opcional)</FormLabel>
                <FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={e => field.onChange(stringToArrayZod.parse(e.target.value))} placeholder="UID1, UID2"/></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </CardContent>
        </Card>

        {tipoContenido === 'video_propio' && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5 text-primary"/>Detalles del Video Propio</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField control={control} name="videoPropioURL" render={({ field }) => (<FormItem><FormLabel>URL del Video Propio* (Ej: enlace de Firebase Storage, YouTube propio)</FormLabel><FormControl><Input type="url" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={control} name="plataformaVideoPropio" render={({ field }) => (
                <FormItem> <FormLabel>Plataforma (Video Propio)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione plataforma" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {plataformaVideoPropioOptions.map(val =>
                        <SelectItem key={val} value={val}>
                          {val.replace('_', ' ')}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select> <FormMessage />
                </FormItem>
              )}/>
            </CardContent>
          </Card>
        )}

        {tipoContenido === 'enlace_video_externo' && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5 text-primary"/>Detalles del Video Externo</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField control={control} name="urlVideoExterno" render={({ field }) => (<FormItem><FormLabel>URL del Video Externo *</FormLabel><FormControl><Input type="url" {...field} value={field.value || ''} placeholder="https://youtube.com/watch?v=..."/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={control} name="plataformaVideoExterno" render={({ field }) => (
                <FormItem> <FormLabel>Plataforma (Video Externo)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccione plataforma" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {plataformaVideoExternoOptions.map(val =>
                        <SelectItem key={val} value={val}>
                          {val}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select> <FormMessage />
                </FormItem>
              )}/>
              <FormField control={control} name="fuenteVideoExterno" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Fuente (Ej: Nombre del Canal/Página)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-primary"/>Clasificación y Metadatos</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField control={control} name="fechaGrabacionORecopilacion" render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Grabación/Recopilación *</FormLabel>
                <Popover><PopoverTrigger asChild><FormControl>
                  <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
                  </Button></FormControl></PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/></PopoverContent>
                </Popover><FormMessage />
              </FormItem>
            )}/>
            <FormField control={control} name="ambitoSaber" render={({ field }) => (<FormItem><FormLabel>Ámbito del Saber (Ej: Cocina, Telar, Siembra)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField
              control={control}
              name="idsTemasSaber"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel className="flex items-center gap-1"><Tag className="h-4 w-4"/>Temas Asociados</FormLabel>
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
                                    trigger('idsTemasSaber');
                                  }}>
                                  <Checkbox className="mr-2" checked={(field.value || []).includes(tema.id!)} id={`tema-saber-${tema.id}`} />
                                  <label htmlFor={`tema-saber-${tema.id}`} className="cursor-pointer flex-1">{tema.nombre}</label>
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
                                field.onChange(newSelectedIds); trigger('idsTemasSaber');
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
            <FormField control={control} name="palabrasClaveSaber" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel className="flex items-center gap-1"><Tag className="h-4 w-4"/>Palabras Clave (separadas por coma)</FormLabel>
                <FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={e => field.onChange(stringToArrayZod.parse(e.target.value))} placeholder="Ej: Tradición, Receta, Lluvia"/></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={control} name="duracionMediaMinutos" render={({ field }) => ( <FormItem><FormLabel>Duración (minutos)</FormLabel><FormControl><Input type="number" {...field} value={String(field.value ?? '')} onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem> )}/>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary"/>Archivos Adicionales</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <FormItem>
                    <FormLabel className="flex items-center gap-1"><ImageIcon className="h-4 w-4"/>Imagen Miniatura (Opcional)</FormLabel>
                    {previewMiniaturaURL && isValidUrl(previewMiniaturaURL) && (<div className="my-2"><NextImage src={previewMiniaturaURL} alt="Vista previa miniatura" width={150} height={100} className="rounded-md object-cover border shadow-sm"/></div>)}
                    <FormField control={control} name="imagenMiniaturaURL" render={() => (
                        <FormItem><FormControl><Input id="miniatura-upload" type="file" accept="image/*" onChange={handleMiniaturaFileChange} className="text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/></FormControl><FormMessage /></FormItem>
                    )}/>
                    {isUploadingMiniatura && (<div className="mt-1 space-y-1"><Progress value={uploadMiniaturaProgress} className="w-full h-1.5" /><p className="text-xs text-muted-foreground text-center">Subiendo: {uploadMiniaturaProgress.toFixed(0)}%</p></div>)}
                    {(previewMiniaturaURL || currentMiniaturaURL === 'PENDING_UPLOAD_MINIATURA' || selectedMiniaturaFile) && !isUploadingMiniatura && (<Button type="button" variant="outline" size="xs" onClick={handleRemoveMiniatura} className="mt-1 text-destructive hover:text-destructive"><Trash2 className="mr-1 h-3 w-3" /> Quitar Miniatura</Button>)}
                </FormItem>
                <FormItem>
                    <FormLabel className="flex items-center gap-1"><TextIcon className="h-4 w-4"/>Archivo de Transcripción (PDF, TXT - Opcional)</FormLabel>
                    {currentTranscripcionURL && isValidUrl(currentTranscripcionURL) && !currentTranscripcionURL.startsWith('PENDING') && (<p className="text-xs text-muted-foreground mt-1">Actual: <a href={currentTranscripcionURL} target="_blank" rel="noopener noreferrer" className="text-primary underline">{currentTranscripcionURL.substring(0,50)}...</a></p>)}
                    <FormField control={control} name="transcripcionFileURL" render={() => (
                        <FormItem><FormControl><Input id="transcripcion-upload" type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleTranscripcionFileChange} className="text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/></FormControl><FormMessage /></FormItem>
                    )}/>
                    {isUploadingTranscripcion && (<div className="mt-1 space-y-1"><Progress value={uploadTranscripcionProgress} className="w-full h-1.5" /><p className="text-xs text-muted-foreground text-center">Subiendo: {uploadTranscripcionProgress.toFixed(0)}%</p></div>)}
                    {(currentTranscripcionURL === 'PENDING_UPLOAD_TRANSCRIPCION' || selectedTranscripcionFile) && !isUploadingTranscripcion && (<Button type="button" variant="outline" size="xs" onClick={handleRemoveTranscripcion} className="mt-1 text-destructive hover:text-destructive"><Trash2 className="mr-1 h-3 w-3" /> Quitar Transcripción</Button>)}
                    {selectedTranscripcionFile && <p className="text-xs text-muted-foreground mt-1">Seleccionado: {selectedTranscripcionFile.name}</p>}
                </FormItem>
                <FormField control={control} name="transcripcionTextoCompleto" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Texto de Transcripción (si no hay archivo)</FormLabel><FormControl><Textarea {...field} value={field.value || ''} rows={8} placeholder="Pegar aquí el texto completo de la transcripción..."/></FormControl><FormMessage /></FormItem>)}/>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-lg">Configuración de Visibilidad</CardTitle></CardHeader>
            <CardContent>
                <FormField control={control} name="estaPublicada" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Publicar Entrevista</FormLabel><FormDescription className="text-xs">Hacer visible en el sitio público.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
            </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCancelClick} disabled={parentIsSubmitting || isUploadingMiniatura || isUploadingTranscripcion}>Cancelar</Button>
            <Button type="submit" disabled={parentIsSubmitting || isUploadingMiniatura || isUploadingTranscripcion || (!!initialData && !isFormEffectivelyDirty && !selectedMiniaturaFile && !selectedTranscripcionFile)} className="min-w-[150px]">
                {(parentIsSubmitting || isUploadingMiniatura || isUploadingTranscripcion) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {parentIsSubmitting || isUploadingMiniatura || isUploadingTranscripcion ? (isUploadingMiniatura ? 'Subiendo miniatura...' : isUploadingTranscripcion ? 'Subiendo transcripción...' :(initialData ? 'Actualizando...' : 'Creando...')) : (initialData ? 'Actualizar Entrevista' : 'Crear Entrevista')}
            </Button>
        </div>
      </form>
      <UnsavedChangesModal isOpen={isUnsavedChangesModalOpen} onClose={() => setIsUnsavedChangesModalOpen(false)} onConfirmSaveAndExit={triggerSubmitAndNavigate} onConfirmDiscardAndExit={discardChangesAndExit} />
      {isAddTemaModalOpen && <AddTemaModal open={isAddTemaModalOpen} onOpenChange={setIsAddTemaModalOpen} onTemaCreated={handleTemaCreatedFromModal} />}
    </Form>
  );
}
    
