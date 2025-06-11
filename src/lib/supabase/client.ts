import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types/database.types'

// This is the one and only Supabase client for the entire application.
// It's a universal client that is safe to use in both Server and Client Components.
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) 