import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LabsService } from './labs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrackAllPairsDto } from '../gamification/dto/gamification.dto';
import { randomUUID } from 'crypto';

class SendGitExamResultDto {
  examResult: any;
}

class SendTechnicalBugReportDto {
  report: any;
}

@ApiTags('labs')
@Controller('api/v1/labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  @Post('git/send-result')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send Git exam result via email to admin' })
  @ApiResponse({ status: 200, description: 'Email sent successfully to admin' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendGitExamResult(@Body() body: SendGitExamResultDto) {
    await this.labsService.sendGitExamResult(body.examResult);
    return { message: 'Resultado enviado exitosamente a admin@aiquaa.com' };
  }

  @Post('test-app/send-bug-report')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send technical bug report via email to admin' })
  @ApiResponse({
    status: 200,
    description: 'Bug report sent successfully to admin',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendTechnicalBugReport(@Body() body: SendTechnicalBugReportDto) {
    await this.labsService.sendTechnicalBugReport(body.report);
    return {
      success: true,
      message: 'Informe técnico enviado exitosamente a admin@aiquaa.com',
    };
  }

  @Post('allpairs/track')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar generación de casos All Pairs (gamificación)',
    description:
      'Otorga XP al usuario autenticado por generar combinaciones con All Pairs. ' +
      'Más de 20 combinaciones otorga XP adicional. Llamar desde el frontend después de generar.',
  })
  @ApiResponse({ status: 200, description: 'XP event queued' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async trackAllPairs(
    @Body() dto: TrackAllPairsDto,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    const sessionId = randomUUID();
    await this.labsService.trackAllPairsGeneration(
      req.user.id as number,
      dto.combinationsCount,
      sessionId
    );
    return { success: true };
  }
}
