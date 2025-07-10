// supabase/functions/send-email/index.ts

// CORS headers inline (sin archivo separado)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  text?: string
}

interface EmailResponse {
  success: boolean
  id?: string
  error?: string
}

// @ts-ignore: Deno global
Deno.serve(async (req: Request) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Obtener API key de Resend
    // @ts-ignore: Deno global
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY no configurado')
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parsear request body
    const emailData: EmailRequest = await req.json()
    const { to, subject, html, text } = emailData

    // Validaciones básicas
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: to, subject, html' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('📧 Enviando email a:', to)

    // Llamar a Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'La Técnica no se Olvida <noreply@resend.dev>',
        to: [to],
        subject,
        html,
        text: text || '', // Fallback a texto vacío
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('❌ Error de Resend:', resendData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Resend error: ${resendData.message || 'Unknown error'}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Email enviado exitosamente:', resendData.id)

    // Respuesta exitosa
    const response: EmailResponse = {
      success: true,
      id: resendData.id
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error en send-email function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})