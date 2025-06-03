import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type NoticiaTema = Database['public']['Tables']['noticia_tema']['Row'];
type CreateNoticiaTema = Database['public']['Tables']['noticia_tema']['Insert'];

export class NoticiaTemaService extends BaseService<NoticiaTema, CreateNoticiaTema, never> {
  constructor(supabase: SupabaseClient<Database>) {
    super({ tableName: 'noticia_tema', supabase });
  }

  protected validateCreateInput(data: CreateNoticiaTema): ValidationError | null {
    if (!data.noticia_id) {
      return mapValidationError('Noticia ID is required', 'noticia_id', data.noticia_id);
    }

    if (!data.tema_id) {
      return mapValidationError('Tema ID is required', 'tema_id', data.tema_id);
    }

    return null;
  }

  async addTemaToNoticia(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both noticiaId and temaId are required', 'relationship', { noticiaId, temaId })
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

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

      // Check if relationship already exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { noticiaId, temaId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          noticia_id: noticiaId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addTemaToNoticia', noticiaId, temaId }));
    }
  }

  async removeTemaFromNoticia(noticiaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!noticiaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both noticiaId and temaId are required', 'relationship', { noticiaId, temaId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { noticiaId, temaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('noticia_id', noticiaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeTemaFromNoticia', noticiaId, temaId }));
    }
  }

  async getTemasByNoticia(noticiaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
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
        .from('temas')
        .select(`
          *,
          noticia_tema!inner(noticia_id)
        `)
        .eq('noticia_tema.noticia_id', noticiaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getTemasByNoticia', noticiaId }));
    }
  }

  async getNoticiasByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['noticias']['Row'][]>> {
    try {
      if (!temaId) {
        return this.createErrorResult(
          mapValidationError('Tema ID is required', 'temaId', temaId)
        );
      }

      // Check if tema exists
      const { data: tema, error: temaError } = await this.supabase
        .from('temas')
        .select('id')
        .eq('id', temaId)
        .single();

      if (temaError || !tema) {
        return this.createErrorResult(
          mapValidationError('Tema not found', 'temaId', temaId)
        );
      }

      const { data, error } = await this.supabase
        .from('noticias')
        .select(`
          *,
          noticia_tema!inner(tema_id)
        `)
        .eq('noticia_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getNoticiasByTema', temaId }));
    }
  }
} 