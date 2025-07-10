// src/lib/services/emailService.ts
import {
  ServiceResult,
  createSuccessResult as createSuccess,
  createErrorResult as createError,
} from "../types/serviceResult";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  variables?: Record<string, string>;
}

class EmailService {
  private baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // ===== TEMPLATES REUTILIZABLES =====

  getOrganizacionInvitationTemplate(
    organizacionNombre: string,
    token: string,
    adminNombre?: string
  ): EmailTemplate {
    const reclamarUrl = `${this.baseUrl}/reclamar/${token}`;

    return {
      subject: `Invitación para verificar ${organizacionNombre} en La Técnica no se Olvida`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">La Técnica no se Olvida</h1>
            <p style="color: #f0f0f0; margin: 5px 0 0 0;">CET N°26 - Ingeniero Jacobacci</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Hola!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              ${
                adminNombre ? `${adminNombre}` : "El equipo"
              } te invita a verificar y gestionar 
              el perfil de <strong>${organizacionNombre}</strong> en nuestra plataforma.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">¿Qué puedes hacer?</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li>Completar y actualizar la información de tu organización</li>
                <li>Agregar proyectos y colaboraciones</li>
                <li>Conectar con otras organizaciones y personas</li>
                <li>Gestionar la visibilidad pública de tu perfil</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reclamarUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verificar Organización
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Si no solicitaste esta invitación, puedes ignorar este email.
              <br>
              Este enlace expira en 30 días.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>CET N°26 "La Técnica no se Olvida"</p>
            <p>Ingeniero Jacobacci, Río Negro, Argentina</p>
          </div>
        </div>
      `,
      text: `
        La Técnica no se Olvida - CET N°26
        
        ¡Hola!
        
        ${
          adminNombre ? `${adminNombre}` : "El equipo"
        } te invita a verificar y gestionar 
        el perfil de ${organizacionNombre} en nuestra plataforma.
        
        Para verificar tu organización, visita:
        ${reclamarUrl}
        
        ¿Qué puedes hacer?
        - Completar y actualizar la información de tu organización
        - Agregar proyectos y colaboraciones  
        - Conectar con otras organizaciones y personas
        - Gestionar la visibilidad pública de tu perfil
        
        Si no solicitaste esta invitación, puedes ignorar este email.
        Este enlace expira en 30 días.
        
        CET N°26 "La Técnica no se Olvida"
        Ingeniero Jacobacci, Río Negro, Argentina
      `,
    };
  }

  // 🎯 TEMPLATE PARA PERSONAS (futuro)
  getPersonaInvitationTemplate(
    personaNombre: string,
    token: string,
    adminNombre?: string
  ): EmailTemplate {
    const reclamarUrl = `${this.baseUrl}/reclamar/${token}`;

    return {
      subject: `Invitación para completar tu perfil en La Técnica no se Olvida`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">La Técnica no se Olvida</h1>
            <p style="color: #f0f0f0; margin: 5px 0 0 0;">CET N°26 - Ingeniero Jacobacci</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Hola ${personaNombre}!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              ${
                adminNombre ? `${adminNombre}` : "El equipo"
              } te invita a completar tu perfil en nuestra plataforma de la comunidad CET.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">¿Qué puedes hacer?</h3>
              <ul style="color: #666; padding-left: 20px;">
                <li>Completar tu información personal y profesional</li>
                <li>Conectar con otros miembros de la comunidad</li>
                <li>Participar en proyectos y colaboraciones</li>
                <li>Gestionar la visibilidad de tu perfil</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reclamarUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Completar mi Perfil
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Si no solicitaste esta invitación, puedes ignorar este email.
              <br>
              Este enlace expira en 30 días.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>CET N°26 "La Técnica no se Olvida"</p>
            <p>Ingeniero Jacobacci, Río Negro, Argentina</p>
          </div>
        </div>
      `,
      text: `
        La Técnica no se Olvida - CET N°26
        
        ¡Hola ${personaNombre}!
        
        ${
          adminNombre ? `${adminNombre}` : "El equipo"
        } te invita a completar tu perfil 
        en nuestra plataforma de la comunidad CET.
        
        Para completar tu perfil, visita:
        ${reclamarUrl}
        
        ¿Qué puedes hacer?
        - Completar tu información personal y profesional
        - Conectar con otros miembros de la comunidad
        - Participar en proyectos y colaboraciones
        - Gestionar la visibilidad de tu perfil
        
        Si no solicitaste esta invitación, puedes ignorar este email.
        Este enlace expira en 30 días.
        
        CET N°26 "La Técnica no se Olvida"
        Ingeniero Jacobacci, Río Negro, Argentina
      `,
    };
  }

