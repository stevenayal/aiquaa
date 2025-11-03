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

async sendIstqbExamReport(examData: any, resultId: number): Promise<void> {
  const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@aiquaa.com');
  const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

  const examDate = new Date(examData.endTime).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    const { data, error } = await this.resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `[ISTQB] Examen completado - ${examData.participantName} - ${examDate}`,
      html: this.getIstqbExamReportTemplate(examData, resultId, examDate),
    });

    if (error) {
      this.logger.error(`Error enviando informe ISTQB a ${adminEmail}:`, error);
      throw new Error(`Error de Resend: ${error.message}`);
    }

    this.logger.log(`Informe ISTQB enviado a ${adminEmail}: ${data?.id}`);
  } catch (error) {
    this.logger.error(`Error enviando informe ISTQB a ${adminEmail}`, error);
    throw error;
  }
}

async sendTestResultsReport(testResults: {
  success: boolean;
  timestamp: Date;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  failures?: Array<{
    test: string;
    error: string;
  }>;
  type: 'unit' | 'e2e' | 'contract' | 'all';
}): Promise<void> {
  const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@aiquaa.com');
  const fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

  const testDate = testResults.timestamp.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const typeLabels = {
    unit: 'Pruebas Unitarias',
    e2e: 'Pruebas E2E',
    contract: 'Pruebas de Contrato',
    all: 'Todas las Pruebas',
  };

  try {
    const { data, error } = await this.resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `[Tests] ${typeLabels[testResults.type]} - ${testResults.success ? '✅ EXITOSO' : '❌ FALLIDO'} - ${testDate}`,
      html: this.getTestResultsReportTemplate(testResults, testDate, typeLabels[testResults.type]),
    });

    if (error) {
      this.logger.error(`Error enviando resultados de pruebas a ${adminEmail}:`, error);
      throw new Error(`Error de Resend: ${error.message}`);
    }

    this.logger.log(`Resultados de pruebas enviados a ${adminEmail}: ${data?.id}`);
  } catch (error) {
    this.logger.error(`Error enviando resultados de pruebas a ${adminEmail}`, error);
    throw error;
  }
}

