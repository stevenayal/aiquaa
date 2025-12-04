import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);
  private readonly adminEmail = 'admin@aiquaa.com';

  constructor(private readonly mailerService: MailerService) {}

  async sendGitExamResult(examResult: any): Promise<void> {
    this.logger.log(`Enviando resultado de examen Git a ${this.adminEmail} - Estudiante: ${examResult.participantName}`);
    await this.mailerService.sendGitExamReport(this.adminEmail, examResult);
  }

  async sendTechnicalBugReport(report: any): Promise<void> {
    this.logger.log(`Enviando informe técnico de bugs a ${this.adminEmail} - Candidato: ${report.candidateInfo.fullName}`);
    await this.mailerService.sendTechnicalBugReport(this.adminEmail, report);
  }
}
