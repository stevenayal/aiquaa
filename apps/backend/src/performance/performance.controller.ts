import { Controller, Post, Get, Body, Param, Query, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { SubmitPerformanceExamDto } from './dto/submit-exam.dto';

@ApiTags('Performance Testing')
@Controller('performance')
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name);

  constructor(private readonly performanceService: PerformanceService) {}

  @Post('submit-exam')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enviar resultados de examen de Performance Testing',
    description: 'Guarda los resultados del examen en la base de datos y envía un informe por email al administrador',
  })
  @ApiResponse({
    status: 201,
    description: 'Resultado guardado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Resultado guardado exitosamente',
        id: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async submitExamResult(@Body() examData: SubmitPerformanceExamDto) {
    this.logger.log(
      `Recibiendo resultado de examen de Performance: ${examData.participantName} - ${examData.passed ? 'Aprobado' : 'Reprobado'}`,
    );

    try {
      const result = await this.performanceService.submitExamResult(examData);
      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error procesando resultado de examen: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Get('results')
  @ApiOperation({ summary: 'Obtener todos los resultados de exámenes de Performance' })
  @ApiQuery({ name: 'githubProfile', required: false, description: 'Filtrar por perfil de GitHub' })
  @ApiQuery({ name: 'passed', required: false, description: 'Filtrar por estado de aprobación', type: Boolean })
  @ApiQuery({ name: 'examPurpose', required: false, description: 'Filtrar por motivo del examen' })
  @ApiResponse({ status: 200, description: 'Lista de resultados' })
  async getResults(
    @Query('githubProfile') githubProfile?: string,
    @Query('passed') passed?: string,
    @Query('examPurpose') examPurpose?: string,
  ) {
    const filters: any = {};

    if (githubProfile) {
      filters.githubProfile = githubProfile;
    }

    if (passed !== undefined) {
      filters.passed = passed === 'true';
    }

    if (examPurpose) {
      filters.examPurpose = examPurpose;
    }

    return this.performanceService.getExamResults(filters);
  }

  @Get('results/:id')
  @ApiOperation({ summary: 'Obtener resultado de examen por ID' })
  @ApiResponse({ status: 200, description: 'Resultado encontrado' })
  @ApiResponse({ status: 404, description: 'Resultado no encontrado' })
  async getResultById(@Param('id') id: string) {
    const resultId = parseInt(id, 10);
    return this.performanceService.getExamResultById(resultId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas generales de exámenes de Performance' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de exámenes',
    schema: {
      example: {
        total: 75,
        passed: 52,
        failed: 23,
        passRate: '69.33',
        averageScore: 19.2,
        averagePercentage: '73.85',
      },
    },
  })
  async getStats() {
    return this.performanceService.getExamStats();
  }
}
