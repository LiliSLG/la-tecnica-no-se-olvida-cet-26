/**
 * Error codes for the application
 * Each code represents a specific type of error that can occur
 */
export enum ErrorCode {
  // Validation Errors (1000-1999)
  VALIDATION_ERROR = 1000,
  REQUIRED_FIELD = 1001,
  INVALID_FORMAT = 1002,
  INVALID_VALUE = 1003,
  DUPLICATE_ENTRY = 1004,

  // Database Errors (2000-2999)
  DATABASE_ERROR = 2000,
  QUERY_ERROR = 2001,
  TRANSACTION_ERROR = 2002,
  CONSTRAINT_ERROR = 2003,
  CONNECTION_ERROR = 2004,

  // Authentication Errors (3000-3999)
  AUTH_ERROR = 3000,
  UNAUTHORIZED = 3001,
  FORBIDDEN = 3002,
  INVALID_CREDENTIALS = 3003,
  SESSION_EXPIRED = 3004,

  // Migration Errors (4000-4999)
  MIGRATION_ERROR = 4000,
  EXTRACTION_ERROR = 4001,
  TRANSFORMATION_ERROR = 4002,
  MIGRATION_VALIDATION_ERROR = 4003,
  ROLLBACK_ERROR = 4004,

  // Relationship Errors (5000-5999)
  RELATIONSHIP_ERROR = 5000,
  INVALID_RELATIONSHIP = 5001,
  DUPLICATE_RELATIONSHIP = 5002,
  MISSING_RELATIONSHIP = 5003,

  // System Errors (9000-9999)
  SYSTEM_ERROR = 9000,
  CONFIGURATION_ERROR = 9001,
  UNKNOWN_ERROR = 9999
}

/**
 * Base error interface that all application errors should implement
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  timestamp: Date;
  stack?: string;
}

/**
 * Validation error interface for data validation errors
 */
export interface ValidationError extends AppError {
  code: ErrorCode.VALIDATION_ERROR | ErrorCode.REQUIRED_FIELD | ErrorCode.INVALID_FORMAT | ErrorCode.INVALID_VALUE | ErrorCode.DUPLICATE_ENTRY;
  field?: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

/**
 * Database error interface for database-related errors
 */
export interface DatabaseError extends AppError {
  code: ErrorCode.DATABASE_ERROR | ErrorCode.QUERY_ERROR | ErrorCode.TRANSACTION_ERROR | ErrorCode.CONSTRAINT_ERROR | ErrorCode.CONNECTION_ERROR;
  query?: string;
  params?: unknown[];
  table?: string;
}

/**
 * Authentication error interface for auth-related errors
 */
export interface AuthError extends AppError {
  code: ErrorCode.AUTH_ERROR | ErrorCode.UNAUTHORIZED | ErrorCode.FORBIDDEN | ErrorCode.INVALID_CREDENTIALS | ErrorCode.SESSION_EXPIRED;
  userId?: string;
  resource?: string;
  action?: string;
}

/**
 * Migration error interface for data migration errors
 */
export interface MigrationError extends AppError {
  code: ErrorCode.MIGRATION_ERROR | ErrorCode.EXTRACTION_ERROR | ErrorCode.TRANSFORMATION_ERROR | ErrorCode.MIGRATION_VALIDATION_ERROR | ErrorCode.ROLLBACK_ERROR;
  entity?: string;
  operation?: string;
  batchId?: string;
}

/**
 * Relationship error interface for relationship-related errors
 */
export interface RelationshipError extends AppError {
  code: ErrorCode.RELATIONSHIP_ERROR | ErrorCode.INVALID_RELATIONSHIP | ErrorCode.DUPLICATE_RELATIONSHIP | ErrorCode.MISSING_RELATIONSHIP;
  sourceEntity?: string;
  targetEntity?: string;
  relationshipType?: string;
}

/**
 * System error interface for system-level errors
 */
export interface SystemError extends AppError {
  code: ErrorCode.SYSTEM_ERROR | ErrorCode.CONFIGURATION_ERROR | ErrorCode.UNKNOWN_ERROR;
  component?: string;
  context?: Record<string, unknown>;
}

/**
 * Type guard functions to check error types
 */
export const isValidationError = (error: AppError): error is ValidationError => 
  error.code >= 1000 && error.code < 2000;

export const isDatabaseError = (error: AppError): error is DatabaseError => 
  error.code >= 2000 && error.code < 3000;

export const isAuthError = (error: AppError): error is AuthError => 
  error.code >= 3000 && error.code < 4000;

export const isMigrationError = (error: AppError): error is MigrationError => 
  error.code >= 4000 && error.code < 5000;

export const isRelationshipError = (error: AppError): error is RelationshipError => 
  error.code >= 5000 && error.code < 6000;

export const isSystemError = (error: AppError): error is SystemError => 
  error.code >= 9000; 