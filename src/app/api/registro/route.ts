// src/app/api/registro/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/supabase/types/database.types'

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route: Iniciando registro público')
    
    const { email, password, userData } = await request.json()
    
    // Validar datos requeridos
    if (!email || !password || !userData.nombre) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' }, 
        { status: 400 }
      )
    }

    // 1. Crear usuario con auth admin
    console.log('🔍 Creando usuario de auth:', email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirmar email
    })

    if (authError || !authData.user) {
      console.error('❌ Error creando usuario:', authError)
      return NextResponse.json(
        { error: authError?.message || 'Error creando usuario' }, 
        { status: 400 }
      )
    }

    console.log('✅ Usuario de auth creado:', authData.user.id)

    // 2. Crear perfil con service role (bypassa RLS)
    console.log('🔍 Creando perfil de persona')
    const { data: persona, error: personaError } = await supabaseAdmin
      .from("personas")
      .insert({
        id: authData.user.id,
        email: email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        categoria_principal: userData.categoria_principal as Database["public"]["Enums"]["categoria_principal_persona_enum"] || "comunidad_general",
        es_ex_alumno_cet: userData.es_ex_alumno_cet || false,
        estado_verificacion: userData.estado_verificacion as Database["public"]["Enums"]["estado_verificacion_enum"] || "verificada",
        tipo_solicitud: userData.tipo_solicitud,
        disponible_para_proyectos: userData.disponible_para_proyectos || false,
        activo: true,
        buscando_oportunidades: false,
        visibilidad_perfil: "privado" as Database["public"]["Enums"]["visibilidad_perfil_enum"],
        created_by_uid: authData.user.id,
      })
      .select()
      .single()

    if (personaError) {
      console.error('❌ Error creando perfil:', personaError)
      
      // Si falla el perfil, limpiar el usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: personaError.message }, 
        { status: 400 }
      )
    }

    console.log('✅ Perfil creado exitosamente:', persona.id)

    return NextResponse.json({ 
      success: true, 
      user: persona,
      message: 'Usuario registrado exitosamente'
    })

  } catch (error) {
    console.error('❌ Error inesperado en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}