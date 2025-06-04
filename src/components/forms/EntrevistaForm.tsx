// EntrevistaForm.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  entrevistaSchema,
  type EntrevistaFormData,
  tipoContenidoEntrevistaOptions,
  plataformaVideoPropioOptions,
  plataformaVideoExternoOptions,
} from "@/lib/schemas/entrevistaSchema";
import { stringToArrayZod } from "@/lib/schemas/projectSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  Video,
  Link as LinkIcon,
  UserCircle,
  Users,
  Tag,
  Image as ImageIcon,
  Trash2,
  Loader2,
  ChevronsUpDown,
  Check,
  PlusCircle,
  X,
  CalendarDays,
} from "lucide-react";
import NextImage from "next/image";
import { supabase } from "@/lib/supabase/supabaseClient";

import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import UnsavedChangesModal from "@/components/modals/UnsavedChangesModal";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getAllTemasActivos } from "@/lib/supabase/services/temasService";
import type { Tema, TemaOption } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "../ui/badge";
import AddTemaModal from "./AddTemaModal";
import { uploadFile } from "@/lib/supabase/supabaseStorage";

interface EntrevistaFormProps {
  onSubmit: (data: EntrevistaFormData) => Promise<boolean>;
  initialData?: EntrevistaFormData;
  isSubmitting: boolean;
  volverAPath: string;
}

