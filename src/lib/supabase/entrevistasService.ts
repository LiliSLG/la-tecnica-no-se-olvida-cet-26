"use server";

import { supabase } from "@/lib/supabase/supabaseClient";
import type { Entrevista, TemaOption } from "@/lib/types";
import type { EntrevistaFormData } from "@/lib/schemas/entrevistaSchema";

const TABLE = "entrevistas";
const PIVOT_TABLE = "entrevista_tema";

/**
 * Inserta una nueva entrevista y asocia temas mediante la tabla pivote.
 */
export const addEntrevista = async (
  data: EntrevistaFormData,
  adminUid: string
): Promise<string> => {
  const newEntrevista: Partial<Entrevista> = {
    tipoContenido: data.tipoContenido,
    tituloSaber: data.tituloSaber,
    descripcionSaber: data.descripcionSaber,
    videoPropioURL: data.videoPropioURL || null,
    plataformaVideoPropio: data.plataformaVideoPropio || null,
    urlVideoExterno: data.urlVideoExterno || null,
    plataformaVideoExterno: data.plataformaVideoExterno || null,
    fuenteVideoExterno: data.fuenteVideoExterno || null,
    fechaGrabacionORecopilacion: data.fechaGrabacionORecopilacion.toISOString(),
    ambitoSaber: data.ambitoSaber || null,
    palabrasClaveSaber: data.palabrasClaveSaber?.length
      ? data.palabrasClaveSaber
      : null,
    fuentesInformacion: data.fuentesInformacion?.length
      ? data.fuentesInformacion
      : null,
    recopiladoPorUids: data.recopiladoPorUids?.length
      ? data.recopiladoPorUids
      : null,
    transcripcionTextoCompleto: data.transcripcionTextoCompleto || null,
    transcripcionFileURL: data.transcripcionFileURL || null,
    imagenMiniaturaURL: data.imagenMiniaturaURL || null,
    duracionMediaMinutos:
      data.duracionMediaMinutos !== undefined &&
      data.duracionMediaMinutos !== null
        ? data.duracionMediaMinutos
        : null,
    estaPublicada: data.estaPublicada ?? false,
    creadoPorUid: adminUid,
    modificadoPorUid: adminUid,
    estaEliminada: false,
  };

  // 2) Insertar la entrevista en la tabla principal
  const { data: inserted, error: insertError } = await supabase
    .from(TABLE)
    .insert([newEntrevista])
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("Error adding entrevista:", insertError);
    throw insertError;
  }
  const entrevistaId = inserted.id;

  // 3) Insertar filas en la tabla pivote "entrevista_tema"
  //    data.temasSaber es TemaOption[]
  const temaIds = data.temas?.map((t: TemaOption) => t.id) || [];
  if (temaIds.length > 0) {
    const pivotRows = temaIds.map((temaId) => ({
      entrevista_id: entrevistaId,
      tema_id: temaId,
    }));
    const { error: pivotError } = await supabase
      .from(PIVOT_TABLE)
      .insert(pivotRows);
    if (pivotError) {
      console.error("Error inserting entrevista_tema pivot rows:", pivotError);
      throw pivotError;
    }
  }

  return entrevistaId;
};

/**
 * Actualiza una entrevista y resetea sus asociaciones de temas en el pivote.
 */
export const updateEntrevista = async (
  id: string,
  data: EntrevistaFormData,
  adminUid: string
): Promise<void> => {
  const updatedData: Partial<Entrevista> = {
    tipoContenido: data.tipoContenido,
    tituloSaber: data.tituloSaber,
    descripcionSaber: data.descripcionSaber,
    videoPropioURL: data.videoPropioURL || null,
    plataformaVideoPropio: data.plataformaVideoPropio || null,
    urlVideoExterno: data.urlVideoExterno || null,
    plataformaVideoExterno: data.plataformaVideoExterno || null,
    fuenteVideoExterno: data.fuenteVideoExterno || null,
    fechaGrabacionORecopilacion: data.fechaGrabacionORecopilacion.toISOString(),
    ambitoSaber: data.ambitoSaber || null,
    palabrasClaveSaber: data.palabrasClaveSaber?.length
      ? data.palabrasClaveSaber
      : null,
    fuentesInformacion: data.fuentesInformacion?.length
      ? data.fuentesInformacion
      : null,
    recopiladoPorUids: data.recopiladoPorUids?.length
      ? data.recopiladoPorUids
      : null,
    transcripcionTextoCompleto: data.transcripcionTextoCompleto || null,
    transcripcionFileURL: data.transcripcionFileURL || null,
    imagenMiniaturaURL: data.imagenMiniaturaURL || null,
    duracionMediaMinutos:
      data.duracionMediaMinutos !== undefined &&
      data.duracionMediaMinutos !== null
        ? data.duracionMediaMinutos
        : null,
    estaPublicada: data.estaPublicada ?? false,
    modificadoPorUid: adminUid,
  };

  const { error: updateError } = await supabase
    .from(TABLE)
    .update(updatedData)
    .eq("id", id);

  if (updateError) {
    console.error("Error updating entrevista:", updateError);
    throw updateError;
  }

  // 2) Borrar todas las asociaciones previas de esta entrevista
  const { error: deletePivotError } = await supabase
    .from(PIVOT_TABLE)
    .delete()
    .eq("entrevista_id", id);

  if (deletePivotError) {
    console.error(
      "Error deleting existing entrevista_tema pivot rows:",
      deletePivotError
    );
    throw deletePivotError;
  }

  // 3) Reinsertar las nuevas asociaciones
  const temaIds = data.temas?.map((t: TemaOption) => t.id) || [];
  if (temaIds.length > 0) {
    const pivotRows = temaIds.map((temaId) => ({
      entrevista_id: id,
      tema_id: temaId,
    }));
    const { error: insertPivotError } = await supabase
      .from(PIVOT_TABLE)
      .insert(pivotRows);
    if (insertPivotError) {
      console.error(
        "Error inserting entrevista_tema pivot rows:",
        insertPivotError
      );
      throw insertPivotError;
    }
  }
};

