import { Database } from './database.types';

export type MappedPersona = {
  id: string;
  nombre: string;
  email: string | null;
  fotoUrl: string | null;
  biografia: string | null;
  categoriaPrincipal: string | null;
  capacidadesPlataforma: string[] | null;
  esAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  estaEliminada: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
};

export type PersonaRow = Database['public']['Tables']['personas']['Row'];
export type PersonaInsert = Database['public']['Tables']['personas']['Insert'];
export type PersonaUpdate = Database['public']['Tables']['personas']['Update']; 