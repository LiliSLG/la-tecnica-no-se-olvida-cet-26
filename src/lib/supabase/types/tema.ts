import { Database } from './database.types';

export type MappedTema = {
  id: string;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
  estaEliminado: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
};

export type TemaRow = Database['public']['Tables']['temas']['Row'];
export type TemaInsert = Database['public']['Tables']['temas']['Insert'];
export type TemaUpdate = Database['public']['Tables']['temas']['Update']; 