// =============================================================================
// AdminDataTable RESPONSIVE - Basado en tu versión con mejoras móviles
// Ubicación: /src/components/admin/AdminDataTable.tsx
// =============================================================================

import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

// =============================================================================
// TIPOS Y INTERFACES (manteniendo tu estructura + nuevas props responsive)
// =============================================================================

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  searchable?: boolean;
  mobileHidden?: boolean; // ✅ NUEVO: Ocultar en móvil
  mobileLabel?: string; // ✅ NUEVO: Label personalizado para móvil
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "outline" | "secondary";
  show?: (item: T) => boolean;
  requireConfirmation?: {
    title: string;
    description: string;
  };
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  loading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showDeleted: boolean;
  onToggleShowDeleted: () => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  emptyMessage?: string;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  title?: string;
  mobileCardView?: boolean; // ✅ NUEVO: Habilitar vista de tarjetas en móvil
}

// =============================================================================
// HELPER FUNCTIONS (manteniendo las tuyas)
// =============================================================================

const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

const isColumnSearchable = (column: DataTableColumn<any>): boolean => {
  return column.searchable !== false;
};

// =============================================================================
// COMPONENTE PRINCIPAL RESPONSIVE
// =============================================================================

export function AdminDataTable<
  T extends { id: string; is_deleted?: boolean | null }
