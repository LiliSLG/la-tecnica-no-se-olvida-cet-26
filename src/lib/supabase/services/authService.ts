import { supabase } from '@/lib/supabase/supabaseClient';
import { ServiceResult, ServiceError } from './baseService';
import { Persona } from '@/types/persona';
import { PersonasService } from './personasService';

export class AuthService {
  private personasService: PersonasService;

  constructor() {
    this.personasService = new PersonasService();
  }

  async signIn(email: string, password: string): Promise<ServiceResult<{ user: Persona; session: any }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return {
          success: false,
          data: null,
          error: new ServiceError(authError.message),
        };
      }

      if (!authData.user) {
        return {
          success: false,
          data: null,
          error: new ServiceError('No user data returned'),
        };
      }

      // Get user profile
      const result = await this.personasService.getById(authData.user.id);
      if (result.error) {
        return {
          success: false,
          data: null,
          error: result.error,
        };
      }

      return {
        success: true,
        data: {
          user: result.data,
          session: authData.session,
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: new ServiceError(error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  async signUp(email: string, password: string, userData: Partial<Persona>): Promise<ServiceResult<{ user: Persona; session: any }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return {
          success: false,
          data: null,
          error: new ServiceError(authError.message),
        };
      }

      if (!authData.user) {
        return {
          success: false,
          data: null,
          error: new ServiceError('No user data returned'),
        };
      }

      // Create user profile
      const persona: Partial<Persona> = {
        ...userData,
        id: authData.user.id,
        email,
        estado: 'activo',
        activo: true,
        esAdmin: false,
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
      };

      const result = await this.personasService.create(persona);
      if (result.error) {
        return {
          success: false,
          data: null,
          error: result.error,
        };
      }

      return {
        success: true,
        data: {
          user: result.data,
          session: authData.session,
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: new ServiceError(error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  async signOut(): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return {
          success: false,
          data: null,
          error: new ServiceError(error.message),
        };
      }

      return {
        success: true,
        data: undefined,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: new ServiceError(error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  async resetPassword(email: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return {
          success: false,
          data: null,
          error: new ServiceError(error.message),
        };
      }

      return {
        success: true,
        data: undefined,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: new ServiceError(error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  async updatePassword(password: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return {
          success: false,
          data: null,
          error: new ServiceError(error.message),
        };
      }

      return {
        success: true,
        data: undefined,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: new ServiceError(error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  async getCurrentUser(): Promise<ServiceResult<Persona | null>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        return {
          success: false,
          data: null,
          error: new ServiceError(authError.message),
        };
      }

      if (!user) {
        return {
          success: true,
          data: null,
          error: null,
        };
      }

      const result = await this.personasService.getById(user.id);
      if (result.error) {
        return {
          success: false,
          data: null,
          error: result.error,
        };
      }

      return {
        success: true,
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: new ServiceError(error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }
} 