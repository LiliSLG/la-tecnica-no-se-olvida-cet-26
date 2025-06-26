// /src/components/admin/AdminDataTableSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AdminDataTableSkeletonProps {
  title?: string;
  addLabel?: string;
  rows?: number;
  columns?: number;
}

export function AdminDataTableSkeleton({
  title = "Cargando...",
  addLabel = "Agregar",
  rows = 5,
  columns = 3,
}: AdminDataTableSkeletonProps) {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Skeleton className="h-8 w-48" /> {/* Title */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Search input skeleton */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              disabled
              className="pl-9 pr-9 bg-muted"
            />
          </div>

          {/* Filter skeletons */}
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        {/* Add button skeleton */}
        <Button disabled className="w-full sm:w-auto">
          {addLabel}
        </Button>
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            {/* Header skeleton */}
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                {Array.from({ length: columns }).map((_, index) => (
                  <th
                    key={index}
                    className="h-12 px-4 text-left align-middle font-medium"
                  >
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <Skeleton className="h-4 w-16" />
                </th>
              </tr>
            </thead>

            {/* Body skeleton */}
            <tbody className="[&_tr:last-child]:border-0">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="p-4 align-middle">
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    </td>
                  ))}
                  {/* Actions column */}
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
