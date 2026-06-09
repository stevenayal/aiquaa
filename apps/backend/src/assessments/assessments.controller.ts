import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { SaveTestCasesDto } from './dto/save-test-cases.dto';
import { SaveBugReportsDto } from './dto/save-bug-reports.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@ApiTags('Assessments')
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post('start')
  @UseGuards(OptionalJwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Iniciar un nuevo intento de assessment' })
  @ApiResponse({ status: 201, description: 'Intento creado' })
  async startAttempt(@Body() dto: StartAttemptDto, @Request() req: any) {
    const userId: number | undefined = req.user?.id;
    return this.assessmentsService.startAttempt(dto, userId);
  }

  @Post(':id/test-cases')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar casos de prueba del intento' })
  @ApiResponse({ status: 200, description: 'Casos de prueba guardados' })
  async saveTestCases(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveTestCasesDto
  ) {
    return this.assessmentsService.saveTestCases(id, dto);
  }

  @Post(':id/bug-reports')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Guardar reportes de bugs del intento' })
  @ApiResponse({ status: 200, description: 'Reportes de bugs guardados' })
  async saveBugReports(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveBugReportsDto
  ) {
    return this.assessmentsService.saveBugReports(id, dto);
  }

  @Post(':id/submit')
  @UseGuards(OptionalJwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar intento y obtener puntuación automática' })
  @ApiResponse({ status: 200, description: 'Intento enviado y puntuado' })
  async submitAttempt(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitAttemptDto,
    @Request() req: any
  ) {
    const userId: number | undefined = req.user?.id;
    return this.assessmentsService.submitAttempt(id, dto, userId);
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Obtener resultado del intento' })
  @ApiResponse({ status: 200, description: 'Resultado del intento' })
  @ApiResponse({ status: 404, description: 'Intento no encontrado' })
  async getResult(@Param('id', ParseIntPipe) id: number) {
    return this.assessmentsService.getResult(id);
  }
}
