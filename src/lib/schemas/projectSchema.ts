import { supabase } from "@/lib/supabase/supabaseClient";
import type { Proyecto } from "@/lib/types";

export const addProject = async (
  projectData: Omit<
    Proyecto,
    | "id"
    | "creadoEn"
    | "actualizadoEn"
    | "creadoPorUid"
    | "actualizadoPorUid"
    | "estaEliminado"
  >,
  userId: string
): Promise<string> => {
  const now = new Date().toISOString();

  // 1️⃣ Insertar proyecto base
  const { data: proyectoData, error: proyectoError } = await supabase
    .from("proyectos")
    .insert({
      titulo: projectData.titulo,
      descripcionGeneral: projectData.descripcionGeneral,
      resumenEjecutivo: projectData.resumenEjecutivo,
      anoProyecto: projectData.anoProyecto,
      estadoActual: projectData.estadoActual,
      fechaInicio: projectData.fechaInicio,
      fechaFinalizacionEstimada: projectData.fechaFinalizacionEstimada,
      fechaFinalizacionReal: projectData.fechaFinalizacionReal,
      fechaPresentacion: projectData.fechaPresentacion,
      archivoPrincipalURL: projectData.archivoPrincipalURL,
      nombreArchivoPrincipal: projectData.nombreArchivoPrincipal,
      archivosAdjuntos: projectData.archivosAdjuntos,
      nivelEducativoRecomendado: projectData.nivelEducativoRecomendado,
      aplicabilidadActual: projectData.aplicabilidadActual,
      imagenPortadaURL: projectData.imagenPortadaURL,
      creadoPorUid: userId,
      actualizadoPorUid: userId,
      creadoEn: now,
      actualizadoEn: now,
      estaEliminado: false,
    })
    .select("id")
    .single();

  if (proyectoError || !proyectoData) {
    console.error("Error adding project:", proyectoError);
    throw proyectoError;
  }

  const proyectoId = proyectoData.id;

  // 2️⃣ Insertar relaciones N:M

  // Proyecto - Tema
  if (projectData.idsTemas && projectData.idsTemas.length > 0) {
    const temaRows = projectData.idsTemas.map((temaId) => ({
      proyecto_id: proyectoId,
      tema_id: temaId,
    }));

    const { error: temaError } = await supabase
      .from("proyecto_tema")
      .insert(temaRows);

    if (temaError) {
      console.error("Error adding proyecto_tema:", temaError);
      throw temaError;
    }
  }

  // Proyecto - Autor
  if (projectData.idsAutores && projectData.idsAutores.length > 0) {
    const autorRows = projectData.idsAutores.map((personaId) => ({
      proyecto_id: proyectoId,
      persona_id: personaId,
    }));

    const { error: autorError } = await supabase
      .from("proyecto_autor")
      .insert(autorRows);

    if (autorError) {
      console.error("Error adding proyecto_autor:", autorError);
      throw autorError;
    }
  }

  // Proyecto - Tutor Persona
  if (
    projectData.idsTutoresPersonas &&
    projectData.idsTutoresPersonas.length > 0
  ) {
    const tutorRows = projectData.idsTutoresPersonas.map((personaId) => ({
      proyecto_id: proyectoId,
      persona_id: personaId,
    }));

    const { error: tutorError } = await supabase
      .from("proyecto_tutor_persona")
      .insert(tutorRows);

    if (tutorError) {
      console.error("Error adding proyecto_tutor_persona:", tutorError);
      throw tutorError;
    }
  }

  // Proyecto - Organización Tutoria
  if (
    projectData.idsOrganizacionesTutoria &&
    projectData.idsOrganizacionesTutoria.length > 0
  ) {
    const orgRows = projectData.idsOrganizacionesTutoria.map((orgId) => ({
      proyecto_id: proyectoId,
      organizacion_id: orgId,
    }));

    const { error: orgError } = await supabase
      .from("proyecto_organizacion_tutoria")
      .insert(orgRows);

    if (orgError) {
      console.error("Error adding proyecto_organizacion_tutoria:", orgError);
      throw orgError;
    }
  }

  // Proyecto - Colaborador
  if (projectData.idsColaboradores && projectData.idsColaboradores.length > 0) {
    const colabRows = projectData.idsColaboradores.map((personaId) => ({
      proyecto_id: proyectoId,
      persona_id: personaId,
    }));

    const { error: colabError } = await supabase
      .from("proyecto_colaborador")
      .insert(colabRows);

    if (colabError) {
      console.error("Error adding proyecto_colaborador:", colabError);
      throw colabError;
    }
  }

  return proyectoId;
};


