import { Database } from './database.types';

export enum TipoNoticia {
  Article = 'article',
  Link = 'link'
}

export type MappedNoticia = {
  id: string;
  titulo: string;
  contenido: string | null;
  imagenUrl: string | null;
  tipo: TipoNoticia;
  urlExterna: string | null;
  createdAt: string;
  updatedAt: string;
  estaEliminada: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
};

export type NoticiaRow = Database['public']['Tables']['noticias']['Row'];
export type NoticiaInsert = Database['public']['Tables']['noticias']['Insert'];
export type NoticiaUpdate = Database['public']['Tables']['noticias']['Update']; 