// /src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./types/database.types";

// ESTE ES EL ÚNICO CLIENTE QUE EXISTE. ES UNIVERSAL.
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
