import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitPerformanceExamDto } from './dto/submit-exam.dto';
import { PerformanceExamCompletedEvent } from './events/performance-exam-completed.event';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus
  ) {}

  async submitExamResult(examData: SubmitPerformanceExamDto, userId?: number) {
    try {
      const result = await this.prisma.performanceExamResult.create({
        data: {
          participantName: examData.participantName,
          githubProfile: examData.githubProfile,
          examPurpose: examData.examPurpose,
          companyName: examData.companyName || null,
          startTime: new Date(examData.startTime),
          endTime: new Date(examData.endTime),
          timeSpentSeconds: examData.timeSpent,
          score: examData.score,
          totalQuestions: examData.totalQuestions,
          percentage: new Decimal(examData.percentage.toFixed(2)),
          passed: examData.passed,
          mode: examData.mode,
          answers: examData.answers as any,
          sectionAnalysis: examData.learningObjectiveAnalysis as any,
        },
      });

      this.logger.log(
        `Resultado de examen de Performance guardado: ${result.id} - ${examData.participantName}`
      );

      if (userId) {
        this.eventBus.publish(
          new PerformanceExamCompletedEvent(
            userId,
            result.id,
            examData.passed,
            examData.percentage,
            examData.mode
          )
        );
      }

      return {
        success: true,
        message: 'Resultado guardado exitosamente',
        id: result.id,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error guardando resultado de examen: ${err.message}`,
        err.stack
      );
      throw error;
    }
  }

  async getExamResults(filters?: {
    githubProfile?: string;
    passed?: boolean;
    examPurpose?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.githubProfile) {
      where.githubProfile = {
        contains: filters.githubProfile,
        mode: 'insensitive',
      };
    }

    if (filters?.passed !== undefined) {
      where.passed = filters.passed;
    }

    if (filters?.examPurpose) {
      where.examPurpose = filters.examPurpose;
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

    return this.prisma.performanceExamResult.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getExamResultById(id: number) {
    return this.prisma.performanceExamResult.findUnique({
      where: { id },
    });
  }

  async getExamStats() {
    const total = await this.prisma.performanceExamResult.count();
    const passed = await this.prisma.performanceExamResult.count({
      where: { passed: true },
    });
    const failed = total - passed;

    const avgScore = await this.prisma.performanceExamResult.aggregate({
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
