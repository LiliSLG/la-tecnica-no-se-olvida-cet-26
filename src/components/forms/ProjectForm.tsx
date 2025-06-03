"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData, estadoOptions, estadoLabels, stringToArray } from '@/lib/schemas/projectSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { CalendarIcon, PlusCircle, Trash2, X, Loader2, Search as SearchIcon, Users, Briefcase, UserPlus, Building as BuildingIcon, Link as LinkIconLucide, TagsIcon as ProjectTagsIcon, Check, ChevronsUpDown, Tag as SingleTagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import type { Persona, FormAuthor, FormOrganizacion, CapacidadPlataforma, Organizacion, Tema, CategoriaPrincipalPersona, TipoOrganizacion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { searchPersonas, getPersonasByIds, createPersonaPlaceholder } from '@/lib/supabase/personasService';
import { searchOrganizacionesByName, getOrganizacionesByIds, addOrganizacion } from '@/lib/supabase/organizacionesService';
import { getAllTemasActivos as getAllTemasActivosService, getTemasByIds as getTemasByIdsService } from '@/lib/supabase/temasService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import AddPersonaModal from './AddPersonaModal';
import AddOrganizacionModal from './AddOrganizacionModal';
import AddTemaModal from './AddTemaModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from '@/components/ui/checkbox';
import UnsavedChangesModal from '@/components/modals/UnsavedChangesModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { categoriasPrincipalesPersonaLabels } from '@/lib/schemas/personaSchema';

const opcionesCategoriaAutor: Array<{ value: CategoriaPrincipalPersona; label: string; }> = [
  { value: 'estudiante_cet', label: categoriasPrincipalesPersonaLabels['estudiante_cet'] },
  { value: 'ex_alumno_cet', label: categoriasPrincipalesPersonaLabels['ex_alumno_cet'] },
  { value: 'docente_cet', label: categoriasPrincipalesPersonaLabels['docente_cet'] }, // Added for completeness
  { value: 'otro', label: categoriasPrincipalesPersonaLabels['otro'] },
  { value: 'ninguno_asignado', label: categoriasPrincipalesPersonaLabels['ninguno_asignado']}
];
const opcionesCategoriaTutor: Array<{ value: CategoriaPrincipalPersona; label: string; }> = [
  { value: 'docente_cet', label: categoriasPrincipalesPersonaLabels['docente_cet'] },
  { value: 'productor_rural', label: categoriasPrincipalesPersonaLabels['productor_rural'] },
  { value: 'profesional_externo', label: categoriasPrincipalesPersonaLabels['profesional_externo'] },
  { value: 'investigador', label: categoriasPrincipalesPersonaLabels['investigador'] },
  { value: 'ex_alumno_cet', label: categoriasPrincipalesPersonaLabels['ex_alumno_cet'] },
  { value: 'otro', label: categoriasPrincipalesPersonaLabels['otro'] },
  { value: 'ninguno_asignado', label: categoriasPrincipalesPersonaLabels['ninguno_asignado']}
];
const opcionesCategoriaColaborador: Array<{ value: CategoriaPrincipalPersona; label: string; }> = [
  ...opcionesCategoriaTutor, 
  { value: 'comunidad_general', label: categoriasPrincipalesPersonaLabels['comunidad_general'] },
];

interface ItemSelectorProps<T extends { id: string; nombre?: string; apellido?: string; nombreOficial?: string; email?: string; tipo?: TipoOrganizacion, isNewPlaceholder?: boolean; }> {
  title: string;
  itemIdentifier: 'autores' | 'tutores' | 'colaboradores' | 'organizaciones';
  selectedItems: T[];
  searchFunction: (term: string) => Promise<any[]>;
  onItemSelect: (item: T) => void;
  onItemRemove: (itemId: string) => void;
  onAddNewItemClick: () => void;
  renderItemLabel: (item: T) => string;
  placeholderText: string;
  isLoading?: boolean;
  formErrors: any; 
  errorField?: keyof ProjectFormData | string; 
  addNewButtonLabel: string;
  icon: React.ReactNode;
}

