import { ValidationError, ServiceError } from './types';

export function mapValidationError(message: string, field: string, value: any): ValidationError {
  const error = new Error(message) as ValidationError;
  error.field = field;
  error.value = value;
  error.code = 'VALIDATION_ERROR';
  error.name = 'ValidationError';
  return error;
}

export function mapServiceError(message: string, code?: string, details?: any, context?: any): ServiceError {
  return {
    message,
    code,
    details,
    context
  };
} 