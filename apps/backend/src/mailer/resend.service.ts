import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no configurada, usando clave de prueba');
      // Usar la clave que proporcionaste como fallback
      this.resend = new Resend('re_Vo8z4maQ_8ruYVtSYkU5Ye1ue2CPDPbcT');
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Verifica tu email - AIQUAA',
        html: this.getVerificationEmailTemplate(name, verificationUrl),
      });

      if (error) {
        this.logger.error(`Error enviando email de verificación a ${email}:`, error);
        throw new Error(`Error de Resend: ${error.message}`);
      }

      this.logger.log(`Email de verificación enviado a ${email}: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error enviando email de verificación a ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Restablece tu contraseña - AIQUAA',
        html: this.getPasswordResetEmailTemplate(name, resetUrl),
      });

      if (error) {
        this.logger.error(`Error enviando email de reset de contraseña a ${email}:`, error);
        throw new Error(`Error de Resend: ${error.message}`);
      }

      this.logger.log(`Email de reset de contraseña enviado a ${email}: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error enviando email de reset de contraseña a ${email}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: '¡Bienvenido a AIQUAA! 🎉',
        html: this.getWelcomeEmailTemplate(name),
      });

      if (error) {
        this.logger.error(`Error enviando email de bienvenida a ${email}:`, error);
        throw new Error(`Error de Resend: ${error.message}`);
      }

      this.logger.log(`Email de bienvenida enviado a ${email}: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error enviando email de bienvenida a ${email}`, error);
      // No relanzamos para no bloquear el flujo de verificación
    }
  }

  async sendTwoFactorCode(email: string, code: string, name: string): Promise<void> {
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Código de verificación - AIQUAA',
        html: this.getTwoFactorEmailTemplate(name, code),
      });

      if (error) {
        this.logger.error(`Error enviando código 2FA a ${email}:`, error);
        throw new Error(`Error de Resend: ${error.message}`);
      }

      this.logger.log(`Código 2FA enviado a ${email}: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error enviando código 2FA a ${email}`, error);
      throw error;
    }
  }

  async sendSecurityAlert(email: string, name: string, alertType: string, details: string): Promise<void> {
    const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: `Alerta de seguridad - AIQUAA`,
        html: this.getSecurityAlertTemplate(name, alertType, details),
      });

      if (error) {
        this.logger.error(`Error enviando alerta de seguridad a ${email}:`, error);
        throw new Error(`Error de Resend: ${error.message}`);
      }

      this.logger.log(`Alerta de seguridad enviada a ${email}: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Error enviando alerta de seguridad a ${email}`, error);
      // No relanzamos para no bloquear el flujo principal
    }
  }

  private getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu email - AIQUAA</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; text-align: center; }
          .button:hover { background: linear-gradient(135deg, #4338CA, #6D28D9); }
          .footer { text-align: center; margin-top: 40px; color: #6B7280; font-size: 14px; }
          .code { background: #F3F4F6; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; letter-spacing: 2px; }
          .highlight { background: #FEF3C7; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎯 AIQUAA</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Verifica tu cuenta</p>
          </div>
          <div class="content">
            <h2 style="color: #1F2937; margin-top: 0;">¡Hola ${name}!</h2>
            <p>Gracias por registrarte en <span class="highlight">AIQUAA</span>. Para completar tu registro y acceder a todas las funcionalidades, necesitamos verificar tu dirección de email.</p>
            <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Email</a>
            </div>
            <p style="font-size: 14px; color: #6B7280;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #F9FAFB; padding: 12px; border-radius: 6px; font-size: 14px;"><a href="${verificationUrl}" style="color: #4F46E5;">${verificationUrl}</a></p>
            <p style="font-size: 14px; color: #6B7280;">Este enlace expirará en <strong>24 horas</strong>.</p>
            <p style="font-size: 14px; color: #6B7280;">Si no creaste esta cuenta, puedes ignorar este email de forma segura.</p>
          </div>
          <div class="footer">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
            <p>Este email fue enviado desde una dirección que no acepta respuestas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restablece tu contraseña - AIQUAA</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #DC2626, #EF4444); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #DC2626, #EF4444); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: 600; text-align: center; }
          .button:hover { background: linear-gradient(135deg, #B91C1C, #DC2626); }
          .footer { text-align: center; margin-top: 40px; color: #6B7280; font-size: 14px; }
          .highlight { background: #FEF3C7; padding: 2px 6px; border-radius: 4px; }
          .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎯 AIQUAA</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Restablece tu contraseña</p>
          </div>
          <div class="content">
            <h2 style="color: #1F2937; margin-top: 0;">¡Hola ${name}!</h2>
            <p>Has solicitado restablecer tu contraseña en <span class="highlight">AIQUAA</span>.</p>
            <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            <p style="font-size: 14px; color: #6B7280;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #F9FAFB; padding: 12px; border-radius: 6px; font-size: 14px;"><a href="${resetUrl}" style="color: #DC2626;">${resetUrl}</a></p>
            <div class="warning">
              <p style="margin: 0; font-size: 14px; color: #991B1B;"><strong>⚠️ Importante:</strong> Este enlace expirará en <strong>24 horas</strong> por seguridad.</p>
            </div>
            <p style="font-size: 14px; color: #6B7280;">Si no solicitaste este cambio, puedes ignorar este email de forma segura. Tu contraseña actual permanecerá sin cambios.</p>
          </div>
          <div class="footer">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
            <p>Este email fue enviado desde una dirección que no acepta respuestas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a AIQUAA</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16A34A, #22C55E); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .footer { text-align: center; margin-top: 40px; color: #6B7280; font-size: 14px; }
          .feature { background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #16A34A; }
          .highlight { background: #FEF3C7; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎯 AIQUAA</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">¡Bienvenido!</p>
          </div>
          <div class="content">
            <h2 style="color: #1F2937; margin-top: 0;">¡Hola ${name}!</h2>
            <p>¡Excelente! Has verificado tu email y ahora eres parte de la comunidad <span class="highlight">AIQUAA</span>. Estamos emocionados de tenerte con nosotros.</p>
            
            <div class="feature">
              <h3 style="margin-top: 0; color: #16A34A;">🚀 ¿Qué puedes hacer ahora?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Explorar el <strong>foro</strong> y participar en discusiones</li>
                <li>Descubrir herramientas en <strong>Labs</strong></li>
                <li>Conectar con otros usuarios</li>
                <li>Personalizar tu perfil</li>
              </ul>
            </div>

            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Nuestro equipo está aquí para ayudarte.</p>
            <p>¡Disfruta explorando AIQUAA!</p>
          </div>
          <div class="footer">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
            <p>Este email fue enviado desde una dirección que no acepta respuestas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getTwoFactorEmailTemplate(name: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de verificación - AIQUAA</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7C3AED, #A855F7); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .footer { text-align: center; margin-top: 40px; color: #6B7280; font-size: 14px; }
          .code { background: #F3F4F6; padding: 24px; border-radius: 12px; font-family: 'Courier New', monospace; font-size: 32px; text-align: center; margin: 24px 0; letter-spacing: 8px; font-weight: bold; color: #7C3AED; border: 2px dashed #7C3AED; }
          .highlight { background: #FEF3C7; padding: 2px 6px; border-radius: 4px; }
          .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎯 AIQUAA</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Código de verificación</p>
          </div>
          <div class="content">
            <h2 style="color: #1F2937; margin-top: 0;">¡Hola ${name}!</h2>
            <p>Se ha solicitado un código de verificación para tu cuenta en <span class="highlight">AIQUAA</span>.</p>
            <p>Usa el siguiente código para completar la verificación:</p>
            <div class="code">${code}</div>
            <div class="warning">
              <p style="margin: 0; font-size: 14px; color: #991B1B;"><strong>⚠️ Importante:</strong> Este código expirará en <strong>10 minutos</strong> por seguridad.</p>
            </div>
            <p style="font-size: 14px; color: #6B7280;">Si no solicitaste este código, ignora este email de forma segura. Tu cuenta permanece protegida.</p>
          </div>
          <div class="footer">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
            <p>Este email fue enviado desde una dirección que no acepta respuestas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getSecurityAlertTemplate(name: string, alertType: string, details: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Alerta de seguridad - AIQUAA</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #DC2626, #EF4444); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .footer { text-align: center; margin-top: 40px; color: #6B7280; font-size: 14px; }
          .alert { background: #FEF2F2; border: 2px solid #DC2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .highlight { background: #FEF3C7; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎯 AIQUAA</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Alerta de seguridad</p>
          </div>
          <div class="content">
            <h2 style="color: #1F2937; margin-top: 0;">¡Hola ${name}!</h2>
            <p>Hemos detectado una actividad inusual en tu cuenta de <span class="highlight">AIQUAA</span>.</p>
            
            <div class="alert">
              <h3 style="margin-top: 0; color: #DC2626;">🚨 ${alertType}</h3>
              <p style="margin: 0;">${details}</p>
            </div>

            <p>Si reconoces esta actividad, no necesitas hacer nada. Si no reconoces esta actividad, te recomendamos:</p>
            <ul>
              <li>Cambiar tu contraseña inmediatamente</li>
              <li>Revisar los dispositivos conectados a tu cuenta</li>
              <li>Contactar a nuestro equipo de soporte</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
            <p>Este email fue enviado desde una dirección que no acepta respuestas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

