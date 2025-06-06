import { supabase } from '@/lib/supabase/supabaseClient';
import { ServiceResult, createSuccessResult, createErrorResult } from '@/lib/supabase/types/service';
import { PersonasService } from './personasService';
import { Database } from '../types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

// TODO: If PersonasService mapping changes, update this helper accordingly
function mapPersonaToDomain(persona: Database['public']['Tables']['personas']['Row']) {
  return {
    id: persona.id,
    nombre: persona.nombre,
    email: persona.email,
    fotoURL: persona.foto_url,
    biografia: persona.biografia,
    categoriaPrincipal: persona.categoria_principal,
    capacidadesPlataforma: persona.capacidades_plataforma,
    esAdmin: persona.es_admin,
    activo: !persona.esta_eliminada,
    eliminadoPorUid: persona.eliminado_por_uid,
    eliminadoEn: persona.eliminado_en,
    creadoEn: persona.created_at,
    actualizadoEn: persona.updated_at
  };
}

type MappedPersona = ReturnType<typeof mapPersonaToDomain>;

type Persona = Database['public']['Tables']['personas']['Row'];

export class AuthService {
  private personasService: PersonasService;

  constructor(supabase: SupabaseClient<Database>) {
    this.personasService = new PersonasService(supabase);
  }

  async signIn(email: string, password: string): Promise<ServiceResult<{ user: MappedPersona; session: any }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return createErrorResult({
          name: 'ServiceError',
          message: authError.message,
          code: 'AUTH_ERROR',
          details: authError
        });
      }

      if (!authData.user) {
        return createErrorResult({
          name: 'ServiceError',
          message: 'No user data returned',
          code: 'AUTH_ERROR',
          details: null
        });
      }

      // Get user profile
      const result = await this.personasService.getById(authData.user.id);
      if (result.error) {
        return createErrorResult({
          name: 'ServiceError',
          message: result.error.message,
          code: 'DB_ERROR',
          details: result.error
        });
      }

      if (!result.data) {
        return createErrorResult({
          name: 'ServiceError',
          message: 'User profile not found',
          code: 'DB_ERROR',
          details: null
        });
      }

      return createSuccessResult({
        user: mapPersonaToDomain(result.data),
        session: authData.session,
      });
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }

  async signUp(email: string, password: string, userData: Partial<MappedPersona>): Promise<ServiceResult<{ user: MappedPersona; session: any }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return createErrorResult({
          name: 'ServiceError',
          message: authError.message,
          code: 'AUTH_ERROR',
          details: authError
        });
      }

      if (!authData.user) {
        return createErrorResult({
          name: 'ServiceError',
          message: 'No user data returned',
          code: 'AUTH_ERROR',
          details: null
        });
      }

      // Create user profile
      const persona: Omit<Persona, 'id'> = {
        nombre: userData?.nombre ?? "",
        apellido: "",
        email: userData?.email ?? "",
        foto_url:  null,
        biografia: null,
        categoria_principal: "ninguno_asignado",
        capacidades_plataforma: [],
        es_admin: false,
        esta_eliminada: false,
        eliminado_por_uid: null,
        eliminado_en: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      
        // Campos adicionales requeridos:
        activo: true,
        titulo_profesional: "",
        descripcion_personal_o_profesional: "",
        areas_de_interes_o_expertise: [],
        estado_situacion_laboral: "no_especificado",
        empresa_o_institucion_actual: "",
        cargo_actual: "",
        buscando_oportunidades: false,
        disponible_para_proyectos: false,
        ofrece_colaboracion_como: [],
        telefono_contacto: "",
        links_profesionales: [],
        ubicacion_residencial: { ciudad: "", provincia: "rio_negro" },
        es_ex_alumno_cet: false,
        ano_cursada_actual_cet: null,
        ano_egreso_cet: null,
        titulacion_obtenida_cet: "",
        proyecto_final_cet_id: null,
        historia_de_exito_o_resumen_trayectoria: "",
        visibilidad_perfil: "privado"
      };

      const result = await this.personasService.create(persona);
      if (result.error) {
        return createErrorResult({
          name: 'ServiceError',
          message: result.error.message,
          code: 'DB_ERROR',
          details: result.error
        });
      }

      if (!result.data) {
        return createErrorResult({
          name: 'ServiceError',
          message: 'Failed to create user profile',
          code: 'DB_ERROR',
          details: null
        });
      }

      return createSuccessResult({
        user: mapPersonaToDomain(result.data),
        session: authData.session,
      });
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }

  async signOut(): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return createErrorResult({
          name: 'ServiceError',
          message: error.message,
          code: 'AUTH_ERROR',
          details: error
        });
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }

  async resetPassword(email: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return createErrorResult({
          name: 'ServiceError',
          message: error.message,
          code: 'AUTH_ERROR',
          details: error
        });
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }

  async updatePassword(password: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return createErrorResult({
          name: 'ServiceError',
          message: error.message,
          code: 'AUTH_ERROR',
          details: error
        });
      }

      return createSuccessResult(undefined);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }

  async getCurrentUser(): Promise<ServiceResult<MappedPersona | null>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        return createErrorResult({
          name: 'ServiceError',
          message: authError.message,
          code: 'AUTH_ERROR',
          details: authError
        });
      }

      if (!user) {
        return createSuccessResult(null);
      }

      const result = await this.personasService.getById(user.id);
      if (result.error) {
        return createErrorResult({
          name: 'ServiceError',
          message: result.error.message,
          code: 'DB_ERROR',
          details: result.error
        });
      }

      return createSuccessResult(result.data ? mapPersonaToDomain(result.data) : null);
    } catch (error) {
      return createErrorResult({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }
} 