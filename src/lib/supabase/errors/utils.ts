import { ValidationError, ServiceError } from './types';

export function mapValidationError(message: string, field: string, value: any): ValidationError {
  return {
    message,
    field,
    value,
    code: 'VALIDATION_ERROR'
  };
}

export function mapServiceError(message: string, code?: string, details?: any, context?: any): ServiceError {
  return {
    message,
    code,
    details,
    context
  };
} 