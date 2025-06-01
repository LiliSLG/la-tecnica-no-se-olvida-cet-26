

import { supabase } from "@/lib/supabase/supabaseClient";
import type { Persona } from "@/lib/types";


export const addPersona = async (
  data: Partial<
    Omit<
      Persona,
      | "id"
      | "creadoEn"
      | "actualizadoEn"
      | "ingresadoPor"
      | "modificadoPor"
      | "idsTemasDeInteres"
    >
  >,
  temasIds: string[],
  adminUid: string
): Promise<string> => {
  const now = new Date().toISOString();

  const { data: insertedPersona, error } = await supabase
    .from("personas")
    .insert({
      ...data,
      ingresadoPor: adminUid,
      modificadoPor: adminUid,
      creadoEn: now,
      actualizadoEn: now,
      estaEliminada: false,
      activo: data.activo ?? true,
      esAdmin: data.esAdmin ?? false,
      visibilidadPerfil:
        data.visibilidadPerfil ?? "solo_registrados_plataforma",
      disponibleParaProyectos:
        data.disponibleParaProyectos !== undefined
          ? data.disponibleParaProyectos
          : true,
      anoEgresoCET: data.anoEgresoCET ?? null,
      anoCursadaActualCET: data.anoCursadaActualCET ?? null,
    })
    .select("id")
    .single();

  if (error || !insertedPersona) {
    console.error("Error adding persona:", error);
    throw error;
  }

  // Insert temas en persona_tema
  const temaInserts = temasIds.map((temaId) => ({
    persona_id: insertedPersona.id,
    tema_id: temaId,
  }));

  if (temaInserts.length > 0) {
    const { error: temasError } = await supabase
      .from("persona_tema")
      .insert(temaInserts);

    if (temasError) {
      console.error("Error adding persona_tema:", temasError);
      throw temasError;
    }
  }

  return insertedPersona.id;
};


export const getPersonaById = async (id: string): Promise<Persona | null> => {
  const { data: persona, error } = await supabase
    .from("personas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !persona) {
    console.error("Error getting persona by ID:", error);
    return null;
  }

  // Fetch temas
  const { data: temas, error: temasError } = await supabase
    .from("persona_tema")
    .select("tema_id")
    .eq("persona_id", id);

  if (temasError) {
    console.error("Error getting persona temas:", temasError);
    return { ...persona, idsTemasDeInteres: [] };
  }

  const idsTemasDeInteres = temas.map((t) => t.tema_id);

  return { ...persona, idsTemasDeInteres } as Persona;
};


export const updatePersona = async (
  id: string,
  data: Partial<
    Omit<Persona, "id" | "creadoEn" | "ingresadoPor" | "idsTemasDeInteres">
  >,
  temasIds: string[],
  adminUid: string
): Promise<void> => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("personas")
    .update({
      ...data,
      modificadoPor: adminUid,
      actualizadoEn: now,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating persona:", error);
    throw error;
  }

  // Replace temas: delete existing and insert new
  const { error: deleteError } = await supabase
    .from("persona_tema")
    .delete()
    .eq("persona_id", id);

  if (deleteError) {
    console.error("Error deleting old persona_tema:", deleteError);
    throw deleteError;
  }

  const temaInserts = temasIds.map((temaId) => ({
    persona_id: id,
    tema_id: temaId,
  }));

  if (temaInserts.length > 0) {
    const { error: insertError } = await supabase
      .from("persona_tema")
      .insert(temaInserts);

    if (insertError) {
      console.error("Error inserting new persona_tema:", insertError);
      throw insertError;
    }
  }
};


export const getAllPersonasForAdmin = async (): Promise<Persona[]> => {
  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true });

  if (error || !data) {
    console.error("Error getting all personas for admin:", error);
    throw error;
  }

  return data as Persona[];
};


export const logicalDeletePersona = async (
  id: string,
  adminUid: string
): Promise<void> => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("personas")
    .update({
      estaEliminada: true,
      eliminadoPorUid: adminUid,
      eliminadoEn: now,
      activo: false,
      modificadoPor: adminUid,
      actualizadoEn: now,
    })
    .eq("id", id);

  if (error) {
    console.error("Error logically deleting persona:", error);
    throw error;
  }
};


export const permanentlyDeletePersona = async (id: string): Promise<void> => {
  const { error } = await supabase.from("personas").delete().eq("id", id);

  if (error) {
    console.error("Error permanently deleting persona:", error);
    throw error;
  }
};


export const getPersonasByIds = async (ids: string[]): Promise<Persona[]> => {
  if (!ids || ids.length === 0) return [];

  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .in("id", ids);

  if (error || !data) {
    console.error("Error getting personas by IDs:", error);
    throw error;
  }

  return data as Persona[];
};


export const searchPersonas = async (
  searchTerm: string,
  limitNum = 10
): Promise<Persona[]> => {
  if (!searchTerm.trim()) return [];

  const searchPattern = `%${searchTerm.trim()}%`;

  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .or(
      `nombre.ilike."${searchPattern}",apellido.ilike."${searchPattern}",email.ilike."${searchPattern}"`
    )
    .eq("estaEliminada", false)
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true })
    .limit(limitNum);

  if (error || !data) {
    console.error("Error searching personas:", error);
    return [];
  }

  return data as Persona[];
};

export const getPublicEgresadosYEstudiantes = async (): Promise<Persona[]> => {
  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .eq("activo", true)
    .eq("estaEliminada", false)
    .in("visibilidadPerfil", ["publico", "solo_registrados_plataforma"])
    .in("categoriaPrincipal", ["ex_alumno_cet", "estudiante_cet"])
    .order("apellido", { ascending: true })
    .order("nombre", { ascending: true });

  if (error || !data) {
    console.error("Error getting public egresados y estudiantes:", error);
    throw error;
  }

  return data as Persona[];
};

