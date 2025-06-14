// /src/providers/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client"; // <-- Importamos la instancia universal y única
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/lib/supabase/types/database.types";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/supabase/services/authService";
import { personasService } from "@/lib/supabase/services/personasService";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

interface AuthContextType {
  session: Session | null;
  user: Persona | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  // Función para obtener el perfil del usuario logueado o crearlo si no existe.
  const fetchAndProvisionUserProfile = useCallback(
    async (authUser: User | null) => {
      if (!authUser) {
        setUser(null);
        return;
      }

      try {
        // 1. Intenta buscar el perfil existente.
        const { data: persona } = await personasService.getById(authUser.id);

        if (persona) {
          // 2. Si existe, lo establece en el estado.
          setUser(persona);
        } else {
          // 3. Si NO existe, lo crea.
          const { data: newPersona } = await personasService.create({
            id: authUser.id,
            email: authUser.email!,
            nombre: authUser.email!.split("@")[0] || "Nuevo Usuario",
          });
          setUser(newPersona);
          toast({
            title: "¡Bienvenido/a!",
            description: "Hemos creado tu perfil.",
          });
        }
      } catch (err) {
        console.error("Error fetching or creating user profile:", err);
        toast({ title: "Error de Perfil", variant: "destructive" });
        setUser(null);
      }
    },
    [toast]
  ); // `toast` es la única dependencia externa aquí

  // Efecto que se ejecuta solo una vez al montar la app
  useEffect(() => {
    // Escuchamos los cambios en el estado de autenticación de Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      await fetchAndProvisionUserProfile(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAndProvisionUserProfile]);

  // Efecto para manejar las redirecciones
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === "/login";
      if (user && isAuthPage) {
        router.push("/admin");
      }
      if (!user && !isAuthPage && pathname.startsWith("/admin")) {
        router.push("/login");
      }
    }
  }, [user, isLoading, pathname, router]);

  // Funciones que expondrá nuestro contexto
  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password);
    if (error) throw error;
    // El onAuthStateChange se encargará del resto (actualizar estado y redirigir).
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    router.push("/login");
  };

  const value = { session, user, isLoading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
