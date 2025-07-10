export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analisis_satelitales: {
        Row: {
          created_at: string | null
          created_by_uid: string | null
          datos_tabla: Json | null
          deleted_at: string | null
          deleted_by_uid: string | null
          id: string
          imagen_grafico_url: string | null
          is_deleted: boolean | null
          parametros_gee: Json | null
          proyecto_id: string
          resumen: string | null
          tipo_analisis: string
          titulo: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_uid?: string | null
          datos_tabla?: Json | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          id?: string
          imagen_grafico_url?: string | null
          is_deleted?: boolean | null
          parametros_gee?: Json | null
          proyecto_id: string
          resumen?: string | null
          tipo_analisis: string
          titulo: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_uid?: string | null
          datos_tabla?: Json | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          id?: string
          imagen_grafico_url?: string | null
          is_deleted?: boolean | null
          parametros_gee?: Json | null
          proyecto_id?: string
          resumen?: string | null
          tipo_analisis?: string
          titulo?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analisis_satelitales_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion: string
          duracion: number
          estado: string
          id: string
          is_deleted: boolean | null
          nivel: Database["public"]["Enums"]["nivel_curso_enum"]
          titulo: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion: string
          duracion: number
          estado: string
          id?: string
          is_deleted?: boolean | null
          nivel: Database["public"]["Enums"]["nivel_curso_enum"]
          titulo: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string
          duracion?: number
          estado?: string
          id?: string
          is_deleted?: boolean | null
          nivel?: Database["public"]["Enums"]["nivel_curso_enum"]
          titulo?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: []
      }
      historia_oral_tema: {
        Row: {
          historia_oral_id: string
          tema_id: string
        }
        Insert: {
          historia_oral_id: string
          tema_id: string
        }
        Update: {
          historia_oral_id?: string
          tema_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entrevista_tema_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historia_oral_tema_historia_oral_id_fkey"
            columns: ["historia_oral_id"]
            isOneToOne: false
            referencedRelation: "historias_orales"
            referencedColumns: ["id"]
          },
        ]
      }
      historias_orales: {
        Row: {
          ambito_saber: string | null
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion_saber: string | null
          duracion_media_minutos: number | null
          esta_publicada: boolean | null
          fecha_grabacion_o_recopilacion: string | null
          fuente_video_externo: string | null
          fuentes_informacion: string[] | null
          id: string
          imagen_miniatura_url: string | null
          is_deleted: boolean | null
          palabras_clave_saber: string[] | null
          plataforma_video_externo:
            | Database["public"]["Enums"]["plataforma_video_enum"]
            | null
          plataforma_video_propio:
            | Database["public"]["Enums"]["plataforma_video_enum"]
            | null
          recopilado_por_uids: string[] | null
          tipo_contenido:
            | Database["public"]["Enums"]["tipo_contenido_entrevista_enum"]
            | null
          titulo_saber: string
          transcripcion_file_url: string | null
          transcripcion_texto_completo: string | null
          updated_at: string | null
          updated_by_uid: string | null
          url_video_externo: string | null
          video_propio_url: string | null
        }
        Insert: {
          ambito_saber?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion_saber?: string | null
          duracion_media_minutos?: number | null
          esta_publicada?: boolean | null
          fecha_grabacion_o_recopilacion?: string | null
          fuente_video_externo?: string | null
          fuentes_informacion?: string[] | null
          id?: string
          imagen_miniatura_url?: string | null
          is_deleted?: boolean | null
          palabras_clave_saber?: string[] | null
          plataforma_video_externo?:
            | Database["public"]["Enums"]["plataforma_video_enum"]
            | null
          plataforma_video_propio?:
            | Database["public"]["Enums"]["plataforma_video_enum"]
            | null
          recopilado_por_uids?: string[] | null
          tipo_contenido?:
            | Database["public"]["Enums"]["tipo_contenido_entrevista_enum"]
            | null
          titulo_saber: string
          transcripcion_file_url?: string | null
          transcripcion_texto_completo?: string | null
          updated_at?: string | null
          updated_by_uid?: string | null
          url_video_externo?: string | null
          video_propio_url?: string | null
        }
        Update: {
          ambito_saber?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion_saber?: string | null
          duracion_media_minutos?: number | null
          esta_publicada?: boolean | null
          fecha_grabacion_o_recopilacion?: string | null
          fuente_video_externo?: string | null
          fuentes_informacion?: string[] | null
          id?: string
          imagen_miniatura_url?: string | null
          is_deleted?: boolean | null
          palabras_clave_saber?: string[] | null
          plataforma_video_externo?:
            | Database["public"]["Enums"]["plataforma_video_enum"]
            | null
          plataforma_video_propio?:
            | Database["public"]["Enums"]["plataforma_video_enum"]
            | null
          recopilado_por_uids?: string[] | null
          tipo_contenido?:
            | Database["public"]["Enums"]["tipo_contenido_entrevista_enum"]
            | null
          titulo_saber?: string
          transcripcion_file_url?: string | null
          transcripcion_texto_completo?: string | null
          updated_at?: string | null
          updated_by_uid?: string | null
          url_video_externo?: string | null
          video_propio_url?: string | null
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "noticia_tema_noticia_id_fkey"
            columns: ["noticia_id"]
            isOneToOne: false
            referencedRelation: "noticias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticia_tema_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
        ]
      }
      noticias: {
        Row: {
          autor_noticia: string | null
          contenido: string | null
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          es_destacada: boolean
          esta_publicada: boolean | null
          fecha_publicacion: string | null
          fuente_externa: string | null
          id: string
          imagen_url: string | null
          is_deleted: boolean
          resumen_o_contexto_interno: string | null
          subtitulo: string | null
          tipo: Database["public"]["Enums"]["tipo_noticia"]
          titulo: string
          updated_at: string | null
          updated_by_uid: string | null
          url_externa: string | null
        }
        Insert: {
          autor_noticia?: string | null
          contenido?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          es_destacada?: boolean
          esta_publicada?: boolean | null
          fecha_publicacion?: string | null
          fuente_externa?: string | null
          id?: string
          imagen_url?: string | null
          is_deleted?: boolean
          resumen_o_contexto_interno?: string | null
          subtitulo?: string | null
          tipo?: Database["public"]["Enums"]["tipo_noticia"]
          titulo: string
          updated_at?: string | null
          updated_by_uid?: string | null
          url_externa?: string | null
        }
        Update: {
          autor_noticia?: string | null
          contenido?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          es_destacada?: boolean
          esta_publicada?: boolean | null
          fecha_publicacion?: string | null
          fuente_externa?: string | null
          id?: string
          imagen_url?: string | null
          is_deleted?: boolean
          resumen_o_contexto_interno?: string | null
          subtitulo?: string | null
          tipo?: Database["public"]["Enums"]["tipo_noticia"]
          titulo?: string
          updated_at?: string | null
          updated_by_uid?: string | null
          url_externa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noticias_created_by_uid_fkey"
            columns: ["created_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticias_deleted_by_uid_fkey"
            columns: ["deleted_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticias_updated_by_uid_fkey"
            columns: ["updated_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas_laborales: {
        Row: {
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion: string | null
          empresa: string | null
          estado: string
          id: string
          is_deleted: boolean | null
          titulo: string
          ubicacion: string | null
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string | null
          empresa?: string | null
          estado: string
          id?: string
          is_deleted?: boolean | null
          titulo: string
          ubicacion?: string | null
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string | null
          empresa?: string | null
          estado?: string
          id?: string
          is_deleted?: boolean | null
          titulo?: string
          ubicacion?: string | null
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: []
      }
      organizaciones: {
        Row: {
          abierta_a_colaboraciones: boolean
          aprobada_por_admin_uid: string | null
          areas_de_interes: string[]
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion: string
          email_contacto: string | null
          estado_verificacion: Database["public"]["Enums"]["estado_verificacion_enum"]
          fecha_aprobacion_admin: string | null
          fecha_reclamacion: string | null
          fecha_ultima_invitacion: string | null
          id: string
          is_deleted: boolean
          logo_url: string | null
          nombre_fantasia: string | null
          nombre_oficial: string
          reclamada_por_uid: string | null
          sitio_web: string | null
          telefono_contacto: string | null
          tipo: Database["public"]["Enums"]["tipo_organizacion_enum"]
          token_reclamacion: string | null
          ubicacion: Json | null
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          abierta_a_colaboraciones?: boolean
          aprobada_por_admin_uid?: string | null
          areas_de_interes: string[]
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion: string
          email_contacto?: string | null
          estado_verificacion?: Database["public"]["Enums"]["estado_verificacion_enum"]
          fecha_aprobacion_admin?: string | null
          fecha_reclamacion?: string | null
          fecha_ultima_invitacion?: string | null
          id?: string
          is_deleted?: boolean
          logo_url?: string | null
          nombre_fantasia?: string | null
          nombre_oficial: string
          reclamada_por_uid?: string | null
          sitio_web?: string | null
          telefono_contacto?: string | null
          tipo: Database["public"]["Enums"]["tipo_organizacion_enum"]
          token_reclamacion?: string | null
          ubicacion?: Json | null
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          abierta_a_colaboraciones?: boolean
          aprobada_por_admin_uid?: string | null
          areas_de_interes?: string[]
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string
          email_contacto?: string | null
          estado_verificacion?: Database["public"]["Enums"]["estado_verificacion_enum"]
          fecha_aprobacion_admin?: string | null
          fecha_reclamacion?: string | null
          fecha_ultima_invitacion?: string | null
          id?: string
          is_deleted?: boolean
          logo_url?: string | null
          nombre_fantasia?: string | null
          nombre_oficial?: string
          reclamada_por_uid?: string | null
          sitio_web?: string | null
          telefono_contacto?: string | null
          tipo?: Database["public"]["Enums"]["tipo_organizacion_enum"]
          token_reclamacion?: string | null
          ubicacion?: Json | null
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_org_aprobada_por"
            columns: ["aprobada_por_admin_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_org_reclamada_por"
            columns: ["reclamada_por_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_organizacion: {
        Row: {
          cargo: string | null
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          es_contacto_principal: boolean | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          is_deleted: boolean | null
          organizacion_id: string
          persona_id: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          es_contacto_principal?: boolean | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          is_deleted?: boolean | null
          organizacion_id: string
          persona_id: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          es_contacto_principal?: boolean | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          is_deleted?: boolean | null
          organizacion_id?: string
          persona_id?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_organizacion_created_by_uid_fkey"
            columns: ["created_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_organizacion_deleted_by_uid_fkey"
            columns: ["deleted_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_organizacion_organizacion_id_fkey"
            columns: ["organizacion_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_organizacion_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_organizacion_updated_by_uid_fkey"
            columns: ["updated_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_roles: {
        Row: {
          asignado_en: string | null
          asignado_por_uid: string | null
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          is_deleted: boolean | null
          persona_id: string
          rol_id: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          asignado_en?: string | null
          asignado_por_uid?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          is_deleted?: boolean | null
          persona_id: string
          rol_id: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          asignado_en?: string | null
          asignado_por_uid?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          is_deleted?: boolean | null
          persona_id?: string
          rol_id?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_roles_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_roles_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "persona_tema_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persona_tema_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          activo: boolean
          ano_cursada_actual_cet: number | null
          ano_egreso_cet: number | null
          apellido: string | null
          aprobada_por_admin_uid: string | null
          areas_de_interes_o_expertise: string[] | null
          biografia: string | null
          buscando_oportunidades: boolean
          cargo_actual: string | null
          categoria_principal:
            | Database["public"]["Enums"]["categoria_principal_persona_enum"]
            | null
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion_personal_o_profesional: string | null
          disponible_para_proyectos: boolean
          email: string | null
          empresa_o_institucion_actual: string | null
          es_ex_alumno_cet: boolean
          estado_situacion_laboral: string | null
          estado_verificacion: string | null
          fecha_aprobacion_admin: string | null
          fecha_ultima_invitacion: string | null
          foto_url: string | null
          historia_de_exito_o_resumen_trayectoria: string | null
          id: string
          is_deleted: boolean | null
          links_profesionales: Json | null
          nombre: string
          ofrece_colaboracion_como: string[] | null
          proyecto_final_cet_id: string | null
          telefono_contacto: string | null
          tipo_solicitud: string | null
          titulacion_obtenida_cet: string | null
          titulo_profesional: string | null
          token_reclamacion: string | null
          ubicacion_residencial: Json | null
          updated_at: string | null
          updated_by_uid: string | null
          visibilidad_perfil: Database["public"]["Enums"]["visibilidad_perfil_enum"]
        }
        Insert: {
          activo?: boolean
          ano_cursada_actual_cet?: number | null
          ano_egreso_cet?: number | null
          apellido?: string | null
          aprobada_por_admin_uid?: string | null
          areas_de_interes_o_expertise?: string[] | null
          biografia?: string | null
          buscando_oportunidades?: boolean
          cargo_actual?: string | null
          categoria_principal?:
            | Database["public"]["Enums"]["categoria_principal_persona_enum"]
            | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion_personal_o_profesional?: string | null
          disponible_para_proyectos?: boolean
          email?: string | null
          empresa_o_institucion_actual?: string | null
          es_ex_alumno_cet?: boolean
          estado_situacion_laboral?: string | null
          estado_verificacion?: string | null
          fecha_aprobacion_admin?: string | null
          fecha_ultima_invitacion?: string | null
          foto_url?: string | null
          historia_de_exito_o_resumen_trayectoria?: string | null
          id?: string
          is_deleted?: boolean | null
          links_profesionales?: Json | null
          nombre: string
          ofrece_colaboracion_como?: string[] | null
          proyecto_final_cet_id?: string | null
          telefono_contacto?: string | null
          tipo_solicitud?: string | null
          titulacion_obtenida_cet?: string | null
          titulo_profesional?: string | null
          token_reclamacion?: string | null
          ubicacion_residencial?: Json | null
          updated_at?: string | null
          updated_by_uid?: string | null
          visibilidad_perfil?: Database["public"]["Enums"]["visibilidad_perfil_enum"]
        }
        Update: {
          activo?: boolean
          ano_cursada_actual_cet?: number | null
          ano_egreso_cet?: number | null
          apellido?: string | null
          aprobada_por_admin_uid?: string | null
          areas_de_interes_o_expertise?: string[] | null
          biografia?: string | null
          buscando_oportunidades?: boolean
          cargo_actual?: string | null
          categoria_principal?:
            | Database["public"]["Enums"]["categoria_principal_persona_enum"]
            | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion_personal_o_profesional?: string | null
          disponible_para_proyectos?: boolean
          email?: string | null
          empresa_o_institucion_actual?: string | null
          es_ex_alumno_cet?: boolean
          estado_situacion_laboral?: string | null
          estado_verificacion?: string | null
          fecha_aprobacion_admin?: string | null
          fecha_ultima_invitacion?: string | null
          foto_url?: string | null
          historia_de_exito_o_resumen_trayectoria?: string | null
          id?: string
          is_deleted?: boolean | null
          links_profesionales?: Json | null
          nombre?: string
          ofrece_colaboracion_como?: string[] | null
          proyecto_final_cet_id?: string | null
          telefono_contacto?: string | null
          tipo_solicitud?: string | null
          titulacion_obtenida_cet?: string | null
          titulo_profesional?: string | null
          token_reclamacion?: string | null
          ubicacion_residencial?: Json | null
          updated_at?: string | null
          updated_by_uid?: string | null
          visibilidad_perfil?: Database["public"]["Enums"]["visibilidad_perfil_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "fk_personas_created_by"
            columns: ["created_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_personas_deleted_by"
            columns: ["deleted_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_personas_updated_by"
            columns: ["updated_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personas_aprobada_por_admin_uid_fkey"
            columns: ["aprobada_por_admin_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personas_proyecto_final_cet_id_fkey"
            columns: ["proyecto_final_cet_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto_organizacion_rol: {
        Row: {
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          is_deleted: boolean | null
          organizacion_id: string
          proyecto_id: string
          rol: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          is_deleted?: boolean | null
          organizacion_id: string
          proyecto_id: string
          rol: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          is_deleted?: boolean | null
          organizacion_id?: string
          proyecto_id?: string
          rol?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_organizacion_rol_organizacion_id_fkey"
            columns: ["organizacion_id"]
            isOneToOne: false
            referencedRelation: "organizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_organizacion_rol_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto_persona_rol: {
        Row: {
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          is_deleted: boolean | null
          persona_id: string
          proyecto_id: string
          rol: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          is_deleted?: boolean | null
          persona_id: string
          proyecto_id: string
          rol: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          is_deleted?: boolean | null
          persona_id?: string
          proyecto_id?: string
          rol?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_persona_rol_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_persona_rol_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto_relaciones: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion: string | null
          is_deleted: boolean | null
          proyecto_origen_id: string
          proyecto_referencia_id: string
          tipo_relacion: Database["public"]["Enums"]["tipo_relacion_proyecto_enum"]
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string | null
          is_deleted?: boolean | null
          proyecto_origen_id: string
          proyecto_referencia_id: string
          tipo_relacion: Database["public"]["Enums"]["tipo_relacion_proyecto_enum"]
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string | null
          is_deleted?: boolean | null
          proyecto_origen_id?: string
          proyecto_referencia_id?: string
          tipo_relacion?: Database["public"]["Enums"]["tipo_relacion_proyecto_enum"]
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_relaciones_proyecto_origen_id_fkey"
            columns: ["proyecto_origen_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_relaciones_proyecto_referencia_id_fkey"
            columns: ["proyecto_referencia_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "proyecto_tema_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_tema_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          ano_proyecto: number | null
          archivo_principal_url: string | null
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion_general: string | null
          estado_actual: Database["public"]["Enums"]["estado_proyecto"] | null
          fecha_finalizacion_estimada: string | null
          fecha_finalizacion_real: string | null
          fecha_inicio: string | null
          fecha_presentacion: string | null
          id: string
          is_deleted: boolean | null
          nombre_archivo_principal: string | null
          resumen_ejecutivo: string | null
          titulo: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          ano_proyecto?: number | null
          archivo_principal_url?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion_general?: string | null
          estado_actual?: Database["public"]["Enums"]["estado_proyecto"] | null
          fecha_finalizacion_estimada?: string | null
          fecha_finalizacion_real?: string | null
          fecha_inicio?: string | null
          fecha_presentacion?: string | null
          id?: string
          is_deleted?: boolean | null
          nombre_archivo_principal?: string | null
          resumen_ejecutivo?: string | null
          titulo: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          ano_proyecto?: number | null
          archivo_principal_url?: string | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion_general?: string | null
          estado_actual?: Database["public"]["Enums"]["estado_proyecto"] | null
          fecha_finalizacion_estimada?: string | null
          fecha_finalizacion_real?: string | null
          fecha_inicio?: string | null
          fecha_presentacion?: string | null
          id?: string
          is_deleted?: boolean | null
          nombre_archivo_principal?: string | null
          resumen_ejecutivo?: string | null
          titulo?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion: string | null
          id: string
          is_deleted: boolean | null
          nombre: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string | null
          id?: string
          is_deleted?: boolean | null
          nombre: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string | null
          id?: string
          is_deleted?: boolean | null
          nombre?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: []
      }
      temas: {
        Row: {
          categoria_tema:
            | Database["public"]["Enums"]["tema_categoria_enum"]
            | null
          created_at: string | null
          created_by_uid: string | null
          deleted_at: string | null
          deleted_by_uid: string | null
          descripcion: string | null
          id: string
          is_deleted: boolean | null
          nombre: string
          updated_at: string | null
          updated_by_uid: string | null
        }
        Insert: {
          categoria_tema?:
            | Database["public"]["Enums"]["tema_categoria_enum"]
            | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string | null
          id?: string
          is_deleted?: boolean | null
          nombre: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Update: {
          categoria_tema?:
            | Database["public"]["Enums"]["tema_categoria_enum"]
            | null
          created_at?: string | null
          created_by_uid?: string | null
          deleted_at?: string | null
          deleted_by_uid?: string | null
          descripcion?: string | null
          id?: string
          is_deleted?: boolean | null
          nombre?: string
          updated_at?: string | null
          updated_by_uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temas_created_by_uid_fkey"
            columns: ["created_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temas_deleted_by_uid_fkey"
            columns: ["deleted_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temas_updated_by_uid_fkey"
            columns: ["updated_by_uid"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      toggle_organizacion_colaboraciones: {
        Args: { org_id: string; nuevo_estado: boolean; user_id: string }
        Returns: undefined
      }
      update_organizacion_logo: {
        Args: { org_id: string; new_logo_url: string; user_id: string }
        Returns: undefined
      }
      update_organizacion_on_activation: {
        Args: { org_id: string; user_id: string }
        Returns: {
          id: string
          nombre_oficial: string
          estado_verificacion: Database["public"]["Enums"]["estado_verificacion_enum"]
        }[]
      }
    }
    Enums: {
      categoria_principal_persona_enum:
        | "docente_cet"
        | "estudiante_cet"
        | "ex_alumno_cet"
        | "comunidad_activa"
        | "comunidad_general"
      estado_proyecto:
        | "idea"
        | "en_desarrollo"
        | "finalizado"
        | "presentado"
        | "archivado"
        | "cancelado"
      estado_proyecto_enum:
        | "idea"
        | "en_desarrollo"
        | "finalizado"
        | "presentado"
        | "archivado"
        | "cancelado"
      estado_situacion_laboral_enum:
        | "buscando_empleo"
        | "empleado"
        | "emprendedor"
        | "estudiante"
        | "no_especificado"
        | "jubilado"
        | "otro"
      estado_verificacion_enum:
        | "sin_invitacion"
        | "pendiente_aprobacion"
        | "invitacion_enviada"
        | "verificada"
        | "rechazada"
      nivel_curso_enum: "basico" | "intermedio" | "avanzado"
      plataforma_video_enum:
        | "firebase_storage"
        | "youtube_propio"
        | "youtube"
        | "facebook"
        | "vimeo"
        | "otro"
      tema_categoria_enum:
        | "agropecuario"
        | "tecnologico"
        | "social"
        | "ambiental"
        | "educativo"
        | "produccion_animal"
        | "sanidad"
        | "energia"
        | "recursos_naturales"
        | "manejo_suelo"
        | "gastronomia"
        | "otro"
      tipo_contenido_entrevista_enum: "video_propio" | "enlace_video_externo"
      tipo_noticia: "articulo_propio" | "enlace_externo"
      tipo_organizacion_enum:
        | "empresa"
        | "institucion_educativa"
        | "ONG"
        | "establecimiento_ganadero"
        | "organismo_gubernamental"
        | "otro"
        | "cooperativa"
      tipo_relacion_proyecto_enum:
        | "referencia"
        | "continuacion"
        | "mejora"
        | "inspirado_en"
        | "utiliza_componentes_de"
        | "antecedente_directo"
      user_role: "admin" | "user"
      visibilidad_perfil_enum:
        | "publico"
        | "solo_registrados_plataforma"
        | "privado"
        | "solo_admins_y_propio"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_principal_persona_enum: [
        "docente_cet",
        "estudiante_cet",
        "ex_alumno_cet",
        "comunidad_activa",
        "comunidad_general",
      ],
      estado_proyecto: [
        "idea",
        "en_desarrollo",
        "finalizado",
        "presentado",
        "archivado",
        "cancelado",
      ],
      estado_proyecto_enum: [
        "idea",
        "en_desarrollo",
        "finalizado",
        "presentado",
        "archivado",
        "cancelado",
      ],
      estado_situacion_laboral_enum: [
        "buscando_empleo",
        "empleado",
        "emprendedor",
        "estudiante",
        "no_especificado",
        "jubilado",
        "otro",
      ],
      estado_verificacion_enum: [
        "sin_invitacion",
        "pendiente_aprobacion",
        "invitacion_enviada",
        "verificada",
        "rechazada",
      ],
      nivel_curso_enum: ["basico", "intermedio", "avanzado"],
      plataforma_video_enum: [
        "firebase_storage",
        "youtube_propio",
        "youtube",
        "facebook",
        "vimeo",
        "otro",
      ],
      tema_categoria_enum: [
        "agropecuario",
        "tecnologico",
        "social",
        "ambiental",
        "educativo",
        "produccion_animal",
        "sanidad",
        "energia",
        "recursos_naturales",
        "manejo_suelo",
        "gastronomia",
        "otro",
      ],
      tipo_contenido_entrevista_enum: ["video_propio", "enlace_video_externo"],
      tipo_noticia: ["articulo_propio", "enlace_externo"],
      tipo_organizacion_enum: [
        "empresa",
        "institucion_educativa",
        "ONG",
        "establecimiento_ganadero",
        "organismo_gubernamental",
        "otro",
        "cooperativa",
      ],
      tipo_relacion_proyecto_enum: [
        "referencia",
        "continuacion",
        "mejora",
        "inspirado_en",
        "utiliza_componentes_de",
        "antecedente_directo",
      ],
      user_role: ["admin", "user"],
      visibilidad_perfil_enum: [
        "publico",
        "solo_registrados_plataforma",
        "privado",
        "solo_admins_y_propio",
      ],
    },
  },
} as const
