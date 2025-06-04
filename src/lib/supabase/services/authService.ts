import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types/database.types';
import { BaseService } from '@/lib/supabase/services/baseService';
import { ServiceResult } from '@/lib/supabase/types/service';
import { ValidationError } from '@/lib/supabase/errors/types';
import { mapValidationError } from '@/lib/supabase/errors/utils';
import { CacheableServiceConfig } from '@/lib/supabase/services/cacheableService';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';

type User = Database['public']['Tables']['users']['Row'];
type CreateUser = Database['public']['Tables']['users']['Insert'];
type UpdateUser = Database['public']['Tables']['users']['Update'];

export class AuthService extends BaseService<User, 'users'> {
  constructor(
    supabase: SupabaseClient<Database>,
    tableName: 'users' = 'users',
    cacheConfig: CacheableServiceConfig = { ttl: 300, entityType: 'user' }
  ) {
    super(supabase, tableName, cacheConfig);
  }

  protected validateCreateInput(data: CreateUser): ValidationError | null {
    if (!data.email) {
      return {
        name: 'ValidationError',
        message: 'El email es requerido',
        field: 'email',
        value: data.email
      };
    }
    return null;
  }

  protected validateUpdateInput(data: UpdateUser): ValidationError | null {
    if (data.email === '') {
      return {
        name: 'ValidationError',
        message: 'El email no puede estar vacío',
        field: 'email',
        value: data.email
      };
    }
    return null;
  }

  async create(data: Omit<User, 'id'>): Promise<ServiceResult<User>> {
    try {
      // Validate input
      const validationError = this.validateCreateInput(data as CreateUser);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const now = new Date().toISOString();
      const { data: newUser, error } = await this.supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_at: now,
          updated_at: now,
          esta_eliminada: false,
          eliminado_por_uid: null,
          eliminado_en: null
        })
        .select()
        .single();

      if (error) throw error;
      if (!newUser) throw new Error('Failed to create user');

      // Cache the new user
      await this.setInCache(newUser.id, newUser);

      return this.createSuccessResult(newUser);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'create' }));
    }
  }

  async update(id: string, data: Partial<User>): Promise<ServiceResult<User>> {
    try {
      // Validate input
      const validationError = this.validateUpdateInput(data as UpdateUser);
      if (validationError) {
        return this.createErrorResult(validationError);
      }

      const now = new Date().toISOString();
      const { data: updatedUser, error } = await this.supabase
        .from(this.tableName)
        .update({
          ...data,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!updatedUser) throw new Error('Failed to update user');

      // Update cache
      await this.setInCache(id, updatedUser);

      return this.createSuccessResult(updatedUser);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'update' }));
    }
  }

  async getById(id: string): Promise<ServiceResult<User>> {
    try {
      // Try to get from cache first
      const cached = await this.getFromCache(id);
      if (cached) return this.createSuccessResult(cached);

      const { data: user, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!user) return this.createSuccessResult(null);

      // Cache the result
      await this.setInCache(id, user);

      return this.createSuccessResult(user);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getById' }));
    }
  }

  async getByEmail(email: string): Promise<ServiceResult<User>> {
    try {
      const { data: user, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      if (!user) return this.createSuccessResult(null);

      // Cache the result
      await this.setInCache(user.id, user);

      return this.createSuccessResult(user);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'getByEmail' }));
    }
  }

  async logicalDelete(id: string, adminUid: string): Promise<ServiceResult<User>> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: true,
          eliminado_por_uid: adminUid,
          eliminado_en: now,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Update cache
      await this.setInCache(id, data);

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'logicalDelete' }));
    }
  }

  async restore(id: string, adminUid: string): Promise<ServiceResult<User>> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          esta_eliminada: false,
          eliminado_por_uid: null,
          eliminado_en: null,
          updated_at: now
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return this.createSuccessResult(null);

      // Update cache
      await this.setInCache(id, data);

      return this.createSuccessResult(data);
    } catch (error) {
      return this.createErrorResult(this.handleError(error, { operation: 'restore' }));
    }
  }
}

// Singleton instance
export const authService = new AuthService(supabase);

// Export individual functions for backward compatibility
export const getUserById = (id: string) => authService.getById(id);
export const getUserByEmail = (email: string) => authService.getByEmail(email); 