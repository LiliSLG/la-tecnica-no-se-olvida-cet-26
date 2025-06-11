"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/supabaseClient';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/supabase/types/database.types';
import { authService } from '@/lib/supabase/services/authService';
import { useToast } from '@/components/ui/use-toast';

type Persona = Database['public']['Tables']['personas']['Row'];

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
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session and user data
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          const { data: persona } = await authService.getCurrentUser();
          setUser(persona);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        const { data: persona } = await authService.getCurrentUser();
        setUser(persona);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await authService.signIn(email, password);
      if (error) throw error;

      const { data: persona } = await authService.getCurrentUser();
      setUser(persona);

      toast({
        title: 'Bienvenido',
        description: 'Has iniciado sesión correctamente.',
      });

      router.push('/admin');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar sesión. Por favor, verifica tus credenciales.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);

      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });

      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cerrar sesión. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 