  // ===== ENVÍO DE EMAILS =====
async sendEmail({
  to,
  template,
  variables = {},
}: SendEmailParams): Promise<ServiceResult<boolean>> {
  try {
    console.log("📧 Enviando email a:", to);

    // Reemplazar variables en el template
    let { subject, html, text } = template;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, "g"), value);
      html = html.replace(new RegExp(placeholder, "g"), value);
      text = text.replace(new RegExp(placeholder, "g"), value);
    });

    // 🚀 ENVÍO REAL CON EDGE FUNCTION
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL no configurado");
    }

    const functionUrl = `${supabaseUrl}/functions/v1/send-email`;
    
    console.log("🔗 Llamando a Edge Function:", functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("❌ Error en Edge Function:", result);
      throw new Error(result.error || "Error enviando email");
    }

    console.log("✅ Email enviado exitosamente:", result.id);
    return createSuccess(true);

  } catch (error) {
    console.error("❌ Error enviando email:", error);
    
    // 🔧 FALLBACK: En desarrollo, mostrar el contenido
    if (process.env.NODE_ENV === "development") {
      console.log("🔧 [FALLBACK] Mostrando email en consola:");
      console.log("Para:", to);
      console.log("Asunto:", template.subject);
      console.log("HTML preview:", template.html.substring(0, 200) + "...");
      
      // Seguir guardando en localStorage para debug
      if (typeof window !== "undefined") {
        const emails = JSON.parse(localStorage.getItem("dev_emails") || "[]");
        emails.push({
          to,
          subject: template.subject,
          html: template.html,
          sentAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : "Unknown error"
        });
        localStorage.setItem("dev_emails", JSON.stringify(emails.slice(-10)));
      }
    }

    return createError({
      name: "EmailError",
      message: error instanceof Error ? error.message : "Error enviando email",
      code: "EMAIL_SEND_ERROR",
      details: error,
    });
  }
}

  // ===== MÉTODOS DE CONVENIENCIA =====

  async sendOrganizacionInvitation(
    email: string,
    organizacionNombre: string,
    token: string,
    adminNombre?: string
  ): Promise<ServiceResult<boolean>> {
    const template = this.getOrganizacionInvitationTemplate(
      organizacionNombre,
      token,
      adminNombre
    );
    // ✅ Log para fácil copy-paste en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("🎯 EMAIL COMPLETO GENERADO:");
      console.log("Para:", email);
      console.log("Asunto:", template.subject);
      console.log("🔗 LINK DIRECTO (click para abrir):");
      console.log(
        `%c${this.baseUrl}/reclamar/${token}`,
        "background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
      );
    }
    return this.sendEmail({ to: email, template });
  }

  async sendPersonaInvitation(
    email: string,
    personaNombre: string,
    token: string,
    adminNombre?: string
  ): Promise<ServiceResult<boolean>> {
    const template = this.getPersonaInvitationTemplate(
      personaNombre,
      token,
      adminNombre
    );

    // ✅ Log para fácil copy-paste en desarrollo
    if (process.env.NODE_ENV === "development") {
      console.log("🎯 EMAIL PERSONA COMPLETO GENERADO:");
      console.log("Para:", email);
      console.log("Asunto:", template.subject);
      console.log("🔗 LINK DIRECTO (click para abrir):");
      console.log(
        `%c${this.baseUrl}/reclamar/${token}`,
        "background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
      );
    }
    return this.sendEmail({ to: email, template });
  }
}

export const emailService = new EmailService();
