import { supabase } from "../client";
import { Database } from "../types/database.types";
import { ServiceResult } from "../types/serviceResult";
import {
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";
import { personasService } from "./personasService";

type Persona = Database["public"]["Tables"]["personas"]["Row"];
type CreatePersona = Database["public"]["Tables"]["personas"]["Insert"];

class AuthService {
  async getCurrentUser(): Promise<{
    data: Persona | null;
    error: Error | null;
  }> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from("personas")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error getting current user:", error);
      return { data: null, error: error as Error };
    }
  }

  async signIn(email: string, password: string): Promise<ServiceResult<void>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.user)
        throw new Error("Authentication succeeded but no user was returned.");

      // Check if profile exists, if not, create it
      const { data: profile } = await supabase
        .from("personas")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        await personasService.create({
          id: data.user.id,
          email: data.user.email!,
          nombre: data.user.email!.split("@")[0],
        });
      }

      return createSuccess(undefined);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: "Login error",
        code: "AUTH_ERROR",
        details: error,
      });
    }
  }

  async signUp(
    email: string,
    password: string,
    userData: { nombre?: string }
  ): Promise<ServiceResult<{ user: Persona; session: any }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return createError({
          name: "ServiceError",
          message: authError.message,
          code: "AUTH_ERROR",
          details: authError,
        });
      }

      if (!authData.user) {
        return createError({
          name: "ServiceError",
          message: "No user data returned from signup",
          code: "AUTH_ERROR",
        });
      }

      // Create user profile
      const { data: persona, error: personaError } = await supabase
        .from("personas")
        .insert({
          id: authData.user.id,
          email: email,
          nombre: userData.nombre || email.split("@")[0],
          rol: "usuario",
        })
        .select()
        .single();

      if (personaError || !persona) {
        return createError({
          name: "ServiceError",
          message: personaError?.message || "Failed to create user profile",
          code: "DB_ERROR",
          details: personaError,
        });
      }

      return createSuccess({
        user: persona,
        session: authData.session,
      });
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: error instanceof Error ? error.message : "Unknown error",
        code: "AUTH_ERROR",
        details: error,
      });
    }
  }

  async signOut(): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return createError({
          name: "ServiceError",
          message: error.message,
          code: "AUTH_ERROR",
          details: error,
        });
      }
      return createSuccess(undefined);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: error instanceof Error ? error.message : "Unknown error",
        code: "AUTH_ERROR",
        details: error,
      });
    }
  }

  async resetPassword(email: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return createError({
          name: "ServiceError",
          message: error.message,
          code: "AUTH_ERROR",
          details: error,
        });
      }
      return createSuccess(undefined);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: error instanceof Error ? error.message : "Unknown error",
        code: "AUTH_ERROR",
        details: error,
      });
    }
  }

  async updatePassword(password: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return createError({
          name: "ServiceError",
          message: error.message,
          code: "AUTH_ERROR",
          details: error,
        });
      }
      return createSuccess(undefined);
    } catch (error) {
      return createError({
        name: "ServiceError",
        message: error instanceof Error ? error.message : "Unknown error",
        code: "AUTH_ERROR",
        details: error,
      });
    }
  }
  // En authService.ts, dentro de la clase AuthService

  async getSession() {
    return supabase.auth.getSession();
  }
}

export const authService = new AuthService();
