export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      personas: {
        Row: {
          id: string
          nombre: string
          email: string | null
          foto_url: string | null
          biografia: string | null
          categoria_principal: string | null
          capacidades_plataforma: string[] | null
          es_admin: boolean
          created_at: string
          updated_at: string
          esta_eliminada: boolean
          eliminado_por_uid: string | null
          eliminado_en: string | null
        }
        Insert: {
          id?: string
          nombre: string
          email?: string | null
          foto_url?: string | null
          biografia?: string | null
          categoria_principal?: string | null
          capacidades_plataforma?: string[] | null
          es_admin?: boolean
          created_at?: string
          updated_at?: string
          esta_eliminada?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          email?: string | null
          foto_url?: string | null
          biografia?: string | null
          categoria_principal?: string | null
          capacidades_plataforma?: string[] | null
          es_admin?: boolean
          created_at?: string
          updated_at?: string
          esta_eliminada?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
      }
      organizaciones: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          logo_url: string | null
          sitio_web: string | null
          created_at: string
          updated_at: string
          esta_eliminada: boolean
          eliminado_por_uid: string | null
          eliminado_en: string | null
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          logo_url?: string | null
          sitio_web?: string | null
          created_at?: string
          updated_at?: string
          esta_eliminada?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          logo_url?: string | null
          sitio_web?: string | null
          created_at?: string
          updated_at?: string
          esta_eliminada?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
      }
      temas: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          created_at: string
          updated_at: string
          esta_eliminado: boolean
          eliminado_por_uid: string | null
          eliminado_en: string | null
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          created_at?: string
          updated_at?: string
          esta_eliminado?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          created_at?: string
          updated_at?: string
          esta_eliminado?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
      }
      proyectos: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          archivo_principal_url: string | null
          status: 'draft' | 'published' | 'archived'
          created_at: string
          updated_at: string
          esta_eliminado: boolean
          eliminado_por_uid: string | null
          eliminado_en: string | null
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          archivo_principal_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
          esta_eliminado?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          archivo_principal_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          created_at?: string
          updated_at?: string
          esta_eliminado?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
      }
      entrevistas: {
        Row: {
          id: string
          titulo: string
          descripcion: string | null
          video_url: string | null
          status: 'scheduled' | 'completed' | 'cancelled'
          fecha_entrevista: string | null
          created_at: string
          updated_at: string
          esta_eliminada: boolean
          eliminado_por_uid: string | null
          eliminado_en: string | null
        }
        Insert: {
          id?: string
          titulo: string
          descripcion?: string | null
          video_url?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          fecha_entrevista?: string | null
          created_at?: string
          updated_at?: string
          esta_eliminada?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
        Update: {
          id?: string
          titulo?: string
          descripcion?: string | null
          video_url?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          fecha_entrevista?: string | null
          created_at?: string
          updated_at?: string
          esta_eliminada?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
      }
      noticias: {
        Row: {
          id: string
          titulo: string
          contenido: string | null
          imagen_url: string | null
          tipo: 'article' | 'link'
          url_externa: string | null
          created_at: string
          updated_at: string
          esta_eliminada: boolean
          eliminado_por_uid: string | null
          eliminado_en: string | null
        }
        Insert: {
          id?: string
          titulo: string
          contenido?: string | null
          imagen_url?: string | null
          tipo?: 'article' | 'link'
          url_externa?: string | null
          created_at?: string
          updated_at?: string
          esta_eliminada?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
        Update: {
          id?: string
          titulo?: string
          contenido?: string | null
          imagen_url?: string | null
          tipo?: 'article' | 'link'
          url_externa?: string | null
          created_at?: string
          updated_at?: string
          esta_eliminada?: boolean
          eliminado_por_uid?: string | null
          eliminado_en?: string | null
        }
      }
      persona_tema: {
        Row: {
          persona_id: string
          tema_id: string
        }
        Insert: {
          persona_id: string
          tema_id: string
        }
        Update: {
          persona_id?: string
          tema_id?: string
        }
      }
      proyecto_tema: {
        Row: {
          proyecto_id: string
          tema_id: string
        }
        Insert: {
          proyecto_id: string
          tema_id: string
        }
        Update: {
          proyecto_id?: string
          tema_id?: string
        }
      }
      entrevista_tema: {
        Row: {
          entrevista_id: string
          tema_id: string
        }
        Insert: {
          entrevista_id: string
          tema_id: string
        }
        Update: {
          entrevista_id?: string
          tema_id?: string
        }
      }
      noticia_tema: {
        Row: {
          noticia_id: string
          tema_id: string
        }
        Insert: {
          noticia_id: string
          tema_id: string
        }
        Update: {
          noticia_id?: string
          tema_id?: string
        }
      }
      proyecto_persona_rol: {
        Row: {
          proyecto_id: string
          persona_id: string
          rol: 'director' | 'investigador' | 'colaborador' | 'estudiante'
        }
        Insert: {
          proyecto_id: string
          persona_id: string
          rol: 'director' | 'investigador' | 'colaborador' | 'estudiante'
        }
        Update: {
          proyecto_id?: string
          persona_id?: string
          rol?: 'director' | 'investigador' | 'colaborador' | 'estudiante'
        }
      }
      proyecto_organizacion_rol: {
        Row: {
          proyecto_id: string
          organizacion_id: string
          rol: 'patrocinador' | 'colaborador' | 'investigador' | 'institucion'
        }
        Insert: {
          proyecto_id: string
          organizacion_id: string
          rol: 'patrocinador' | 'colaborador' | 'investigador' | 'institucion'
        }
        Update: {
          proyecto_id?: string
          organizacion_id?: string
          rol?: 'patrocinador' | 'colaborador' | 'investigador' | 'institucion'
        }
      }
      noticia_organizacion_rol: {
        Row: {
          noticia_id: string
          organizacion_id: string
          rol: 'editor' | 'publicador' | 'colaborador'
        }
        Insert: {
          noticia_id: string
          organizacion_id: string
          rol: 'editor' | 'publicador' | 'colaborador'
        }
        Update: {
          noticia_id?: string
          organizacion_id?: string
          rol?: 'editor' | 'publicador' | 'colaborador'
        }
      }
      entrevista_persona_rol: {
        Row: {
          entrevista_id: string
          persona_id: string
          rol: 'entrevistador' | 'entrevistado' | 'moderador'
        }
        Insert: {
          entrevista_id: string
          persona_id: string
          rol: 'entrevistador' | 'entrevistado' | 'moderador'
        }
        Update: {
          entrevista_id?: string
          persona_id?: string
          rol?: 'entrevistador' | 'entrevistado' | 'moderador'
        }
      }
      entrevista_organizacion_rol: {
        Row: {
          entrevista_id: string
          organizacion_id: string
          rol: 'patrocinador' | 'organizador' | 'colaborador'
        }
        Insert: {
          entrevista_id: string
          organizacion_id: string
          rol: 'patrocinador' | 'organizador' | 'colaborador'
        }
        Update: {
          entrevista_id?: string
          organizacion_id?: string
          rol?: 'patrocinador' | 'organizador' | 'colaborador'
        }
      }
      noticia_persona_rol: {
        Row: {
          noticia_id: string
          persona_id: string
          rol: 'autor' | 'editor' | 'colaborador'
        }
        Insert: {
          noticia_id: string
          persona_id: string
          rol: 'autor' | 'editor' | 'colaborador'
        }
        Update: {
          noticia_id?: string
          persona_id?: string
          rol?: 'autor' | 'editor' | 'colaborador'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'user'
      project_status: 'draft' | 'published' | 'archived'
      interview_status: 'scheduled' | 'completed' | 'cancelled'
      news_type: 'article' | 'link'
    }
  }
} 