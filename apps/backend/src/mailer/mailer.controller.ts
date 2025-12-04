import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsObject, IsOptional, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MailerService } from './mailer.service';

enum TestType {
  UNIT = 'unit',
  E2E = 'e2e',
  CONTRACT = 'contract',
  ALL = 'all'
}

class TestResultsDto {
  @IsBoolean()
  success!: boolean;

  @IsDate()
  @Type(() => Date)
  timestamp!: Date;

  @IsNumber()
  duration!: number;

  @IsObject()
  summary!: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };

  @IsObject()
  @IsOptional()
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };

  @IsArray()
  @IsOptional()
  failures?: Array<{
    test: string;
    error: string;
  }>;

  @IsEnum(TestType)
  type!: 'unit' | 'e2e' | 'contract' | 'all';
}

@ApiTags('Mailer')
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test-results')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar reporte de resultados de pruebas',
    description: 'Recibe los resultados de las pruebas (unit, e2e, contract, all) y envía un reporte por email a admin@aiquaa.com'
  })
  @ApiBody({
    type: TestResultsDto,
    description: 'Resultados de las pruebas a reportar',
    examples: {
      unit: {
        summary: 'Ejemplo de resultados de pruebas unitarias',
        value: {
          success: true,
          timestamp: '2025-01-15T10:30:00Z',
          duration: 45000,
          summary: {
            total: 150,
            passed: 148,
            failed: 2,
            skipped: 0
          },
          coverage: {
            statements: 82.5,
            branches: 78.3,
            functions: 85.1,
            lines: 82.8
          },
          failures: [
            {
              test: 'UserService › createUser › should validate email',
              error: 'Expected email to be valid but received invalid format'
            }
          ],
          type: 'unit'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado exitosamente',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Reporte de pruebas enviado exitosamente' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos'
  })
  @ApiResponse({
    status: 500,
    description: 'Error al enviar el email'
  })
  async sendTestResults(@Body() testResults: TestResultsDto) {
    await this.mailerService.sendTestResultsReport(testResults);

    return {
      success: true,
      message: 'Reporte de pruebas enviado exitosamente a admin@aiquaa.com'
    };
  }
}
