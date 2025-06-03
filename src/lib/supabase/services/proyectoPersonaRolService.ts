import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { RelationshipService } from './relationshipService';
import { ServiceResult } from '../types/service';

type Persona = Database['public']['Tables']['personas']['Row'];
type ProyectoPersonaRol = {
  proyecto_id: string;
  persona_id: string;
  rol: string;
};

export class ProyectoPersonaRolService extends RelationshipService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'proyecto_persona_rol', 'proyecto_id', 'persona_id');
  }

  async getPersonasWithRoles(proyectoId: string): Promise<ServiceResult<(Persona & { rol: string })[]>> {
    try {
      const { data, error } = await this.supabase
        .from('personas')
        .select(`
          *,
          proyecto_persona_rol!inner(proyecto_id, rol)
        `)
        .eq('proyecto_persona_rol.proyecto_id', proyectoId);

      if (error) throw error;
      const personasWithRoles = data.map(persona => ({
        ...persona,
        rol: (persona.proyecto_persona_rol as ProyectoPersonaRol).rol
      }));
      return this.createSuccessResult(personasWithRoles);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getProyectosByPersona(personaId: string): Promise<ServiceResult<(Database['public']['Tables']['proyectos']['Row'] & { rol: string })[]>> {
    try {
      const { data, error } = await this.supabase
        .from('proyectos')
        .select(`
          *,
          proyecto_persona_rol!inner(persona_id, rol)
        `)
        .eq('proyecto_persona_rol.persona_id', personaId);

      if (error) throw error;
      const proyectosWithRoles = data.map(proyecto => ({
        ...proyecto,
        rol: (proyecto.proyecto_persona_rol as ProyectoPersonaRol).rol
      }));
      return this.createSuccessResult(proyectosWithRoles);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async addPersonaToProyecto(proyectoId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.junctionTable)
        .insert({
          proyecto_id: proyectoId,
          persona_id: personaId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async updatePersonaRol(proyectoId: string, personaId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.junctionTable)
        .update({ rol })
        .eq('proyecto_id', proyectoId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async removePersonaFromProyecto(proyectoId: string, personaId: string): Promise<ServiceResult<void>> {
    return this.removeRelationship(proyectoId, personaId);
  }

  async getPersonaRoles(proyectoId: string): Promise<ServiceResult<{ persona_id: string; rol: string }[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.junctionTable)
        .select('persona_id, rol')
        .eq('proyecto_id', proyectoId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async hasPersona(proyectoId: string, personaId: string): Promise<ServiceResult<boolean>> {
    return this.hasRelationship(proyectoId, personaId);
  }

  async countProyectoPersonas(proyectoId: string): Promise<ServiceResult<number>> {
    return this.countRelationships(proyectoId);
  }
} 