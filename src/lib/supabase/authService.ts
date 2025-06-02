"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

// Reutilizamos el supabaseClient central
import { supabase } from "./supabaseClient";

// Login con Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) throw error;
  return data;
};

// Registro con email/password
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Login con email/password
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

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