const ItemSelector: React.FC<ItemSelectorProps<any>> = ({
  title,
  itemIdentifier,
  selectedItems,
  searchFunction,
  onItemSelect,
  onItemRemove,
  onAddNewItemClick,
  renderItemLabel,
  placeholderText,
  isLoading,
  formErrors,
  errorField,
  addNewButtonLabel,
  icon
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast(); // Corregido: removido personSelectorToast

  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchFunction(term);
      const selectedIds = new Set(selectedItems.map(p => p.id));
      setSearchResults(results.filter(r => r.id && !selectedIds.has(r.id)));
    } catch (error) {
      console.error(`Error searching ${title.toLowerCase()}:`, error);
      toast({ title: "Error de Búsqueda", description: `No se pudieron buscar ${title.toLowerCase()}.`, variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  }, [searchFunction, selectedItems, title, toast]);


  const getNestedError = (fieldPath?: string) => {
    if (!fieldPath || !formErrors) return null;
    const pathArray = fieldPath.split('.');
    let error = formErrors;
    for (const key of pathArray) {
      if (error && typeof error === 'object' && key in error) {
        error = error[key];
      } else {
        return null;
      }
    }
    return typeof error === 'object' && error && 'message' in error ? error.message as string : undefined;
  };
  const errorMessage = getNestedError(errorField as string);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${itemIdentifier}-search`}>Buscar Existente</Label>
            <Command className="rounded-lg border shadow-sm">
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <CommandInput
                id={`${itemIdentifier}-search`}
                placeholder={placeholderText}
                value={searchTerm}
                onValueChange={(currentValue) => {
                  setSearchTerm(currentValue);
                  handleSearch(currentValue);
                }}
                className="pl-10 h-10" 
                disabled={isLoading}
              />
              {isSearching && <Loader2 className="absolute right-3 h-4 w-4 animate-spin" />}
            </div>
            {searchResults.length > 0 && searchTerm.length >=2 && (
              <ScrollArea className="max-h-40">
                <CommandList>
                  <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                  <CommandGroup>
                    {searchResults.map(item => (
                      <CommandItem
                        key={item.id}
                        value={renderItemLabel(item)} 
                        onSelect={() => {
                          if (selectedItems.find(p => p.id === item.id)) {
                            toast({ title: "Ya Seleccionado", description: `${renderItemLabel(item)} ya está en la lista.`, variant: "default" });
                            return;
                          }
                          onItemSelect(item);
                          setSearchTerm('');
                          setSearchResults([]);
                        }}
                        className="p-2 hover:bg-accent cursor-pointer text-sm rounded-md"
                      >
                        {renderItemLabel(item)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </ScrollArea>
            )}
          </Command>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddNewItemClick();
          }}
          disabled={isLoading}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> {addNewButtonLabel}
        </Button>
        <div>
          <Label>Seleccionados para este Proyecto:</Label>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay {title.toLowerCase().replace(/\(.*\)/,'').trim()} seleccionados.</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedItems.map(item => (
                <Badge key={item.id} variant="secondary" className="flex items-center gap-1 pr-1 text-xs sm:text-sm">
                  {renderItemLabel(item)}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-destructive/20 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onItemRemove(item.id);
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          {errorMessage && <p className="text-sm font-medium text-destructive mt-2">{errorMessage}</p>}
        </div>
      </CardContent>
    </Card>
  );
};


interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<boolean>;
  initialData?: ProjectFormData;
  isSubmitting: boolean;
  volverAPath: string;
}


export default function ProjectForm({
  onSubmit: parentOnSubmit,
  initialData,
  isSubmitting: parentIsSubmitting,
  volverAPath,
}: ProjectFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const formDefaultValues: ProjectFormData = {
    titulo: "",
    descripcionGeneral: "",
    resumenEjecutivo: null,
    idsTemas: [],
    palabrasClave: [],
    idsOrganizacionesTutoria: [],
    anoProyecto: new Date().getFullYear(),
    estadoActual: "idea",
    fechaInicio: null,
    fechaFinalizacionEstimada: null,
    fechaFinalizacionReal: null,
    fechaPresentacion: null,
    idsAutores: [],
    idsTutoresPersonas: [],
    idsColaboradores: [],
    archivoPrincipalURL: null,
    nombreArchivoPrincipal: null,
    archivosAdjuntos: [],
    estaEliminado: false,
  };

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: formDefaultValues,
  });

  const {
    control,
    handleSubmit: formHandleSubmit,
    formState: { errors, isDirty: formHookIsDirty },
    watch,
    setValue,
    getValues,
    reset,
    trigger,
  } = form;

  // State for Temas
  const [allActiveTemas, setAllActiveTemas] = useState<Tema[]>([]);
  const [selectedTemaObjects, setSelectedTemaObjects] = useState<Tema[]>([]);
  const [loadingTemas, setLoadingTemas] = useState(true);
  const [isAddTemaModalOpen, setIsAddTemaModalOpen] = useState(false); // ✅ Corregido

  // States for Person/Organization Selectors and Modals
  const [selectedProjectAuthors, setSelectedProjectAuthors] = useState<
    FormAuthor[]
  >([]);
  const [isAddAuthorModalOpen, setIsAddAuthorModalOpen] = useState(false); // ✅ Corregido

  const [selectedProjectTutors, setSelectedProjectTutors] = useState<
    FormAuthor[]
  >([]);
  const [isAddTutorModalOpen, setIsAddTutorModalOpen] = useState(false); // ✅ Corregido

  const [selectedProjectCollaborators, setSelectedProjectCollaborators] =
    useState<FormAuthor[]>([]);
  const [isAddCollaboratorModalOpen, setIsAddCollaboratorModalOpen] =
    useState(false); // ✅ Corregido

  const [selectedOrganizaciones, setSelectedOrganizaciones] = useState<
    FormOrganizacion[]
  >([]);
  const [isAddOrganizacionModalOpen, setIsAddOrganizacionModalOpen] =
    useState(false); // ✅ Corregido

  // For tracking changes in lists for isDirty state
  const [authorListChanged, setAuthorListChanged] = useState(false);
  const [tutorListChanged, setTutorListChanged] = useState(false);
  const [collaboratorListChanged, setCollaboratorListChanged] = useState(false);
  const [organizacionListChanged, setOrganizacionListChanged] = useState(false);

  const {
    fields: attachedFileFields,
    append: appendAttachedFile,
    remove: removeAttachedFile,
  } = useFieldArray({
    control,
    name: "archivosAdjuntos",
  });

  const handleAddAttachedFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    appendAttachedFile({ nombre: "", url: "", tipo: "", descripcion: "" });
  };

  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false); // ✅ Corregido
  const [navigationAction, setNavigationAction] = useState<(() => void) | null>(
    null
  );

  const isFormEffectivelyDirty =
    formHookIsDirty ||
    authorListChanged ||
    tutorListChanged ||
    collaboratorListChanged ||
    organizacionListChanged;

  useEffect(() => {
    const fetchTemasForSelector = async () => {
      setLoadingTemas(true);
      try {
        const temas = await getAllTemasActivosService();
        setAllActiveTemas(temas);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los temas.",
          variant: "destructive",
        });
      } finally {
        setLoadingTemas(false);
      }
    };
    fetchTemasForSelector();
  }, [toast]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);

      const populatePersonSelection = async (
        ids: string[] | undefined | null,
        setter: React.Dispatch<React.SetStateAction<FormAuthor[]>>,
        rhfFieldName: "idsAutores" | "idsTutoresPersonas" | "idsColaboradores"
      ) => {
        if (ids && ids.length > 0) {
          try {
            const personas = await getPersonasByIds(ids);
            setter(
              personas.map((p) => ({
                id: p.id!,
                nombre: p.nombre,
                apellido: p.apellido,
                email: p.email || undefined,
                fotoURL: p.fotoURL || undefined,
                isNewPlaceholder: false,
              }))
            );
            setValue(rhfFieldName, ids, { shouldDirty: false });
          } catch (err) {
            console.error(`Error fetching initial ${rhfFieldName}:`, err);
            setter([]);
            setValue(rhfFieldName, [], { shouldDirty: false });
          }
        } else {
          setter([]);
          setValue(rhfFieldName, [], { shouldDirty: false });
        }
      };

      populatePersonSelection(
        initialData.idsAutores,
        setSelectedProjectAuthors,
        "idsAutores"
      );
      populatePersonSelection(
        initialData.idsTutoresPersonas,
        setSelectedProjectTutors,
        "idsTutoresPersonas"
      );
      populatePersonSelection(
        initialData.idsColaboradores,
        setSelectedProjectCollaborators,
        "idsColaboradores"
      );

      const populateOrgSelection = async () => {
        if (
          initialData.idsOrganizacionesTutoria &&
          initialData.idsOrganizacionesTutoria.length > 0
        ) {
          try {
            const orgs = await getOrganizacionesByIds(
              initialData.idsOrganizacionesTutoria
            );
            setSelectedOrganizaciones(
              orgs.map((o) => ({
                id: o.id!,
                nombreOficial: o.nombreOficial,
                tipo: o.tipo,
                isNewPlaceholder: false,
              }))
            );
            setValue(
              "idsOrganizacionesTutoria",
              initialData.idsOrganizacionesTutoria,
              { shouldDirty: false }
            );
          } catch (err) {
            console.error(`Error fetching initial organizaciones:`, err);
            setSelectedOrganizaciones([]);
            setValue("idsOrganizacionesTutoria", [], { shouldDirty: false });
          }
        } else {
          setSelectedOrganizaciones([]);
          setValue("idsOrganizacionesTutoria", [], { shouldDirty: false });
        }
      };
      populateOrgSelection();

      if (
        initialData.idsTemas &&
        initialData.idsTemas.length > 0 &&
        allActiveTemas.length > 0
      ) {
        const initialTemaObjects = allActiveTemas.filter((t) =>
          initialData.idsTemas!.includes(t.id!)
        );
        setSelectedTemaObjects(initialTemaObjects);
        setValue("idsTemas", initialData.idsTemas, { shouldDirty: false });
      } else if (initialData.idsTemas) {
        setValue("idsTemas", initialData.idsTemas, { shouldDirty: false });
        if (initialData.idsTemas.length > 0) {
          getTemasByIdsService(initialData.idsTemas).then(
            setSelectedTemaObjects
          );
        } else {
          setSelectedTemaObjects([]);
        }
      } else {
        setSelectedTemaObjects([]);
        setValue("idsTemas", [], { shouldDirty: false });
      }

      setAuthorListChanged(false);
      setTutorListChanged(false);
      setCollaboratorListChanged(false);
      setOrganizacionListChanged(false);
    } else {
      reset(formDefaultValues);
      setSelectedProjectAuthors([]);
      setSelectedProjectTutors([]);
      setSelectedProjectCollaborators([]);
      setSelectedOrganizaciones([]);
      setSelectedTemaObjects([]);
      setAuthorListChanged(false);
      setTutorListChanged(false);
      setCollaboratorListChanged(false);
      setOrganizacionListChanged(false);
    }
  }, [initialData, reset, setValue, allActiveTemas]);

  const addPersonToList = useCallback(
    (
      person: FormAuthor,
      currentList: FormAuthor[],
      setter: React.Dispatch<React.SetStateAction<FormAuthor[]>>,
      listChangedSetter: React.Dispatch<React.SetStateAction<boolean>>,
      formFieldName: "idsAutores" | "idsTutoresPersonas" | "idsColaboradores"
    ) => {
      if (!currentList.find((p) => p.id === person.id)) {
        const newList = [...currentList, person];
        setter(newList);
        const newIdList = newList.map((p) => p.id);
        const initialIdList = initialData?.[formFieldName] || [];
        setValue(formFieldName, newIdList, {
          shouldDirty:
            JSON.stringify(newIdList.sort()) !==
            JSON.stringify(initialIdList.sort()),
        });
        listChangedSetter(true);
      }
    },
    [setValue, initialData]
  );

  const removePersonFromList = useCallback(
    (
      personId: string,
      currentList: FormAuthor[],
      setter: React.Dispatch<React.SetStateAction<FormAuthor[]>>,
      listChangedSetter: React.Dispatch<React.SetStateAction<boolean>>,
      formFieldName: "idsAutores" | "idsTutoresPersonas" | "idsColaboradores"
    ) => {
      const newList = currentList.filter((p) => p.id !== personId);
      setter(newList);
      const newIdList = newList.map((p) => p.id);
      const initialIdList = initialData?.[formFieldName] || [];
      setValue(formFieldName, newIdList, {
        shouldDirty:
          JSON.stringify(newIdList.sort()) !==
          JSON.stringify(initialIdList.sort()),
      });
      listChangedSetter(true);
    },
    [setValue, initialData]
  );

  const onAuthorCreatedFromModal = (newAuthor: FormAuthor) => {
    addPersonToList(
      newAuthor,
      selectedProjectAuthors,
      setSelectedProjectAuthors,
      setAuthorListChanged,
      "idsAutores"
    );
  };
  const onTutorCreatedFromModal = (newTutor: FormAuthor) => {
    addPersonToList(
      newTutor,
      selectedProjectTutors,
      setSelectedProjectTutors,
      setTutorListChanged,
      "idsTutoresPersonas"
    );
  };
  const onCollaboratorCreatedFromModal = (newCollab: FormAuthor) => {
    addPersonToList(
      newCollab,
      selectedProjectCollaborators,
      setSelectedProjectCollaborators,
      setCollaboratorListChanged,
      "idsColaboradores"
    );
  };

  const addOrganizacionToListInternal = (
    org: FormOrganizacion,
    currentList: FormOrganizacion[],
    setter: React.Dispatch<React.SetStateAction<FormOrganizacion[]>>,
    listChangedSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!currentList.find((o) => o.id === org.id)) {
      const newList = [...currentList, org];
      setter(newList);
      const newIdList = newList.map((o) => o.id);
      const initialIdList = initialData?.idsOrganizacionesTutoria || [];
      setValue("idsOrganizacionesTutoria", newIdList, {
        shouldDirty:
          JSON.stringify(newIdList.sort()) !==
          JSON.stringify(initialIdList.sort()),
      });
      listChangedSetter(true);
    }
  };

  const removeOrganizacionFromListInternal = (
    orgId: string,
    currentList: FormOrganizacion[],
    setter: React.Dispatch<React.SetStateAction<FormOrganizacion[]>>,
    listChangedSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const newList = currentList.filter((o) => o.id !== orgId);
    setter(newList);
    const newIdList = newList.map((o) => o.id);
    const initialIdList = initialData?.idsOrganizacionesTutoria || [];
    setValue("idsOrganizacionesTutoria", newIdList, {
      shouldDirty:
        JSON.stringify(newIdList.sort()) !==
        JSON.stringify(initialIdList.sort()),
    });
    listChangedSetter(true);
  };

  const onOrganizacionCreatedFromModal = (newOrg: FormOrganizacion) => {
    addOrganizacionToListInternal(
      newOrg,
      selectedOrganizaciones,
      setSelectedOrganizaciones,
      setOrganizacionListChanged
    );
  };

  const handleTemaCreatedFromModal = (newTema: Tema) => {
    setAllActiveTemas((prev) =>
      [...prev, newTema].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );

    const currentSelectedIds = getValues("idsTemas") || [];
    if (!currentSelectedIds.includes(newTema.id!)) {
      const newIds = [...currentSelectedIds, newTema.id!];
      setValue("idsTemas", newIds, {
        shouldDirty:
          JSON.stringify(newIds.sort()) !==
          JSON.stringify((initialData?.idsTemas || []).sort()),
      });
      setSelectedTemaObjects((prev) =>
        [...prev, newTema].sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
    }
    trigger("idsTemas");
  };

  const handleMainSubmit = async (dataFromHookForm: ProjectFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado.",
        variant: "destructive",
      });
      return false;
    }

    setValue(
      "idsAutores",
      selectedProjectAuthors.map((p) => p.id)
    );
    setValue(
      "idsTutoresPersonas",
      selectedProjectTutors.map((p) => p.id)
    );
    setValue(
      "idsColaboradores",
      selectedProjectCollaborators.map((p) => p.id)
    );
    setValue(
      "idsOrganizacionesTutoria",
      selectedOrganizaciones.map((o) => o.id)
    );

    const finalDataToSubmit = getValues();

    const success = await parentOnSubmit(finalDataToSubmit);

    if (success) {
      if (!initialData) {
        reset(formDefaultValues);
        setSelectedProjectAuthors([]);
        setSelectedProjectTutors([]);
        setSelectedProjectCollaborators([]);
        setSelectedOrganizaciones([]);
        setSelectedTemaObjects([]);
        setAuthorListChanged(false);
        setTutorListChanged(false);
        setCollaboratorListChanged(false);
        setOrganizacionListChanged(false);
      } else {
        reset(finalDataToSubmit);
        setAuthorListChanged(false);
        setTutorListChanged(false);
        setCollaboratorListChanged(false);
        setOrganizacionListChanged(false);
      }
    }
    return success;
  };

  const handleCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const targetPath = volverAPath || "/proyectos";
    if (isFormEffectivelyDirty) {
      setNavigationAction(() => () => router.push(targetPath));
      setIsUnsavedChangesModalOpen(true); // ✅ Corregido
    } else {
      router.push(targetPath);
    }
  };

  const triggerSubmitAndNavigate = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast({
        title: "Error de Validación",
        description: "Por favor, corrige los errores en el formulario.",
        variant: "destructive",
      });
      setIsUnsavedChangesModalOpen(false);
      return;
    }

    try {
      const success = await formHandleSubmit(handleMainSubmit)();
      if (success) {
        navigationAction?.();
      }
    } finally {
      setIsUnsavedChangesModalOpen(false);
    }
  };

  const discardChangesAndExit = () => {
    reset(initialData || formDefaultValues);
    if (initialData) {
      const initialAuthorIds = initialData.idsAutores || [];
      getPersonasByIds(initialAuthorIds).then(setSelectedProjectAuthors);

      const initialTutorIds = initialData.idsTutoresPersonas || [];
      getPersonasByIds(initialTutorIds).then(setSelectedProjectTutors);

      const initialCollabIds = initialData.idsColaboradores || [];
      getPersonasByIds(initialCollabIds).then(setSelectedProjectCollaborators);

      const initialOrgIds = initialData.idsOrganizacionesTutoria || [];
      getOrganizacionesByIds(initialOrgIds).then(setSelectedOrganizaciones);

      const initialTemaIds = initialData.idsTemas || [];
      if (initialTemaIds.length > 0 && allActiveTemas.length > 0) {
        setSelectedTemaObjects(
          allActiveTemas.filter((t) => initialTemaIds.includes(t.id!))
        );
      } else if (initialTemaIds.length > 0) {
        getTemasByIdsService(initialTemaIds).then(setSelectedTemaObjects);
      } else {
        setSelectedTemaObjects([]);
      }
    } else {
      setSelectedProjectAuthors([]);
      setSelectedProjectTutors([]);
      setSelectedProjectCollaborators([]);
      setSelectedOrganizaciones([]);
      setSelectedTemaObjects([]);
    }
    setAuthorListChanged(false);
    setTutorListChanged(false);
    setCollaboratorListChanged(false);
    setOrganizacionListChanged(false);
    if (navigationAction) {
      navigationAction();
    }
    setIsUnsavedChangesModalOpen(false); // ✅ Corregido
  };

  return (
    <Form {...form}>
      <form onSubmit={formHandleSubmit(handleMainSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ProjectTagsIcon className="h-5 w-5 text-primary" />
              Información Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Proyecto *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="descripcionGeneral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción General *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="resumenEjecutivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumen Ejecutivo (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="idsTemas"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel className="flex items-center gap-1">
                      <ProjectTagsIcon className="h-4 w-4" />
                      Temas del Proyecto *
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
                              {allActiveTemas.map((tema) => (
                                <CommandItem
                                  value={tema.nombre}
                                  key={tema.id}
                                  onSelect={() => {
                                    const currentSelectedIds =
                                      field.value || [];
                                    const isSelected =
                                      currentSelectedIds.includes(tema.id!);
                                    let newSelectedIds: string[];
                                    if (isSelected) {
                                      newSelectedIds =
                                        currentSelectedIds.filter(
                                          (id) => id !== tema.id
                                        );
                                    } else {
                                      newSelectedIds = [
                                        ...currentSelectedIds,
                                        tema.id!,
                                      ];
                                    }
                                    field.onChange(newSelectedIds);
                                    setSelectedTemaObjects(
                                      allActiveTemas.filter((t) =>
                                        newSelectedIds.includes(t.id!)
                                      )
                                    );
                                    trigger("idsTemas");
                                  }}
                                >
                                  <Checkbox
                                    className="mr-2"
                                    checked={(field.value || []).includes(
                                      tema.id!
                                    )}
                                    onCheckedChange={(checked) => {
                                      const currentSelectedIds =
                                        field.value || [];
                                      let newSelectedIds: string[];
                                      if (checked) {
                                        newSelectedIds = [
                                          ...currentSelectedIds,
                                          tema.id!,
                                        ];
                                      } else {
                                        newSelectedIds =
                                          currentSelectedIds.filter(
                                            (id) => id !== tema.id
                                          );
                                      }
                                      field.onChange(newSelectedIds);
                                      setSelectedTemaObjects(
                                        allActiveTemas.filter((t) =>
                                          newSelectedIds.includes(t.id!)
                                        )
                                      );
                                      trigger("idsTemas");
                                    }}
                                    id={`tema-${tema.id}`}
                                  />
                                  <label
                                    htmlFor={`tema-${tema.id}`}
                                    className="cursor-pointer flex-1"
                                  >
                                    {tema.nombre}
                                  </label>
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Selecciona uno o más temas relevantes para el proyecto.
                  </FormDescription>
                  <FormMessage />
                  {selectedTemaObjects.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Temas Seleccionados:
                      </Label>
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
                                const newSelectedIds = (
                                  field.value || []
                                ).filter((id) => id !== tema.id);
                                field.onChange(newSelectedIds);
                                setSelectedTemaObjects(
                                  allActiveTemas.filter((t) =>
                                    newSelectedIds.includes(t.id!)
                                  )
                                );
                                trigger("idsTemas");
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
          </CardContent>
        </Card>

        <ItemSelector
          title="Autores del Proyecto"
          itemIdentifier="autores"
          selectedItems={selectedProjectAuthors}
          searchFunction={searchPersonas}
          onItemSelect={(author: FormAuthor) =>
            addPersonToList(
              author,
              selectedProjectAuthors,
              setSelectedProjectAuthors,
              setAuthorListChanged,
              "idsAutores"
            )
          }
          onItemRemove={(id) =>
            removePersonFromList(
              id,
              selectedProjectAuthors,
              setSelectedProjectAuthors,
              setAuthorListChanged,
              "idsAutores"
            )
          }
          onAddNewItemClick={() => setIsAddAuthorModalOpen(true)}
          renderItemLabel={(item: FormAuthor) =>
            `${item.nombre} ${item.apellido} ${
              item.email ? `(${item.email})` : ""
            } ${item.isNewPlaceholder ? "(Nuevo)" : ""}`
          }
          placeholderText="Buscar por nombre, apellido o email..."
          isLoading={parentIsSubmitting}
          formErrors={errors}
          errorField="idsAutores"
          addNewButtonLabel="Añadir Nuevo Autor"
          icon={<Users className="h-5 w-5 text-primary" />}
        />

        <ItemSelector
          title="Tutores (Personas)"
          itemIdentifier="tutores"
          selectedItems={selectedProjectTutors}
          searchFunction={searchPersonas}
          onItemSelect={(tutor: FormAuthor) =>
            addPersonToList(
              tutor,
              selectedProjectTutors,
              setSelectedProjectTutors,
              setTutorListChanged,
              "idsTutoresPersonas"
            )
          }
          onItemRemove={(id) =>
            removePersonFromList(
              id,
              selectedProjectTutors,
              setSelectedProjectTutors,
              setTutorListChanged,
              "idsTutoresPersonas"
            )
          }
          onAddNewItemClick={() => setIsAddTutorModalOpen(true)}
          renderItemLabel={(item: FormAuthor) =>
            `${item.nombre} ${item.apellido} ${
              item.email ? `(${item.email})` : ""
            } ${item.isNewPlaceholder ? "(Nuevo)" : ""}`
          }
          placeholderText="Buscar por nombre, apellido o email..."
          isLoading={parentIsSubmitting}
          formErrors={errors}
          errorField="idsTutoresPersonas"
          addNewButtonLabel="Añadir Nuevo Tutor"
          icon={<Briefcase className="h-5 w-5 text-primary" />}
        />

        <ItemSelector
          title="Colaboradores (Personas)"
          itemIdentifier="colaboradores"
          selectedItems={selectedProjectCollaborators}
          searchFunction={searchPersonas}
          onItemSelect={(collab: FormAuthor) =>
            addPersonToList(
              collab,
              selectedProjectCollaborators,
              setSelectedProjectCollaborators,
              setCollaboratorListChanged,
              "idsColaboradores"
            )
          }
          onItemRemove={(id) =>
            removePersonFromList(
              id,
              selectedProjectCollaborators,
              setSelectedProjectCollaborators,
              setCollaboratorListChanged,
              "idsColaboradores"
            )
          }
          onAddNewItemClick={() => setIsAddCollaboratorModalOpen(true)}
          renderItemLabel={(item: FormAuthor) =>
            `${item.nombre} ${item.apellido} ${
              item.email ? `(${item.email})` : ""
            } ${item.isNewPlaceholder ? "(Nuevo)" : ""}`
          }
          placeholderText="Buscar por nombre, apellido o email..."
          isLoading={parentIsSubmitting}
          formErrors={errors}
          errorField="idsColaboradores"
          addNewButtonLabel="Añadir Nuevo Colaborador"
          icon={<UserPlus className="h-5 w-5 text-primary" />}
        />

        <ItemSelector
          title="Organizaciones Tutoras"
          itemIdentifier="organizaciones"
          selectedItems={selectedOrganizaciones}
          searchFunction={searchOrganizacionesByName}
          onItemSelect={(org: FormOrganizacion) =>
            addOrganizacionToListInternal(
              org,
              selectedOrganizaciones,
              setSelectedOrganizaciones,
              setOrganizacionListChanged
            )
          }
          onItemRemove={(id) =>
            removeOrganizacionFromListInternal(
              id,
              selectedOrganizaciones,
              setSelectedOrganizaciones,
              setOrganizacionListChanged
            )
          }
          onAddNewItemClick={() => setIsAddOrganizacionModalOpen(true)}
          renderItemLabel={(item: FormOrganizacion) =>
            `${item.nombreOficial} ${item.isNewPlaceholder ? "(Nueva)" : ""}`
          }
          placeholderText="Buscar por nombre de organización..."
          isLoading={parentIsSubmitting}
          formErrors={errors}
          errorField="idsOrganizacionesTutoria"
          addNewButtonLabel="Añadir Nueva Organización"
          icon={<BuildingIcon className="h-5 w-5 text-primary" />}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SingleTagIcon className="h-5 w-5 text-primary" />
              Clasificación y Fechas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={control}
                name="palabrasClave"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palabras Clave (separadas por coma) *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(stringToArray(e.target.value))
                        }
                        value={
                          Array.isArray(field.value)
                            ? field.value.join(", ")
                            : field.value || ""
                        }
                        placeholder="Ej: Riego, IoT, Sustentable"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="anoProyecto"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Año del Proyecto *</FormLabel>{" "}
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="estadoActual"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Estado Actual *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {" "}
                        {estadoOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {estadoLabels[option]}
                          </SelectItem>
                        ))}{" "}
                      </SelectContent>
                    </Select>{" "}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              {[
                { name: "fechaInicio", label: "Fecha de Inicio" },
                {
                  name: "fechaFinalizacionEstimada",
                  label: "Fecha Estimada de Finalización",
                },
                {
                  name: "fechaFinalizacionReal",
                  label: "Fecha Real de Finalización",
                },
                { name: "fechaPresentacion", label: "Fecha de Presentación" },
              ].map((dateFieldInfo) => (
                <FormField
                  key={dateFieldInfo.name}
                  control={control}
                  name={
                    dateFieldInfo.name as keyof Pick<
                      ProjectFormData,
                      | "fechaInicio"
                      | "fechaFinalizacionEstimada"
                      | "fechaFinalizacionReal"
                      | "fechaPresentacion"
                    >
                  }
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      {" "}
                      <FormLabel>
                        {dateFieldInfo.label} (Opcional)
                      </FormLabel>{" "}
                      <Popover>
                        {" "}
                        <PopoverTrigger asChild>
                          {" "}
                          <FormControl>
                            {" "}
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {" "}
                              {field.value ? (
                                format(
                                  new Date(
                                    field.value as string | number | Date
                                  ),
                                  "PPP",
                                  { locale: es }
                                )
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}{" "}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />{" "}
                            </Button>{" "}
                          </FormControl>{" "}
                        </PopoverTrigger>{" "}
                        <PopoverContent className="w-auto p-0" align="start">
                          {" "}
                          <Calendar
                            mode="single"
                            selected={
                              field.value
                                ? new Date(
                                    field.value as string | number | Date
                                  )
                                : undefined
                            }
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                            locale={es}
                          />{" "}
                        </PopoverContent>{" "}
                      </Popover>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIconLucide className="h-5 w-5 text-primary" /> Archivos del
              Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="archivoPrincipalURL"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>URL del Archivo Principal</FormLabel>{" "}
                  <FormControl>
                    <Input type="url" {...field} value={field.value || ""} />
                  </FormControl>{" "}
                  <FormMessage />{" "}
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="nombreArchivoPrincipal"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Nombre del Archivo Principal</FormLabel>{" "}
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>{" "}
                  <FormMessage />{" "}
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Archivos Adjuntos (Opcional)</CardTitle>
              <CardDescription>
                Agregue enlaces a otros archivos relevantes.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAttachedFile}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Adjunto
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {attachedFileFields.map((item, index) => {
              const fieldNameBase = `archivosAdjuntos.${index}` as const;
              return (
                <Card key={item.id} className="p-4 bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    {/* Nombre del Adjunto */}
                    <div className="space-y-1">
                      <Label htmlFor={`${fieldNameBase}.nombre`}>
                        Nombre del Adjunto *
                      </Label>
                      <Controller
                        name={`${fieldNameBase}.nombre`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <>
                            <Input
                              id={`${fieldNameBase}.nombre`}
                              {...field}
                              value={String(field.value ?? "")}
                              className="w-full"
                            />
                            {fieldState.error && (
                              <p className="text-sm text-destructive mt-1">
                                {fieldState.error.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    {/* URL del Adjunto */}
                    <div className="space-y-1">
                      <Label htmlFor={`${fieldNameBase}.url`}>
                        URL del Adjunto *
                      </Label>
                      <Controller
                        name={`${fieldNameBase}.url`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <>
                            <Input
                              id={`${fieldNameBase}.url`}
                              type="url"
                              {...field}
                              value={String(field.value ?? "")}
                              className="w-full"
                            />
                            {fieldState.error && (
                              <p className="text-sm text-destructive mt-1">
                                {fieldState.error.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    {/* Tipo del Adjunto */}
                    <div className="space-y-1">
                      <Label htmlFor={`${fieldNameBase}.tipo`}>
                        Tipo (Ej: Presentación, Código)
                      </Label>
                      <Controller
                        name={`${fieldNameBase}.tipo`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <>
                            <Input
                              id={`${fieldNameBase}.tipo`}
                              {...field}
                              value={String(field.value ?? "")}
                              className="w-full"
                            />
                            {fieldState.error && (
                              <p className="text-sm text-destructive mt-1">
                                {fieldState.error.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    {/* Descripción Corta del Adjunto */}
                    <div className="space-y-1">
                      <Label htmlFor={`${fieldNameBase}.descripcion`}>
                        Descripción Corta
                      </Label>
                      <Controller
                        name={`${fieldNameBase}.descripcion`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <>
                            <Input
                              id={`${fieldNameBase}.descripcion`}
                              {...field}
                              value={String(field.value ?? "")}
                              className="w-full"
                            />
                            {fieldState.error && (
                              <p className="text-sm text-destructive mt-1">
                                {fieldState.error.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeAttachedFile(index);
                    }}
                    disabled={parentIsSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Eliminar Adjunto
                  </Button>
                </Card>
              );
            })}
            {errors.archivosAdjuntos &&
              typeof errors.archivosAdjuntos === "object" &&
              "message" in errors.archivosAdjuntos &&
              !Array.isArray(errors.archivosAdjuntos) && (
                <p className="text-sm text-destructive mt-1">
                  {errors.archivosAdjuntos.message as string}
                </p>
              )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelClick}
            disabled={parentIsSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              (!!initialData && !isFormEffectivelyDirty) || parentIsSubmitting
            }
            className="w-full md:w-auto text-lg py-3 px-6 min-w-[150px]"
          >
            {parentIsSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {parentIsSubmitting
              ? initialData
                ? "Actualizando..."
                : "Creando..."
              : initialData
              ? "Actualizar Proyecto"
              : "Crear Proyecto"}
          </Button>
        </div>
      </form>
      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onClose={() => setIsUnsavedChangesModalOpen(false)}
        onConfirmSaveAndExit={triggerSubmitAndNavigate}
        onConfirmDiscardAndExit={discardChangesAndExit}
      />
      <AddPersonaModal
        open={isAddAuthorModalOpen}
        onOpenChange={setIsAddAuthorModalOpen}
        onPersonaCreated={onAuthorCreatedFromModal}
        roleToAssign="es_autor_invitado"
        opcionesCategoriaPrincipal={opcionesCategoriaAutor}
      />
      <AddPersonaModal
        open={isAddTutorModalOpen}
        onOpenChange={setIsAddTutorModalOpen}
        onPersonaCreated={onTutorCreatedFromModal}
        roleToAssign="es_tutor_invitado"
        opcionesCategoriaPrincipal={opcionesCategoriaTutor}
      />
      <AddPersonaModal
        open={isAddCollaboratorModalOpen}
        onOpenChange={setIsAddCollaboratorModalOpen}
        onPersonaCreated={onCollaboratorCreatedFromModal}
        roleToAssign="es_colaborador_invitado"
        opcionesCategoriaPrincipal={opcionesCategoriaColaborador}
      />
      <AddOrganizacionModal
        open={isAddOrganizacionModalOpen}
        onOpenChange={setIsAddOrganizacionModalOpen}
        onOrganizacionCreated={onOrganizacionCreatedFromModal}
      />
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
    
    