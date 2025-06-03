import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { ServiceResult, ServiceError } from '../types/service';

export abstract class RelationshipService {
  protected constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly junctionTable: string,
    protected readonly sourceIdColumn: string,
    protected readonly targetIdColumn: string
  ) {}

  protected createSuccessResult<T>(data: T): ServiceResult<T> {
    return {
      data,
      error: null
    };
  }

  protected createErrorResult(error: unknown): ServiceResult<never> {
    const serviceError: ServiceError = {
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      code: 'RELATIONSHIP_ERROR'
    };
    return {
      data: null,
      error: serviceError
    };
  }

  async addRelationship(sourceId: string, targetId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.junctionTable)
        .insert({
          [this.sourceIdColumn]: sourceId,
          [this.targetIdColumn]: targetId
        });

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async removeRelationship(sourceId: string, targetId: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await this.supabase
        .from(this.junctionTable)
        .delete()
        .eq(this.sourceIdColumn, sourceId)
        .eq(this.targetIdColumn, targetId);

      if (error) throw error;
      return this.createSuccessResult(undefined);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async getRelationships(sourceId: string): Promise<ServiceResult<string[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.junctionTable)
        .select(this.targetIdColumn)
        .eq(this.sourceIdColumn, sourceId);

      if (error) throw error;
      const targetIds = data.map(row => row[this.targetIdColumn as keyof typeof row] as string);
      return this.createSuccessResult(targetIds);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async hasRelationship(sourceId: string, targetId: string): Promise<ServiceResult<boolean>> {
    try {
      const { data, error } = await this.supabase
        .from(this.junctionTable)
        .select(this.targetIdColumn)
        .eq(this.sourceIdColumn, sourceId)
        .eq(this.targetIdColumn, targetId)
        .limit(1);

      if (error) throw error;
      return this.createSuccessResult(data.length > 0);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }

  async countRelationships(sourceId: string): Promise<ServiceResult<number>> {
    try {
      const { count, error } = await this.supabase
        .from(this.junctionTable)
        .select('*', { count: 'exact', head: true })
        .eq(this.sourceIdColumn, sourceId);

      if (error) throw error;
      return this.createSuccessResult(count || 0);
    } catch (error) {
      return this.createErrorResult(error);
    }
  }
} 