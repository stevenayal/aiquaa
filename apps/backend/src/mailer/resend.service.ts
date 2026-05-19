import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SES_SMTP_HOST'),
      port: this.configService.get<number>('SES_SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('SES_SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SES_SMTP_PASS'),
      },
    });
    this.logger.log('MailerService inicializado con AWS SES SMTP');
  }

  private async sendMail(options: {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
  }): Promise<string> {
    const info = await this.transporter.sendMail(options);
    return info.messageId;
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    name: string
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000'
    );
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const fromEmail = this.configService.get<string>(
      'SES_FROM_EMAIL',
      'noreply@aiquaa.com'
    );

    try {
      const messageId = await this.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Verifica tu email - AIQUAA',
        html: this.getVerificationEmailTemplate(name, verificationUrl),
      });
      this.logger.log(`Email de verificación enviado a ${email}: ${messageId}`);
    } catch (error) {
      this.logger.error(
        `Error enviando email de verificación a ${email}`,
        error
      );
      throw error;
    }
  }

  async sendNewEmpresaAlert(data: {
    companyName: string;
    ownerName: string;
    ownerEmail: string;
    ruc?: string;
    registeredAt: string;
  }): Promise<void> {
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@aiquaa.com'
    );
    const fromEmail = this.configService.get<string>(
      'SES_FROM_EMAIL',
      'noreply@aiquaa.com'
    );

    try {
      const messageId = await this.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject: `🏢 Nueva empresa registrada: ${data.companyName}`,
        html: this.getNewEmpresaAlertTemplate(data),
      });
      this.logger.log(
        `Alerta nueva empresa enviada a ${adminEmail}: ${messageId}`
      );
    } catch (error) {
      this.logger.error(
        `Error enviando alerta de nueva empresa a ${adminEmail}`,
        error
      );
      throw error;
    }
  }

  private getNewEmpresaAlertTemplate(data: {
    companyName: string;
    ownerName: string;
    ownerEmail: string;
    ruc?: string;
    registeredAt: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva empresa registrada — AIQUAA</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669, #10B981); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .field { margin-bottom: 16px; padding: 12px 16px; background: #F9FAFB; border-radius: 8px; border-left: 4px solid #10B981; }
          .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; margin-bottom: 2px; }
          .value { font-size: 15px; font-weight: 500; color: #111827; }
          .footer { text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🏢 Nueva empresa</h1>
            <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.9;">Se registró una empresa en AIQUAA</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Empresa</div>
              <div class="value">${data.companyName}</div>
            </div>
            ${
              data.ruc
                ? `
            <div class="field">
              <div class="label">RUC</div>
              <div class="value">${data.ruc}</div>
            </div>`
                : ''
            }
            <div class="field">
              <div class="label">Responsable</div>
              <div class="value">${data.ownerName}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${data.ownerEmail}" style="color: #059669;">${data.ownerEmail}</a></div>
            </div>
            <div class="field">
              <div class="label">Fecha de registro</div>
              <div class="value">${data.registeredAt}</div>
            </div>
          </div>
          <div class="footer">
            <p>Notificación automática de AIQUAA · admin@aiquaa.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    name: string
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000'
    );
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
    const fromEmail = this.configService.get<string>(
      'SES_FROM_EMAIL',
      'noreply@aiquaa.com'
    );

    try {
      const messageId = await this.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Restablece tu contraseña - AIQUAA',
        html: this.getPasswordResetEmailTemplate(name, resetUrl),
      });
      this.logger.log(
        `Email de reset de contraseña enviado a ${email}: ${messageId}`
      );
    } catch (error) {
      this.logger.error(
        `Error enviando email de reset de contraseña a ${email}`,
        error
      );
      throw error;
    }
  }

  private getVerificationEmailTemplate(
    name: string,
    verificationUrl: string
  ): string {
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
          .footer { text-align: center; margin-top: 40px; color: #6B7280; font-size: 14px; }
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

  private getPasswordResetEmailTemplate(
    name: string,
    resetUrl: string
  ): string {
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

  async sendTwoFactorCode(email: string, code: string): Promise<void> {
    const fromEmail =
      process.env.SES_FROM_EMAIL || 'AIQUAA <noreply@aiquaa.com>';
    try {
      await this.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Tu código de verificación - AIQUAA',
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4F46E5;">Verificación de dos factores</h2>
            <p>Tu código de verificación es:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #F3F4F6; border-radius: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #6B7280; font-size: 14px;">Este código expira en 10 minutos. No compartas este código con nadie.</p>
          </div>
        `,
      });
      this.logger.log(`Código 2FA enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error enviando código 2FA a ${email}`, error);
      throw error;
    }
  }
}
