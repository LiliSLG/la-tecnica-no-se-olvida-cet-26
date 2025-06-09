export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
        Relationships: [
          {
            foreignKeyName: "entrevista_tema_entrevista_id_fkey"
            columns: ["entrevista_id"]
            isOneToOne: false
            referencedRelation: "entrevistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrevista_tema_tema_id_fkey"
            columns: ["tema_id"]
            isOneToOne: false
            referencedRelation: "temas"
            referencedColumns: ["id"]
          },
        ]
      }
      entrevistas: {
        Row: {
          created_at: string | null
          descripcion: string | null
          eliminado_en: string | null
          eliminado_por_uid: string | null
          esta_eliminada: boolean | null
          fecha_entrevista: string | null
          id: string
          status: Database["public"]["Enums"]["interview_status"] | null
          titulo: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminada?: boolean | null
          fecha_entrevista?: string | null
          id?: string
          status?: Database["public"]["Enums"]["interview_status"] | null
          titulo: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminada?: boolean | null
          fecha_entrevista?: string | null
          id?: string
          status?: Database["public"]["Enums"]["interview_status"] | null
          titulo?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      historias_orales: {
        Row: {
          archivo_principal_url: string | null
          created_at: string | null
          descripcion: string | null
          eliminado_en: string | null
          eliminado_por_uid: string | null
          esta_eliminada: boolean | null
          estado: Database["public"]["Enums"]["estado_entrevista"] | null
          id: string
          plataforma_video: string | null
          tipo_contenido: Database["public"]["Enums"]["tipo_contenido_entrevista"]
          titulo: string
          updated_at: string | null
        }
        Insert: {
          archivo_principal_url?: string | null
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminada?: boolean | null
          estado?: Database["public"]["Enums"]["estado_entrevista"] | null
          id?: string
          plataforma_video?: string | null
          tipo_contenido: Database["public"]["Enums"]["tipo_contenido_entrevista"]
          titulo: string
          updated_at?: string | null
        }
        Update: {
          archivo_principal_url?: string | null
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminada?: boolean | null
          estado?: Database["public"]["Enums"]["estado_entrevista"] | null
          id?: string
          plataforma_video?: string | null
          tipo_contenido?: Database["public"]["Enums"]["tipo_contenido_entrevista"]
          titulo?: string
          updated_at?: string | null
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
          contenido: string | null
          created_at: string | null
          eliminado_en: string | null
          eliminado_por_uid: string | null
          esta_eliminada: boolean | null
          id: string
          imagen_url: string | null
          tipo: Database["public"]["Enums"]["tipo_noticia"]
          titulo: string
          updated_at: string | null
          url_externa: string | null
        }
        Insert: {
          contenido?: string | null
          created_at?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminada?: boolean | null
          id?: string
          imagen_url?: string | null
          tipo?: Database["public"]["Enums"]["tipo_noticia"]
          titulo: string
          updated_at?: string | null
          url_externa?: string | null
        }
        Update: {
          contenido?: string | null
          created_at?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminada?: boolean | null
          id?: string
          imagen_url?: string | null
          tipo?: Database["public"]["Enums"]["tipo_noticia"]
          titulo?: string
          updated_at?: string | null
          url_externa?: string | null
        }
        Relationships: []
      }
      ofertas_laborales: {
        Row: {
          created_at: string | null
          descripcion: string | null
          eliminado_en: string | null
          eliminado_por_uid: string | null
          empresa: string | null
          esta_eliminada: boolean | null
          estado: string
          id: string
          titulo: string
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          empresa?: string | null
          esta_eliminada?: boolean | null
          estado: string
          id?: string
          titulo: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          empresa?: string | null
          esta_eliminada?: boolean | null
          estado?: string
          id?: string
          titulo?: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      organizaciones: {
        Row: {
          created_at: string | null
          descripcion: string | null
          eliminado_en: string | null
          eliminado_por_uid: string | null
          esta_eliminada: boolean | null
          id: string
          logo_url: string | null
          nombre: string
          sitio_web: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminada?: boolean | null
          id?: string
          logo_url?: string | null
          nombre: string
          sitio_web?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminada?: boolean | null
          id?: string
          logo_url?: string | null
          nombre?: string
          sitio_web?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          areas_de_interes_o_expertise: string[] | null
          biografia: string | null
          buscando_oportunidades: boolean
          capacidades_plataforma: string[] | null
          cargo_actual: string | null
          categoria_principal: string | null
          created_at: string | null
          descripcion_personal_o_profesional: string | null
          disponible_para_proyectos: boolean
          eliminado_en: string | null
          eliminado_por_uid: string | null
          email: string | null
          empresa_o_institucion_actual: string | null
          es_admin: boolean | null
          es_ex_alumno_cet: boolean
          esta_eliminada: boolean | null
          estado_situacion_laboral: string | null
          foto_url: string | null
          historia_de_exito_o_resumen_trayectoria: string | null
          id: string
          links_profesionales: Json | null
          nombre: string
          ofrece_colaboracion_como: string[] | null
          proyecto_final_cet_id: string | null
          telefono_contacto: string | null
          titulacion_obtenida_cet: string | null
          titulo_profesional: string | null
          ubicacion_residencial: Json | null
          updated_at: string | null
          visibilidad_perfil: Database["public"]["Enums"]["visibilidad_perfil_enum"]
        }
        Insert: {
          activo?: boolean
          ano_cursada_actual_cet?: number | null
          ano_egreso_cet?: number | null
          apellido?: string | null
          areas_de_interes_o_expertise?: string[] | null
          biografia?: string | null
          buscando_oportunidades?: boolean
          capacidades_plataforma?: string[] | null
          cargo_actual?: string | null
          categoria_principal?: string | null
          created_at?: string | null
          descripcion_personal_o_profesional?: string | null
          disponible_para_proyectos?: boolean
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          email?: string | null
          empresa_o_institucion_actual?: string | null
          es_admin?: boolean | null
          es_ex_alumno_cet?: boolean
          esta_eliminada?: boolean | null
          estado_situacion_laboral?: string | null
          foto_url?: string | null
          historia_de_exito_o_resumen_trayectoria?: string | null
          id?: string
          links_profesionales?: Json | null
          nombre: string
          ofrece_colaboracion_como?: string[] | null
          proyecto_final_cet_id?: string | null
          telefono_contacto?: string | null
          titulacion_obtenida_cet?: string | null
          titulo_profesional?: string | null
          ubicacion_residencial?: Json | null
          updated_at?: string | null
          visibilidad_perfil?: Database["public"]["Enums"]["visibilidad_perfil_enum"]
        }
        Update: {
          activo?: boolean
          ano_cursada_actual_cet?: number | null
          ano_egreso_cet?: number | null
          apellido?: string | null
          areas_de_interes_o_expertise?: string[] | null
          biografia?: string | null
          buscando_oportunidades?: boolean
          capacidades_plataforma?: string[] | null
          cargo_actual?: string | null
          categoria_principal?: string | null
          created_at?: string | null
          descripcion_personal_o_profesional?: string | null
          disponible_para_proyectos?: boolean
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          email?: string | null
          empresa_o_institucion_actual?: string | null
          es_admin?: boolean | null
          es_ex_alumno_cet?: boolean
          esta_eliminada?: boolean | null
          estado_situacion_laboral?: string | null
          foto_url?: string | null
          historia_de_exito_o_resumen_trayectoria?: string | null
          id?: string
          links_profesionales?: Json | null
          nombre?: string
          ofrece_colaboracion_como?: string[] | null
          proyecto_final_cet_id?: string | null
          telefono_contacto?: string | null
          titulacion_obtenida_cet?: string | null
          titulo_profesional?: string | null
          ubicacion_residencial?: Json | null
          updated_at?: string | null
          visibilidad_perfil?: Database["public"]["Enums"]["visibilidad_perfil_enum"]
        }
        Relationships: [
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
          organizacion_id: string
          proyecto_id: string
          rol: string
        }
        Insert: {
          organizacion_id: string
          proyecto_id: string
          rol: string
        }
        Update: {
          organizacion_id?: string
          proyecto_id?: string
          rol?: string
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
          persona_id: string
          proyecto_id: string
          rol: string
        }
        Insert: {
          persona_id: string
          proyecto_id: string
          rol: string
        }
        Update: {
          persona_id?: string
          proyecto_id?: string
          rol?: string
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
          archivo_principal_url: string | null
          created_at: string | null
          descripcion: string | null
          eliminado_en: string | null
          eliminado_por_uid: string | null
          esta_eliminado: boolean | null
          id: string
          status: Database["public"]["Enums"]["estado_proyecto"] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          archivo_principal_url?: string | null
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminado?: boolean | null
          id?: string
          status?: Database["public"]["Enums"]["estado_proyecto"] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          archivo_principal_url?: string | null
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          esta_eliminado?: boolean | null
          id?: string
          status?: Database["public"]["Enums"]["estado_proyecto"] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      temas: {
        Row: {
          actualizadoen: string | null
          categoriatema:
            | Database["public"]["Enums"]["tema_categoria_enum"]
            | null
          creadoen: string | null
          created_at: string | null
          descripcion: string | null
          eliminado_en: string | null
          eliminado_por_uid: string | null
          eliminadoen: string | null
          eliminadoporuid: string | null
          esta_eliminado: boolean | null
          estaeliminada: boolean | null
          id: string
          ingresadoporuid: string | null
          modificadoporuid: string | null
          nombre: string
          updated_at: string | null
        }
        Insert: {
          actualizadoen?: string | null
          categoriatema?:
            | Database["public"]["Enums"]["tema_categoria_enum"]
            | null
          creadoen?: string | null
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          eliminadoen?: string | null
          eliminadoporuid?: string | null
          esta_eliminado?: boolean | null
          estaeliminada?: boolean | null
          id?: string
          ingresadoporuid?: string | null
          modificadoporuid?: string | null
          nombre: string
          updated_at?: string | null
        }
        Update: {
          actualizadoen?: string | null
          categoriatema?:
            | Database["public"]["Enums"]["tema_categoria_enum"]
            | null
          creadoen?: string | null
          created_at?: string | null
          descripcion?: string | null
          eliminado_en?: string | null
          eliminado_por_uid?: string | null
          eliminadoen?: string | null
          eliminadoporuid?: string | null
          esta_eliminado?: boolean | null
          estaeliminada?: boolean | null
          id?: string
          ingresadoporuid?: string | null
          modificadoporuid?: string | null
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      categoria_principal_persona_enum:
        | "docente_cet"
        | "estudiante_cet"
        | "ex_alumno_cet"
        | "productor_rural"
        | "profesional_externo"
        | "investigador"
        | "comunidad_general"
        | "otro"
        | "ninguno_asignado"
        | "tutor_invitado"
        | "colaborador_invitado"
        | "autor_invitado"
      estado_entrevista: "scheduled" | "completed" | "cancelled"
      estado_proyecto: "draft" | "published" | "archived"
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
      interview_status: "scheduled" | "completed" | "cancelled"
      news_type: "article" | "link"
      plataforma_video_enum:
        | "firebase_storage"
        | "youtube_propio"
        | "youtube"
        | "facebook"
        | "vimeo"
        | "otro"
      project_status: "draft" | "published" | "archived"
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
      tipo_contenido_entrevista: "video" | "audio" | "texto"
      tipo_contenido_entrevista_enum: "video_propio" | "enlace_video_externo"
      tipo_contenido_noticia_enum: "articulo_propio" | "enlace_externo"
      tipo_noticia: "article" | "link"
      tipo_organizacion_enum:
        | "empresa"
        | "institucion_educativa"
        | "ONG"
        | "estancia_productiva"
        | "organismo_gubernamental"
        | "otro"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
        "productor_rural",
        "profesional_externo",
        "investigador",
        "comunidad_general",
        "otro",
        "ninguno_asignado",
        "tutor_invitado",
        "colaborador_invitado",
        "autor_invitado",
      ],
      estado_entrevista: ["scheduled", "completed", "cancelled"],
      estado_proyecto: ["draft", "published", "archived"],
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
      interview_status: ["scheduled", "completed", "cancelled"],
      news_type: ["article", "link"],
      plataforma_video_enum: [
        "firebase_storage",
        "youtube_propio",
        "youtube",
        "facebook",
        "vimeo",
        "otro",
      ],
      project_status: ["draft", "published", "archived"],
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
      tipo_contenido_entrevista: ["video", "audio", "texto"],
      tipo_contenido_entrevista_enum: ["video_propio", "enlace_video_externo"],
      tipo_contenido_noticia_enum: ["articulo_propio", "enlace_externo"],
      tipo_noticia: ["article", "link"],
      tipo_organizacion_enum: [
        "empresa",
        "institucion_educativa",
        "ONG",
        "estancia_productiva",
        "organismo_gubernamental",
        "otro",
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
