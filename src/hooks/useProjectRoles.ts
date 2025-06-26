// src/hooks/useProjectRoles.ts
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export function useProjectRoles() {
  const { user, isLoading: authLoading } = useAuth();
  const [hasActiveRoles, setHasActiveRoles] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si auth está cargando, esperar
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    // Si no hay usuario, no tiene roles
    if (!user) {
      setHasActiveRoles(false);
      setIsLoading(false);
      return;
    }

    // 🚧 MOCK TEMPORAL - Corregir nombre del campo
    // CORREGIDO: usar categoria_principal (no categoria_principal_persona)
    try {
      const mockHasRoles =
        user.categoria_principal === "estudiante_cet" ||
        user.categoria_principal === "ex_alumno_cet";

      setHasActiveRoles(mockHasRoles);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in useProjectRoles:", error);
      setHasActiveRoles(false);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  return {
    hasActiveRoles,
    isLoading,
  };
}