/**
 * Elimina lógicamente una entrevista, marcando `estaEliminada = true` y `estaPublicada = false`.
 */
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
      estaPublicada: false,
    })
    .eq("id", id);

  if (error) {
    console.error("Error logically deleting entrevista:", error);
    throw error;
  }
};

/**
 * Restaura una entrevista previamente eliminada lógicamente.
 */
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
    })
    .eq("id", id);

  if (error) {
    console.error("Error restoring entrevista:", error);
    throw error;
  }
};


/**
 * Devuelve una Entrevista con su arreglo de temas (`temasSaber: TemaOption[]`).
 */
export const getEntrevistaById = async (
   id: string
 ): Promise<Entrevista | null> => {
   // 1) Obtener la fila principal de "entrevistas"
   const { data: entrevistaData, error: entrevistaError } = await supabase
     .from(TABLE)
     .select("*")
     .eq("id", id)
     .single();

   if (entrevistaError || !entrevistaData) {
     console.error("Error getting entrevista by ID:", entrevistaError);
     return null;
   }

   // 2) Obtener los temas asociados desde la tabla pivote "entrevista_tema"
   //    haciendo join para traer { id, nombre } de cada tema
   const { data: pivotRows, error: pivotError } = await supabase
     .from(PIVOT_TABLE)
     .select("tema_id, temas(id, nombre)")
     .eq("entrevista_id", id);

   if (pivotError) {
     console.error("Error fetching entrevista_tema pivot rows:", pivotError);
     // Si falla el join, devolvemos la entrevista sin arreglo de temas
     return entrevistaData as Entrevista;
   }

   // 3) Construir TemaOption[] a partir del resultado del join
   const temas: TemaOption[] = (pivotRows || []).map((row: any) => ({
     id: row.tema_id,
     nombre: row.temas.nombre,
   }));

   // 4) Devolver la entrevista uniendo campos principales + "temas"
   return {
     ...entrevistaData,
     temas,
   } as Entrevista;
 };


interface AdminEntrevistasFilters {
  tipoContenido?: Entrevista["tipoContenido"];
  estaPublicada?: boolean;
  estaEliminada?: boolean;
}

/**
 * Obtiene todas las entrevistas para administración, aplicando filtros opcionales.
 */
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

/**
 * Obtiene entrevistas públicas, filtrando por tema (pivot) y/o por ámbito.
 */
export const getPublicadasEntrevistas = async (
  options?: PublicEntrevistasOptions
): Promise<Entrevista[]> => {
  // Si filtramos por tema, hacemos JOIN con pivote
  if (options?.temaId && options.temaId !== "all") {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        entrevista_tema!inner(tema_id)
      `
      )
      .eq("estaPublicada", true)
      .neq("estaEliminada", true)
      .eq("entrevista_tema.tema_id", options.temaId)
      .order("fechaGrabacionORecopilacion", { ascending: false });

    if (error) {
      console.error("Error filtering published entrevistas by tema:", error);
      throw error;
    }

    // Agrupar filas duplicadas y extraer TemaOption[]
    const uniqueMap = new Map<string, any>();
    data?.forEach((row: any) => {
      const entId = row.id;
      if (!uniqueMap.has(entId)) {
        uniqueMap.set(entId, {
          ...row,
          temasSaber: [
            { id: row.entrevista_tema.tema_id, nombre: row.temas?.nombre },
          ],
        });
      } else {
        (uniqueMap.get(entId).temasSaber as TemaOption[]).push({
          id: row.entrevista_tema.tema_id,
          nombre: row.temas?.nombre,
        });
      }
    });

    return Array.from(uniqueMap.values()) as Entrevista[];
  }

  // Si no filtramos por tema:
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("estaPublicada", true)
    .neq("estaEliminada", true);

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
