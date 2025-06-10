import { Database } from '../database.types';

export enum EstadoProyecto {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived'
}

export type MappedProyecto = {
  id: string;
  titulo: string;
  descripcion: string | null;
  archivoPrincipalUrl: string | null;
  status: EstadoProyecto;
  createdAt: string;
  updatedAt: string;
  estaEliminado: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
};

export type ProyectoRow = Database['public']['Tables']['proyectos']['Row'];
export type ProyectoInsert = Database['public']['Tables']['proyectos']['Insert'];
export type ProyectoUpdate = Database['public']['Tables']['proyectos']['Update']; 