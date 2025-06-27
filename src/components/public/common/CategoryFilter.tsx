// /src/components/public/common/CategoryFilter.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

interface CategoryFilterProps {
  onCategoryChange: (category: string | null) => void;
  selectedCategory?: string | null;
  className?: string;
}

export function CategoryFilter({
  onCategoryChange,
  selectedCategory,
  className = "",
}: CategoryFilterProps) {
  const categories = [
    { value: "articulo_propio", label: "Artículos", icon: "📝" },
    { value: "enlace_externo", label: "Enlaces", icon: "🔗" },
  ];

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      onCategoryChange(null); // Deseleccionar si ya está seleccionado
    } else {
      onCategoryChange(category);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Filtrar:</span>
      </div>

      <div className="flex gap-2">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={
              selectedCategory === category.value ? "default" : "outline"
            }
            size="sm"
            onClick={() => handleCategoryClick(category.value)}
            className={`transition-all duration-200 ${
              selectedCategory === category.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "hover:bg-primary/10 hover:border-primary/30"
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </Button>
        ))}

        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCategoryChange(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpiar
          </Button>
        )}
      </div>

      {selectedCategory && (
        <Badge variant="secondary" className="ml-2">
          {categories.find((c) => c.value === selectedCategory)?.label}
        </Badge>
      )}
    </div>
  );
}
