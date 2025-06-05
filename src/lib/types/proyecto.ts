import { Database } from '../supabase/types/database.types';

export type EstadoProyecto = 
  | 'draft'
  | 'published'
  | 'archived';

export interface Proyecto {
  id: string;
  titulo: string;
  descripcion?: string | null;
  archivoPrincipalUrl?: string | null;
  estado: EstadoProyecto;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  estaEliminado: boolean;
  eliminadoPorUid?: string | null;
  eliminadoEn?: string | null;
} 