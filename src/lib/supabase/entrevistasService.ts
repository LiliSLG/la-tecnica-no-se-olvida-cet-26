"use server";

import { supabase } from "@/lib/supabase/supabaseClient";
import type { Entrevista } from "@/lib/types";
import type { EntrevistaFormData } from "@/lib/schemas/entrevistaSchema";
import { convertFormDataForFirestoreEntrevista } from "@/lib/schemas/entrevistaSchema";

const TABLE = "entrevistas";

export const addEntrevista = async (
  data: EntrevistaFormData,
  adminUid: string
): Promise<string> => {
  const newEntrevista = {
    ...convertFormDataForFirestoreEntrevista(data, adminUid),
    creadoPorUid: adminUid,
    modificadoPorUid: adminUid,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    estaEliminada: false,
    estaPublicada: data.estaPublicada ?? false,
  };

  const { data: inserted, error } = await supabase
    .from(TABLE)
    .insert([newEntrevista])
    .select()
    .single();

  if (error) {
    console.error("Error adding entrevista:", error);
    throw error;
  }

  return inserted.id;
};

export const updateEntrevista = async (
  id: string,
  data: EntrevistaFormData,
  adminUid: string
): Promise<void> => {
  const updatedData = {
    ...convertFormDataForFirestoreEntrevista(data, adminUid, id),
    modificadoPorUid: adminUid,
    actualizadoEn: new Date().toISOString(),
  };

  const { error } = await supabase.from(TABLE).update(updatedData).eq("id", id);

  if (error) {
    console.error("Error updating entrevista:", error);
    throw error;
  }
};

export const logicalDeleteEntrevista = async (
  id: string,
  adminUid: string
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE)
    .update({
      estaEliminada: true,
      eliminadaPorUid: adminUid,
      eliminadaEn: new Date().toISOString(),
      modificadoPorUid: adminUid,
      actualizadoEn: new Date().toISOString(),
      estaPublicada: false,
    })
    .eq("id", id);

  if (error) {
    console.error("Error logically deleting entrevista:", error);
    throw error;
  }
};

export const restoreEntrevista = async (
  id: string,
  adminUid: string
): Promise<void> => {
  const { error } = await supabase
    .from(TABLE)
    .update({
      estaEliminada: false,
      eliminadaPorUid: null,
      eliminadaEn: null,
      modificadoPorUid: adminUid,
      actualizadoEn: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error restoring entrevista:", error);
    throw error;
  }
};

export const getEntrevistaById = async (
  id: string
): Promise<Entrevista | null> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting entrevista by ID:", error);
    return null;
  }

  return data as Entrevista;
};

interface AdminEntrevistasFilters {
  tipoContenido?: Entrevista["tipoContenido"];
  estaPublicada?: boolean;
  estaEliminada?: boolean;
}

export const getAllEntrevistasForAdmin = async (options?: {
  filters?: AdminEntrevistasFilters;
}): Promise<Entrevista[]> => {
  let query = supabase.from(TABLE).select("*");

  if (options?.filters) {
    const { tipoContenido, estaPublicada, estaEliminada } = options.filters;

    if (tipoContenido !== undefined) {
      query = query.eq("tipoContenido", tipoContenido);
    }
    if (estaPublicada !== undefined) {
      query = query.eq("estaPublicada", estaPublicada);
    }
    if (estaEliminada !== undefined) {
      query = query.eq("estaEliminada", estaEliminada);
    } else {
      query = query.neq("estaEliminada", true);
    }
  } else {
    query = query.neq("estaEliminada", true);
  }

  query = query.order("fechaGrabacionORecopilacion", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error getting all entrevistas for admin:", error);
    throw error;
  }

  return (data ?? []) as Entrevista[];
};

interface PublicEntrevistasOptions {
  limit?: number;
  temaId?: string | "all";
  ambito?: string | "all";
}

export const getPublicadasEntrevistas = async (
  options?: PublicEntrevistasOptions
): Promise<Entrevista[]> => {
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("estaPublicada", true)
    .neq("estaEliminada", true);

  if (options?.temaId && options.temaId !== "all") {
    query = query.contains("idsTemasSaber", [options.temaId]);
  }
  if (options?.ambito && options.ambito !== "all") {
    query = query.eq("ambitoSaber", options.ambito);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order("fechaGrabacionORecopilacion", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error getting published entrevistas:", error);
    throw error;
  }

  return (data ?? []) as Entrevista[];
};
