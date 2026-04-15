import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);

  async sendGitExamResult(_examResult: any): Promise<void> {
    // Email notifications disabled — only registration and password reset emails are sent
    this.logger.debug('sendGitExamResult called but email notifications are disabled');
  }

  async sendTechnicalBugReport(_report: any): Promise<void> {
    // Email notifications disabled — only registration and password reset emails are sent
    this.logger.debug('sendTechnicalBugReport called but email notifications are disabled');
  }
}
