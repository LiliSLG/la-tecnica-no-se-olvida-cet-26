"use server";

import { supabase } from "@/lib/supabase/supabaseClient";
import type { Noticia, TemaOption } from "@/lib/types";
import type { NoticiaFormData } from "@/lib/schemas/noticiaSchema";

const TABLE = "noticias";
const PIVOT_TABLE = "noticia_tema";

export const addNoticia = async (
  data: NoticiaFormData,
  adminUid: string
): Promise<string> => {
  // 1) Insertar la noticia sin CREATED_AT / UPDATED_AT
  const newNoticia: Partial<Noticia> = {
    tipoContenido: data.tipoContenido,
    titulo: data.titulo,
    subtitulo: data.subtitulo || null,
    contenido: data.contenido || null,
    urlExterna: data.urlExterna || null,
    fuenteExterna: data.fuenteExterna || null,
    resumenOContextoInterno: data.resumenOContextoInterno || null,
    fechaPublicacion: data.fechaPublicacion.toISOString(),
    autorNoticia: data.autorNoticia || null,
    imagenPrincipalURL: data.imagenPrincipalURL || null,
    esDestacada: data.esDestacada ?? false,
    estaPublicada: data.estaPublicada ?? false,
    creadoPorUid: adminUid,
    modificadoPorUid: adminUid,
    estaEliminada: false,
    // ⚠ No enviamos creadoEn / actualizadoEn aquí
  };

  const { data: inserted, error: insertError } = await supabase
    .from(TABLE)
    .insert([newNoticia])
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("Error adding noticia:", insertError);
    throw insertError;
  }
  const noticiaId = inserted.id;

  // 2) Insertar filas en el pivot noticia_tema
  const temasIds = (data.temas || []).map((t: TemaOption) => t.id);
  if (temasIds.length > 0) {
    const pivotRows = temasIds.map((temaId) => ({
      noticia_id: noticiaId,
      tema_id: temaId,
    }));
    const { error: pivotError } = await supabase
      .from(PIVOT_TABLE)
      .insert(pivotRows);
    if (pivotError) {
      console.error("Error inserting noticia_tema pivot:", pivotError);
      throw pivotError;
    }
  }

  return noticiaId;
};

export const updateNoticia = async (
  id: string,
  data: NoticiaFormData,
  adminUid: string
): Promise<void> => {
  // 1) Actualizar la fila principal en "noticias" (sin UPDATED_AT manual)
  const updatedData: Partial<Noticia> = {
    tipoContenido: data.tipoContenido,
    titulo: data.titulo,
    subtitulo: data.subtitulo || null,
    contenido: data.contenido || null,
    urlExterna: data.urlExterna || null,
    fuenteExterna: data.fuenteExterna || null,
    resumenOContextoInterno: data.resumenOContextoInterno || null,
    fechaPublicacion: data.fechaPublicacion.toISOString(),
    autorNoticia: data.autorNoticia || null,
    imagenPrincipalURL: data.imagenPrincipalURL || null,
    esDestacada: data.esDestacada ?? false,
    estaPublicada: data.estaPublicada ?? false,
    modificadoPorUid: adminUid,
    // ⚠ No enviamos actualizadoEn aquí: que el DEFAULT de la tabla se encargue
  };

  const { error: updateError } = await supabase
    .from(TABLE)
    .update(updatedData)
    .eq("id", id);

  if (updateError) {
    console.error("Error updating noticia:", updateError);
    throw updateError;
  }

  // 2) Sincronizar el pivot noticia_tema
  const { error: deletePivotError } = await supabase
    .from(PIVOT_TABLE)
    .delete()
    .eq("noticia_id", id);

  if (deletePivotError) {
    console.error(
      "Error deleting existing noticia_tema pivot rows:",
      deletePivotError
    );
    throw deletePivotError;
  }

  const temasIds = (data.temas || []).map((t: TemaOption) => t.id);
  if (temasIds.length > 0) {
    const pivotRows = temasIds.map((temaId) => ({
      noticia_id: id,
      tema_id: temaId,
    }));
    const { error: insertPivotError } = await supabase
      .from(PIVOT_TABLE)
      .insert(pivotRows);
    if (insertPivotError) {
      console.error(
        "Error inserting noticia_tema pivot rows:",
        insertPivotError
      );
      throw insertPivotError;
    }
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
      // ⚠ No enviamos actualizadoEn aquí
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
      // ⚠ No enviamos actualizadoEn
    })
    .eq("id", id);

  if (error) {
    console.error("Error restoring noticia:", error);
    throw error;
  }
};

export const getNoticiaById = async (id: string): Promise<Noticia | null> => {
  const { data: noticiaData, error: noticiaError } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (noticiaError || !noticiaData) {
    console.error("Error getting noticia by ID:", noticiaError);
    return null;
  }

  // Traer temas desde pivote
  const { data: pivotRows, error: pivotError } = await supabase
    .from(PIVOT_TABLE)
    .select("tema_id, temas(id, nombre)")
    .eq("noticia_id", id);

  if (pivotError) {
    console.error("Error fetching noticia_tema pivot rows:", pivotError);
    return noticiaData as Noticia;
  }

  const temas: TemaOption[] = (pivotRows || []).map((row: any) => ({
    id: row.tema_id,
    nombre: row.temas.nombre,
  }));

  return {
    ...noticiaData,
    temas,
  } as unknown as Noticia;
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
  if (options?.categoria && options.categoria !== "all") {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        *, 
        noticia_tema!inner(
          tema_id
        )
      `
      )
      .eq("estaPublicada", true)
      .neq("estaEliminada", true)
      .eq("noticia_tema.tema_id", options.categoria)
      .order("fechaPublicacion", { ascending: false });

    if (error) {
      console.error("Error filtering published noticias by category:", error);
      throw error;
    }

    const uniqueMap = new Map<string, any>();
    data?.forEach((row: any) => {
      const noticiaId = row.id;
      if (!uniqueMap.has(noticiaId)) {
        uniqueMap.set(noticiaId, {
          ...row,
          temas: [{ id: row.noticia_tema.tema_id, nombre: row.temas?.nombre }],
        });
      } else {
        (uniqueMap.get(noticiaId).temas as TemaOption[]).push({
          id: row.noticia_tema.tema_id,
          nombre: row.temas?.nombre,
        });
      }
    });

    return Array.from(uniqueMap.values()) as Noticia[];
  }

  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("estaPublicada", true)
    .neq("estaEliminada", true);

  if (options?.esDestacada !== undefined && options.esDestacada !== "all") {
    query = query.eq("esDestacada", options.esDestacada);
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
