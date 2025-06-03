"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmailPswd: (email: string, password: string) => Promise<boolean>;
  signUpWithEmailPswdAndName: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar sesión inicial
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Suscribirse a cambios de sesión
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmailPswd = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in with email/password:", error.message);
      toast.error("Error al iniciar sesión: " + error.message);
      setLoading(false);
      return false;
    }

    toast.success("¡Inicio de sesión exitoso!");
    setLoading(false);
    return true;
  };

  const signUpWithEmailPswdAndName = async (
    name: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: name, // Puedes agregar más campos si quieres
        },
      },
    });

    if (error) {
      console.error("Error during signUpWithEmailPswdAndName:", error.message);
      toast.error("Error al registrarse: " + error.message);
      setLoading(false);
      return false;
    }

    toast.success("¡Registro exitoso! Por favor, verifica tu correo.");
    setLoading(false);
    return true;
  };

  const sendPasswordReset = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error("Error sending password reset:", error.message);
      toast.error(
        "Error al enviar el correo de recuperación: " + error.message
      );
      setLoading(false);
      return false;
    }

    toast.success(
      "Correo de recuperación enviado. ¡Revisa tu bandeja de entrada!"
    );
    setLoading(false);
    return true;
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
      toast.error("Error al cerrar sesión: " + error.message);
    } else {
      toast.success("Sesión cerrada exitosamente.");
      router.push("/");
    }

    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error.message);
      toast.error("Error al iniciar sesión con Google: " + error.message);
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmailPswd,
        signUpWithEmailPswdAndName,
        sendPasswordReset,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
