// src/lib/supabase/types/service.ts

import { ServiceError } from '@/lib/supabase/errors/types';

export interface ServiceResult<T> {
  success: boolean;
  data: T | null;
  error?: ServiceError;
}

export interface QueryOptions {
  useCache?: boolean;
  bypassCache?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
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

export function createSuccessResult<T>(data: T): ServiceResult<T> {
  return {
    success: true,
    data,
  };
}

export function createErrorResult<T>(error: ServiceError): ServiceResult<T> {
  return {
    success: false,
    data: null,
    error,
  };
}
