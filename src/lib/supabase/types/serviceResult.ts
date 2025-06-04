export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export const createSuccessResult = <T>(data: T): ServiceResult<T> => ({
  data,
  error: null,
  success: true,
});

export const createErrorResult = <T>(error: Error): ServiceResult<T> => ({
  data: null,
  error,
  success: false,
}); 