// /src/providers/AuthProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/lib/supabase/types/database.types";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/supabase/services/authService";

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

  const checkUser = useCallback(async () => {
    const { data: userProfile, error } = await authService.getCurrentUser();
    if (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    } else {
      setUser(userProfile);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const getInitialSession = async () => {
      await checkUser();
      const { data } = await authService.getSession();
      setSession(data.session);
      setIsLoading(false);
    };
    getInitialSession();
  }, [checkUser]);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (result.error) throw new Error(result.error.message);

    await checkUser();
    const { data } = await authService.getSession();
    setSession(data.session);

    toast({ title: "Bienvenido/a" });
    router.push("/admin");
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
