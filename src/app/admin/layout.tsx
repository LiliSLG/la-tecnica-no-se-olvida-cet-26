"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { Persona } from "@/lib/types";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    // 1) Obtener el usuario actual de Supabase Auth
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoadingUser(false);
      });

    // 2) Escuchar cambios de sesión (opcional, para redirecciones en tiempo real)
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Esperar hasta saber si hay usuario
    if (loadingUser) return;

    // Si no hay usuario autenticado, redirigir a login
    if (!user) {
      router.push("/login?redirect=/admin");
      return;
    }

    // Verificar en Supabase DB si esta persona es admin
    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("personas")
          .select("esAdmin")
          .eq("id", user.id)
          .single();

        if (error || !data) {
          // 1) Ocurrió un error en la consulta, o no existe el registro “personas” para este user
          //    En cualquiera de los dos casos, conviene redirigir fuera del área de admin.
          console.warn("No se encontró la persona o hubo un error:", error);
          router.push("/");
          return;
        }

        // Si llegamos aquí, data tiene { esAdmin: boolean }
        if (data.esAdmin) {
          setIsAdmin(true);
        } else {
          router.push("/");
        }
      

      } catch (err) {
        console.error("Error verificando admin:", err);
        router.push("/");
      } finally {
        setStatusLoading(false);
      }
    };

    checkAdminStatus();
  }, [loadingUser, user, router]);

  if (loadingUser || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">
          Verificando acceso...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-destructive">
          Acceso denegado. Redirigiendo...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
