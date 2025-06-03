import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

// Auth types
export interface AuthUser {
  id: string;
  email: string | undefined;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
}

export interface AuthSession {
  user: AuthUser | null;
  access_token: string;
  refresh_token: string;
}

// Auth configuration
export const AUTH_CONFIG = {
  providers: {
    email: true,
    google: true,
  },
  redirectTo: `${window.location.origin}/auth/callback`,
  cookieOptions: {
    name: 'sb-auth-token',
    lifetime: 60 * 60 * 24 * 7, // 7 days
    domain: window.location.hostname,
    path: '/',
    sameSite: 'lax',
  },
} as const;

// Auth state management
let currentSession: AuthSession | null = null;

export const getCurrentSession = async (): Promise<AuthSession | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    if (session) {
      currentSession = {
        user: session.user as AuthUser,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      };
    }

    return currentSession;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const session = await getCurrentSession();
  return session?.user || null;
};

// Auth event handling
export const handleAuthStateChange = (callback: (session: AuthSession | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      currentSession = {
        user: session.user as AuthUser,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      };
    } else {
      currentSession = null;
    }
    callback(currentSession);
  });
};

// Error handling
export const handleAuthError = (error: any) => {
  console.error('Auth error:', error);
  
  const message = error.message || 'An authentication error occurred';
  toast({
    title: 'Authentication Error',
    description: message,
    variant: 'destructive',
  });
}; 