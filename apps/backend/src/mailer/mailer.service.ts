import { Injectable, Logger } from '@nestjs/common';
import { ResendService } from './resend.service';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(private resendService: ResendService) {
    this.logger.log('MailerService inicializado con AWS SES SMTP');
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    name: string
  ): Promise<void> {
    return this.resendService.sendVerificationEmail(email, token, name);
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    name: string
  ): Promise<void> {
    return this.resendService.sendPasswordResetEmail(email, token, name);
  }

  async sendTwoFactorCode(email: string, code: string): Promise<void> {
    return this.resendService.sendTwoFactorCode(email, code);
  }

  async sendNewEmpresaAlert(data: {
    companyName: string;
    ownerName: string;
    ownerEmail: string;
    ruc?: string;
    registeredAt: string;
  }): Promise<void> {
    return this.resendService.sendNewEmpresaAlert(data);
  }
}
