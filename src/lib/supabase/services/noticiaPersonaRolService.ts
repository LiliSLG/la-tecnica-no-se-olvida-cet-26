import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type NoticiaPersonaRol = Database['public']['Tables']['noticia_persona_rol']['Row'] & { id: string };
type CreateNoticiaPersonaRol = Database['public']['Tables']['noticia_persona_rol']['Insert'];
type UpdateNoticiaPersonaRol = Database['public']['Tables']['noticia_persona_rol']['Update'];
type Persona = Database['public']['Tables']['personas']['Row'];
type Noticia = Database['public']['Tables']['noticias']['Row'];

const VALID_ROLES = ['autor', 'editor', 'colaborador'] as const;
type ValidRole = typeof VALID_ROLES[number];

export class NoticiaPersonaRolService extends BaseService<NoticiaPersonaRol, 'noticia_persona_rol'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'noticia_persona_rol', {
      entityType: 'noticia',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateNoticiaPersonaRol): ValidationError | null {
    if (!data.noticia_id) {
      return mapValidationError('Noticia ID is required', 'noticia_id', data.noticia_id);
    }

    if (!data.persona_id) {
      return mapValidationError('Persona ID is required', 'persona_id', data.persona_id);
    }

    if (!data.rol) {
      return mapValidationError('Role is required', 'rol', data.rol);
    }

    if (!this.isValidRole(data.rol)) {
      return mapValidationError('Invalid role value', 'rol', data.rol);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateNoticiaPersonaRol): ValidationError | null {
    if (data.rol && !this.isValidRole(data.rol)) {
      return mapValidationError('Invalid role value', 'rol', data.rol);
    }

    return null;
  }

  private isValidRole(rol: string): rol is ValidRole {
    return VALID_ROLES.includes(rol as ValidRole);
  }

  async addPersonaToNoticia(noticiaId: string, personaId: string, rol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !personaId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { noticiaId, personaId, rol })
        );
      }

      if (!this.isValidRole(rol)) {
        return this.createErrorResult(
          mapValidationError('Invalid role value', 'rol', rol)
        );
      }

      // Check if noticia exists
      const { data: noticia, error: noticiaError } = await this.supabase
        .from('noticias')
        .select('id')
        .eq('id', noticiaId)
        .single();

      if (noticiaError || !noticia) {
        return this.createErrorResult(
          mapValidationError('Noticia not found', 'noticiaId', noticiaId)
        );
      }

      // Check if persona exists
      const { data: persona, error: personaError } = await this.supabase
        .from('personas')
        .select('id')
        .eq('id', personaId)
        .single();

      if (personaError || !persona) {
        return this.createErrorResult(
          mapValidationError('Persona not found', 'personaId', personaId)
        );
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { noticiaId, personaId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          noticia_id: noticiaId,
          persona_id: personaId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addPersonaToNoticia', noticiaId, personaId, rol }));
    }
  }

  async removePersonaFromNoticia(noticiaId: string, personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !personaId) {
        return this.createErrorResult(
          mapValidationError('Both noticiaId and personaId are required', 'relationship', { noticiaId, personaId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { noticiaId, personaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removePersonaFromNoticia', noticiaId, personaId }));
    }
  }

  async updatePersonaRol(noticiaId: string, personaId: string, newRol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !personaId || !newRol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { noticiaId, personaId, newRol })
        );
      }

      if (!this.isValidRole(newRol)) {
        return this.createErrorResult(
          mapValidationError('Invalid role value', 'rol', newRol)
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { noticiaId, personaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'updatePersonaRol', noticiaId, personaId, newRol }));
    }
  }

  async getPersonasByNoticia(noticiaId: string): Promise<ServiceResult<Persona[] | null>> {
    try {
      if (!noticiaId) {
        return this.createErrorResult(
          mapValidationError('Noticia ID is required', 'noticiaId', noticiaId)
        );
      }

      // Check if noticia exists
      const { data: noticia, error: noticiaError } = await this.supabase
        .from('noticias')
        .select('id')
        .eq('id', noticiaId)
        .single();

      if (noticiaError || !noticia) {
        return this.createErrorResult(
          mapValidationError('Noticia not found', 'noticiaId', noticiaId)
        );
      }

      const { data, error } = await this.supabase
        .from('personas')
        .select(`
          *,
          noticia_persona_rol!inner(noticia_id, rol)
        `)
        .eq('noticia_persona_rol.noticia_id', noticiaId);

      if (error) throw error;
      return this.createSuccessResult(data as Persona[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getPersonasByNoticia', noticiaId }));
    }
  }

  async getNoticiasByPersona(personaId: string): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }

      // Check if persona exists
      const { data: persona, error: personaError } = await this.supabase
        .from('personas')
        .select('id')
        .eq('id', personaId)
        .single();

      if (personaError || !persona) {
        return this.createErrorResult(
          mapValidationError('Persona not found', 'personaId', personaId)
        );
      }

      const { data, error } = await this.supabase
        .from('noticias')
        .select(`
          *,
          noticia_persona_rol!inner(persona_id, rol)
        `)
        .eq('noticia_persona_rol.persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(data as Noticia[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getNoticiasByPersona', personaId }));
    }
  }

  async getByNoticia(noticiaId: string): Promise<ServiceResult<NoticiaPersonaRol[] | null>> {
    try {
      if (!noticiaId) {
        return this.createErrorResult(
          mapValidationError('Noticia ID is required', 'noticiaId', noticiaId)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('noticia_id', noticiaId);

      if (error) throw error;
      return this.createSuccessResult(data as NoticiaPersonaRol[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByNoticia', noticiaId }));
    }
  }

  async getByPersona(personaId: string): Promise<ServiceResult<NoticiaPersonaRol[] | null>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(data as NoticiaPersonaRol[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByPersona', personaId }));
    }
  }

  async getByRol(rol: ValidRole): Promise<ServiceResult<NoticiaPersonaRol[] | null>> {
    try {
      if (!this.isValidRole(rol)) {
        return this.createErrorResult(
          mapValidationError('Invalid role value', 'rol', rol)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('rol', rol);

      if (error) throw error;
      return this.createSuccessResult(data as NoticiaPersonaRol[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByRol', rol }));
    }
  }

  async getByNoticiaAndPersona(noticiaId: string, personaId: string): Promise<ServiceResult<NoticiaPersonaRol | null>> {
    try {
      if (!noticiaId || !personaId) {
        return this.createErrorResult(
          mapValidationError('Both noticiaId and personaId are required', 'relationship', { noticiaId, personaId })
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as NoticiaPersonaRol);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByNoticiaAndPersona', noticiaId, personaId }));
    }
  }

  async updateRol(noticiaId: string, personaId: string, rol: ValidRole): Promise<ServiceResult<NoticiaPersonaRol | null>> {
    try {
      if (!noticiaId || !personaId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { noticiaId, personaId, rol })
        );
      }

      if (!this.isValidRole(rol)) {
        return this.createErrorResult(
          mapValidationError('Invalid role value', 'rol', rol)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({ rol })
        .eq('noticia_id', noticiaId)
        .eq('persona_id', personaId)
        .select()
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as NoticiaPersonaRol);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'updateRol', noticiaId, personaId, rol }));
    }
  }

  async deleteByNoticia(noticiaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId) {
        return this.createErrorResult(
          mapValidationError('Noticia ID is required', 'noticiaId', noticiaId)
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('noticia_id', noticiaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'deleteByNoticia', noticiaId }));
    }
  }

  async deleteByPersona(personaId: string): Promise<ServiceResult<void>> {
    try {
      if (!personaId) {
        return this.createErrorResult(
          mapValidationError('Persona ID is required', 'personaId', personaId)
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('persona_id', personaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'deleteByPersona', personaId }));
    }
  }
} 