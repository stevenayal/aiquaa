import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendGitExamResult(email: string, examResult: any): Promise<void> {
    this.logger.log(`Enviando resultado de examen Git a ${email}`);
    await this.mailerService.sendGitExamReport(email, examResult);
  }
}
