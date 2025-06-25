// =============================================================================
// AdminDataTable ARREGLADO - requireConfirmation funciona correctamente
// Ubicación: /src/components/admin/AdminDataTable.tsx
// =============================================================================

import React, { useState } from "react"; 
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

// =============================================================================
// TIPOS Y INTERFACES (manteniendo tu estructura)
// =============================================================================

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  searchable?: boolean;
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
// COMPONENTE PRINCIPAL ARREGLADO
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
}: AdminDataTableProps<T>) {
  // ✅ NUEVO: Estado para manejar confirmaciones
  const [pendingAction, setPendingAction] = useState<{
    action: DataTableAction<T>;
    item: T;
  } | null>(null);

  const clearSearch = () => {
    onSearchChange("");
  };

  // ✅ NUEVO: Función para manejar clicks en acciones
  const handleActionClick = async (action: DataTableAction<T>, item: T) => {
    // Si la acción requiere confirmación, mostrar dialog
    if (action.requireConfirmation) {
      setPendingAction({ action, item });
      return; // ✅ NO ejecutar onClick hasta confirmar
    }

    // Si no requiere confirmación, ejecutar directamente
    try {
      await action.onClick(item);
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  // ✅ NUEVO: Función para confirmar y ejecutar acción pendiente
  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      await pendingAction.action.onClick(pendingAction.item);
    } catch (error) {
      console.error("Error executing confirmed action:", error);
    } finally {
      setPendingAction(null); // Cerrar dialog
    }
  };

  // Filtrar datos basado en showDeleted
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

  // ✅ ARREGLADO: Renderizar acciones con confirmación correcta
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
                  handleActionClick(action, item); // ✅ USAR handleActionClick
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
        onClick={() => handleActionClick(action, item)} // ✅ USAR handleActionClick
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
        {/* Header mejorado */}
        <div className="flex justify-between items-center">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {onAdd && (
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
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

          <div className="flex items-center space-x-2">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={onToggleShowDeleted}
            />
            <Label htmlFor="show-deleted" className="text-sm">
              {showDeleted ? "Mostrando eliminados" : "Mostrar eliminados"}
            </Label>
          </div>
        </div>

        {/* Tabla */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key as string}
                    style={{ width: column.width }}
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
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="text-center py-8 text-gray-500"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow
                    key={item.id}
                    className={item.is_deleted ? "opacity-60 bg-gray-50" : ""}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key as string}>
                        <div className="flex items-center gap-2">
                          {column.render
                            ? column.render(
                                getNestedValue(item, column.key as string),
                                item
                              )
                            : String(
                                getNestedValue(item, column.key as string) ||
                                  "-"
                              )}
                          {item.is_deleted && column.key === columns[0].key && (
                            <Badge variant="secondary" className="text-xs">
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {totalCount && (
                <span>
                  Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                  {Math.min(currentPage * pageSize, totalCount)} de {totalCount}{" "}
                  resultados
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
                Anterior
              </Button>

              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
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

      {/* ✅ NUEVO: Dialog de confirmación global */}
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
