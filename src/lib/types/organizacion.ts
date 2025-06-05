import { Database } from '../supabase/types/database.types';

export type TipoOrganizacion = 
  | 'empresa'
  | 'institucion_educativa'
  | 'ONG'
  | 'estancia_productiva'
  | 'organismo_gubernamental'
  | 'otro';

export interface Organizacion {
  id: string;
  nombre: string;
  descripcion?: string | null;
  logoUrl?: string | null;
  sitioWeb?: string | null;
  estado: 'activo' | 'inactivo';
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  estaEliminada: boolean;
  eliminadoPorUid?: string | null;
  eliminadoEn?: string | null;
} 