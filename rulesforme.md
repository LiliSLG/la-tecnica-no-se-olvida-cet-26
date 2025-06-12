npm run dev

npx tsc --noEmit

npx supabase gen types typescript --project-id ijhrpnguoczbtwuptysq --schema public > src/lib/supabase/typ
es/database.types.ts

ps tree /F
