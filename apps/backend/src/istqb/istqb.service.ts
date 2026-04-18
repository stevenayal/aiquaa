import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class IstqbService {
  private readonly logger = new Logger(IstqbService.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  async submitExamResult(examData: SubmitExamDto) {
    try {
      // Guardar resultado en la base de datos
      const result = await this.prisma.istqbExamResult.create({
        data: {
          participantName: examData.participantName,
          participantEmail: examData.participantEmail || null,
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
        `Resultado de examen guardado: ${result.id} - ${examData.participantName}`,
      );

      // Enviar email al administrador de forma asíncrona (no bloqueante)
      this.sendAdminNotification(examData, result.id).catch((error) => {
        this.logger.error(
          `Error enviando notificación al admin: ${error.message}`,
          error.stack,
        );
      });

      return {
        success: true,
        message: 'Resultado guardado exitosamente',
        id: result.id,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error guardando resultado de examen: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  private async sendAdminNotification(
    _examData: SubmitExamDto,
    _resultId: number,
  ): Promise<void> {
    // Email notifications disabled — only registration and password reset emails are sent
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
