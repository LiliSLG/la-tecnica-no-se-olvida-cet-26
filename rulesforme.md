npm run dev

npx tsc --noEmit

npx supabase gen types typescript --project-id ijhrpnguoczbtwuptysq --schema public > src/lib/supabase/types/database.types.ts

npx shadcn@latest add radio-group


ps tree /F