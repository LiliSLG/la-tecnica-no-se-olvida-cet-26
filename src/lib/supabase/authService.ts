"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

// Reutilizamos el supabaseClient central
import { supabase } from "./supabaseClient";
import { AuthUser, AuthSession, handleAuthError } from './auth';
import { toast } from '@/hooks/use-toast';

// Login con Google
export async function signInWithGoogle(): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  } catch (error) {
    handleAuthError(error);
  }
}

// Registro con email/password
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { full_name?: string }
): Promise<AuthSession | null> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;

    if (data.session) {
      return {
        user: data.user as AuthUser,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    }

    // If email confirmation is required
    toast({
      title: 'Verification Required',
      description: 'Please check your email to verify your account.',
    });

    return null;
  } catch (error) {
    handleAuthError(error);
    return null;
  }
}

// Login con email/password
export async function signInWithEmail(email: string, password: string): Promise<AuthSession | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      user: data.user as AuthUser,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  } catch (error) {
    handleAuthError(error);
    return null;
  }
}

// Logout
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    handleAuthError(error);
  }
}

// Obtener el usuario actual (si está autenticado)
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting current user:", error);
    return null;
  }
  return user;
};

/**
 * Updates the current user's profile
 */
export async function updateUserProfile(
  updates: {
    full_name?: string;
    avatar_url?: string;
  }
): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;

    return data.user as AuthUser;
  } catch (error) {
    handleAuthError(error);
    return null;
  }
}

/**
 * Updates the current user's password
 */
export async function updatePassword(newPassword: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    toast({
      title: 'Password Updated',
      description: 'Your password has been successfully updated.',
    });

    return true;
  } catch (error) {
    handleAuthError(error);
    return false;
  }
}

/**
 * Sends a password reset email
 */
export async function resetPassword(email: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;

    toast({
      title: 'Reset Email Sent',
      description: 'Please check your email for password reset instructions.',
    });

    return true;
  } catch (error) {
    handleAuthError(error);
    return false;
  }
}

/**
 * Refreshes the current session
 */
export async function refreshSession(): Promise<AuthSession | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) throw error;

    if (data.session) {
      return {
        user: data.user as AuthUser,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      };
    }

    return null;
  } catch (error) {
    handleAuthError(error);
    return null;
  }
}

/**
 * 🚀 PRO TIP (para opción PRO futura - RLS, roles):
 *
 * - Si quisiéramos meter roles en el JWT (para no tener que consultar la tabla personas cada vez):
 *   - Se puede usar Supabase Edge Function que escuche en `auth.users` y que:
 *     - busque los roles de ese usuario en `personas` o en una tabla `roles` (mejor separado).
 *     - setee "custom claims" en el JWT (usando Supabase Admin API).
 *
 * - Ejemplo: "app_metadata": { "roles": ["admin", "autor"] }
 *
 * - Luego, en el frontend, podemos leer `session.access_token` y parsear los roles.
 *
 * Ventajas:
 * - 🔥 Más performante → el JWT ya trae los roles.
 * - 🔐 Compatible con Row Level Security.
 *
 * Desventajas:
 * - Más complejo de mantener.
 *
 * 👉 Para tu caso actual: NO NECESARIO. Con leer `personas` por email alcanza.
 */
