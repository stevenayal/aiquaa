import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LabsService } from './labs.service';

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
  @ApiResponse({ status: 200, description: 'Bug report sent successfully to admin' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendTechnicalBugReport(@Body() body: SendTechnicalBugReportDto) {
    await this.labsService.sendTechnicalBugReport(body.report);
    return {
      success: true,
      message: 'Informe técnico enviado exitosamente a admin@aiquaa.com'
    };
  }
}