const isValidUrl = (url: string | null): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function EntrevistaForm({
  onSubmit: parentOnSubmit,
  initialData,
  isSubmitting: parentIsSubmitting,
  volverAPath,
}: EntrevistaFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  // ─── File Upload State ─────────────────────────────────────────────────────
  const [selectedMiniaturaFile, setSelectedMiniaturaFile] =
    useState<File | null>(null);
  const [previewMiniaturaURL, setPreviewMiniaturaURL] = useState<string | null>(
    null
  );
  const [uploadMiniaturaProgress, setUploadMiniaturaProgress] =
    useState<number>(0);
  const [isUploadingMiniatura, setIsUploadingMiniatura] =
    useState<boolean>(false);

  const [selectedTranscripcionFile, setSelectedTranscripcionFile] =
    useState<File | null>(null);
  const [uploadTranscripcionProgress, setUploadTranscripcionProgress] =
    useState<number>(0);
  const [isUploadingTranscripcion, setIsUploadingTranscripcion] =
    useState<boolean>(false);

  // ─── Unsaved Changes Modal ──────────────────────────────────────────────────
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false);
  const [navigationAction, setNavigationAction] = useState<(() => void) | null>(
    null
  );

  // ─── Temas Selection State ─────────────────────────────────────────────────
  const [allActiveTemas, setAllActiveTemas] = useState<TemaOption[]>([]);
  const [selectedTemaObjects, setSelectedTemaObjects] = useState<TemaOption[]>(
    []
  );
  const [loadingTemas, setLoadingTemas] = useState(true);
  const [isAddTemaModalOpen, setIsAddTemaModalOpen] = useState(false);

  // ─── Form Default Values ────────────────────────────────────────────────────
  const formDefaultValues: EntrevistaFormData = {
    tipoContenido: "video_propio",
    tituloSaber: "",
    descripcionSaber: "",
    videoPropioURL: "",
    plataformaVideoPropio: null,
    urlVideoExterno: "",
    plataformaVideoExterno: null,
    fuenteVideoExterno: "",
    fechaGrabacionORecopilacion: new Date(),
    ambitoSaber: "",
    temas: [], // ← Cambiado: ahora es array de Tema
    palabrasClaveSaber: [],
    fuentesInformacion: [],
    recopiladoPorUids: [],
    transcripcionTextoCompleto: "",
    transcripcionFileURL: "",
    imagenMiniaturaURL: "",
    duracionMediaMinutos: undefined,
    estaPublicada: false,
  };

  const form = useForm<EntrevistaFormData>({
    resolver: zodResolver(entrevistaSchema),
    defaultValues: initialData || formDefaultValues,
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty: formHookIsDirty },
    reset,
    setValue,
    watch,
    trigger,
    getValues,
  } = form;

  const tipoContenido = watch("tipoContenido");
  const currentMiniaturaURL = watch("imagenMiniaturaURL");
  const currentTranscripcionURL = watch("transcripcionFileURL");
  const currentTemas = watch("temas") as Tema[] | undefined;

  // Comparar si hay cambios en temas (por IDs)
  const isFormEffectivelyDirty =
    formHookIsDirty ||
    JSON.stringify((initialData?.temas || []).map((t) => t.id).sort()) !==
      JSON.stringify((currentTemas || []).map((t) => t.id).sort());

  // ─── Fetch Temas Activos ────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchTemas() {
      setLoadingTemas(true);
      try {
        const temasData = await getAllTemasActivos();
        setAllActiveTemas(temasData);

        // Si initialData tiene temas, marcarlos como seleccionados
        if (initialData?.temas) {
          const opcionesIniciales: TemaOption[] = initialData.temas.map(
            (t) => ({
              id: t.id,
              nombre: t.nombre,
            })
          );
          setSelectedTemaObjects(opcionesIniciales);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los temas.",
          variant: "destructive",
        });
      } finally {
        setLoadingTemas(false);
      }
    }
    fetchTemas();
  }, [toast, initialData?.temas]);

  // ─── Sincronizar selectedTemaObjects con initialData y allActiveTemas ───────
  useEffect(() => {
    if (initialData) {
      // Preparar valores para el form
      const dataForForm: EntrevistaFormData = {
        ...initialData,
        temas: Array.isArray(initialData.temas) ? initialData.temas : [],
        palabrasClaveSaber: Array.isArray(initialData.palabrasClaveSaber)
          ? initialData.palabrasClaveSaber
          : [],
        fuentesInformacion: Array.isArray(initialData.fuentesInformacion)
          ? initialData.fuentesInformacion
          : [],
        recopiladoPorUids: Array.isArray(initialData.recopiladoPorUids)
          ? initialData.recopiladoPorUids
          : [],
        plataformaVideoPropio: initialData.plataformaVideoPropio || null,
        plataformaVideoExterno: initialData.plataformaVideoExterno || null,
      };
      reset(dataForForm);

      // Vista previa de miniatura si existe URL válida
      if (
        initialData.imagenMiniaturaURL &&
        isValidUrl(initialData.imagenMiniaturaURL)
      ) {
        setPreviewMiniaturaURL(initialData.imagenMiniaturaURL);
      }

      // selectedTemaObjects ya se estableció arriba al cargar los temas activos
    } else {
      // Si no hay initialData, restablecer form y estados relacionados
      reset(formDefaultValues);
      setPreviewMiniaturaURL(null);
      setSelectedMiniaturaFile(null);
      setSelectedTranscripcionFile(null);
      setSelectedTemaObjects([]);
    }
  }, [initialData, reset, allActiveTemas]);

  // ─── Actualizar selectedTemaObjects cuando cambian los valores en el form ────
  useEffect(() => {
    if (currentTemas && Array.isArray(currentTemas)) {
      setSelectedTemaObjects(currentTemas);
    } else {
      setSelectedTemaObjects([]);
    }
  }, [currentTemas]);

  // ─── Vista previa de miniatura (blob o URL existente) ────────────────────────
  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    if (selectedMiniaturaFile) {
      objectUrlToRevoke = previewMiniaturaURL?.startsWith("blob:")
        ? previewMiniaturaURL
        : null;
      const newObjectUrl = URL.createObjectURL(selectedMiniaturaFile);
      setPreviewMiniaturaURL(newObjectUrl);
    } else if (
      currentMiniaturaURL &&
      isValidUrl(currentMiniaturaURL) &&
      currentMiniaturaURL !== "PENDING_UPLOAD_MINIATURA"
    ) {
      if (previewMiniaturaURL?.startsWith("blob:"))
        objectUrlToRevoke = previewMiniaturaURL;
      setPreviewMiniaturaURL(currentMiniaturaURL);
    } else if (!currentMiniaturaURL && !selectedMiniaturaFile) {
      if (previewMiniaturaURL?.startsWith("blob:"))
        objectUrlToRevoke = previewMiniaturaURL;
      setPreviewMiniaturaURL(null);
    }
    return () => {
      if (objectUrlToRevoke) URL.revokeObjectURL(objectUrlToRevoke);
    };
  }, [selectedMiniaturaFile, currentMiniaturaURL, previewMiniaturaURL]);

  // ─── Manejadores de archivos ─────────────────────────────────────────────────
  const handleMiniaturaFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setValue("imagenMiniaturaURL", "PENDING_UPLOAD_MINIATURA", {
        shouldDirty: true,
      });
      setSelectedMiniaturaFile(file);
      setUploadMiniaturaProgress(0);
    } else {
      setSelectedMiniaturaFile(null);
      if (watch("imagenMiniaturaURL") === "PENDING_UPLOAD_MINIATURA") {
        setValue("imagenMiniaturaURL", initialData?.imagenMiniaturaURL || "", {
          shouldDirty: true,
        });
      }
    }
  };

  const handleRemoveMiniatura = () => {
    setSelectedMiniaturaFile(null);
    setValue("imagenMiniaturaURL", "", { shouldDirty: true });
    setUploadMiniaturaProgress(0);
    toast({ title: "Miniatura Quitada" });
  };

  const handleTranscripcionFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setValue("transcripcionFileURL", "PENDING_UPLOAD_TRANSCRIPCION", {
        shouldDirty: true,
      });
      setSelectedTranscripcionFile(file);
      setUploadTranscripcionProgress(0);
    } else {
      setSelectedTranscripcionFile(null);
      if (watch("transcripcionFileURL") === "PENDING_UPLOAD_TRANSCRIPCION") {
        setValue(
          "transcripcionFileURL",
          initialData?.transcripcionFileURL || "",
          { shouldDirty: true }
        );
      }
    }
  };

  const handleRemoveTranscripcion = () => {
    setSelectedTranscripcionFile(null);
    setValue("transcripcionFileURL", "", { shouldDirty: true });
    setUploadTranscripcionProgress(0);
    toast({ title: "Archivo de Transcripción Quitado" });
  };

  // ─── Al crear un nuevo Tema desde el Modal ──────────────────────────────────
  const handleTemaCreatedFromModal = (newTema: Tema) => {
    // Agregar a la lista de todos los temas
    setAllActiveTemas((prev) =>
      [...prev, newTema].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );

    // Si no estaba seleccionado, agregarlo
    const currentSelected = getValues("temas") || [];
    const isAlreadySelected = currentSelected.some((t) => t.id === newTema.id);
    if (!isAlreadySelected) {
      const newSelected = [...currentSelected, newTema];
      setValue("temas", newSelected, {
        shouldDirty:
          JSON.stringify(newSelected.map((t) => t.id).sort()) !==
          JSON.stringify((initialData?.temas || []).map((t) => t.id).sort()),
      });
      setSelectedTemaObjects((prev) =>
        [...prev, newTema].sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
    }
    trigger("temas");
  };

  // ─── Enviar Formulario ──────────────────────────────────────────────────────
  const handleMainSubmit = async (dataFromHookForm: EntrevistaFormData) => {
    let finalData = { ...dataFromHookForm };

    // ── Miniatura ──────────────────────────────────────────────────────────────
    if (selectedMiniaturaFile) {
      setIsUploadingMiniatura(true);
      try {
        finalData.imagenMiniaturaURL = await uploadFile(
          selectedMiniaturaFile,
          "miniaturas",
          setUploadMiniaturaProgress
        );

      } catch {
        setIsUploadingMiniatura(false);
        return false;
      }
      setIsUploadingMiniatura(false);
    } else if (finalData.imagenMiniaturaURL === "PENDING_UPLOAD_MINIATURA") {
      finalData.imagenMiniaturaURL = initialData?.imagenMiniaturaURL || "";
    }

    // ── Transcripción ──────────────────────────────────────────────────────────
    if (selectedTranscripcionFile) {
      setIsUploadingTranscripcion(true);
      try {
        finalData.transcripcionFileURL = await uploadFile(
          selectedTranscripcionFile,
          "transcripciones",
          setUploadTranscripcionProgress
        );
      } catch {
        setIsUploadingTranscripcion(false);
        return false;
      }
      setIsUploadingTranscripcion(false);
    } else if (
      finalData.transcripcionFileURL === "PENDING_UPLOAD_TRANSCRIPCION"
    ) {
      finalData.transcripcionFileURL = initialData?.transcripcionFileURL || "";
    }

    // ── Preparar temas para enviar ─────────────────────────────────────────────
    // Si tu service espera temasIds en lugar de objetos Tema, descomenta la línea siguiente:
    // finalData.temasIds = selectedTemaObjects.map(t => t.id);

    const success = await parentOnSubmit(finalData);
    if (success) {
      setSelectedMiniaturaFile(null);
      setSelectedTranscripcionFile(null);
      if (!initialData) {
        reset(formDefaultValues);
        setSelectedTemaObjects([]);
      } else {
        reset(finalData);
      }
      setPreviewMiniaturaURL(finalData.imagenMiniaturaURL || null);
    }
    return success;
  };

  // ─── Cancelar con alerta de cambios sin guardar ─────────────────────────────
  const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFormEffectivelyDirty) {
      setNavigationAction(() => () => router.push(volverAPath));
      setIsUnsavedChangesModalOpen(true);
    } else {
      router.push(volverAPath);
    }
  };

  const triggerSubmitAndNavigate = async () => {
    // 1) Validamos manualmente con trigger()
    const isValid = await trigger();
    if (!isValid) {
      toast({ title: "Error de Validación", variant: "destructive" });
      setIsUnsavedChangesModalOpen(false);
      return;
    }

    // 2) Obtenemos los datos del formulario
    const formData = getValues(); // si necesitas todos los campos
    //    o bien pasas directamente el callback a handleSubmit, pero extraeremos el valor
    //    manualmente para capturar el boolean.

    // 3) Llamamos a tu función y capturamos el resultado
    const success = await handleMainSubmit(formData);
    if (success && navigationAction) {
      navigationAction();
    }

    setIsUnsavedChangesModalOpen(false);
  };
  

  const discardChangesAndExit = () => {
    reset(initialData || formDefaultValues);
    setSelectedMiniaturaFile(null);
    setSelectedTranscripcionFile(null);
    setPreviewMiniaturaURL(initialData?.imagenMiniaturaURL || null);
    setSelectedTemaObjects(initialData?.temas || []);
    if (navigationAction) navigationAction();
    setIsUnsavedChangesModalOpen(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleMainSubmit)} className="space-y-6">
        {/* ─── Información General del Saber/Entrevista ─────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Información General del Saber/Entrevista
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {/* Tipo de Contenido */}
            <FormField
              control={control}
              name="tipoContenido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contenido *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tipoContenidoEntrevistaOptions.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Título */}
            <FormField
              control={control}
              name="tituloSaber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Saber/Entrevista *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción/Resumen */}
            <FormField
              control={control}
              name="descripcionSaber"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descripción/Resumen *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Breve descripción del contenido..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Entrevistados/Fuentes */}
            <FormField
              control={control}
              name="fuentesInformacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Entrevistado(s): (separados por coma)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        Array.isArray(field.value)
                          ? field.value.join(", ")
                          : field.value || ""
                      }
                      onChange={(e) =>
                        field.onChange(stringToArrayZod.parse(e.target.value))
                      }
                      placeholder="Ej: Juan Pérez, Familia Rodríguez"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recopilado por UIDs */}
            <FormField
              control={control}
              name="recopiladoPorUids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <UserCircle className="h-4 w-4" />
                    Recopilado por (UIDs separados por coma, opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        Array.isArray(field.value)
                          ? field.value.join(", ")
                          : field.value || ""
                      }
                      onChange={(e) =>
                        field.onChange(stringToArrayZod.parse(e.target.value))
                      }
                      placeholder="UID1, UID2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Detalles Video Propio ────────────────────────────────────── */}
        {tipoContenido === "video_propio" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Detalles del Video Propio
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              {/* URL Video Propio */}
              <FormField
                control={control}
                name="videoPropioURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      URL del Video Propio* (Ej: enlace de supabase Storage,
                      YouTube propio)
                    </FormLabel>
                    <FormControl>
                      <Input type="url" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plataforma Video Propio */}
              <FormField
                control={control}
                name="plataformaVideoPropio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataforma (Video Propio)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione plataforma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plataformaVideoPropioOptions.map((val) => (
                          <SelectItem key={val} value={val}>
                            {val.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* ─── Detalles Video Externo ───────────────────────────────────── */}
        {tipoContenido === "enlace_video_externo" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Detalles del Video Externo
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              {/* URL Video Externo */}
              <FormField
                control={control}
                name="urlVideoExterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Video Externo *</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        {...field}
                        value={field.value || ""}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Plataforma Video Externo */}
              <FormField
                control={control}
                name="plataformaVideoExterno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataforma (Video Externo)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione plataforma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plataformaVideoExternoOptions.map((val) => (
                          <SelectItem key={val} value={val}>
                            {val.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fuente Video Externo */}
              <FormField
                control={control}
                name="fuenteVideoExterno"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Fuente (Ej: Nombre del Canal/Página)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* ─── Clasificación y Metadatos ──────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Clasificación y Metadatos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {/* Fecha de Grabación/Recopilación */}
            <FormField
              control={control}
              name="fechaGrabacionORecopilacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Grabación/Recopilación *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ámbito del Saber */}
            <FormField
              control={control}
              name="ambitoSaber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Ámbito del Saber (Ej: Gastronomía, Artesanía, Agricultura)
                  </FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ─── Temas Asociados ────────────────────────────────────────── */}
            <FormField
              control={control}
              name="temas"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Temas Asociados
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAddTemaModalOpen(true);
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Tema
                    </Button>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between h-auto min-h-10 py-2",
                            !selectedTemaObjects.length &&
                              "text-muted-foreground"
                          )}
                        >
                          <span className="flex flex-wrap gap-1">
                            {selectedTemaObjects.length > 0
                              ? selectedTemaObjects.map((t) => (
                                  <Badge key={t.id} variant="secondary">
                                    {t.nombre}
                                  </Badge>
                                ))
                              : "Seleccionar temas..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Buscar tema..."
                          disabled={loadingTemas}
                        />
                        <CommandList>
                          {loadingTemas && (
                            <CommandEmpty>Cargando temas...</CommandEmpty>
                          )}
                          {!loadingTemas && allActiveTemas.length === 0 && (
                            <CommandEmpty>
                              No hay temas disponibles.
                            </CommandEmpty>
                          )}
                          <CommandGroup>
                            <ScrollArea className="max-h-48">
                              {allActiveTemas.map((tema) => {
                                const isChecked = selectedTemaObjects.some(
                                  (t) => t.id === tema.id
                                );
                                return (
                                  <CommandItem
                                    key={tema.id}
                                    value={tema.nombre}
                                    onSelect={() => {
                                      // Cambiamos "Tema[]" por "TemaOption[]"
                                      let newSelected: TemaOption[];

                                      // "isChecked" debería venir de:
                                      // const isChecked = selectedTemaObjects.some(t => t.id === tema.id);

                                      if (isChecked) {
                                        // Eliminamos el tema actual de la lista
                                        newSelected =
                                          selectedTemaObjects.filter(
                                            (t) => t.id !== tema.id
                                          );
                                      } else {
                                        // Añadimos el tema actual (que ya es TemaOption)
                                        newSelected = [
                                          ...selectedTemaObjects,
                                          tema,
                                        ];
                                      }

                                      // Ahora "newSelected" es TemaOption[], acorde a setValue("temas", …)
                                      field.onChange(newSelected);
                                      trigger("temas");
                                    }}
                                  >
                                    <Checkbox
                                      className="mr-2"
                                      checked={isChecked}
                                      id={`tema-saber-${tema.id}`}
                                    />
                                    <label
                                      htmlFor={`tema-saber-${tema.id}`}
                                      className="cursor-pointer flex-1"
                                    >
                                      {tema.nombre}
                                    </label>
                                  </CommandItem>
                                );
                              })}
                            </ScrollArea>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />

                  {selectedTemaObjects.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <FormDescription className="text-xs">
                        Temas Seleccionados:
                      </FormDescription>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemaObjects.map((tema) => (
                          <Badge
                            key={tema.id}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            {tema.nombre}
                            <button
                              type="button"
                              aria-label={`Quitar tema ${tema.nombre}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newSelected = selectedTemaObjects.filter(
                                  (t) => t.id !== tema.id
                                );
                                field.onChange(newSelected);
                                trigger("temas");
                              }}
                              className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                            >
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

            {/* Palabras Clave */}
            <FormField
              control={control}
              name="palabrasClaveSaber"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Palabras Clave (separadas por coma)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        Array.isArray(field.value)
                          ? field.value.join(", ")
                          : field.value || ""
                      }
                      onChange={(e) =>
                        field.onChange(stringToArrayZod.parse(e.target.value))
                      }
                      placeholder="Ej: Tradición, Receta, Lluvia"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duración (minutos) */}
            <FormField
              control={control}
              name="duracionMediaMinutos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={String(field.value ?? "")}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value, 10)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Archivos Adicionales ──────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Archivos Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            {/* Miniatura */}
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Imagen Miniatura (Opcional)
              </FormLabel>
              {previewMiniaturaURL && isValidUrl(previewMiniaturaURL) && (
                <div className="my-2">
                  <NextImage
                    src={previewMiniaturaURL}
                    alt="Vista previa miniatura"
                    width={150}
                    height={100}
                    className="rounded-md object-cover border shadow-sm"
                  />
                </div>
              )}
              <FormField
                control={control}
                name="imagenMiniaturaURL"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="miniatura-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleMiniaturaFileChange}
                        className="text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isUploadingMiniatura && (
                <div className="mt-1 space-y-1">
                  <Progress
                    value={uploadMiniaturaProgress}
                    className="w-full h-1.5"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Subiendo: {uploadMiniaturaProgress.toFixed(0)}%
                  </p>
                </div>
              )}
              {(previewMiniaturaURL ||
                currentMiniaturaURL === "PENDING_UPLOAD_MINIATURA" ||
                selectedMiniaturaFile) &&
                !isUploadingMiniatura && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveMiniatura}
                    className="mt-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Quitar Miniatura
                  </Button>
                )}
            </FormItem>

            {/* Transcripción */}
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Archivo de Transcripción (PDF, TXT - Opcional)
              </FormLabel>
              {currentTranscripcionURL &&
                isValidUrl(currentTranscripcionURL) &&
                !currentTranscripcionURL.startsWith("PENDING") && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Actual:{" "}
                    <a
                      href={currentTranscripcionURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      {currentTranscripcionURL.substring(0, 50)}...
                    </a>
                  </p>
                )}
              <FormField
                control={control}
                name="transcripcionFileURL"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="transcripcion-upload"
                        type="file"
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={handleTranscripcionFileChange}
                        className="text-sm file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isUploadingTranscripcion && (
                <div className="mt-1 space-y-1">
                  <Progress
                    value={uploadTranscripcionProgress}
                    className="w-full h-1.5"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Subiendo: {uploadTranscripcionProgress.toFixed(0)}%
                  </p>
                </div>
              )}
              {(currentTranscripcionURL === "PENDING_UPLOAD_TRANSCRIPCION" ||
                selectedTranscripcionFile) &&
                !isUploadingTranscripcion && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveTranscripcion}
                    className="mt-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Quitar Transcripción
                  </Button>
                )}
              {selectedTranscripcionFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Seleccionado: {selectedTranscripcionFile.name}
                </p>
              )}
            </FormItem>

            {/* Texto de Transcripción */}
            <FormField
              control={control}
              name="transcripcionTextoCompleto"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    Texto de Transcripción (si no hay archivo)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={8}
                      placeholder="Pegar aquí el texto completo de la transcripción..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Configuración de Visibilidad ──────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Configuración de Visibilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="estaPublicada"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Publicar Entrevista</FormLabel>
                    <FormDescription className="text-xs">
                      Hacer visible en el sitio público.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ─── Botones ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelClick}
            disabled={
              parentIsSubmitting ||
              isUploadingMiniatura ||
              isUploadingTranscripcion
            }
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              parentIsSubmitting ||
              isUploadingMiniatura ||
              isUploadingTranscripcion ||
              (!!initialData && !isFormEffectivelyDirty)
            }
            className="min-w-[150px]"
          >
            {(parentIsSubmitting ||
              isUploadingMiniatura ||
              isUploadingTranscripcion) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {parentIsSubmitting ||
            isUploadingMiniatura ||
            isUploadingTranscripcion
              ? isUploadingMiniatura
                ? "Subiendo miniatura..."
                : isUploadingTranscripcion
                ? "Subiendo transcripción..."
                : initialData
                ? "Actualizando..."
                : "Creando..."
              : initialData
              ? "Actualizar Entrevista"
              : "Crear Entrevista"}
          </Button>
        </div>
      </form>

      {/* ─── Modal Cambios Sin Guardar ─────────────────────────────────────────── */}
      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onClose={() => setIsUnsavedChangesModalOpen(false)}
        onConfirmSaveAndExit={triggerSubmitAndNavigate}
        onConfirmDiscardAndExit={discardChangesAndExit}
      />

      {/* ─── Modal para Crear Nuevo Tema ─────────────────────────────────────── */}
      {isAddTemaModalOpen && (
        <AddTemaModal
          open={isAddTemaModalOpen}
          onOpenChange={setIsAddTemaModalOpen}
          onTemaCreated={handleTemaCreatedFromModal}
        />
      )}
    </Form>
  );
}
