import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/types/database.types';
import { ServiceResult } from '@/lib/supabase/types/service';
import { ValidationError } from '@/lib/supabase/errors/types';
import { mapValidationError } from '@/lib/supabase/errors/utils';
import { createSuccessResult, createErrorResult } from '@/lib/supabase/types/serviceResult';
import { supabase } from '@/lib/supabase/supabaseClient';

export async function signIn(email: string, password: string): Promise<ServiceResult<{ user: any; session: any }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data) throw new Error('No data returned from sign in');

    return createSuccessResult(data);
  } catch (error) {
    return createErrorResult(mapValidationError('Error signing in', 'auth', error));
  }
}

export async function signUp(email: string, password: string): Promise<ServiceResult<{ user: any; session: any }>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    if (!data) throw new Error('No data returned from sign up');

    return createSuccessResult(data);
  } catch (error) {
    return createErrorResult(mapValidationError('Error signing up', 'auth', error));
  }
}

export async function signOut(): Promise<ServiceResult<void>> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return createSuccessResult(undefined);
  } catch (error) {
    return createErrorResult(mapValidationError('Error signing out', 'auth', error));
  }
}

export async function resetPassword(email: string): Promise<ServiceResult<void>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return createSuccessResult(undefined);
  } catch (error) {
    return createErrorResult(mapValidationError('Error resetting password', 'auth', error));
  }
}

export async function updatePassword(password: string): Promise<ServiceResult<void>> {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });
    if (error) throw error;
    return createSuccessResult(undefined);
  } catch (error) {
    return createErrorResult(mapValidationError('Error updating password', 'auth', error));
  }
}

export async function getSession(): Promise<ServiceResult<any>> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return createSuccessResult(session);
  } catch (error) {
    return createErrorResult(mapValidationError('Error getting session', 'auth', error));
  }
}

export async function getUser(): Promise<ServiceResult<any>> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return createSuccessResult(user);
  } catch (error) {
    return createErrorResult(mapValidationError('Error getting user', 'auth', error));
  }
} 