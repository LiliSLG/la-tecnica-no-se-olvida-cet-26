// src/app/admin/layout.tsx - SOLUCIÓN RADICAL ANTI-HYDRATION
"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { Database } from "@/lib/supabase/types/database.types";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

// ✅ CLAVE: Componente que solo se renderiza en el cliente
const ClientOnlyAdminContent = dynamic(
  () => import("./ClientOnlyAdminContent"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Iniciando panel admin...</p>
        </div>
      </div>
    ),
  }
);

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ClientOnlyAdminContent>{children}</ClientOnlyAdminContent>;
}
