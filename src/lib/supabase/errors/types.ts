export interface ValidationError {
  message: string;
  field: string;
  value: any;
  code?: string;
}

export interface ServiceError {
  message: string;
  code?: string;
  details?: any;
  context?: any;
} 