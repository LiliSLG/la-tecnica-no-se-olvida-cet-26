// src/components/shared/data-tables/DataTable.tsx - CON TOGGLE DE VISTA
import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Filter,
  Table2,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTableState, DataTableConfig } from "@/hooks/useDataTableState";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// =============================================================================
// TIPOS Y INTERFACES
// =============================================================================

export type DataColumnConfig<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  className?: string;
  mobileHidden?: boolean;
  cardHidden?: boolean; // 🆕 Para ocultar columnas en vista de cards
  render?: (value: any, item: T) => React.ReactNode;
};

export type ActionColumnConfig<T> = {
  key: `action_${string}`;
  label: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
};

export type ColumnConfig<T> = DataColumnConfig<T> | ActionColumnConfig<T>;

interface FilterField {
  key: string;
  label: string;
  type: "select" | "switch";
  options?: { value: string; label: string }[];
}

interface DataTableProps<T extends object> {
  title?: string;
  columns: ColumnConfig<T>[];
  config: {
    searchFields: (keyof T)[];
    filterFields: FilterField[];
    sortableColumns: (keyof T)[];
  };
  state: DataTableState<T>;
  onAdd?: () => void;
  addLabel?: string;
  emptyState?: {
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  pageSizes?: number[];
  enableViewToggle?: boolean; // 🆕 Para habilitar/deshabilitar el toggle
  defaultView?: "table" | "cards"; // 🆕 Vista por defecto (solo si no hay en localStorage)
}

// =============================================================================
// HOOK PARA PERSISTIR VISTA EN LOCALSTORAGE
// =============================================================================

function useViewPreference(defaultView: "table" | "cards" = "table") {
  const [viewMode, setViewMode] = useState<"table" | "cards">(defaultView);

  useEffect(() => {
    // Cargar preferencia desde localStorage al montar
    const savedView = localStorage.getItem("datatable-view-preference");
    if (savedView === "table" || savedView === "cards") {
      setViewMode(savedView);
    }
  }, []);

  const setView = (view: "table" | "cards") => {
    setViewMode(view);
    localStorage.setItem("datatable-view-preference", view);
  };

  return [viewMode, setView] as const;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function isDataColumn<T>(
  column: ColumnConfig<T>
): column is DataColumnConfig<T> {
  return !String(column.key).startsWith("action_");
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function DataTable<T extends object>({
  title,
  columns,
  config,
  state,
  onAdd,
  addLabel = "Agregar",
  emptyState,
  pageSizes = [5, 10, 20, 50],
  enableViewToggle = true, // 🆕 Por defecto habilitado
  defaultView = "table", // 🆕 Vista por defecto
}: DataTableProps<T>) {
  const {
    search,
    filters,
    sort,
    currentPage,
    pageSize,
    paginatedData,
    totalPages,
    totalItems,
    setSearch,
    setFilters,
    setSort,
    setCurrentPage,
    setPageSize,
  } = state;

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const isMobile = useIsMobile();

  // 🆕 Hook para persistir vista
  const [viewMode, setViewMode] = useViewPreference(
    isMobile ? "cards" : defaultView
  );

  // 🆕 Determinar vista efectiva
  const effectiveViewMode = enableViewToggle ? viewMode : "table";

  // Handlers
  const handleSort = (column: keyof T) => {
    if (config.sortableColumns.includes(column)) {
      setSort(column);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const clearSearch = () => {
    setSearch("");
  };

  // 🆕 COMPONENTE TOGGLE DE VISTA
  const ViewToggle = () => (
    <TooltipProvider>
      <div className="flex items-center border rounded-lg p-1 bg-muted/30">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={effectiveViewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 w-8 p-0"
            >
              <Table2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Vista de tabla</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={effectiveViewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Vista de tarjetas</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );

  // 🆕 COMPONENTE CARD MEJORADO PARA VISTA CARDS
  const ResponsiveCard = ({ item }: { item: T }) => (
    <Card className="group transition-all duration-200 hover:shadow-lg border-border bg-card hover:bg-accent/5">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Mostrar columnas visibles en cards */}
          {columns
            .filter((col) => {
              if (String(col.key).startsWith("action_")) return false;
              const dataCol = col as DataColumnConfig<T>;
              return !dataCol.cardHidden;
            })
            .map((column) => {
              const dataColumn = column as DataColumnConfig<T>;
              const value = (item as any)[dataColumn.key];
              const displayValue = dataColumn.render
                ? dataColumn.render(value, item)
                : String(value || "-");

              return (
                <div
                  key={String(column.key)}
                  className="flex justify-between items-start gap-3"
                >
                  <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0">
                    {column.label}:
                  </span>
                  <div className="text-sm text-right ml-2 min-w-0 flex-1">
                    {displayValue}
                  </div>
                </div>
              );
            })}

          {/* Acciones */}
          {(() => {
            const actionColumns = columns.filter((col) =>
              String(col.key).startsWith("action_")
            ) as ActionColumnConfig<T>[];

            if (actionColumns.length === 0) return null;

            return (
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-end gap-2">
                  {actionColumns.map((actionColumn) => (
                    <div key={String(actionColumn.key)}>
                      {actionColumn.render(item)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );

  // Componente de filtros móviles
  const MobileFilters = () => (
    <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {Object.values(filters).some(
            (val) => val !== false && val !== "all" && val !== ""
          ) && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              !
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[40vh]">
        <SheetHeader>
          <SheetTitle>Filtros y opciones</SheetTitle>
          <SheetDescription>
            Ajusta los filtros para refinar los resultados
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {config.filterFields.map((field) =>
            field.type === "select" ? (
              <div key={field.key} className="space-y-2">
                <Label className="text-sm font-medium">{field.label}</Label>
                <Select
                  value={filters[field.key] || "all"}
                  onValueChange={(value) =>
                    setFilters({ [field.key]: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Seleccionar ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div key={field.key} className="flex items-center space-x-2">
                <Switch
                  id={field.key}
                  checked={!!filters[field.key]}
                  onCheckedChange={(checked) =>
                    setFilters({ [field.key]: checked })
                  }
                />
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
              </div>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* 🆕 Toggle de vista */}
          {enableViewToggle && !isMobile && <ViewToggle />}

          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filtros móviles */}
        <MobileFilters />

        {/* Filtros desktop */}
        <div className="hidden md:flex items-center gap-3">
          {config.filterFields.map((field) =>
            field.type === "select" ? (
              <Select
                key={field.key}
                value={filters[field.key] || "all"}
                onValueChange={(value) =>
                  setFilters({ [field.key]: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={field.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div key={field.key} className="flex items-center space-x-2">
                <Switch
                  id={field.key}
                  checked={!!filters[field.key]}
                  onCheckedChange={(checked) =>
                    setFilters({ [field.key]: checked })
                  }
                />
                <Label htmlFor={field.key} className="text-sm">
                  {field.label}
                </Label>
              </div>
            )
          )}
        </div>
      </div>

      {/* Info y toggle móvil */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Mostrando {paginatedData.length} de {totalItems} elementos
        </div>

        {/* 🆕 Toggle móvil */}
        {enableViewToggle && isMobile && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Vista:</span>
            <ViewToggle />
          </div>
        )}
      </div>

      {/* Contenido principal */}
      {paginatedData.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-lg font-semibold text-muted-foreground">
                {emptyState?.title || "No hay datos disponibles"}
              </div>
              <p className="text-muted-foreground">
                {emptyState?.description ||
                  "No se encontraron elementos que coincidan con los criterios de búsqueda."}
              </p>
              {emptyState?.action && (
                <Button
                  variant="outline"
                  onClick={emptyState.action.onClick}
                  className="mt-4"
                >
                  {emptyState.action.label}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 🆕 VISTA CONDICIONAL */}
          {effectiveViewMode === "cards" ? (
            /* Vista de Cards Responsiva */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((item, index) => (
                <ResponsiveCard key={index} item={item} />
              ))}
            </div>
          ) : (
            /* Vista de Tabla */
            <Card className="border-border shadow-sm overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      {columns.map((column) => (
                        <TableHead
                          key={String(column.key)}
                          className={cn(
                            "py-4 px-6 font-semibold",
                            isDataColumn(column) && column.sortable
                              ? "cursor-pointer hover:bg-muted/50 select-none"
                              : "",
                            column.className
                          )}
                          onClick={() =>
                            isDataColumn(column) && handleSort(column.key)
                          }
                        >
                          <div className="flex items-center gap-2">
                            {column.label}
                            {isDataColumn(column) && column.sortable && (
                              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-muted/30 transition-colors border-border"
                      >
                        {columns.map((column) => (
                          <TableCell
                            key={String(column.key)}
                            className={cn("py-4 px-6", column.className)}
                          >
                            {isDataColumn(column)
                              ? column.render
                                ? column.render((item as any)[column.key], item)
                                : String((item as any)[column.key] || "-")
                              : (column as ActionColumnConfig<T>).render(item)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Elementos por página:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <span className="text-sm text-muted-foreground px-4">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
