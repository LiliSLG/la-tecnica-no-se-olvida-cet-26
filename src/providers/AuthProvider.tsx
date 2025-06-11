"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/lib/supabase/types/database.types';
import { useRouter, usePathname } from 'next/navigation';

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
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get initial session and user data
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          const { data: persona } = await supabase
            .from('personas')
            .select('*')
            .eq('id', session.user.id)
            .single();
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
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);

      if (session?.user) {
        const { data: persona } = await supabase
          .from('personas')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(persona);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle redirection based on auth state
  useEffect(() => {
    if (!isLoading) {
      // If we have a user and we are currently on the login page, redirect to admin
      if (user && pathname === '/login') {
        router.push('/admin');
      }
    }
  }, [user, pathname, isLoading, router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 