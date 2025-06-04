import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type NoticiaOrganizacionRol = Database['public']['Tables']['noticia_organizacion_rol']['Row'] & { id: string };
type CreateNoticiaOrganizacionRol = Database['public']['Tables']['noticia_organizacion_rol']['Insert'];
type UpdateNoticiaOrganizacionRol = Database['public']['Tables']['noticia_organizacion_rol']['Update'];
type Organizacion = Database['public']['Tables']['organizaciones']['Row'];
type Noticia = Database['public']['Tables']['noticias']['Row'];

const VALID_ROLES = ['editor', 'publicador', 'colaborador'] as const;
type ValidRole = typeof VALID_ROLES[number];

export class NoticiaOrganizacionRolService extends BaseService<NoticiaOrganizacionRol, 'noticia_organizacion_rol'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'noticia_organizacion_rol', {
      entityType: 'noticia',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateNoticiaOrganizacionRol): ValidationError | null {
    if (!data.noticia_id) {
      return mapValidationError('Noticia ID is required', 'noticia_id', data.noticia_id);
    }

    if (!data.organizacion_id) {
      return mapValidationError('Organizacion ID is required', 'organizacion_id', data.organizacion_id);
    }

    if (!data.rol) {
      return mapValidationError('Role is required', 'rol', data.rol);
    }

    if (!this.isValidRole(data.rol)) {
      return mapValidationError('Invalid role value', 'rol', data.rol);
    }

    return null;
  }

  protected validateUpdateInput(data: UpdateNoticiaOrganizacionRol): ValidationError | null {
    if (data.rol && !this.isValidRole(data.rol)) {
      return mapValidationError('Invalid role value', 'rol', data.rol);
    }

    return null;
  }

  private isValidRole(rol: string): rol is ValidRole {
    return VALID_ROLES.includes(rol as ValidRole);
  }

  async addOrganizacionToNoticia(noticiaId: string, organizacionId: string, rol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !organizacionId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { noticiaId, organizacionId, rol })
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

      // Check if organizacion exists
      const { data: organizacion, error: organizacionError } = await this.supabase
        .from('organizaciones')
        .select('id')
        .eq('id', organizacionId)
        .single();

      if (organizacionError || !organizacion) {
        return this.createErrorResult(
          mapValidationError('Organizacion not found', 'organizacionId', organizacionId)
        );
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { noticiaId, organizacionId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          noticia_id: noticiaId,
          organizacion_id: organizacionId,
          rol
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addOrganizacionToNoticia', noticiaId, organizacionId, rol }));
    }
  }

  async removeOrganizacionFromNoticia(noticiaId: string, organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !organizacionId) {
        return this.createErrorResult(
          mapValidationError('Both noticiaId and organizacionId are required', 'relationship', { noticiaId, organizacionId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { noticiaId, organizacionId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeOrganizacionFromNoticia', noticiaId, organizacionId }));
    }
  }

  async updateOrganizacionRol(noticiaId: string, organizacionId: string, newRol: ValidRole): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !organizacionId || !newRol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { noticiaId, organizacionId, newRol })
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
        .eq('organizacion_id', organizacionId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { noticiaId, organizacionId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .update({ rol: newRol })
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'updateOrganizacionRol', noticiaId, organizacionId, newRol }));
    }
  }

  async getOrganizacionesByNoticia(noticiaId: string): Promise<ServiceResult<Organizacion[] | null>> {
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
        .from('organizaciones')
        .select(`
          *,
          noticia_organizacion_rol!inner(noticia_id, rol)
        `)
        .eq('noticia_organizacion_rol.noticia_id', noticiaId);

      if (error) throw error;
      return this.createSuccessResult(data as Organizacion[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getOrganizacionesByNoticia', noticiaId }));
    }
  }

  async getNoticiasByOrganizacion(organizacionId: string): Promise<ServiceResult<Noticia[] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }

      // Check if organizacion exists
      const { data: organizacion, error: organizacionError } = await this.supabase
        .from('organizaciones')
        .select('id')
        .eq('id', organizacionId)
        .single();

      if (organizacionError || !organizacion) {
        return this.createErrorResult(
          mapValidationError('Organizacion not found', 'organizacionId', organizacionId)
        );
      }

      const { data, error } = await this.supabase
        .from('noticias')
        .select(`
          *,
          noticia_organizacion_rol!inner(organizacion_id, rol)
        `)
        .eq('noticia_organizacion_rol.organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(data as Noticia[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getNoticiasByOrganizacion', organizacionId }));
    }
  }

  async getByNoticia(noticiaId: string): Promise<ServiceResult<NoticiaOrganizacionRol[] | null>> {
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
      return this.createSuccessResult(data as NoticiaOrganizacionRol[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByNoticia', noticiaId }));
    }
  }

  async getByOrganizacion(organizacionId: string): Promise<ServiceResult<NoticiaOrganizacionRol[] | null>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(data as NoticiaOrganizacionRol[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByOrganizacion', organizacionId }));
    }
  }

  async getByRol(rol: ValidRole): Promise<ServiceResult<NoticiaOrganizacionRol[] | null>> {
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
      return this.createSuccessResult(data as NoticiaOrganizacionRol[]);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByRol', rol }));
    }
  }

  async getByNoticiaAndOrganizacion(noticiaId: string, organizacionId: string): Promise<ServiceResult<NoticiaOrganizacionRol | null>> {
    try {
      if (!noticiaId || !organizacionId) {
        return this.createErrorResult(
          mapValidationError('Both noticiaId and organizacionId are required', 'relationship', { noticiaId, organizacionId })
        );
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select()
        .eq('noticia_id', noticiaId)
        .eq('organizacion_id', organizacionId)
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as NoticiaOrganizacionRol);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByNoticiaAndOrganizacion', noticiaId, organizacionId }));
    }
  }

  async updateRol(noticiaId: string, organizacionId: string, rol: ValidRole): Promise<ServiceResult<NoticiaOrganizacionRol | null>> {
    try {
      if (!noticiaId || !organizacionId || !rol) {
        return this.createErrorResult(
          mapValidationError('All fields are required', 'relationship', { noticiaId, organizacionId, rol })
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
        .eq('organizacion_id', organizacionId)
        .select()
        .single();

      if (error) throw error;
      return this.createSuccessResult(data as NoticiaOrganizacionRol);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'updateRol', noticiaId, organizacionId, rol }));
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

  async deleteByOrganizacion(organizacionId: string): Promise<ServiceResult<void>> {
    try {
      if (!organizacionId) {
        return this.createErrorResult(
          mapValidationError('Organizacion ID is required', 'organizacionId', organizacionId)
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('organizacion_id', organizacionId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'deleteByOrganizacion', organizacionId }));
    }
  }
} 