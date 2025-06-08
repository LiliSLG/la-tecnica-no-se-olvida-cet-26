import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DataTableState, DataTableConfig } from "@/lib/hooks/useDataTableState";

export type ColumnConfig<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
};

interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'switch';
  options?: { value: string; label: string }[];
}

interface AdminDataTableProps<T extends object> {
  title?: string;
  data: T[];
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
}

export function AdminDataTable<T extends object>({
  title,
  data,
  columns,
  config,
  state,
  onAdd,
  addLabel = "Agregar",
  emptyState,
  pageSizes = [10, 25, 50, 100],
}: AdminDataTableProps<T>) {
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

  const handlePageSizeChange = (newSize: number) => {
    state.setPageSize(newSize);
    state.setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    state.setCurrentPage(newPage);
  };

  const handlePreviousPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    state.setCurrentPage(newPage);
  };

  const handleNextPage = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    state.setCurrentPage(newPage);
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {config.filterFields.map((field) => (
            field.type === 'select' ? (
              <Select
                key={String(field.key)}
                value={filters[field.key as string] || 'all'}
                onValueChange={(value) => setFilters({ [field.key as string]: value })}
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
              <div key={String(field.key)} className="flex items-center space-x-2">
                <Switch
                  id={String(field.key)}
                  checked={filters[field.key as string] || false}
                  onCheckedChange={(checked) => setFilters({ [field.key as string]: checked })}
                />
                <Label htmlFor={String(field.key)}>{field.label}</Label>
              </div>
            )
          ))}
        </div>
        {onAdd && (
          <Button onClick={onAdd} className="w-full sm:w-auto">
            {addLabel}
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    className={`py-3 px-4 ${column.className || ''} ${
                      column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
                    }`}
                    onClick={() => column.sortable && setSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sort.column === column.key && (
                        <ArrowUpDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center py-8">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-lg font-medium mb-2">
                        {emptyState?.title || "No hay resultados"}
                      </p>
                      <p className="text-sm">
                        {emptyState?.description || "Intenta ajustar los filtros de búsqueda"}
                      </p>
                      {emptyState?.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={emptyState.action.onClick}
                          className="mt-4"
                        >
                          {emptyState.action.label}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/50 transition-colors duration-200">
                    {columns.map((column) => (
                      <TableCell key={String(column.key)} className={`py-3 px-4 ${column.className || ''}`}>
                        {column.render ? column.render(item) : String(item[column.key] || '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems} resultados
            </p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Por página" />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map(size => (
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
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 