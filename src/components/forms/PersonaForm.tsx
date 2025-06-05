"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  personaSchema,
  type PersonaFormData,
  adminSelectableCategoriasPrincipalesPersona,
  categoriasPrincipalesPersonaLabels,
  allCapacidadesPlataformaOptions,
  capacidadesPlataformaLabels,
  visibilidadPerfilOptions,
  visibilidadPerfilLabels,
  estadoSituacionLaboralOptions,
  estadoSituacionLaboralLabels,
  type CategoriaPrincipalPersona,
  type EstadoSituacionLaboral,
  type VisibilidadPerfil,
} from '@/lib/schemas/personaSchema';
import type { Persona, CapacidadPlataforma } from '@/lib/types';
import { PersonasService } from '@/lib/supabase/services/personasService';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, Mail, Briefcase, Shield, MapPin, Link as LinkIconLucide, UploadCloud, 
  Image as ImageIcon, Trash2, PlusCircle, Loader2, Tags, CalendarDays, 
  GraduationCap, Eye, InfoIcon, Activity, HandHeart, PhoneIcon, Building, BookUser 
} from 'lucide-react';
import NextImage from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import UnsavedChangesModal from '@/components/modals/UnsavedChangesModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { uploadFile } from '@/lib/supabase/supabaseStorage';

const NO_ESPECIFICADO_VALUE = "_NO_ESPECIFICADO_"; 

interface PersonaFormProps {
  onSubmit: (data: PersonaFormData, originalData?: PersonaFormData) => Promise<boolean>; // Pass originalData for comparison
  initialData?: PersonaFormData; // This should already be converted by parent
  isSubmitting: boolean;
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

const projectRelatedCapacities: CapacidadPlataforma[] = ['es_autor', 'es_tutor', 'es_colaborador'];

const personasService = new PersonasService(supabase);

export default function PersonaForm({ onSubmit: parentOnSubmit, initialData, isSubmitting: parentIsSubmitting }: PersonaFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams(); // To get volverA path for cancel

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSvgPreview, setIsSvgPreview] = useState<boolean>(false);

  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [navigationAction, setNavigationAction] = useState<(() => void) | null>(null);
  
  const formDefaultValues: PersonaFormData = {
      nombre: '',
      apellido: '',
      email: '',
      fotoURL: '',
      categoriaPrincipal: 'ninguno_asignado' as CategoriaPrincipalPersona,
      capacidadesPlataforma: [],
      activo: true,
      esAdmin: false,
      tituloProfesional: '',
      descripcionPersonalOProfesional: '',
      areasDeInteresOExpertise: [],
      idsTemasDeInteres: [], // Not directly editable in this form
      disponibleParaProyectos: true,
      esExAlumnoCET: undefined,
      anoCursadaActualCET: null,
      anoEgresoCET: null,
      titulacionObtenidaCET: '',
      proyectoFinalCETId: '',
      buscandoOportunidades: undefined,
      estadoSituacionLaboral: null,
      historiaDeExitoOResumenTrayectoria: '',
      empresaOInstitucionActual: '',
      cargoActual: '',
      ofreceColaboracionComo: [],
      telefonoContacto: '',
      linksProfesionales: [{ tipo: '', url: '' }],
      ubicacion: {
        latitud: undefined,
        longitud: undefined,
        direccionTextoCompleto: '',
        calleYNumero: '',
        localidad: '',
        parajeORural: '',
        provincia: '',
        pais: '',
        referenciasAdicionales: '',
      },
      visibilidadPerfil: 'solo_registrados_plataforma' as VisibilidadPerfil,
      estaEliminada: false,
      // creadoEn and actualizadoEn are not part of form data
    };

