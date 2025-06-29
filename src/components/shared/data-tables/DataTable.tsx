// src/components/shared/data-tables/DataTable.tsx - ARREGLADO
import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Filter,
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
import { DataTableState, DataTableConfig } from "@/hooks/useDataTableState";
// ✅ USAR EL HOOK CORRECTO
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
  mobileCardView?: boolean; // ✅ PROP PARA HABILITAR CARDS
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
  mobileCardView = true, // ✅ DEFAULT TRUE
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
  // ✅ USAR EL HOOK CORRECTO
  const isMobile = useIsMobile();

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

  // Filtrar columnas visibles en móvil
  const visibleColumns = React.useMemo(() => {
    if (!isMobile || !mobileCardView) return columns;
    return columns.filter((col) => !col.mobileHidden);
  }, [columns, isMobile, mobileCardView]);

  // ✅ COMPONENTE MOBILE CARD MEJORADO
  const MobileCard = ({ item }: { item: T }) => (
    <Card className="group transition-all duration-200 hover:shadow-md border-border bg-card">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Mostrar columnas visibles */}
          {visibleColumns.map((column) => {
            if (String(column.key).startsWith("action_")) {
              return null; // Las acciones las renderizamos por separado
            }

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
              </div>
            ) : (
              <div key={field.key} className="flex items-center gap-3">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
                <Switch
                  id={field.key}
                  checked={filters[field.key] || false}
                  onCheckedChange={(checked) =>
                    setFilters({ [field.key]: checked })
                  }
                />
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
        {title && (
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground">
              Gestiona y organiza el contenido de la plataforma
            </p>
          </div>
        )}
        {onAdd && (
          <Button
            onClick={onAdd}
            className="flex items-center gap-2 w-full sm:w-auto shadow-sm"
            size="default"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* Controles de búsqueda y filtros */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar en el contenido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10 bg-background/50 border-border"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Filtros desktop */}
            <div className="hidden md:flex items-center gap-4">
              {config.filterFields.map((field) =>
                field.type === "select" ? (
                  <Select
                    key={field.key}
                    value={filters[field.key] || "all"}
                    onValueChange={(value) =>
                      setFilters({ [field.key]: value === "all" ? "" : value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
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
                  <div key={field.key} className="flex items-center gap-2">
                    <Switch
                      id={field.key}
                      checked={filters[field.key] || false}
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

            {/* Botón filtros móvil */}
            <MobileFilters />
          </div>
        </CardContent>
      </Card>

      {/* Contenido */}
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
          {/* ✅ VISTA MÓVIL: CARDS CONDICIONALES */}
          {isMobile && mobileCardView ? (
            <div className="space-y-3">
              {paginatedData.map((item, index) => (
                <MobileCard key={index} item={item} />
              ))}
            </div>
          ) : (
            /* Vista desktop: Tabla */
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
                              ? "cursor-pointer hover:bg-muted/50 transition-colors"
                              : "",
                            column.className
                          )}
                          onClick={() => {
                            if (isDataColumn(column) && column.sortable) {
                              handleSort(column.key);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {column.label}
                            {isDataColumn(column) &&
                              column.sortable &&
                              sort.column === column.key && (
                                <ArrowUpDown className="h-4 w-4 text-primary" />
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
                        className="hover:bg-muted/30 transition-colors duration-150 border-border"
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
        <Card className="border-border bg-card/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalItems)} de {totalItems}{" "}
                  resultados
                </p>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue placeholder="Por página" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizes.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} por página
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
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Anterior</span>
                </Button>

                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  <span className="hidden sm:inline mr-2">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
