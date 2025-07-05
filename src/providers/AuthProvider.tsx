// src/providers/AuthProvider.tsx - VERSIÓN ARREGLADA
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

  const isInitialized = useRef(false);

  // Función para verificar admin status
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.user?.id) {
        setIsAdmin(false);
        return false;
      }

      console.log("🔍 Checking admin status for:", currentSession.user.email);

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
  }, []);

  // Función para obtener/crear perfil de usuario
  const fetchUserProfile = useCallback(
    async (authUser: User): Promise<Persona | null> => {
      try {
        console.log("👤 Fetching profile for:", authUser.email);

        // Buscar perfil existente
        const { data: existingPersona } = await personasService.getById(
          authUser.id
        );

        if (existingPersona) {
          console.log("✅ Profile found:", existingPersona.email);
          return existingPersona;
        }

        // Crear perfil si no existe
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
          return newPersona;
        }

        return null;
      } catch (error) {
        console.error("❌ Error fetching/creating user profile:", error);
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

  // ✅ ARREGLO: Procesar sesión con logs correctos y sin race conditions
  const processSession = useCallback(
    async (newSession: Session | null) => {
      console.log("🔄 Processing session:", newSession?.user?.email || "null");

      try {
        if (!newSession) {
          // No hay sesión
          console.log("❌ No session found");
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // ✅ ARREGLO: Usar newSession en vez de session
        console.log("🔍 Session found - user ID:", newSession.user?.id);
        console.log("🔍 Session found - user email:", newSession.user?.email);

        // Hay sesión
        setSession(newSession);

        // Obtener perfil del usuario
        const userProfile = await fetchUserProfile(newSession.user);
        setUser(userProfile);

        // ✅ ARREGLO: Verificar admin status solo si hay perfil válido
        if (userProfile && newSession.user?.id) {
          console.log("🔍 User profile loaded, checking admin status...");
          await checkAdminStatus();
        } else {
          console.log("⚠️ No user profile, setting admin to false");
          setIsAdmin(false);
        }

        setIsLoading(false);
        console.log("✅ Session processed successfully");
      } catch (error) {
        console.error("❌ Error processing session:", error);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    },
    [fetchUserProfile, checkAdminStatus]
  );

  // Inicializar auth al montar el componente
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeAuth = async () => {
      try {
        console.log("🚀 Initializing auth...");

        // Obtener sesión inicial
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        console.log(
          "🔍 Initial session:",
          initialSession?.user?.email || "null"
        );
        console.log("🔍 Session valid:", !!initialSession);

        // Procesar sesión inicial
        await processSession(initialSession);

        // Configurar listener para cambios
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("🔄 Auth state change:", event);
          console.log("🔍 New session user:", session?.user?.email || "null");

          if (event === "SIGNED_OUT") {
            console.log("👋 User signed out");
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            setIsSigningOut(false);
            setIsLoading(false);
          } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            console.log("🔑 User signed in or token refreshed");
            await processSession(session);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [processSession]);

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
