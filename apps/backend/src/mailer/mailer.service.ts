import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const smtpUrl = this.configService.get<string>('SMTP_URL');
    
    if (smtpUrl) {
      try {
        this.transporter = nodemailer.createTransport(smtpUrl);
        await this.transporter.verify();
        this.logger.log('SMTP transporter configurado correctamente');
      } catch (error) {
        this.logger.error('Error configurando SMTP, usando Ethereal como fallback', error);
        this.setupEtherealFallback();
      }
    } else {
      this.setupEtherealFallback();
    }
  }

  private async setupEtherealFallback() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log('Usando Ethereal como fallback para emails');
    } catch (error) {
      this.logger.error('Error configurando Ethereal fallback', error);
    }
  }

  async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const verificationUrl = `${appUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', 'AIQUAA <no-reply@aiquaa.com>'),
      to: email,
      subject: 'Verifica tu email - AIQUAA',
      html: this.getVerificationEmailTemplate(name, verificationUrl),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de verificación enviado a ${email}: ${info.messageId}`);
      
      if (info.messageId.includes('ethereal')) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Error enviando email de verificación a ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', 'AIQUAA <no-reply@aiquaa.com>'),
      to: email,
      subject: 'Restablece tu contraseña - AIQUAA',
      html: this.getPasswordResetEmailTemplate(name, resetUrl),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de reset de contraseña enviado a ${email}: ${info.messageId}`);
      
      if (info.messageId.includes('ethereal')) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Error enviando email de reset de contraseña a ${email}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', 'AIQUAA <no-reply@aiquaa.com>'),
      to: email,
      subject: '¡Bienvenido a AIQUAA! 🎉',
      html: this.getWelcomeEmailTemplate(name),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de bienvenida enviado a ${email}: ${info.messageId}`);

      if (info.messageId.includes('ethereal')) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Error enviando email de bienvenida a ${email}`, error);
      // No relanzamos para no bloquear el flujo de verificación
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 AIQUAA</h1>
            <p>Verifica tu cuenta</p>
          </div>
          <div class="content">
            <h2>¡Hola ${name}!</h2>
            <p>Gracias por registrarte en AIQUAA. Para completar tu registro, necesitamos verificar tu dirección de email.</p>
            <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
            <a href="${verificationUrl}" class="button">Verificar Email</a>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
          </div>
          <div class="footer">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 AIQUAA</h1>
            <p>Restablece tu contraseña</p>
          </div>
          <div class="content">
            <h2>¡Hola ${name}!</h2>
            <p>Has solicitado restablecer tu contraseña en AIQUAA.</p>
            <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña actual permanecerá sin cambios.</p>
          </div>
          <div class="footer">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16A34A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 AIQUAA</h1>
            <p>¡Bienvenido!</p>
          </div>
          <div class="content">
            <h2>¡Hola ${name}!</h2>
            <p>Gracias por verificar tu email y unirte a AIQUAA. Estamos emocionados de tenerte con nosotros.</p>
            <p>Desde tu cuenta podrás explorar el foro, participar en discusiones y aprovechar nuestras herramientas en Labs.</p>
            <p>Si tienes dudas, responde a este correo o visita la sección de ayuda.</p>
          </div>
          <div class="footer">
            <p>© 2024 AIQUAA. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