  const form = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: initialData || formDefaultValues,
  });

  const { control, handleSubmit, formState: { errors, isDirty }, reset, setValue, watch, getValues, trigger } = form;

  const currentFotoURL = watch('fotoURL');
  const watchedCategoriaPrincipal = watch('categoriaPrincipal');
  const esAdminSwitchWatched = watch('esAdmin');
  const capacidadesPlataformaWatched = watch('capacidadesPlataforma');

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: "linksProfesionales",
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData); 
      if (initialData.fotoURL && isValidImageUrl(initialData.fotoURL)) {
        setPreviewURL(initialData.fotoURL);
        setIsSvgPreview(initialData.fotoURL.toLowerCase().endsWith('.svg') || initialData.fotoURL.includes('data:image/svg+xml'));
      } else {
        setPreviewURL(null);
        setIsSvgPreview(false);
      }
    } else {
      reset(formDefaultValues);
      setPreviewURL(null);
      setIsSvgPreview(false);
      setSelectedFile(null);
    }
  }, [initialData, reset]);

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    if (selectedFile) {
      if (previewURL && previewURL.startsWith('blob:')) objectUrlToRevoke = previewURL;
      const newObjectUrl = URL.createObjectURL(selectedFile);
      setPreviewURL(newObjectUrl);
      setIsSvgPreview(selectedFile.type === 'image/svg+xml');
    } else if (currentFotoURL && isValidImageUrl(currentFotoURL) && currentFotoURL !== 'PENDING_UPLOAD') {
      if (previewURL && previewURL.startsWith('blob:')) objectUrlToRevoke = previewURL;
      setPreviewURL(currentFotoURL);
      setIsSvgPreview(currentFotoURL.toLowerCase().endsWith('.svg') || currentFotoURL.includes('data:image/svg+xml'));
    } else if (!currentFotoURL && !selectedFile) { 
      if (previewURL && previewURL.startsWith('blob:')) objectUrlToRevoke = previewURL;
      setPreviewURL(null);
      setIsSvgPreview(false);
    }
    return () => { if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke); };
  }, [selectedFile, currentFotoURL]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('fotoURL', 'PENDING_UPLOAD', { shouldDirty: true });
      setSelectedFile(file);
      setUploadProgress(0);
    } else {
      setSelectedFile(null);
      const originalFotoURL = initialData?.fotoURL || '';
      if (getValues('fotoURL') === 'PENDING_UPLOAD') {
        setValue('fotoURL', originalFotoURL, { shouldDirty: originalFotoURL !== (initialData?.fotoURL || '') });
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setValue('fotoURL', '', { shouldDirty: true }); 
    setUploadProgress(0);
    toast({ title: "Foto Quitada", description: "La foto de perfil ha sido quitada del formulario." });
  };

  const handleMainSubmit = async (dataFromHookForm: PersonaFormData) => {
    console.log("PersonaForm Zod errors:", JSON.stringify(errors, null, 2));
    console.log("Data from react-hook-form:", JSON.stringify(dataFromHookForm, null, 2));
    
    let processedFotoURL: string | null = dataFromHookForm.fotoURL || null;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadFile(selectedFile, 'profile-pictures', (progress) => {
          setUploadProgress(progress);
        });
        processedFotoURL = uploadedUrl;
      } catch (error) {
        console.error("Error uploading image for persona:", error);
        setIsUploading(false);
        return false;
      }
    } else if (dataFromHookForm.fotoURL === 'PENDING_UPLOAD') {
      processedFotoURL = initialData?.fotoURL || null; 
    } else if (dataFromHookForm.fotoURL === '') {
      processedFotoURL = null;
    }

    const finalDataForParent: PersonaFormData = {
      ...dataFromHookForm,
      fotoURL: processedFotoURL,
    };

    const result = await parentOnSubmit(finalDataForParent, initialData);
    return result;
  };

  const handleEsAdminChange = (checked: boolean) => {
    setValue('esAdmin', checked, { shouldDirty: true });
    const currentCaps = getValues('capacidadesPlataforma') || [];
    const adminCapability: CapacidadPlataforma = 'es_admin_sistema';
    let newCapsArray: CapacidadPlataforma[];

    if (checked) {
      newCapsArray = currentCaps.includes(adminCapability) ? [...currentCaps] : [...currentCaps, adminCapability];
    } else {
      newCapsArray = currentCaps.filter(c => c !== adminCapability);
    }
    if (JSON.stringify(newCapsArray.sort()) !== JSON.stringify((getValues('capacidadesPlataforma') || []).sort())) {
      setValue('capacidadesPlataforma', newCapsArray, { shouldDirty: true });
    }
  };

  const handleCapacidadesChange = (capability: CapacidadPlataforma, checked: boolean) => {
    const currentCaps = getValues('capacidadesPlataforma') || [];
    let newCapsArray: CapacidadPlataforma[];

    if (checked) {
      newCapsArray = currentCaps.includes(capability) ? [...currentCaps] : [...currentCaps, capability];
    } else {
      newCapsArray = currentCaps.filter(c => c !== capability);
    }
    setValue('capacidadesPlataforma', newCapsArray, { shouldDirty: true });

    if (capability === 'es_admin_sistema') {
      if (getValues('esAdmin') !== checked) {
        setValue('esAdmin', checked, { shouldDirty: true });
      }
    }
  };
  
  const volverAPath = searchParams.get('volverA') || '/admin/gestion-participantes';

  const handleCancelClick = () => {
    if (isDirty) {
      setNavigationAction(() => () => router.push(volverAPath));
      setIsUnsavedChangesModalOpen(true);
    } else {
      router.push(volverAPath);
    }
  };

  const triggerSubmitAndNavigate = async () => {
    const isValid = await trigger();
    if (isValid) {
      const submitResult = await form.handleSubmit(handleMainSubmit)();
      if (submitResult === true && navigationAction) {
        navigationAction();
      }
    } else {
      toast({ title: "Error de Validación", description: "Por favor, corrige los errores en el formulario.", variant: "destructive" });
    }
    setIsUnsavedChangesModalOpen(false);
  };

  const discardChangesAndExit = () => {
    reset(initialData || formDefaultValues);
    setSelectedFile(null);
    if(initialData?.fotoURL) setPreviewURL(initialData.fotoURL); else setPreviewURL(null);
    setIsSvgPreview(initialData?.fotoURL?.toLowerCase().endsWith('.svg') || initialData?.fotoURL?.includes('data:image/svg+xml') || false);
    
    if (navigationAction) {
      navigationAction();
    }
    setIsUnsavedChangesModalOpen(false);
  };
  
  const categoriaPrincipalValue = watch('categoriaPrincipal');
  let resolvedCategoriaPrincipal = 'ninguno_asignado';
  if (categoriaPrincipalValue && adminSelectableCategoriasPrincipalesPersona.includes(categoriaPrincipalValue as CategoriaPrincipalPersona)) {
      resolvedCategoriaPrincipal = categoriaPrincipalValue;
  }

  const renderImagePreview = () => {
    if (!previewURL || !isValidImageUrl(previewURL)) return null;
    
    return (
      <div className="my-2 flex flex-col items-center">
        <NextImage 
          src={previewURL} 
          alt="Vista previa de foto" 
          width={100} 
          height={100} 
          className="rounded-full object-cover border-2 border-primary/30 shadow-sm h-24 w-24" 
          unoptimized={!!(isSvgPreview && previewURL && !previewURL.startsWith('blob:'))}
        />
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleMainSubmit)} className="space-y-8">
        <Accordion type="multiple" defaultValue={['item-info-basica']} className="w-full space-y-4">
          <AccordionItem value="item-info-basica" className="border-b-0 rounded-lg shadow-md bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
              <CardTitle className="text-xl flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Información Básica</CardTitle>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={control} name="nombre" render={({ field }) => ( <FormItem> <FormLabel>Nombre *</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="apellido" render={({ field }) => ( <FormItem> <FormLabel>Apellido *</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email *</FormLabel> <FormControl><Input type="email" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-foto-perfil" className="border-b-0 rounded-lg shadow-md bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
               <CardTitle className="text-xl flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Foto de Perfil</CardTitle>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-4">
                {renderImagePreview()}
                <FormField
                    control={control}
                    name="fotoURL"
                    render={() => ( 
                    <FormItem>
                        <FormLabel htmlFor="foto-upload">{previewURL ? 'Cambiar Foto' : 'Seleccionar Foto'}</FormLabel>
                        <FormControl>
                            <Input
                                id="foto-upload"
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
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">Subiendo: {uploadProgress.toFixed(0)}%</p>
                </div>
                )}
                {(previewURL || currentFotoURL === 'PENDING_UPLOAD' || selectedFile) && !isUploading && (
                <Button type="button" variant="outline" onClick={handleRemoveImage} className="w-full mt-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50"><Trash2 className="mr-2 h-4 w-4" /> Quitar Foto Actual</Button>
                )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-clasificacion" className="border-b-0 rounded-lg shadow-md bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
              <CardTitle className="text-xl flex items-center gap-2"><Tags className="h-5 w-5 text-primary" /> Clasificación y Roles</CardTitle>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-6">
              <FormField
                control={control}
                name="categoriaPrincipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría Principal *</FormLabel>
                    {isUploading ? (
                        <Input
                            disabled
                            readOnly
                            value={categoriasPrincipalesPersonaLabels[resolvedCategoriaPrincipal as CategoriaPrincipalPersona] || 'Cargando...'}
                            className="h-10"
                        />
                    ) : (
                        <Select
                            onValueChange={(value) => field.onChange(value as CategoriaPrincipalPersona)}
                            value={field.value} // Use direct field.value
                            // The default value is set in useForm
                        >
                        <FormControl><SelectTrigger><SelectValue placeholder="Seleccione una categoría" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {adminSelectableCategoriasPrincipalesPersona.map(cat => (
                            <SelectItem key={cat} value={cat}>{categoriasPrincipalesPersonaLabels[cat]}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={control}
                  name="capacidadesPlataforma"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                          <FormLabel className="text-base">Capacidades en la Plataforma</FormLabel>
                          <FormDescription>Asigna los roles o permisos que tendrá este participante.</FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                      {allCapacidadesPlataformaOptions.map((capacidad) => {
                        const isProjectRelated = projectRelatedCapacities.includes(capacidad);
                        return (
                          <FormField
                            key={capacidad}
                            control={control}
                            name="capacidadesPlataforma"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                      checked={(field.value || []).includes(capacidad)}
                                      onCheckedChange={(checked) => handleCapacidadesChange(capacidad, !!checked)}
                                      disabled={isProjectRelated}
                                    />
                                </FormControl>
                                <div className="flex flex-col">
                                  <FormLabel className="font-normal text-sm leading-none">
                                      {capacidadesPlataformaLabels[capacidad]}
                                  </FormLabel>
                                  {isProjectRelated && (
                                    <FormDescription className="text-xs leading-tight">
                                      (Asignado por participación en proyectos)
                                    </FormDescription>
                                  )}
                                </div>
                                </FormItem>
                            )}
                          />
                        );
                      })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
              />
              <FormField control={control} name="activo" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"> <div className="space-y-0.5"> <FormLabel>Participante Activo</FormLabel> </div> <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={control} name="esAdmin" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"> <div className="space-y-0.5"> <FormLabel>Administrador del Sistema</FormLabel> <FormDescription className="text-xs">Otorga acceso completo al panel de administración.</FormDescription> </div> <FormControl><Switch checked={field.value} onCheckedChange={(checked) => handleEsAdminChange(!!checked)} /></FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={control} name="visibilidadPerfil" render={({ field }) => ( <FormItem> <FormLabel>Visibilidad del Perfil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'solo_registrados_plataforma'}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccione visibilidad" /></SelectTrigger></FormControl>
                      <SelectContent> {visibilidadPerfilOptions.map(option => ( <SelectItem key={option} value={option}>{visibilidadPerfilLabels[option]}</SelectItem> ))} </SelectContent>
                  </Select> <FormMessage />
              </FormItem> )}/>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-info-cet" className="border-b-0 rounded-lg shadow-md bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
              <CardTitle className="text-xl flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary"/> Información CET N°26</CardTitle>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-4">
              {watchedCategoriaPrincipal === 'estudiante_cet' && (
                <FormField control={control} name="anoCursadaActualCET" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Año de Cursada Actual (CET)</FormLabel>
                    <FormControl><Input type="number" {...field} value={String(field.value ?? '')} onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              )}
              <FormField control={control} name="esExAlumnoCET" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5"> <FormLabel>Es Ex-alumno/a del CET N°26</FormLabel> </div>
                  <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              {(watchedCategoriaPrincipal === 'ex_alumno_cet' || watch('esExAlumnoCET')) && (
                <>
                  <FormField control={control} name="anoEgresoCET" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Año de Egreso (CET)</FormLabel>
                      <FormControl><Input type="number" {...field} value={String(field.value ?? '')} onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))} placeholder="Ej: 2015" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={control} name="titulacionObtenidaCET" render={({ field }) => (
                    <FormItem> <FormLabel>Titulación Obtenida en CET N°26</FormLabel> <FormControl><Input {...field} value={field.value || ''} placeholder="Ej: Técnico en Producción Agropecuaria"/></FormControl> <FormMessage /> </FormItem>
                  )}/>
                </>
              )}
              <FormField control={control} name="proyectoFinalCETId" render={({ field }) => (
                <FormItem> <FormLabel>ID del Proyecto Final del CET (Opcional)</FormLabel> <FormControl><Input {...field} value={field.value || ''} placeholder="ID del proyecto en esta plataforma"/></FormControl> <FormMessage /> </FormItem>
              )}/>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-info-profesional" className="border-b-0 rounded-lg shadow-md bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardTitle className="text-xl flex items-center gap-2"><InfoIcon className="h-5 w-5 text-primary"/> Perfil Profesional y Personal</CardTitle>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-4">
                <FormField control={control} name="descripcionPersonalOProfesional" render={({ field }) => ( <FormItem> <FormLabel>Descripción Personal/Profesional (Biografía Corta)</FormLabel> <FormControl><Textarea {...field} value={field.value || ''} rows={4} placeholder="Una breve presentación sobre la persona, sus intereses principales, etc."/></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="historiaDeExitoOResumenTrayectoria" render={({ field }) => ( <FormItem> <FormLabel>Resumen de Trayectoria / Historia de Éxito (Opcional)</FormLabel> <FormControl><Textarea {...field} value={field.value || ''} rows={6} placeholder="Detalles sobre su carrera, logros importantes, o una historia relevante."/></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="areasDeInteresOExpertise" render={({ field }) => ( <FormItem> <FormLabel>Áreas de Interés o Expertise (separadas por coma)</FormLabel> <FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} placeholder="Ej: Agroecología, Desarrollo Rural, Energías Renovables"/></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="tituloProfesional" render={({ field }) => ( <FormItem> <FormLabel>Título Profesional</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
            </AccordionContent>
          </AccordionItem>

          {(capacidadesPlataformaWatched?.includes('es_tutor') || capacidadesPlataformaWatched?.includes('es_tutor_invitado')) && (
            <AccordionItem value="item-info-tutor" className="border-b-0 rounded-lg shadow-md bg-card">
                <AccordionTrigger className="p-6 hover:no-underline">
                     <CardTitle className="text-xl flex items-center gap-2"><BookUser className="h-5 w-5 text-primary" /> Información Específica de Tutor</CardTitle>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0 space-y-4">
                    <FormField control={control} name="tituloProfesional" render={({ field }) => ( <FormItem> <FormLabel>Título Profesional del Tutor</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                    {/* <FormField control={control} name="biografiaTutor" render={({ field }) => ( <FormItem> <FormLabel>Biografía del Tutor</FormLabel> <FormControl><Textarea {...field} value={field.value || ''} rows={3} /></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="especialidadesTutor" render={({ field }) => ( <FormItem> <FormLabel>Especialidades del Tutor (separadas por coma)</FormLabel> <FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} /></FormControl> <FormMessage /> </FormItem> )}/> */}
                    <FormField control={control} name="empresaOInstitucionActual" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-1"><Building className="h-4 w-4"/> Organización Principal (si aplica)</FormLabel> <FormControl><Input {...field} value={field.value || ''} placeholder="Nombre de la organización"/></FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={control} name="cargoActual" render={({ field }) => ( <FormItem> <FormLabel>Cargo en Organización (si aplica)</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="item-situacion-laboral" className="border-b-0 rounded-lg shadow-md bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardTitle className="text-xl flex items-center gap-2"><Activity className="h-5 w-5 text-primary"/> Situación Laboral y Colaboración</CardTitle>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-4">
                 <FormField
                    control={control}
                    name="estadoSituacionLaboral"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado Situación Laboral</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(value === NO_ESPECIFICADO_VALUE ? null : value as EstadoSituacionLaboral | null)}
                                value={field.value || NO_ESPECIFICADO_VALUE} 
                            >
                                <FormControl><SelectTrigger><SelectValue placeholder="Seleccione estado laboral" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value={NO_ESPECIFICADO_VALUE}>{estadoSituacionLaboralLabels.no_especificado}</SelectItem>
                                    {estadoSituacionLaboralOptions.filter(o => o !== 'no_especificado').map(option => (
                                        <SelectItem key={option} value={option}>{estadoSituacionLaboralLabels[option]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={control} name="buscandoOportunidades" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"> <div className="space-y-0.5"> <FormLabel>Buscando Oportunidades Laborales/Profesionales</FormLabel> </div> <FormControl><Switch checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="empresaOInstitucionActual" render={({ field }) => ( <FormItem> <FormLabel>Empresa o Institución Actual (si no es la de tutor)</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="cargoActual" render={({ field }) => ( <FormItem> <FormLabel>Cargo Actual (si no es el de tutor)</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="disponibleParaProyectos" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"> <div className="space-y-0.5"> <FormLabel>Disponible para Nuevos Proyectos/Colaboraciones</FormLabel> </div> <FormControl><Switch checked={field.value ?? true} onCheckedChange={field.onChange} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="ofreceColaboracionComo" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center gap-1"><HandHeart className="h-4 w-4"/> Ofrece Colaboración Como (ej: mentoría, asesoría técnica - separar por coma)</FormLabel> <FormControl><Input {...field} value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} placeholder="Ej: Mentoría técnica, Asesoría en riego"/></FormControl> <FormMessage /> </FormItem> )}/>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-contacto-adicional" className="border-b-0 rounded-lg shadow-md bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardTitle className="text-xl flex items-center gap-2"><PhoneIcon className="h-5 w-5 text-primary" /> Contacto Adicional y Enlaces</CardTitle>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-4">
                <FormField control={control} name="telefonoContacto" render={({ field }) => ( <FormItem> <FormLabel>Teléfono de Contacto</FormLabel> <FormControl><Input type="tel" {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormItem>
                    <div className="flex items-center justify-between mb-2">
                        <FormLabel>Links Profesionales/Sociales (Opcional)</FormLabel>
                        <Button type="button" size="sm" variant="outline" onClick={() => appendLink({ tipo: "", url: "" })}> <PlusCircle className="mr-2 h-4 w-4" /> Añadir Link </Button>
                    </div>
                    {linkFields.map((item, index) => (
                    <Card key={item.id} className="p-3 my-2 bg-muted/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <FormField control={control} name={`linksProfesionales.${index}.tipo`} render={({ field: linkField }) => ( <FormItem> <FormLabel>Tipo de Enlace</FormLabel> <FormControl><Input {...linkField} value={linkField.value || ''} placeholder="Ej: LinkedIn, Portfolio"/></FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={control} name={`linksProfesionales.${index}.url`} render={({ field: linkField }) => ( <FormItem> <FormLabel>URL del Enlace</FormLabel> <FormControl><Input type="url" {...linkField} value={linkField.value || ''} placeholder="https://..."/></FormControl> <FormMessage /> </FormItem> )}/>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLink(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </Card>
                    ))}
                    {errors.linksProfesionales && typeof errors.linksProfesionales === 'object' && 'message' in errors.linksProfesionales && !Array.isArray(errors.linksProfesionales) && (
                        <FormMessage>{errors.linksProfesionales.message as string}</FormMessage>
                    )}
                </FormItem>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-ubicacion" className="border-b-0 rounded-lg shadow-md bg-card">
            <AccordionTrigger className="p-6 hover:no-underline">
                <CardTitle className="text-xl flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Ubicación (Opcional)</CardTitle>
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                <FormField control={control} name="ubicacion.latitud" render={({ field }) => ( <FormItem> <FormLabel>Latitud</FormLabel> <FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="ubicacion.longitud" render={({ field }) => ( <FormItem> <FormLabel>Longitud</FormLabel> <FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={control} name="ubicacion.direccionTextoCompleto" render={({ field }) => ( <FormItem> <FormLabel>Dirección Completa</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="ubicacion.calleYNumero" render={({ field }) => ( <FormItem> <FormLabel>Calle y Número</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={control} name="ubicacion.localidad" render={({ field }) => ( <FormItem> <FormLabel>Localidad</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="ubicacion.parajeORural" render={({ field }) => ( <FormItem> <FormLabel>Paraje o Zona Rural</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="ubicacion.provincia" render={({ field }) => ( <FormItem> <FormLabel>Provincia</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={control} name="ubicacion.pais" render={({ field }) => ( <FormItem> <FormLabel>País</FormLabel> <FormControl><Input {...field} value={field.value || ''} /></FormControl> <FormMessage /> </FormItem> )}/>
                </div>
                <FormField control={control} name="ubicacion.referenciasAdicionales" render={({ field }) => ( <FormItem> <FormLabel>Referencias Adicionales de Ubicación</FormLabel> <FormControl><Textarea {...field} value={field.value || ''} rows={2}/></FormControl> <FormMessage /> </FormItem> )}/>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancelClick}
            size="default"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={parentIsSubmitting || isUploading}
            size="default"
          >
            {parentIsSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </div>
      </form>
      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onClose={() => setIsUnsavedChangesModalOpen(false)}
        onConfirmSaveAndExit={triggerSubmitAndNavigate}
        onConfirmDiscardAndExit={discardChangesAndExit}
      />
    </Form>
  );
}
