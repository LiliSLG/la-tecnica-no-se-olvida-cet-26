import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { AppError, ErrorCode } from '../errors/types';

export type ServiceError = AppError;

export type ServiceResult<T> = {
  data: T | null;
  error: ServiceError | null;
};

export type QueryOptions = {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  filters?: Record<string, unknown>;
  includeDeleted?: boolean;
};

export type CreateOptions = {
  returning?: boolean;
};

export type UpdateOptions = {
  returning?: boolean;
};

export type DeleteOptions = {
  hardDelete?: boolean;
  returning?: boolean;
};

export interface BaseServiceConfig {
  tableName: string;
  supabase: SupabaseClient<Database>;
}

export interface IBaseService<T, CreateInput, UpdateInput> {
  // CRUD Operations
  create(data: CreateInput, options?: CreateOptions): Promise<ServiceResult<T>>;
  getById(id: string): Promise<ServiceResult<T>>;
  getAll(options?: QueryOptions): Promise<ServiceResult<T[]>>;
  update(id: string, data: UpdateInput, options?: UpdateOptions): Promise<ServiceResult<T>>;
  delete(id: string, options?: DeleteOptions): Promise<ServiceResult<T>>;
  
  // Utility Operations
  exists(id: string): Promise<boolean>;
  count(options?: QueryOptions): Promise<number>;
  
  // Soft Delete Operations
  softDelete(id: string): Promise<ServiceResult<T>>;
  restore(id: string): Promise<ServiceResult<T>>;
  
  // Search Operations
  search(query: string, options?: QueryOptions): Promise<ServiceResult<T[]>>;
}

export type WithTimestamps = {
  created_at: string;
  updated_at: string;
};

export type WithSoftDelete = {
  esta_eliminada?: boolean;
  eliminado_por_uid?: string | null;
  eliminado_en?: string | null;
};

export type BaseEntity = WithTimestamps & WithSoftDelete; 