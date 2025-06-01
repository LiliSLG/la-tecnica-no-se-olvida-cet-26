"use server";

import { supabase } from "@/lib/supabase/supabaseClient";
import type { Noticia } from "@/lib/types";
import type { NoticiaFormData } from "@/lib/schemas/noticiaSchema";
import { convertFormDataForFirestoreNoticia } from "@/lib/schemas/noticiaSchema";

const TABLE = "noticias";

export const addNoticia = async (
  data: NoticiaFormData,
  adminUid: string
): Promise<string> => {
  const newNoticia = {
    ...convertFormDataForFirestoreNoticia(data),
    creadoPorUid: adminUid,
    modificadoPorUid: adminUid,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    estaEliminada: false,
  };

  const { data: inserted, error } = await supabase
    .from(TABLE)
    .insert([newNoticia])
    .select()
    .single();

  if (error) {
    console.error("Error adding noticia:", error);
    throw error;
  }

  return inserted.id;
};

export const updateNoticia = async (
  id: string,
  data: NoticiaFormData,
  adminUid: string
): Promise<void> => {
  const updatedData = {
    ...convertFormDataForFirestoreNoticia(data),
    modificadoPorUid: adminUid,
    actualizadoEn: new Date().toISOString(),
  };

  const { error } = await supabase.from(TABLE).update(updatedData).eq("id", id);

  if (error) {
    console.error("Error updating noticia:", error);
    throw error;
  }
};

export const logicalDeleteNoticia = async (
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
    console.error("Error logically deleting noticia:", error);
    throw error;
  }
};

export const restoreNoticia = async (
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
    console.error("Error restoring noticia:", error);
    throw error;
  }
};

export const getNoticiaById = async (id: string): Promise<Noticia | null> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting noticia by ID:", error);
    return null;
  }

  return data as Noticia;
};

interface AdminNoticiasFilters {
  tipoContenido?: "articulo_propio" | "enlace_externo";
  estaPublicada?: boolean;
  esDestacada?: boolean;
  estaEliminada?: boolean;
}

export const getAllNoticiasForAdmin = async (options?: {
  filters?: AdminNoticiasFilters;
}): Promise<Noticia[]> => {
  let query = supabase.from(TABLE).select("*");

  if (options?.filters) {
    const { tipoContenido, estaPublicada, esDestacada, estaEliminada } =
      options.filters;

    if (tipoContenido !== undefined) {
      query = query.eq("tipoContenido", tipoContenido);
    }
    if (estaPublicada !== undefined) {
      query = query.eq("estaPublicada", estaPublicada);
    }
    if (esDestacada !== undefined) {
      query = query.eq("esDestacada", esDestacada);
    }
    if (estaEliminada !== undefined) {
      query = query.eq("estaEliminada", estaEliminada);
    } else {
      query = query.neq("estaEliminada", true);
    }
  } else {
    query = query.neq("estaEliminada", true);
  }

  query = query.order("fechaPublicacion", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error getting all noticias for admin:", error);
    throw error;
  }

  return (data ?? []) as Noticia[];
};

interface PublicNoticiasOptions {
  limit?: number;
  esDestacada?: boolean | "all";
  categoria?: string | "all";
}

export const getPublicadasNoticias = async (
  options?: PublicNoticiasOptions
): Promise<Noticia[]> => {
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("estaPublicada", true)
    .neq("estaEliminada", true);

  if (options?.esDestacada !== undefined && options.esDestacada !== "all") {
    query = query.eq("esDestacada", options.esDestacada);
  }
  if (options?.categoria && options.categoria !== "all") {
    query = query.contains("idsTemas", [options.categoria]);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order("fechaPublicacion", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error getting published noticias:", error);
    throw error;
  }

  return (data ?? []) as Noticia[];
};