export const getProjectsForUser = async (
  userId: string
): Promise<Proyecto[]> => {
  // 1️⃣ Proyectos creados por el user
  const { data: creadosData, error: creadosError } = await supabase
    .from("proyectos")
    .select("*")
    .eq("creadoPorUid", userId)
    .eq("estaEliminado", false)
    .order("actualizadoEn", { ascending: false });

  if (creadosError) {
    console.error("Error getting projects created by user:", creadosError);
    throw creadosError;
  }

  // 2️⃣ Proyectos donde es autor
  const { data: autorRows, error: autorError } = await supabase
    .from("proyecto_autor")
    .select("proyecto_id")
    .eq("persona_id", userId);

  if (autorError) {
    console.error("Error getting proyecto_autor for user:", autorError);
    throw autorError;
  }

  //const autorProyectoIds = autorRows?.map((r) => r.proyecto_id) || [];
  const autorProyectoIds =
    autorRows
      ?.map((r) => r.proyecto_id)
      .filter((id) => typeof id === "string") || [];

  let autorData: Proyecto[] = [];
  if (autorProyectoIds.length > 0) {
    const { data: autorProyectos, error: autorProyectosError } = await supabase
      .from("proyectos")
      .select("*")
      .in("id", autorProyectoIds)
      .eq("estaEliminado", false);

    if (autorProyectosError) {
      console.error(
        "Error getting projects where user is author:",
        autorProyectosError
      );
      throw autorProyectosError;
    }

    autorData = autorProyectos as Proyecto[];
  }

  // 3️⃣ Unir resultados, evitar duplicados
  const resultMap = new Map<string, Proyecto>();

  creadosData?.forEach((p) => {
    if (p.id) {
      resultMap.set(p.id, p as Proyecto);
    }
  });

  autorData.forEach((p) => {
    if (p.id) {
      resultMap.set(p.id, p);
    }
  });
  

  return Array.from(resultMap.values());
};


export const getAllProjectsForAdmin = async (): Promise<Proyecto[]> => {
  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .order("creadoEn", { ascending: false });

  if (error || !data) {
    console.error("Error getting all projects for admin:", error);
    throw error;
  }

  return data as Proyecto[];
};


export const getPublicProjects = async (): Promise<Proyecto[]> => {
  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .eq("estaEliminado", false)
    .in("estadoActual", ["finalizado", "presentado"])
    .order("anoProyecto", { ascending: false })
    .order("titulo", { ascending: true });

  if (error || !data) {
    console.error("Error getting public projects:", error);
    throw error;
  }

  return data as Proyecto[];
};


export const getProjectById = async (id: string): Promise<Proyecto | null> => {
  // 1️⃣ Traer proyecto base
  const { data: proyectoData, error: proyectoError } = await supabase
    .from("proyectos")
    .select("*")
    .eq("id", id)
    .single();

  if (proyectoError || !proyectoData) {
    console.error("Error getting project by ID:", proyectoError);
    return null;
  }

  // 2️⃣ Traer relaciones

  // Temas
  const { data: temasData, error: temasError } = await supabase
    .from("proyecto_tema")
    .select("tema_id")
    .eq("proyecto_id", id);

  // Autores
  const { data: autoresData, error: autoresError } = await supabase
    .from("proyecto_autor")
    .select("persona_id")
    .eq("proyecto_id", id);

  // Tutores
  const { data: tutoresData, error: tutoresError } = await supabase
    .from("proyecto_tutor_persona")
    .select("persona_id")
    .eq("proyecto_id", id);

  // Organizaciones Tutoria
  const { data: orgsData, error: orgsError } = await supabase
    .from("proyecto_organizacion_tutoria")
    .select("organizacion_id")
    .eq("proyecto_id", id);

  // Colaboradores
  const { data: colabData, error: colabError } = await supabase
    .from("proyecto_colaborador")
    .select("persona_id")
    .eq("proyecto_id", id);

  if (temasError || autoresError || tutoresError || orgsError || colabError) {
    console.error("Error getting project relations:", {
      temasError,
      autoresError,
      tutoresError,
      orgsError,
      colabError,
    });
    throw new Error("Error loading project relations");
  }

  return {
    ...proyectoData,
    idsTemas: temasData?.map((t) => t.tema_id) || [],
    idsAutores: autoresData?.map((a) => a.persona_id) || [],
    idsTutoresPersonas: tutoresData?.map((t) => t.persona_id) || [],
    idsOrganizacionesTutoria: orgsData?.map((o) => o.organizacion_id) || [],
    idsColaboradores: colabData?.map((c) => c.persona_id) || [],
  } as Proyecto;
};

