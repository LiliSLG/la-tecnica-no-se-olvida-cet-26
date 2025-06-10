import { Database } from '../types/database.types';
import { ServiceResult } from '../types/serviceResult';
import { createSuccessResult as createSuccess, createErrorResult as createError } from '../types/serviceResult';
import { personasService } from './personasService';
import { supabase } from '../supabaseClient';

type Persona = Database['public']['Tables']['personas']['Row'];

class AuthService {
  async signIn(email: string, password: string): Promise<ServiceResult<{ user: Persona; session: any }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return createError({
          name: 'ServiceError',
          message: authError.message,
          code: 'AUTH_ERROR',
          details: authError
        });
      }

      if (!authData.user) {
        return createError({
          name: 'ServiceError',
          message: 'No user data returned',
          code: 'AUTH_ERROR',
          details: null
        });
      }

      // Get user profile
      const result = await personasService.getById(authData.user.id);
      if (result.error) {
        return createError({
          name: 'ServiceError',
          message: result.error.message,
          code: 'DB_ERROR',
          details: result.error
        });
      }

      if (!result.data) {
        return createError({
          name: 'ServiceError',
          message: 'User profile not found',
          code: 'DB_ERROR',
          details: null
        });
      }

      return createSuccess({
        user: result.data,
        session: authData.session,
      });
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }

  async signUp(email: string, password: string, userData: { nombre?: string }): Promise<ServiceResult<{ user: Persona; session: any }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return createError({
          name: 'ServiceError',
          message: authError.message,
          code: 'AUTH_ERROR',
          details: authError
        });
      }

      if (!authData.user) {
        return createError({
          name: 'ServiceError',
          message: 'No user data returned',
          code: 'AUTH_ERROR',
          details: null
        });
      }

      // Create user profile with minimal required data
      const result = await personasService.create({
        id: authData.user.id,
        nombre: userData?.nombre || 'Nuevo Usuario',
        email: authData.user.email!,
      });

      if (result.error) {
        return createError({
          name: 'ServiceError',
          message: result.error.message,
          code: 'DB_ERROR',
          details: result.error
        });
      }

      if (!result.data) {
        return createError({
          name: 'ServiceError',
          message: 'Failed to create user profile',
          code: 'DB_ERROR',
          details: null
        });
      }

      return createSuccess({
        user: result.data,
        session: authData.session,
      });
    } catch (error) {
      return createError({
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
        return createError({
          name: 'ServiceError',
          message: error.message,
          code: 'AUTH_ERROR',
          details: error
        });
      }

      return createSuccess(undefined);
    } catch (error) {
      return createError({
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
        return createError({
          name: 'ServiceError',
          message: error.message,
          code: 'AUTH_ERROR',
          details: error
        });
      }

      return createSuccess(undefined);
    } catch (error) {
      return createError({
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
        return createError({
          name: 'ServiceError',
          message: error.message,
          code: 'AUTH_ERROR',
          details: error
        });
      }

      return createSuccess(undefined);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }

  async getCurrentUser(): Promise<ServiceResult<Persona | null>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        return createError({
          name: 'ServiceError',
          message: authError.message,
          code: 'AUTH_ERROR',
          details: authError
        });
      }

      if (!user) {
        return createSuccess(null);
      }

      const result = await personasService.getById(user.id);
      if (result.error) {
        return createError({
          name: 'ServiceError',
          message: result.error.message,
          code: 'DB_ERROR',
          details: result.error
        });
      }

      return createSuccess(result.data);
    } catch (error) {
      return createError({
        name: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'AUTH_ERROR',
        details: error
      });
    }
  }
}

export const authService = new AuthService(); 