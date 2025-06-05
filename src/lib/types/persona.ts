import { Database } from '../supabase/types/database.types';

export type CategoriaPrincipalPersona = 
  | 'docente_cet'
  | 'estudiante_cet'
  | 'ex_alumno_cet'
  | 'productor_rural'
  | 'profesional_externo'
  | 'investigador'
  | 'comunidad_general'
  | 'otro'
  | 'ninguno_asignado';

export type CapacidadPlataforma = 
  | 'es_admin_sistema'
  | 'es_autor'
  | 'es_tutor'
  | 'es_colaborador';

export type EstadoSituacionLaboral = 
  | 'empleado'
  | 'desempleado'
  | 'independiente'
  | 'estudiante'
  | 'otro';

export type VisibilidadPerfil = 
  | 'publico'
  | 'solo_registrados_plataforma'
  | 'privado';

export interface Persona {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  fotoUrl?: string | null;
  biografia?: string | null;
  categoriaPrincipal: CategoriaPrincipalPersona;
  capacidadesPlataforma?: CapacidadPlataforma[] | null;
  esAdmin: boolean;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  estaEliminada: boolean;
  eliminadoPorUid?: string | null;
  eliminadoEn?: string | null;
} 