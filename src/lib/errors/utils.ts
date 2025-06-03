import { AppError, ErrorCode, ValidationError, DatabaseError, AuthError, MigrationError, RelationshipError, SystemError } from './types';

/**
 * Creates a new application error with the given parameters
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: unknown,
  stack?: string
): AppError {
  return {
    code,
    message,
    details,
    timestamp: new Date(),
    stack: stack || new Error().stack
  };
}

/**
 * Formats an error for logging
 */
export function formatError(error: AppError): string {
  const timestamp = error.timestamp.toISOString();
  const code = `[${error.code}]`;
  const details = error.details ? `\nDetails: ${JSON.stringify(error.details, null, 2)}` : '';
  const stack = error.stack ? `\nStack: ${error.stack}` : '';

  return `${timestamp} ${code} ${error.message}${details}${stack}`;
}

/**
 * Maps a database error to an application error
 */
export function mapDatabaseError(error: unknown): DatabaseError {
  if (error instanceof Error) {
    return {
      code: ErrorCode.DATABASE_ERROR,
      message: error.message,
      details: error,
      timestamp: new Date(),
      stack: error.stack
    };
  }

  return {
    code: ErrorCode.DATABASE_ERROR,
    message: 'Unknown database error occurred',
    details: error,
    timestamp: new Date()
  };
}

/**
 * Maps a validation error to an application error
 */
export function mapValidationError(
  message: string,
  field?: string,
  value?: unknown,
  constraints?: Record<string, string>
): ValidationError {
  return {
    code: ErrorCode.VALIDATION_ERROR,
    message,
    field,
    value,
    constraints,
    timestamp: new Date(),
    stack: new Error().stack
  };
}

/**
 * Maps an authentication error to an application error
 */
export function mapAuthError(
  code: ErrorCode.AUTH_ERROR | ErrorCode.UNAUTHORIZED | ErrorCode.FORBIDDEN | ErrorCode.INVALID_CREDENTIALS | ErrorCode.SESSION_EXPIRED,
  message: string,
  userId?: string,
  resource?: string,
  action?: string
): AuthError {
  return {
    code,
    message,
    userId,
    resource,
    action,
    timestamp: new Date(),
    stack: new Error().stack
  };
}

/**
 * Maps a migration error to an application error
 */
export function mapMigrationError(
  code: ErrorCode.MIGRATION_ERROR | ErrorCode.EXTRACTION_ERROR | ErrorCode.TRANSFORMATION_ERROR | ErrorCode.MIGRATION_VALIDATION_ERROR | ErrorCode.ROLLBACK_ERROR,
  message: string,
  entity?: string,
  operation?: string,
  batchId?: string
): MigrationError {
  return {
    code,
    message,
    entity,
    operation,
    batchId,
    timestamp: new Date(),
    stack: new Error().stack
  };
}

/**
 * Maps a relationship error to an application error
 */
export function mapRelationshipError(
  code: ErrorCode.RELATIONSHIP_ERROR | ErrorCode.INVALID_RELATIONSHIP | ErrorCode.DUPLICATE_RELATIONSHIP | ErrorCode.MISSING_RELATIONSHIP,
  message: string,
  sourceEntity?: string,
  targetEntity?: string,
  relationshipType?: string
): RelationshipError {
  return {
    code,
    message,
    sourceEntity,
    targetEntity,
    relationshipType,
    timestamp: new Date(),
    stack: new Error().stack
  };
}

/**
 * Maps a system error to an application error
 */
export function mapSystemError(
  code: ErrorCode.SYSTEM_ERROR | ErrorCode.CONFIGURATION_ERROR | ErrorCode.UNKNOWN_ERROR,
  message: string,
  component?: string,
  context?: Record<string, unknown>
): SystemError {
  return {
    code,
    message,
    component,
    context,
    timestamp: new Date(),
    stack: new Error().stack
  };
}

/**
 * Logs an error to the console with appropriate formatting
 */
export function logError(error: AppError): void {
  console.error(formatError(error));
}

/**
 * Logs an error to the console with appropriate formatting and additional context
 */
export function logErrorWithContext(error: AppError, context: Record<string, unknown>): void {
  const errorWithContext = {
    ...error,
    details: error.details ? { ...error.details as Record<string, unknown>, context } : { context }
  };
  console.error(formatError(errorWithContext));
} 