>({
  data,
  columns,
  actions = [],
  loading = false,
  searchValue,
  onSearchChange,
  showDeleted,
  onToggleShowDeleted,
  onAdd,
  addButtonLabel = "Agregar",
  emptyMessage = "No hay datos disponibles",
  totalCount,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  title,
  mobileCardView = true, // ✅ NUEVO: Por defecto true
}: AdminDataTableProps<T>) {
  // ✅ Estados existentes + nuevos para móvil
  const [pendingAction, setPendingAction] = useState<{
    action: DataTableAction<T>;
    item: T;
  } | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ✅ Hook para detectar móvil
  const isMobile = useIsMobile();

  // ✅ Filtrar columnas visibles en móvil
  const visibleColumns = React.useMemo(() => {
    if (!isMobile) return columns;
    return columns.filter((col) => !col.mobileHidden);
  }, [columns, isMobile]);

  const clearSearch = () => {
    onSearchChange("");
  };

  // ✅ Funciones existentes (sin cambios)
  const handleActionClick = async (action: DataTableAction<T>, item: T) => {
    if (action.requireConfirmation) {
      setPendingAction({ action, item });
      return;
    }

    try {
      await action.onClick(item);
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      await pendingAction.action.onClick(pendingAction.item);
    } catch (error) {
      console.error("Error executing confirmed action:", error);
    } finally {
      setPendingAction(null);
    }
  };

  // ✅ Lógica de filtrado existente (sin cambios)
  const filteredData = React.useMemo(() => {
    let filtered = data;

    if (showDeleted) {
      filtered = filtered.filter((item) => !!item.is_deleted);
    } else {
      filtered = filtered.filter((item) => !item.is_deleted);
    }

    if (!searchValue.trim()) return filtered;

    const searchableColumns = columns.filter(isColumnSearchable);

    return filtered.filter((item) =>
      searchableColumns.some((column) => {
        const value = getNestedValue(item, column.key as string);
        return value
          ?.toString()
          .toLowerCase()
          .includes(searchValue.toLowerCase());
      })
    );
  }, [data, searchValue, columns, showDeleted]);

  // ✅ NUEVO: Componente de filtros móvil
  const MobileFilters = () => (
    <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {showDeleted && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              !
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[40vh]">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Ajusta los filtros para refinar los resultados
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="show-deleted-mobile"
              className="text-sm font-medium"
            >
              {showDeleted ? "Mostrando eliminados" : "Mostrar eliminados"}
            </Label>
            <Switch
              id="show-deleted-mobile"
              checked={showDeleted}
              onCheckedChange={onToggleShowDeleted}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // ✅ NUEVO: Componente de tarjeta móvil
  const MobileCard = ({ item }: { item: T }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Mostrar columnas visibles */}
          {visibleColumns.map((column, index) => {
            const value = getNestedValue(item, column.key as string);
            const displayValue = column.render
              ? column.render(value, item)
              : String(value || "-");
            const mobileLabel = column.mobileLabel || column.header;

            return (
              <div
                key={column.key as string}
                className="flex justify-between items-start"
              >
                <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0">
                  {mobileLabel}:
                </span>
                <span className="text-sm text-right ml-2 min-w-0 flex-1">
                  <div className="flex items-center justify-end gap-2">
                    {displayValue}
                    {item.is_deleted && index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Eliminado
                      </Badge>
                    )}
                  </div>
                </span>
              </div>
            );
          })}

          {/* Acciones */}
          {actions.length > 0 && (
            <>
              <Separator />
              <div className="flex justify-end">{renderActions(item)}</div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // ✅ Funciones de renderizado existentes (sin cambios)
  const renderActions = (item: T) => {
    if (!actions.length) return null;

    const visibleActions = actions.filter((action) =>
      action.show ? action.show(item) : true
    );

    if (!visibleActions.length) return null;

    if (visibleActions.length === 1) {
      const action = visibleActions[0];
      return renderSingleAction(action, item);
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visibleActions.map((action, index) => {
            const isDestructive = action.variant === "destructive";

            return (
              <DropdownMenuItem
                key={index}
                onSelect={(e) => {
                  e.preventDefault();
                  handleActionClick(action, item);
                }}
                className={
                  isDestructive ? "text-red-600 focus:text-red-600" : ""
                }
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderSingleAction = (action: DataTableAction<T>, item: T) => {
    return (
      <Button
        variant={action.variant || "outline"}
        size="sm"
        onClick={() => handleActionClick(action, item)}
        className="h-8 w-8 p-0"
        title={action.label}
      >
        {action.icon && <action.icon className="h-4 w-4" />}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header mejorado responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {onAdd && (
            <Button
              onClick={onAdd}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
        </div>

        {/* Controles de búsqueda y filtros responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filtros desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={onToggleShowDeleted}
            />
            <Label htmlFor="show-deleted" className="text-sm whitespace-nowrap">
              {showDeleted ? "Mostrando eliminados" : "Mostrar eliminados"}
            </Label>
          </div>

          {/* Filtros móvil */}
          <MobileFilters />
        </div>

        {/* Contenido principal */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No hay resultados</p>
              <p className="text-sm">{emptyMessage}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Vista móvil: Tarjetas */}
            {isMobile && mobileCardView ? (
              <div className="md:hidden">
                {filteredData.map((item) => (
                  <MobileCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              /* Vista desktop: Tabla */
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {visibleColumns.map((column) => (
                          <TableHead
                            key={column.key as string}
                            style={{ width: column.width }}
                            className="whitespace-nowrap"
                          >
                            {column.header}
                          </TableHead>
                        ))}
                        {actions.length > 0 && (
                          <TableHead className="w-20">Acciones</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow
                          key={item.id}
                          className={cn(
                            "hover:bg-muted/50 transition-colors",
                            item.is_deleted && "opacity-60 bg-gray-50"
                          )}
                        >
                          {visibleColumns.map((column) => (
                            <TableCell key={column.key as string}>
                              <div className="flex items-center gap-2">
                                {column.render
                                  ? column.render(
                                      getNestedValue(
                                        item,
                                        column.key as string
                                      ),
                                      item
                                    )
                                  : String(
                                      getNestedValue(
                                        item,
                                        column.key as string
                                      ) || "-"
                                    )}
                                {item.is_deleted &&
                                  column.key === visibleColumns[0].key && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Eliminado
                                    </Badge>
                                  )}
                              </div>
                            </TableCell>
                          ))}
                          {actions.length > 0 && (
                            <TableCell>{renderActions(item)}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Paginación responsive */}
        {totalPages > 1 && onPageChange && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              {totalCount && (
                <span>
                  Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                  {Math.min(currentPage * pageSize, totalCount)} de {totalCount}{" "}
                  <span className="hidden sm:inline">resultados</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Anterior</span>
              </Button>

              <span className="text-sm px-2">
                {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats de la tabla */}
        {!showDeleted &&
          data.filter((item) => !!item.is_deleted).length > 0 && (
            <div className="text-sm text-gray-500 flex justify-end">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {data.filter((item) => !!item.is_deleted).length} eliminados
                disponibles
              </span>
            </div>
          )}
      </div>

      {/* Dialog de confirmación (sin cambios) */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={() => setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action.requireConfirmation?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action.requireConfirmation?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                pendingAction?.action.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
