// src/providers/AuthProvider.tsx (CORREGIDO - SIN LOOPS)
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/lib/supabase/types/database.types";
import { authService } from "@/lib/supabase/services/authService";
import { personasService } from "@/lib/supabase/services/personasService";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

interface AuthContextType {
  session: Session | null;
  user: Persona | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSigningOut: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();

  // Ref para evitar múltiples ejecuciones simultáneas
  const isProcessingAuth = useRef(false);
  const hasInitialized = useRef(false);

  // Función para verificar si es admin (INDEPENDIENTE)
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    // Solo verificar si hay una sesión activa
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (!currentSession?.user?.id) {
      setIsAdmin(false);
      return false;
    }

    try {
      console.log(
        "🔍 Checking admin status for user:",
        currentSession.user.email
      );

      // Llamar a la función RPC is_admin()
      const { data: adminFlag, error } = await (supabase as any).rpc(
        "is_admin"
      );

      if (error) {
        console.error("❌ Error checking admin status:", error);
        setIsAdmin(false);
        return false;
      }

      const adminStatus = Boolean(adminFlag);
      setIsAdmin(adminStatus);
      console.log("✅ Admin status:", adminStatus);
      return adminStatus;
    } catch (error) {
      console.error("❌ Error checking admin status:", error);
      setIsAdmin(false);
      return false;
    }
  }, []); // Sin dependencias para evitar loops

  // Función para obtener el perfil del usuario (SIN checkAdminStatus automático)
  const fetchUserProfile = useCallback(
    async (authUser: User | null): Promise<Persona | null> => {
      if (!authUser) {
        return null;
      }

      try {
        console.log("👤 Fetching profile for user:", authUser.email);

        // 1. Buscar perfil existente
        const { data: persona } = await personasService.getById(authUser.id);

        if (persona) {
          console.log("✅ Profile found:", persona.email);
          return persona;
        }

        // 2. Crear perfil si no existe
        console.log("➕ Creating new profile for:", authUser.email);
        const { data: newPersona } = await personasService.create({
          id: authUser.id,
          email: authUser.email!,
          nombre: authUser.email!.split("@")[0] || "Nuevo Usuario",
          activo: true,
          es_ex_alumno_cet: false,
          buscando_oportunidades: false,
          disponible_para_proyectos: false,
          visibilidad_perfil:
            "privado" as Database["public"]["Enums"]["visibilidad_perfil_enum"],
        });

        if (newPersona) {
          console.log("✅ Profile created:", newPersona.email);
          toast({
            title: "¡Bienvenido/a!",
            description: "Hemos creado tu perfil.",
          });
        }

        return newPersona;
      } catch (err) {
        console.error("❌ Error fetching/creating user profile:", err);
        toast({
          title: "Error de Perfil",
          description: "No se pudo cargar el perfil de usuario",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  // Función principal para procesar cambios de autenticación
  const processAuthChange = useCallback(
    async (event: string, newSession: Session | null) => {
      // Evitar procesamiento simultáneo
      if (isProcessingAuth.current) {
        console.log("⏳ Auth change already processing, skipping...");
        return;
      }

      isProcessingAuth.current = true;
      console.log("🔄 Processing auth change:", event, newSession?.user?.email);

      try {
        // Caso 1: Usuario cerró sesión
        if (event === "SIGNED_OUT" || !newSession) {
          console.log("👋 User signed out");
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsSigningOut(false);
          return;
        }

        // Caso 2: Usuario inició sesión o sesión inicial
        setSession(newSession);

        // Obtener/crear perfil de usuario
        const userProfile = await fetchUserProfile(newSession.user);
        setUser(userProfile);

        // Verificar status de admin DESPUÉS de establecer el perfil
        if (userProfile) {
          // Usar setTimeout para evitar que interfiera con el flujo principal
          setTimeout(() => {
            checkAdminStatus();
          }, 100);
        }

        console.log("✅ Auth change processed successfully");
      } catch (error) {
        console.error("❌ Error processing auth change:", error);
        // En caso de error, limpiar el estado
        setUser(null);
        setIsAdmin(false);
      } finally {
        isProcessingAuth.current = false;
        setIsLoading(false);
      }
    },
    [fetchUserProfile, checkAdminStatus]
  );

  // Efecto para manejar cambios de autenticación
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Obtener sesión inicial
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (mounted && !hasInitialized.current) {
          hasInitialized.current = true;
          await processAuthChange("INITIAL_SESSION", initialSession);
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Inicializar autenticación
    initializeAuth();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignorar el evento inicial si ya se procesó
      if (event === "INITIAL_SESSION" && hasInitialized.current) {
        return;
      }

      if (mounted) {
        await processAuthChange(event, session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [processAuthChange]);

  // Función de login
  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔑 Attempting sign in for:", email);
      setIsLoading(true);

      const result = await authService.signIn(email, password);
      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log("✅ Sign in successful");
      // El onAuthStateChange se encargará del resto
    } catch (error) {
      console.error("❌ Sign in error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Función de logout
  const signOut = async () => {
    try {
      console.log("👋 Starting sign out process...");
      setIsSigningOut(true);

      // Limpiar estado local inmediatamente
      setUser(null);
      setIsAdmin(false);

      // Ejecutar signOut de Supabase
      const result = await authService.signOut();
      if (result.error) {
        console.error("❌ Sign out error:", result.error);
      }

      console.log("✅ Sign out completed");
    } catch (error) {
      console.error("❌ Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    isAdmin,
    isSigningOut,
    signIn,
    signOut,
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
