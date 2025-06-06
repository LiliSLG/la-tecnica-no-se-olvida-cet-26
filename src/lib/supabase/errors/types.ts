// src/lib/supabase/errors/types.ts
export interface ValidationError extends Error {
  message: string;
  name: string;
  code: string;
  source: string;
  details?: any;
}

export interface ServiceError extends Error {
  // <--- CAMBIO CLAVE
  // message: string; // 'message' ya es heredado de Error
  // name: string;    // 'name' ya es heredado de Error
  code?: string;
  details?: any;
  context?: any;
}
