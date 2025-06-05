import { Database } from '../supabase/types/database.types';

export type NivelCurso = 
  | 'beginner'
  | 'intermediate'
  | 'advanced';

export interface Curso {
  id: string;
  titulo: string;
  descripcion?: string | null;
  nivel: NivelCurso;
  duracion: number;
  estado: 'activo' | 'inactivo';
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  estaEliminado: boolean;
  eliminadoPorUid?: string | null;
  eliminadoEn?: string | null;
} 