// /app/admin/layout.tsx
"use client";

import { useState, ReactNode } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar user={user} onSignOut={signOut} />
      <div className="flex flex-col">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 bg-muted/40">{children}</main>
      </div>
    </div>
  );
}
