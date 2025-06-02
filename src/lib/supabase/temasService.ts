"use server";

import { supabase } from "@/lib/supabase/supabaseClient";
import type { Tema } from "@/lib/types";

import {
  convertFormDataToSupabaseTema,
  convertSupabaseDataToFormTema,
  TemaFormData,
} from "@/lib/schemas/temaSchema";

const TABLE = "temas";

export const addTema = async (
  data: TemaFormData,
  adminUid: string
): Promise<Tema> => {
  const temaDataForCreation = convertFormDataToSupabaseTema(data, adminUid);
  temaDataForCreation.creadoEn = new Date().toISOString();
  temaDataForCreation.actualizadoEn = new Date().toISOString();
  temaDataForCreation.estaEliminada = false;

  const { data: inserted, error } = await supabase
    .from(TABLE)
    .insert([temaDataForCreation])
    .select()
    .single();

  if (error) {
    console.error("Error adding tema:", error);
    throw error;
  }

  return inserted as Tema;
};

export const getAllTemasForAdmin = async (): Promise<Tema[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error getting all temas for admin:", error);
    throw error;
  }

  return data as Tema[];
};

export const getAllTemasActivos = async (): Promise<Tema[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .neq("estaEliminada", true)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error getting active temas:", error);
    throw error;
  }

  return data as Tema[];
};

export const getTemasByIds = async (ids: string[]): Promise<Tema[]> => {
  if (!ids.length) return [];

  const { data, error } = await supabase.from(TABLE).select("*").in("id", ids);

  if (error) {
    console.error("Error getting temas by IDs:", error);
    return [];
  }

  return (data ?? []).filter((tema) => !tema.estaEliminada) as Tema[];
};

export const getTemaById = async (id: string): Promise<Tema | null> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting tema by ID:", error);
    return null;
  }

  return data as Tema;
};

export const updateTema = async (
  id: string,
  data: TemaFormData,
  adminUid: string
): Promise<void> => {
  const temaDataForUpdate = convertFormDataToSupabaseTema(data, adminUid, {
    id,
  } as Tema);

  temaDataForUpdate.actualizadoEn = new Date().toISOString();

  const { error } = await supabase
    .from(TABLE)
    .update(temaDataForUpdate)
    .eq("id", id);

  if (error) {
    console.error("Error updating tema:", error);
    throw error;
  }
};

export const logicalDeleteTema = async (
  id: string,
  adminUid: string
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE)
    .update({
      estaEliminada: true,
      eliminadoPorUid: adminUid,
      eliminadoEn: new Date().toISOString(),
      modificadoPorUid: adminUid,
      actualizadoEn: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error logically deleting tema:", error);
    throw error;
  }
};

export const restoreTema = async (
  id: string,
  adminUid: string
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE)
    .update({
      estaEliminada: false,
      eliminadoPorUid: null,
      eliminadoEn: null,
      modificadoPorUid: adminUid,
      actualizadoEn: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error restoring tema:", error);
    throw error;
  }
};
