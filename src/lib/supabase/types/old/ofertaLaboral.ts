import { Database } from '../database.types';

export type MappedOfertaLaboral = {
  id: string;
  titulo: string;
  descripcion: string | null;
  empresa: string | null;
  ubicacion: string | null;
  estado: string;
  estaEliminada: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OfertaLaboralRow = Database['public']['Tables']['ofertas_laborales']['Row'];
export type OfertaLaboralInsert = Database['public']['Tables']['ofertas_laborales']['Insert'];
export type OfertaLaboralUpdate = Database['public']['Tables']['ofertas_laborales']['Update']; 