import { supabase } from '@/lib/supabase/supabaseClient';
import { ServiceResult, createSuccessResult, createErrorResult } from '@/lib/supabase/types/service';
import { PersonasService } from './personasService';
import { Database } from '../types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type Persona = Database['public']['Tables']['personas']['Row'];
type MappedPersona = {
  id: string;
  nombre: string;
  email: string | null;
  fotoURL: string | null;
  biografia: string | null;
  categoriaPrincipal: string | null;
  capacidadesPlataforma: string[] | null;
  esAdmin: boolean;
  activo: boolean;
  eliminadoPorUid: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
};

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
        user: result.data,
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
        nombre: userData.nombre || '',
        email,
        foto_url: null,
        biografia: null,
        categoria_principal: null,
        capacidades_plataforma: null,
        es_admin: false,
        esta_eliminada: false,
        eliminado_por_uid: null,
        eliminado_en: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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

      // Map the result to MappedPersona
      const mappedPersona: MappedPersona = {
        id: result.data.id,
        nombre: result.data.nombre,
        email: result.data.email,
        fotoURL: result.data.foto_url,
        biografia: result.data.biografia,
        categoriaPrincipal: result.data.categoria_principal,
        capacidadesPlataforma: result.data.capacidades_plataforma,
        esAdmin: result.data.es_admin,
        activo: !result.data.esta_eliminada,
        eliminadoPorUid: result.data.eliminado_por_uid,
        eliminadoEn: result.data.eliminado_en,
        creadoEn: result.data.created_at,
        actualizadoEn: result.data.updated_at
      };

      return createSuccessResult({
        user: mappedPersona,
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

      return createSuccessResult(result.data);
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