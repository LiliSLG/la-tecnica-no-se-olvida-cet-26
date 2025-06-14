import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc";

export type SortState<T> = {
  column: keyof T | null;
  direction: SortDirection;
};

export type FilterState<T> = {
  search: string;
  showDeleted: boolean;
  [key: string]: any;
};

export type DataTableState<T> = {
  // State
  search: string;
  filters: FilterState<T>;
  sort: SortState<T>;
  currentPage: number;
  pageSize: number;

  // Computed
  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  totalPages: number;
  totalItems: number;

  // Handlers
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<FilterState<T>>) => void;
  setSort: (column: keyof T) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetState: () => void;
};

export type FilterField<T> = {
  key: keyof T | string;
  label: string;
  type: "select" | "switch";
  options?: { value: string; label: string }[];
};

export type DataTableConfig<T extends object> = {
  data: T[];
  initialFilters?: Partial<FilterState<T>>;
  initialSort?: SortState<T>;
  initialPageSize?: number;
  searchFields: (keyof T)[]; // <-- Volvemos al tipo estricto
  filterFields: FilterField<T>[];
  sortableColumns: (keyof T)[]; // <-- Volvemos al tipo estricto
  defaultSort?: SortState<T>;
};

export function useDataTableState<T extends object>({
  data,
  initialFilters = {},
  initialSort = { column: null, direction: "asc" },
  initialPageSize = 10,
  searchFields,
  filterFields,
  sortableColumns,
  defaultSort,
}: DataTableConfig<T>): DataTableState<T> {
  // State
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState<T>>({
    search: "",
    showDeleted: false,
    ...initialFilters,
  });
  const [sort, setSort] = useState<SortState<T>>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset page when filters/sort/search changes
  const resetPage = () => setCurrentPage(1);

  // Handlers
  const handleSetSearch = (newSearch: string) => {
    setSearch(newSearch);
    resetPage();
  };

  const handleSetFilters = (newFilters: Partial<FilterState<T>>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    resetPage();
  };

  const handleSetSort = (column: keyof T) => {
    setSort((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
    resetPage();
  };

  const handleSetPageSize = (size: number) => {
    setPageSize(size);
    resetPage();
  };

  const resetState = () => {
    setSearch("");
    setFilters({ search: "", showDeleted: false, ...initialFilters });
    setSort(defaultSort || { column: null, direction: "asc" });
    setCurrentPage(1);
    setPageSize(initialPageSize);
  };

  // Filter data
  const filteredData = useMemo(() => {
    // Primero filtramos por la búsqueda de texto
    const searchedData = data.filter((item) => {
      const searchTerm = search.toLowerCase();
      if (!searchTerm) return true; // Si no hay búsqueda, pasan todos

      // Usamos 'as' porque ya hemos relajado el tipo en la config, aquí lo volvemos a asegurar
      return searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchTerm);
      });
    });

    // Ahora, sobre los datos ya buscados, aplicamos los filtros de los campos
    const fullyFilteredData = searchedData.filter((item) => {
      // Usamos .every() para asegurarnos de que el item pasa TODOS los filtros activos
      return filterFields.every((field) => {
        const filterValue = filters[field.key as string];
        const itemValue = (item as any)[field.key];

        // Si el filtro no tiene valor o es 'all', no se aplica este filtro
        if (
          filterValue === undefined ||
          filterValue === null ||
          filterValue === "all"
        ) {
          return true;
        }

        // Lógica para el switch de borrados
        if (field.type === "switch") {
          // El valor del filtro (del switch) es 'true' (ON) o 'false' (OFF)
          const shouldShowOnlyDeleted = filterValue as boolean;

          // El valor del item es 'true' si está borrado, o 'false' si está activo
          const itemIsDeleted = (item as any)[field.key] === true;

          // La lógica es simple: el estado del item (borrado/no borrado)
          // debe coincidir con el estado que el switch quiere mostrar.
          return itemIsDeleted === shouldShowOnlyDeleted;
        }

        // Lógica para filtros de select
        if (field.type === "select") {
          return String(itemValue) === String(filterValue);
        }

        // Si se añade otro tipo de filtro en el futuro
        return true;
      });
    });

    return fullyFilteredData;
  }, [data, search, filters, searchFields, filterFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sort.column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sort.column!];
      const bValue = b[sort.column!];

      if (aValue === null) return 1;
      if (bValue === null) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sort]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  // Computed values
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const totalItems = sortedData.length;

  return {
    // State
    search,
    filters,
    sort,
    currentPage,
    pageSize,

    // Computed
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    totalItems,

    // Handlers
    setSearch: handleSetSearch,
    setFilters: handleSetFilters,
    setSort: handleSetSort,
    setCurrentPage,
    setPageSize: handleSetPageSize,
    resetState,
  };
}
