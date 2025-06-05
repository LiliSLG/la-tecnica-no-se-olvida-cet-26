import { Database } from './database.types';

export type TipoContenidoEntrevista = "video" | "audio" | "texto";
export type PlataformaVideo = "YouTube" | "Vimeo" | "Otro";

export type MappedHistoriaOral = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipoContenido: TipoContenidoEntrevista;
  plataformaVideo: PlataformaVideo | null;
  archivoPrincipalURL: string | null;
  estado: string;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
  // Additional fields from the form
  temas?: Array<{ id: string; nombre: string }>;
  palabrasClaveSaber?: string[];
  fuentesInformacion?: string[];
  recopiladoPorUids?: string[];
  videoPropioURL?: string;
  plataformaVideoPropio?: string;
  urlVideoExterno?: string;
  plataformaVideoExterno?: string;
  fuenteVideoExterno?: string;
  ambitoSaber?: string;
  transcripcionTextoCompleto?: string;
  transcripcionFileURL?: string;
  imagenMiniaturaURL?: string;
  duracionMediaMinutos?: number;
  estaPublicada?: boolean;
};

export type HistoriaOralRow = Database['public']['Tables']['entrevistas']['Row'];
export type HistoriaOralInsert = Database['public']['Tables']['entrevistas']['Insert'];
export type HistoriaOralUpdate = Database['public']['Tables']['entrevistas']['Update']; 