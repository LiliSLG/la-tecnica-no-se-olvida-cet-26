import { Database } from '../database.types';

export type MappedOrganizacion = {
  id: string;
  nombre: string;
  descripcion: string | null;
  logoUrl: string | null;
  sitioWeb: string | null;
  createdAt: string;
  updatedAt: string;
  estaEliminada: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
};

export type OrganizacionRow = Database['public']['Tables']['organizaciones']['Row'];
export type OrganizacionInsert = Database['public']['Tables']['organizaciones']['Insert'];
export type OrganizacionUpdate = Database['public']['Tables']['organizaciones']['Update']; 