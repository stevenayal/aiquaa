import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Logger,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IstqbService } from './istqb.service';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@ApiTags('ISTQB')
@Controller('istqb')
export class IstqbController {
  private readonly logger = new Logger(IstqbController.name);

  constructor(private readonly istqbService: IstqbService) {}

  @Post('submit-exam')
  @UseGuards(OptionalJwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enviar resultados de examen ISTQB',
    description:
      'Guarda los resultados del examen. Si se incluye un JWT válido, el examen se vincula al usuario y se otorga XP de gamificación.',
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
  async submitExamResult(@Body() examData: SubmitExamDto, @Request() req: any) {
    this.logger.log(
      `Recibiendo resultado de examen: ${examData.participantName} - ${examData.passed ? 'Aprobado' : 'Reprobado'}`
    );

    const userId: number | undefined = req.user?.id;

    try {
      return await this.istqbService.submitExamResult(examData, userId);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error procesando resultado de examen: ${err.message}`,
        err.stack
      );
      throw error;
    }
  }

  @Get('results')
  @ApiOperation({ summary: 'Obtener todos los resultados de exámenes' })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filtrar por email del participante',
  })
  @ApiQuery({
    name: 'passed',
    required: false,
    description: 'Filtrar por estado de aprobación',
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Lista de resultados' })
  async getResults(
    @Query('email') email?: string,
    @Query('passed') passed?: string
  ) {
    const filters: any = {};

    if (email) {
      filters.participantEmail = email;
    }

    if (passed !== undefined) {
      filters.passed = passed === 'true';
    }

    return this.istqbService.getExamResults(filters);
  }

  @Get('results/:id')
  @ApiOperation({ summary: 'Obtener resultado de examen por ID' })
  @ApiResponse({ status: 200, description: 'Resultado encontrado' })
  @ApiResponse({ status: 404, description: 'Resultado no encontrado' })
  async getResultById(@Param('id') id: string) {
    const resultId = parseInt(id, 10);
    return this.istqbService.getExamResultById(resultId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas generales de exámenes' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de exámenes',
    schema: {
      example: {
        total: 150,
        passed: 95,
        failed: 55,
        passRate: '63.33',
        averageScore: 28.5,
        averagePercentage: '71.25',
      },
    },
  })
  async getStats() {
    return this.istqbService.getExamStats();
  }
}