private getIstqbExamReportTemplate(examData: any, resultId: number, examDate: string): string {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const topIncorrectAnswers = examData.answers
    .filter((a: any) => !a.isCorrect)
    .slice(0, 3)
    .map((a: any, index: number) => {
      const questionIndex = examData.answers.findIndex((ans: any) => ans.questionId === a.questionId);
      return `
        <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #DC2626;">
          <h4 style="margin: 0 0 8px 0; color: #991B1B; font-size: 14px;">
            Pregunta ${questionIndex + 1} - ${a.learningObjective} (${a.kLevel})
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #44403C;">${a.questionText.substring(0, 150)}...</p>
          <div style="display: flex; gap: 16px; font-size: 12px;">
            <div>
              <span style="color: #DC2626; font-weight: bold;">❌ Respuesta del usuario:</span>
              <span style="color: #44403C;">${a.userAnswer.join(', ') || 'Sin responder'}</span>
            </div>
            <div>
              <span style="color: #16A34A; font-weight: bold;">✓ Correcta:</span>
              <span style="color: #44403C;">${a.correctAnswer.join(', ')}</span>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  const categoryBreakdown = examData.learningObjectiveAnalysis
    .map((lo: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; color: #374151;">${lo.learningObjective}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center; color: #374151;">${lo.correctAnswers}/${lo.totalQuestions}</td>
        <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">
          <span style="background: ${lo.percentage >= 70 ? '#DEF7EC' : lo.percentage >= 50 ? '#FEF3C7' : '#FEE2E2'};
                       color: ${lo.percentage >= 70 ? '#03543F' : lo.percentage >= 50 ? '#92400E' : '#991B1B'};
                       padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 13px;">
            ${lo.percentage.toFixed(0)}%
          </span>
        </td>
      </tr>
    `)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Informe ISTQB - AIQUAA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #F9FAFB;">
      <div style="max-width: 700px; margin: 20px auto; padding: 0;">
        <div style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">🎓 AIQUAA</h1>
          <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.95;">Simulador ISTQB CTFL v4.0</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.85;">Informe de Examen Completado</p>
        </div>

        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: ${examData.passed ? 'linear-gradient(135deg, #DEF7EC, #BCF0DA)' : 'linear-gradient(135deg, #FEE2E2, #FECACA)'};
                      padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 32px; border: 2px solid ${examData.passed ? '#16A34A' : '#DC2626'};">
            <div style="font-size: 48px; margin-bottom: 8px;">${examData.passed ? '🏆' : '❌'}</div>
            <h2 style="margin: 0; font-size: 28px; color: ${examData.passed ? '#03543F' : '#991B1B'};">
              ${examData.passed ? '¡APROBADO!' : 'NO APROBADO'}
            </h2>
            <p style="margin: 8px 0 0 0; font-size: 18px; color: #374151;">
              <strong>${examData.score}/${examData.totalQuestions}</strong> preguntas correctas
              <span style="font-size: 16px; color: #6B7280;">(${examData.percentage.toFixed(2)}%)</span>
            </p>
          </div>

          <div style="background: #F3F4F6; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px; border-bottom: 2px solid #D97706; padding-bottom: 8px;">
              📋 Información del Participante
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600; width: 180px;">Nombre:</td>
                <td style="padding: 8px 0; color: #1F2937; font-weight: bold;">${examData.participantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #1F2937;">${examData.participantEmail || 'No proporcionado'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Fecha y Hora:</td>
                <td style="padding: 8px 0; color: #1F2937;">${examDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Tiempo Empleado:</td>
                <td style="padding: 8px 0; color: #1F2937; font-weight: bold;">${formatTime(examData.timeSpent)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Modo:</td>
                <td style="padding: 8px 0; color: #1F2937;">
                  <span style="background: ${examData.mode === 'EXAM' ? '#DBEAFE' : '#FEF3C7'};
                               color: ${examData.mode === 'EXAM' ? '#1E40AF' : '#92400E'};
                               padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ${examData.mode === 'EXAM' ? 'EXAMEN' : 'ENTRENAMIENTO'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">ID de Resultado:</td>
                <td style="padding: 8px 0; color: #1F2937; font-family: monospace;">#${resultId}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px; border-bottom: 2px solid #D97706; padding-bottom: 8px;">
              📊 Resumen de Resultados
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              <div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #F59E0B;">
                <div style="font-size: 36px; margin-bottom: 8px;">🏆</div>
                <div style="font-size: 32px; font-weight: bold; color: #92400E; margin-bottom: 4px;">${examData.score}</div>
                <div style="font-size: 13px; color: #78350F; font-weight: 600;">Puntaje</div>
              </div>
              <div style="background: linear-gradient(135deg, #DEF7EC, #BCF0DA); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #16A34A;">
                <div style="font-size: 36px; margin-bottom: 8px;">✓</div>
                <div style="font-size: 32px; font-weight: bold; color: #03543F; margin-bottom: 4px;">${examData.correctAnswers}</div>
                <div style="font-size: 13px; color: #03543F; font-weight: 600;">Correctas</div>
              </div>
              <div style="background: linear-gradient(135deg, #FEE2E2, #FECACA); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #DC2626;">
                <div style="font-size: 36px; margin-bottom: 8px;">✗</div>
                <div style="font-size: 32px; font-weight: bold; color: #991B1B; margin-bottom: 4px;">${examData.incorrectAnswers}</div>
                <div style="font-size: 13px; color: #991B1B; font-weight: 600;">Incorrectas</div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px; border-bottom: 2px solid #D97706; padding-bottom: 8px;">
              📚 Desglose por Learning Objectives
            </h3>
            <table style="width: 100%; border-collapse: collapse; background: #F9FAFB; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #F3F4F6;">
                  <th style="padding: 12px; text-align: left; color: #1F2937; font-weight: 600; border-bottom: 2px solid #D1D5DB;">Learning Objective</th>
                  <th style="padding: 12px; text-align: center; color: #1F2937; font-weight: 600; border-bottom: 2px solid #D1D5DB;">Resultado</th>
                  <th style="padding: 12px; text-align: center; color: #1F2937; font-weight: 600; border-bottom: 2px solid #D1D5DB;">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                ${categoryBreakdown}
              </tbody>
            </table>
          </div>

          ${topIncorrectAnswers ? `
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px; border-bottom: 2px solid #D97706; padding-bottom: 8px;">
              ⚠️ Top Preguntas Incorrectas
            </h3>
            ${topIncorrectAnswers}
          </div>
          ` : ''}

          <div style="background: #F0F9FF; padding: 20px; border-radius: 12px; margin-top: 32px; border-left: 4px solid #0284C7;">
            <p style="margin: 0; color: #0C4A6E; font-size: 14px;">
              <strong>📌 Nota:</strong> Este informe ha sido generado automáticamente por el Sistema de Simulación ISTQB de AIQUAA.
              Los resultados se han guardado en la base de datos con ID <strong>#${resultId}</strong>.
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 32px; padding: 20px; color: #6B7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} AIQUAA. Todos los derechos reservados.</p>
          <p style="margin: 0;">Este email fue enviado desde una dirección que no acepta respuestas.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

private getTestResultsReportTemplate(
  testResults: {
    success: boolean;
    timestamp: Date;
    duration: number;
    summary: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
    };
    coverage?: {
      statements: number;
      branches: number;
      functions: number;
      lines: number;
    };
    failures?: Array<{
      test: string;
      error: string;
    }>;
    type: 'unit' | 'e2e' | 'contract' | 'all';
  },
  testDate: string,
  testTypeLabel: string
): string {
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
  };

  const failuresList = testResults.failures && testResults.failures.length > 0
    ? testResults.failures.map(f => `
      <div style="background: #FEF2F2; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #DC2626;">
        <h4 style="margin: 0 0 8px 0; color: #991B1B; font-size: 14px; font-family: monospace;">
          ${f.test}
        </h4>
        <pre style="margin: 0; font-size: 12px; color: #44403C; white-space: pre-wrap; word-wrap: break-word;">${f.error}</pre>
      </div>
    `).join('')
    : '';

  const coverageSection = testResults.coverage ? `
    <div style="margin-bottom: 24px;">
      <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px; border-bottom: 2px solid #4F46E5; padding-bottom: 8px;">
        📊 Cobertura de Código
      </h3>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div style="background: ${testResults.coverage.statements >= 75 ? 'linear-gradient(135deg, #DEF7EC, #BCF0DA)' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)'};
                    padding: 20px; border-radius: 12px; text-align: center; border: 2px solid ${testResults.coverage.statements >= 75 ? '#16A34A' : '#F59E0B'};">
          <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">Statements</div>
          <div style="font-size: 28px; font-weight: bold; color: ${testResults.coverage.statements >= 75 ? '#03543F' : '#92400E'};">
            ${testResults.coverage.statements.toFixed(2)}%
          </div>
        </div>
        <div style="background: ${testResults.coverage.branches >= 75 ? 'linear-gradient(135deg, #DEF7EC, #BCF0DA)' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)'};
                    padding: 20px; border-radius: 12px; text-align: center; border: 2px solid ${testResults.coverage.branches >= 75 ? '#16A34A' : '#F59E0B'};">
          <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">Branches</div>
          <div style="font-size: 28px; font-weight: bold; color: ${testResults.coverage.branches >= 75 ? '#03543F' : '#92400E'};">
            ${testResults.coverage.branches.toFixed(2)}%
          </div>
        </div>
        <div style="background: ${testResults.coverage.functions >= 75 ? 'linear-gradient(135deg, #DEF7EC, #BCF0DA)' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)'};
                    padding: 20px; border-radius: 12px; text-align: center; border: 2px solid ${testResults.coverage.functions >= 75 ? '#16A34A' : '#F59E0B'};">
          <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">Functions</div>
          <div style="font-size: 28px; font-weight: bold; color: ${testResults.coverage.functions >= 75 ? '#03543F' : '#92400E'};">
            ${testResults.coverage.functions.toFixed(2)}%
          </div>
        </div>
        <div style="background: ${testResults.coverage.lines >= 75 ? 'linear-gradient(135deg, #DEF7EC, #BCF0DA)' : 'linear-gradient(135deg, #FEF3C7, #FDE68A)'};
                    padding: 20px; border-radius: 12px; text-align: center; border: 2px solid ${testResults.coverage.lines >= 75 ? '#16A34A' : '#F59E0B'};">
          <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;">Lines</div>
          <div style="font-size: 28px; font-weight: bold; color: ${testResults.coverage.lines >= 75 ? '#03543F' : '#92400E'};">
            ${testResults.coverage.lines.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resultados de Pruebas - AIQUAA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #F9FAFB;">
      <div style="max-width: 700px; margin: 20px auto; padding: 0;">
        <div style="background: linear-gradient(135deg, ${testResults.success ? '#16A34A, #22C55E' : '#DC2626, #EF4444'}); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 32px;">🎯 AIQUAA</h1>
          <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.95;">Resultados de Pruebas</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.85;">${testTypeLabel}</p>
        </div>

        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: ${testResults.success ? 'linear-gradient(135deg, #DEF7EC, #BCF0DA)' : 'linear-gradient(135deg, #FEE2E2, #FECACA)'};
                      padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 32px; border: 2px solid ${testResults.success ? '#16A34A' : '#DC2626'};">
            <div style="font-size: 48px; margin-bottom: 8px;">${testResults.success ? '✅' : '❌'}</div>
            <h2 style="margin: 0; font-size: 28px; color: ${testResults.success ? '#03543F' : '#991B1B'};">
              ${testResults.success ? 'PRUEBAS EXITOSAS' : 'PRUEBAS FALLIDAS'}
            </h2>
            <p style="margin: 8px 0 0 0; font-size: 16px; color: #374151;">
              Duración: <strong>${formatDuration(testResults.duration)}</strong>
            </p>
          </div>

          <div style="background: #F3F4F6; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px; border-bottom: 2px solid #4F46E5; padding-bottom: 8px;">
              📋 Información General
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600; width: 180px;">Fecha y Hora:</td>
                <td style="padding: 8px 0; color: #1F2937; font-weight: bold;">${testDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Tipo de Prueba:</td>
                <td style="padding: 8px 0; color: #1F2937;">${testTypeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Duración Total:</td>
                <td style="padding: 8px 0; color: #1F2937; font-weight: bold;">${formatDuration(testResults.duration)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280; font-weight: 600;">Estado:</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${testResults.success ? '#DEF7EC' : '#FEE2E2'};
                               color: ${testResults.success ? '#03543F' : '#991B1B'};
                               padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ${testResults.success ? 'EXITOSO' : 'FALLIDO'}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px; border-bottom: 2px solid #4F46E5; padding-bottom: 8px;">
              📊 Resumen de Resultados
            </h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
              <div style="background: linear-gradient(135deg, #DBEAFE, #BFDBFE); padding: 16px; border-radius: 12px; text-align: center; border: 2px solid #3B82F6;">
                <div style="font-size: 24px; margin-bottom: 4px;">📝</div>
                <div style="font-size: 24px; font-weight: bold; color: #1E40AF; margin-bottom: 2px;">${testResults.summary.total}</div>
                <div style="font-size: 12px; color: #1E3A8A; font-weight: 600;">Total</div>
              </div>
              <div style="background: linear-gradient(135deg, #DEF7EC, #BCF0DA); padding: 16px; border-radius: 12px; text-align: center; border: 2px solid #16A34A;">
                <div style="font-size: 24px; margin-bottom: 4px;">✓</div>
                <div style="font-size: 24px; font-weight: bold; color: #03543F; margin-bottom: 2px;">${testResults.summary.passed}</div>
                <div style="font-size: 12px; color: #03543F; font-weight: 600;">Pasaron</div>
              </div>
              <div style="background: linear-gradient(135deg, #FEE2E2, #FECACA); padding: 16px; border-radius: 12px; text-align: center; border: 2px solid #DC2626;">
                <div style="font-size: 24px; margin-bottom: 4px;">✗</div>
                <div style="font-size: 24px; font-weight: bold; color: #991B1B; margin-bottom: 2px;">${testResults.summary.failed}</div>
                <div style="font-size: 12px; color: #991B1B; font-weight: 600;">Fallaron</div>
              </div>
              <div style="background: linear-gradient(135deg, #FEF3C7, #FDE68A); padding: 16px; border-radius: 12px; text-align: center; border: 2px solid #F59E0B;">
                <div style="font-size: 24px; margin-bottom: 4px;">⊘</div>
                <div style="font-size: 24px; font-weight: bold; color: #92400E; margin-bottom: 2px;">${testResults.summary.skipped}</div>
                <div style="font-size: 12px; color: #78350F; font-weight: 600;">Omitidos</div>
              </div>
            </div>
          </div>

          ${coverageSection}

          ${failuresList ? `
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1F2937; font-size: 20px; border-bottom: 2px solid #DC2626; padding-bottom: 8px;">
              ⚠️ Pruebas Fallidas (${testResults.failures?.length || 0})
            </h3>
            ${failuresList}
          </div>
          ` : ''}

          <div style="background: #F0F9FF; padding: 20px; border-radius: 12px; margin-top: 32px; border-left: 4px solid #0284C7;">
            <p style="margin: 0; color: #0C4A6E; font-size: 14px;">
              <strong>📌 Nota:</strong> Este informe ha sido generado automáticamente por el Sistema de Pruebas de AIQUAA.
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 32px; padding: 20px; color: #6B7280; font-size: 14px;">
          <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} AIQUAA. Todos los derechos reservados.</p>
          <p style="margin: 0;">Este email fue enviado desde una dirección que no acepta respuestas.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
}

