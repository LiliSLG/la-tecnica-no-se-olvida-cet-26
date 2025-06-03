import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { RelationshipService } from './relationshipService';
import { ServiceResult } from '../types/service';

type Organizacion = Database['public']['Tables']['organizaciones']['Row'];
type EntrevistaOrganizacionRol = {
  entrevista_id: string;
  organizacion_id: string;
  rol: string;
};

export class EntrevistaOrganizacionRolService extends RelationshipService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'entrevista_organizacion_rol', 'entrevista_id', 'organizacion_id');
  }

  async getOrganizacionesWithRoles(entrevistaId: string): Promise<ServiceResult<(Organizacion & { rol: string })[]>> {
    try {
      const { data, error } = await this.supabase
        .from('organizaciones')
        .select(`
          *,
          entrevista_organizacion_rol!inner(entrevista_id, rol)
        `)
        .eq('entrevista_organizacion_rol.entrevista_id', entrevistaId);

      if (error) throw error;
      const organizacionesWithRoles = data.map(organizacion => ({
        ...organizacion,
        rol: (organizacion.entrevista_organizacion_rol as EntrevistaOrganizacionRol).rol
      }));
      return this.createSuccessResult(organizacionesWithRoles);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getEntrevistasByOrganizacion(organizacionId: string): Promise<ServiceResult<(Database['public']['Tables']['entrevistas']['Row'] & { rol: string })[]>> {
    try {
      const { data, error } = await this.supabase
        .from('entrevistas')
        .select(`
          *,
          entrevista_organizacion_rol!inner(organizacion_id, rol)
        `)
        .eq('entrevista_organizacion_rol.organizacion_id', organizacionId);

      if (error) throw error;
      const entrevistasWithRoles = data.map(entrevista => ({
        ...entrevista,
        rol: (entrevista.entrevista_organizacion_rol as EntrevistaOrganizacionRol).rol
      }));
      return this.createSuccessResult(entrevistasWithRoles);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async addOrganizacionToEntrevista(entrevistaId: string, organizacionId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.junctionTable)
        .insert({
          entrevista_id: entrevistaId,
          organizacion_id: organizacionId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async updateOrganizacionRol(entrevistaId: string, organizacionId: string, rol: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.junctionTable)
        .update({ rol })
        .eq('entrevista_id', entrevistaId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async removeOrganizacionFromEntrevista(entrevistaId: string, organizacionId: string): Promise<ServiceResult<void>> {
    return this.removeRelationship(entrevistaId, organizacionId);
  }

  async getOrganizacionRoles(entrevistaId: string): Promise<ServiceResult<{ organizacion_id: string; rol: string }[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.junctionTable)
        .select('organizacion_id, rol')
        .eq('entrevista_id', entrevistaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async hasOrganizacion(entrevistaId: string, organizacionId: string): Promise<ServiceResult<boolean>> {
    return this.hasRelationship(entrevistaId, organizacionId);
  }

  async countEntrevistaOrganizaciones(entrevistaId: string): Promise<ServiceResult<number>> {
    return this.countRelationships(entrevistaId);
  }
} 