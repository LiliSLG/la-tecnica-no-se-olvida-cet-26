// src/lib/supabase/types/service.ts

import { ServiceError } from '../errors/types';

export interface ServiceResult<T> {
  success: boolean;
  data: T | null;
  error?: {
    name: string;
    message: string;
    code?: string;
    details?: any;
  };
}

/**
 * Options for querying data from the database
 */
export interface QueryOptions {
  /** Page number for pagination (1-based) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Whether to include soft-deleted records */
  includeDeleted?: boolean;
  /** Additional filters to apply */
  filters?: Record<string, any>;
  /** Whether to bypass cache */
  bypassCache?: boolean;
}

export interface BaseServiceConfig {
  useCache?: boolean;
  cacheTtl?: number;
}

export interface CreateOptions {
  bypassCache?: boolean;
}

export interface UpdateOptions {
  bypassCache?: boolean;
}

export interface DeleteOptions {
  bypassCache?: boolean;
}

export interface BaseEntity {
  id: string;
  creadoEn: string | null;
  actualizadoEn: string | null;
}

export const createSuccessResult = <T>(data: T | null): ServiceResult<T> => ({
  success: true,
  data
});

export const createErrorResult = <T>(error: {
  name: string;
  message: string;
  code?: string;
  details?: any;
}): ServiceResult<T> => ({
  success: false,
  data: null,
  error
});
