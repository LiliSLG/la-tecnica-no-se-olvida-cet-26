/**
 * Represents the result of a service operation
 * @template T The type of data returned by the service
 */
export interface ServiceResult<T> {
  /** Whether the operation was successful */
  success: boolean;
  /** The data returned by the service, or null if no data or error */
  data: T | null;
  /** Error information if the operation failed */
  error?: {
    /** The name of the error */
    name: string;
    /** A human-readable error message */
    message: string;
    /** An error code for programmatic handling */
    code: string;
    /** Additional error details */
    details?: any;
  };
}

/**
 * Creates a successful service result
 * @template T The type of data returned by the service
 * @param data The data to return, or null if no data
 * @returns A ServiceResult with success=true and the provided data
 */
export function createSuccessResult<T>(data: T | null): ServiceResult<T> {
  return {
    success: true,
    data
  };
}

/**
 * Creates an error service result
 * @template T The type of data that would have been returned on success
 * @param error The error information
 * @returns A ServiceResult with success=false, data=null, and the provided error
 */
export function createErrorResult<T>(error: {
  name: string;
  message: string;
  code: string;
  details?: any;
}): ServiceResult<T> {
  return {
    success: false,
    data: null,
    error
  };
} 