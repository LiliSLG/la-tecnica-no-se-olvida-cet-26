import { ValidationError } from './types';
import { ServiceResult, createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';

/**
 * Maps a validation error to a service result
 */
export function mapValidationErrorToResult<T>(
  error: ValidationError
): ServiceResult<T | null> {
  return createErrorResult<T | null>({
    name: error.name,
    message: error.message,
    code: error.code || 'VALIDATION_ERROR',
    details: error.details
  });
}

/**
 * Maps a database error to a service result
 */
export function mapDatabaseErrorToResult<T>(
  error: any
): ServiceResult<T | null> {
  return createErrorResult<T | null>({
    name: 'DatabaseError',
    message: error instanceof Error ? error.message : 'Database operation failed',
    code: 'DB_ERROR',
    details: error
  });
}

/**
 * Maps a cache error to a service result
 */
export function mapCacheErrorToResult<T>(
  error: any
): ServiceResult<T | null> {
  return createErrorResult<T | null>({
    name: 'CacheError',
    message: error instanceof Error ? error.message : 'Cache operation failed',
    code: 'CACHE_ERROR',
    details: error
  });
}

/**
 * Maps a service error to a service result
 */
export function mapServiceErrorToResult<T>(
  error: any
): ServiceResult<T | null> {
  return createErrorResult<T | null>({
    name: 'ServiceError',
    message: error instanceof Error ? error.message : 'Service operation failed',
    code: 'SERVICE_ERROR',
    details: error
  });
}

/**
 * Maps a validation error to a service error
 */
export function mapValidationError(
  message: string,
  source: string,
  details?: any
): ValidationError {
  return {
    name: 'ValidationError',
    message,
    code: 'VALIDATION_ERROR',
    source,
    details
  };
}

/**
 * Maps a database error to a service error
 */
export function mapDatabaseError(
  error: any,
  context?: string
): ValidationError {
  return {
    name: 'DatabaseError',
    message: error instanceof Error ? error.message : 'Database operation failed',
    code: 'DB_ERROR',
    source: context || 'database',
    details: error
  };
}

/**
 * Maps a cache error to a service error
 */
export function mapCacheError(
  error: any,
  context?: string
): ValidationError {
  return {
    name: 'CacheError',
    message: error instanceof Error ? error.message : 'Cache operation failed',
    code: 'CACHE_ERROR',
    source: context || 'cache',
    details: error
  };
}

/**
 * Maps a service error to a service error
 */
export function mapServiceError(
  error: any,
  context?: string
): ValidationError {
  return {
    name: 'ServiceError',
    message: error instanceof Error ? error.message : 'Service operation failed',
    code: 'SERVICE_ERROR',
    source: context || 'service',
    details: error
  };
} 