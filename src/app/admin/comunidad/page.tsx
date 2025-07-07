// 🔧 CREAR archivo: /src/app/admin/comunidad/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  personasService,
  type PersonaRow,
} from "@/lib/supabase/services/personasService";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Icons
import {
  Plus,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  AlertTriangle,
} from "lucide-react";

export default function ComunidadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin, isLoading } = useAuth();
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar personas
  useEffect(() => {
    async function fetchPersonas() {
      if (isLoading || isAdmin === undefined) return;

      if (!isAdmin) {
        router.push("/dashboard");
        return;
      }

      try {
        setLoading(true);
        const result = await personasService.getAll(false);

        if (result.success) {
          setPersonas(result.data || []);
        } else {
          toast({
            title: "Error",
            description: "Error cargando personas",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Error inesperado cargando personas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPersonas();
  }, [isAdmin, isLoading, router, toast]);

  // Mapear categoría a tipo para edición
  const mapCategoriaToTipo = (
    categoria: string
  ): "alumno" | "docente" | "activo" => {
    switch (categoria) {
      case "estudiante_cet":
      case "ex_alumno_cet":
        return "alumno";
      case "docente_cet":
        return "docente";
      case "comunidad_activa":
        return "activo";
      default:
        return "activo";
    }
  };

  // Función para borrar persona
  const handleDelete = async (persona: PersonaRow) => {
    try {
      const result = await personasService.delete(persona.id, "admin-delete");

      if (result.success) {
        setPersonas((prev) => prev.filter((p) => p.id !== persona.id));
        toast({
          title: "Éxito",
          description: `${persona.nombre} ${persona.apellido} eliminado correctamente`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Error eliminando persona",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error inesperado eliminando persona",
        variant: "destructive",
      });
    }
  };

  // Formatear categoría para mostrar
  const formatCategoria = (categoria: string) => {
    const categorias = {
      estudiante_cet: {
        label: "Estudiante CET",
        color: "bg-green-100 text-green-800",
      },
      ex_alumno_cet: {
        label: "Ex Alumno CET",
        color: "bg-purple-100 text-purple-800",
      },
      docente_cet: { label: "Docente CET", color: "bg-blue-100 text-blue-800" },
      comunidad_activa: {
        label: "Comunidad Activa",
        color: "bg-orange-100 text-orange-800",
      },
      comunidad_general: {
        label: "Comunidad General",
        color: "bg-gray-100 text-gray-800",
      },
    };
    return (
      categorias[categoria as keyof typeof categorias] || {
        label: categoria,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando comunidad...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Comunidad
          </h1>
          <p className="text-muted-foreground">
            Gestiona los miembros de la comunidad CET
          </p>
        </div>

        {/* Botón crear */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Miembro
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push("/admin/comunidad/new?tipo=docente")}
            >
              👨‍🏫 Docente
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/comunidad/new?tipo=alumno")}
            >
              🎓 Alumno
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/admin/comunidad/new?tipo=activo")}
            >
              🤝 Comunidad Activa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{personas.length}</div>
            <p className="text-xs text-muted-foreground">Total miembros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {
                personas.filter((p) => p.categoria_principal?.includes("cet"))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Relacionados al CET</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {personas.filter((p) => p.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {personas.filter((p) => p.disponible_para_proyectos).length}
            </div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {personas.map((persona) => {
          const categoria = formatCategoria(persona.categoria_principal || "");

          return (
            <Card
              key={persona.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={persona.foto_url || undefined} />
                      <AvatarFallback>
                        {persona.nombre?.charAt(0)}
                        {persona.apellido?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {persona.nombre} {persona.apellido}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {persona.email || "Sin email"}
                      </p>
                    </div>
                  </div>

                  {/* Menú de acciones */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/comunidad/${persona.id}`)
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(
                            `/admin/comunidad/${
                              persona.id
                            }/edit?tipo=${mapCategoriaToTipo(
                              persona.categoria_principal || ""
                            )}`
                          )
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              ¿Eliminar miembro?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que quieres eliminar a{" "}
                              <strong>
                                {persona.nombre} {persona.apellido}
                              </strong>
                              ? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(persona)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <Badge className={categoria.color}>{categoria.label}</Badge>

                  <div className="flex gap-2">
                    {persona.activo && (
                      <Badge variant="outline" className="text-green-600">
                        Activo
                      </Badge>
                    )}
                    {persona.disponible_para_proyectos && (
                      <Badge variant="outline" className="text-blue-600">
                        Disponible
                      </Badge>
                    )}
                  </div>

                  {persona.descripcion_personal_o_profesional && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {persona.descripcion_personal_o_profesional}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {personas.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay miembros</h3>
            <p className="text-muted-foreground mb-4">
              Comienza agregando el primer miembro de la comunidad
            </p>
            <Button
              onClick={() => router.push("/admin/comunidad/new?tipo=alumno")}
            >
              Crear primer miembro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
