"use server";

import { supabase } from "@/lib/supabase/supabaseClient";
import type { Organizacion } from "@/lib/types";
import type { OrganizacionFormData } from "@/lib/schemas/organizacionSchema";

const TABLE = "organizaciones";

export const addOrganizacion = async (
  data: Partial<OrganizacionFormData>,
  adminUid: string
): Promise<string> => {
  const newOrganizacion = {
    ...data,
    nombreOficial: data.nombreOficial || "Nombre Provisional",
    tipo: data.tipo || "otro",
    ingresadoPorUid: adminUid,
    modificadoPorUid: adminUid,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
    estaEliminada: false,
    abiertaAColaboraciones: data.abiertaAColaboraciones ?? true,
  };

  const { data: inserted, error } = await supabase
    .from(TABLE)
    .insert([newOrganizacion])
    .select()
    .single();

  if (error) {
    console.error("Error adding organizacion:", error);
    throw error;
  }

  return inserted.id;
};

export const getAllOrganizacionesForAdmin = async (): Promise<
  Organizacion[]
> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("nombreOficial", { ascending: true });

  if (error) {
    console.error("Error getting all organizaciones for admin:", error);
    throw error;
  }

  return (data ?? []) as Organizacion[];
};

export const getPublicOrganizaciones = async (): Promise<Organizacion[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .neq("estaEliminada", true)
    .order("nombreOficial", { ascending: true });

  if (error) {
    console.error("Error getting public organizaciones:", error);
    throw error;
  }

  return (data ?? []) as Organizacion[];
};

export const getOrganizacionById = async (
  id: string
): Promise<Organizacion | null> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting organizacion by ID:", error);
    return null;
  }

  return data as Organizacion;
};

export const updateOrganizacion = async (
  id: string,
  data: Partial<OrganizacionFormData>,
  adminUid: string
): Promise<void> => {
  const updatedData = {
    ...data,
    modificadoPorUid: adminUid,
    actualizadoEn: new Date().toISOString(),
  };

  const { error } = await supabase.from(TABLE).update(updatedData).eq("id", id);

  if (error) {
    console.error("Error updating organizacion:", error);
    throw error;
  }
};

export const logicalDeleteOrganizacion = async (
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
    })
    .eq("id", id);

  if (error) {
    console.error("Error logically deleting organizacion:", error);
    throw error;
  }
};

export const restoreOrganizacion = async (
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
    console.error("Error restoring organizacion:", error);
    throw error;
  }
};

export const permanentlyDeleteOrganizacion = async (
  id: string
): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error("Error permanently deleting organizacion:", error);
    throw error;
  }
};

export const searchOrganizacionesByName = async (
  name: string,
  limitNum = 10
): Promise<Organizacion[]> => {
  if (!name.trim()) return [];

  const nameLower = name.toLowerCase();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .ilike("nombreOficial", `%${nameLower}%`)
    .order("nombreOficial", { ascending: true })
    .limit(limitNum);

  if (error) {
    console.error("Error searching organizaciones:", error);
    return [];
  }

  return (data ?? []).filter(
    (o) =>
      o.nombreOficial?.toLowerCase().includes(nameLower) ||
      o.nombreFantasia?.toLowerCase().includes(nameLower)
  );
};

export const getOrganizacionesByIds = async (
  ids: string[]
): Promise<Organizacion[]> => {
  if (!ids.length) return [];

  const { data, error } = await supabase.from(TABLE).select("*").in("id", ids);

  if (error) {
    console.error("Error getting organizaciones by IDs:", error);
    return [];
  }

  return data as Organizacion[];
};
