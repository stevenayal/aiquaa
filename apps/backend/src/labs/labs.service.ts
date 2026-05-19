import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { AllPairsGeneratedEvent } from './events/allpairs-generated.event';

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);

  constructor(private readonly eventBus: EventBus) {}

  async sendGitExamResult(_examResult: any): Promise<void> {
    this.logger.debug(
      'sendGitExamResult called but email notifications are disabled'
    );
  }

  async sendTechnicalBugReport(_report: any): Promise<void> {
    this.logger.debug(
      'sendTechnicalBugReport called but email notifications are disabled'
    );
  }

  async trackAllPairsGeneration(
    userId: number,
    combinationsCount: number,
    sessionId: string
  ): Promise<void> {
    this.eventBus.publish(
      new AllPairsGeneratedEvent(userId, combinationsCount, sessionId)
    );
  }
}
