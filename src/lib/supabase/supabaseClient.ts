import { createBrowserClient } from '@supabase/ssr'

// This is a BROWSER client. It's safe to use in the entire app,
// including Server Components (for read-only operations) and Client Components.
// Supabase's library handles the universal nature of this client.
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) 