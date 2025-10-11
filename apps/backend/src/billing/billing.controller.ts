import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear sesión de checkout',
    description: 'Crea una sesión de pago de Stripe para un curso específico'
  })
  @ApiResponse({
    status: 201,
    description: 'Sesión de checkout creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', example: 'cs_test_123456789' },
        url: { type: 'string', example: 'https://checkout.stripe.com/pay/cs_test_123456789' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT requerido' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async createCheckoutSession(
    @Body() body: { courseId: number },
    @Request() req: any,
  ) {
    const session = await this.billingService.createCheckoutSession(
      req.user.id,
      body.courseId,
    );
    return session;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manejar eventos de webhook de Stripe',
    description: 'Endpoint para recibir y procesar eventos de webhook de Stripe (pagos, suscripciones, etc.)'
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook procesado exitosamente',
    schema: {
      type: 'object',
      properties: {
        received: { type: 'boolean', example: true },
        eventType: { type: 'string', example: 'checkout.session.completed' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Evento de webhook inválido' })
  async handleWebhook(@Body() event: any) {
    return this.billingService.handleWebhook(event);
  }
}