export const updateProject = async (
  id: string,
  projectData: Partial<Omit<Proyecto, "id" | "creadoEn" | "creadoPorUid">>,
  userId: string
): Promise<void> => {
  const now = new Date().toISOString();

  // 1️⃣ Actualizar proyecto base
  const { error: updateError } = await supabase
    .from("proyectos")
    .update({
      ...projectData,
      actualizadoPorUid: userId,
      actualizadoEn: now,
    })
    .eq("id", id);

  if (updateError) {
    console.error("Error updating project:", updateError);
    throw updateError;
  }

  // 2️⃣ Actualizar relaciones N:M → borrar e insertar

  // Proyecto - Tema
  await supabase.from("proyecto_tema").delete().eq("proyecto_id", id);
  if (projectData.idsTemas && projectData.idsTemas.length > 0) {
    const temaRows = projectData.idsTemas.map((temaId) => ({
      proyecto_id: id,
      tema_id: temaId,
    }));
    await supabase.from("proyecto_tema").insert(temaRows);
  }

  // Proyecto - Autor
  await supabase.from("proyecto_autor").delete().eq("proyecto_id", id);
  if (projectData.idsAutores && projectData.idsAutores.length > 0) {
    const autorRows = projectData.idsAutores.map((personaId) => ({
      proyecto_id: id,
      persona_id: personaId,
    }));
    await supabase.from("proyecto_autor").insert(autorRows);
  }

  // Proyecto - Tutor Persona
  await supabase.from("proyecto_tutor_persona").delete().eq("proyecto_id", id);
  if (
    projectData.idsTutoresPersonas &&
    projectData.idsTutoresPersonas.length > 0
  ) {
    const tutorRows = projectData.idsTutoresPersonas.map((personaId) => ({
      proyecto_id: id,
      persona_id: personaId,
    }));
    await supabase.from("proyecto_tutor_persona").insert(tutorRows);
  }

  // Proyecto - Organización Tutoria
  await supabase
    .from("proyecto_organizacion_tutoria")
    .delete()
    .eq("proyecto_id", id);
  if (
    projectData.idsOrganizacionesTutoria &&
    projectData.idsOrganizacionesTutoria.length > 0
  ) {
    const orgRows = projectData.idsOrganizacionesTutoria.map((orgId) => ({
      proyecto_id: id,
      organizacion_id: orgId,
    }));
    await supabase.from("proyecto_organizacion_tutoria").insert(orgRows);
  }

  // Proyecto - Colaborador
  await supabase.from("proyecto_colaborador").delete().eq("proyecto_id", id);
  if (projectData.idsColaboradores && projectData.idsColaboradores.length > 0) {
    const colabRows = projectData.idsColaboradores.map((personaId) => ({
      proyecto_id: id,
      persona_id: personaId,
    }));
    await supabase.from("proyecto_colaborador").insert(colabRows);
  }
};


export const logicalDeleteProject = async (
  id: string,
  userId: string
): Promise<void> => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("proyectos")
    .update({
      estaEliminado: true,
      eliminadoPorUid: userId,
      eliminadoEn: now,
      actualizadoPorUid: userId,
      actualizadoEn: now,
    })
    .eq("id", id);

  if (error) {
    console.error("Error logically deleting project:", error);
    throw error;
  }
};

export const restoreProject = async (
  id: string,
  userId: string
): Promise<void> => {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("proyectos")
    .update({
      estaEliminado: false,
      eliminadoPorUid: null,
      eliminadoEn: null,
      actualizadoPorUid: userId,
      actualizadoEn: now,
    })
    .eq("id", id);

  if (error) {
    console.error("Error restoring project:", error);
    throw error;
  }
};

export const permanentlyDeleteProject = async (id: string): Promise<void> => {
  const { error } = await supabase.from("proyectos").delete().eq("id", id);

  if (error) {
    console.error("Error permanently deleting project:", error);
    throw error;
  }
};

