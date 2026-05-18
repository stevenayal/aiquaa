import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { GamificationService } from '../gamification/gamification.service';
import { GamificationEvent } from '../gamification/constants/xp-events.enum';

const HIGH_SCORE_THRESHOLD = 90;

@Injectable()
export class IstqbService {
  private readonly logger = new Logger(IstqbService.name);

  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService
  ) {}

  async submitExamResult(examData: SubmitExamDto, userId?: number) {
    const result = await this.prisma.istqbExamResult.create({
      data: {
        participantName: examData.participantName,
        participantEmail: examData.participantEmail || null,
        userId: userId ?? null,
        startTime: new Date(examData.startTime),
        endTime: new Date(examData.endTime),
        timeSpentSeconds: examData.timeSpent,
        score: examData.score,
        totalQuestions: examData.totalQuestions,
        percentage: new Decimal(examData.percentage.toFixed(2)),
        passed: examData.passed,
        mode: examData.mode,
        answers: examData.answers as any,
        learningObjectives: examData.learningObjectiveAnalysis as any,
      },
    });

    this.logger.log(
      `Resultado de examen guardado: ${result.id} - ${examData.participantName}`
    );

    // Grant XP only to authenticated users
    if (userId) {
      this.grantIstqbXp(userId, result.id, examData).catch((err) => {
        this.logger.error(
          `Error granting ISTQB XP for user=${userId}: ${err.message}`,
          err.stack
        );
      });
    }

    return {
      success: true,
      message: 'Resultado guardado exitosamente',
      id: result.id,
    };
  }

  private async grantIstqbXp(
    userId: number,
    examId: number,
    examData: SubmitExamDto
  ): Promise<void> {
    const source = 'ISTQB_SIMULATOR';
    const sourceIdBase = examId.toString();

    // XP for completing (always, regardless of pass/fail, except TRAINING mode)
    if (examData.mode !== 'TRAINING') {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.ISTQB_COMPLETED,
        source,
        sourceId: `${GamificationEvent.ISTQB_COMPLETED}:${sourceIdBase}`,
        metadata: { examId, mode: examData.mode },
      });
    }

    // XP for passing
    if (examData.passed) {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.ISTQB_PASSED,
        source,
        sourceId: `${GamificationEvent.ISTQB_PASSED}:${sourceIdBase}`,
        metadata: { examId, percentage: examData.percentage },
      });
    }

    // XP for high score (>= 90%)
    if (examData.percentage >= HIGH_SCORE_THRESHOLD) {
      await this.gamification.grantXp({
        userId,
        eventType: GamificationEvent.ISTQB_HIGH_SCORE,
        source,
        sourceId: `${GamificationEvent.ISTQB_HIGH_SCORE}:${sourceIdBase}`,
        metadata: { examId, percentage: examData.percentage },
      });
    }
  }

  async getExamResults(filters?: {
    participantEmail?: string;
    passed?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.participantEmail) {
      where.participantEmail = filters.participantEmail;
    }

    if (filters?.passed !== undefined) {
      where.passed = filters.passed;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return this.prisma.istqbExamResult.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getExamResultById(id: number) {
    return this.prisma.istqbExamResult.findUnique({
      where: { id },
    });
  }

  async getExamStats() {
    const total = await this.prisma.istqbExamResult.count();
    const passed = await this.prisma.istqbExamResult.count({
      where: { passed: true },
    });
    const failed = total - passed;

    const avgScore = await this.prisma.istqbExamResult.aggregate({
      _avg: {
        score: true,
        percentage: true,
      },
    });

    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(2) : 0,
      averageScore: avgScore._avg.score || 0,
      averagePercentage: avgScore._avg.percentage
        ? Number(avgScore._avg.percentage).toFixed(2)
        : 0,
    };
  }
}
