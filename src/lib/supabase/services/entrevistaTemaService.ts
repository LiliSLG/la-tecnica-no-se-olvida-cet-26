import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { BaseService } from './baseService';
import { ServiceResult } from '../types/service';
import { ValidationError } from '../errors/types';
import { mapValidationError } from '../errors/utils';

type EntrevistaTema = Database['public']['Tables']['entrevista_tema']['Row'] & { id: string };
type CreateEntrevistaTema = Database['public']['Tables']['entrevista_tema']['Insert'];

export class EntrevistaTemaService extends BaseService<EntrevistaTema, 'entrevista_tema'> {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'entrevista_tema', {
      entityType: 'entrevista',
      ttl: 3600, // 1 hour
      enableCache: true,
    });
  }

  protected validateCreateInput(data: CreateEntrevistaTema): ValidationError | null {
    if (!data.entrevista_id) {
      return mapValidationError('Entrevista ID is required', 'entrevista_id', data.entrevista_id);
    }

    if (!data.tema_id) {
      return mapValidationError('Tema ID is required', 'tema_id', data.tema_id);
    }

    return null;
  }

  async addTemaToEntrevista(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both entrevistaId and temaId are required', 'relationship', { entrevistaId, temaId })
        );
      }

      // Check if entrevista exists
      const { data: entrevista, error: entrevistaError } = await this.supabase
        .from('entrevistas')
        .select('id')
        .eq('id', entrevistaId)
        .single();

      if (entrevistaError || !entrevista) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
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
        .eq('entrevista_id', entrevistaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existing) {
        return this.createErrorResult(
          mapValidationError('Relationship already exists', 'relationship', { entrevistaId, temaId })
        );
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .insert({
          entrevista_id: entrevistaId,
          tema_id: temaId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'addTemaToEntrevista', entrevistaId, temaId }));
    }
  }

  async removeTemaFromEntrevista(entrevistaId: string, temaId: string): Promise<ServiceResult<void>> {
    try {
      if (!entrevistaId || !temaId) {
        return this.createErrorResult(
          mapValidationError('Both entrevistaId and temaId are required', 'relationship', { entrevistaId, temaId })
        );
      }

      // Check if relationship exists
      const { data: existing, error: existingError } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('entrevista_id', entrevistaId)
        .eq('tema_id', temaId)
        .single();

      if (existingError) {
        if (existingError.code === 'PGRST116') {
          return this.createErrorResult(
            mapValidationError('Relationship does not exist', 'relationship', { entrevistaId, temaId })
          );
        }
        throw existingError;
      }

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('entrevista_id', entrevistaId)
        .eq('tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'removeTemaFromEntrevista', entrevistaId, temaId }));
    }
  }

  async getTemasByEntrevista(entrevistaId: string): Promise<ServiceResult<Database['public']['Tables']['temas']['Row'][]>> {
    try {
      if (!entrevistaId) {
        return this.createErrorResult(
          mapValidationError('Entrevista ID is required', 'entrevistaId', entrevistaId)
        );
      }

      // Check if entrevista exists
      const { data: entrevista, error: entrevistaError } = await this.supabase
        .from('entrevistas')
        .select('id')
        .eq('id', entrevistaId)
        .single();

      if (entrevistaError || !entrevista) {
        return this.createErrorResult(
          mapValidationError('Entrevista not found', 'entrevistaId', entrevistaId)
        );
      }

      const { data, error } = await this.supabase
        .from('temas')
        .select(`
          *,
          entrevista_tema!inner(entrevista_id)
        `)
        .eq('entrevista_tema.entrevista_id', entrevistaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getTemasByEntrevista', entrevistaId }));
    }
  }

  async getEntrevistasByTema(temaId: string): Promise<ServiceResult<Database['public']['Tables']['entrevistas']['Row'][]>> {
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
        .from('entrevistas')
        .select(`
          *,
          entrevista_tema!inner(tema_id)
        `)
        .eq('entrevista_tema.tema_id', temaId);

      if (error) throw error;
      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getEntrevistasByTema', temaId }));
    }
  }
} 