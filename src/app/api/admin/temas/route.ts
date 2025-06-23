// src/app/api/admin/temas/route.ts
import { NextRequest, NextResponse } from "next/server";
import { temasService } from "@/lib/supabase/services/temasService";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies(); // <- Agregar await aquí

    // Crear cliente Supabase para server con cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Verificar si el usuario es admin usando la función RPC
    let includeDeleted = false;
    try {
      const { data: isAdminResult, error: rpcError } = await supabase.rpc(
        "is_admin"
      );
      if (!rpcError) {
        includeDeleted = Boolean(isAdminResult);
      }
    } catch (error) {
      // Usuario no admin o sin sesión - mostrar solo activos
      console.log(
        "Usuario no admin o sin permisos, mostrando solo temas activos"
      );
    }

    // Obtener temas según permisos
    const result = await temasService.getAll(includeDeleted);

    if (!result.success) {
      return NextResponse.json(
        { error: "Error fetching temas", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in temas API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
