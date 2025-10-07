import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendService } from './resend.service';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private configService: ConfigService,
    private resendService: ResendService,
  ) {
    this.logger.log('MailerService inicializado con Resend');
  }

  async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
    return this.resendService.sendVerificationEmail(email, token, name);
  }

  async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
    return this.resendService.sendPasswordResetEmail(email, token, name);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    return this.resendService.sendWelcomeEmail(email, name);
  }

  async sendTwoFactorCode(email: string, code: string, name: string): Promise<void> {
    return this.resendService.sendTwoFactorCode(email, code, name);
  }

  async sendSecurityAlert(email: string, name: string, alertType: string, details: string): Promise<void> {
    return this.resendService.sendSecurityAlert(email, name, alertType, details);
  }
}