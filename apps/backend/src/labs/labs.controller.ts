import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Query,
  Param,
  Patch,
  Delete,
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

class SeedTestAppDto {
  sessionId?: string;
}

class ResetTestAppDto {
  sessionId?: string;
  candidateId?: string;
}

class AddCartItemDto {
  sessionId?: string;
  candidateId?: string;
  productId!: string;
  quantity!: number;
}

class UpdateCartItemDto {
  sessionId?: string;
  candidateId?: string;
  quantity!: number;
}

class CheckoutDto {
  sessionId?: string;
  candidateId?: string;
  shippingAddress!: {
    fullName: string;
    street: string;
    apartmentSuite: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentInfo!: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  };
}

class CreateTicketDto {
  sessionId?: string;
  candidateId?: string;
  subject!: string;
  description!: string;
  priority!: 'low' | 'medium' | 'high';
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

  @Post('admin/seed/:candidateId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Seed controlado del laboratorio test-app',
    description:
      'Inicializa una sesión determinista para un perfil de laboratorio. Perfiles sugeridos: default, demo, team-a, team-b.',
  })
  async seedTestApp(
    @Param('candidateId') candidateId: string,
    @Body() body: SeedTestAppDto
  ) {
    return this.labsService.seedTestApp(candidateId, body.sessionId);
  }

  @Post('admin/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset de sesión o perfil del laboratorio test-app',
  })
  async resetTestApp(@Body() body: ResetTestAppDto) {
    return this.labsService.resetTestApp(body.sessionId, body.candidateId);
  }

  @Get('evidence/:sessionId')
  @ApiOperation({
    summary: 'Obtener evidencia y trazabilidad de una sesión del laboratorio',
  })
  async getEvidence(@Param('sessionId') sessionId: string) {
    return this.labsService.getEvidence(sessionId);
  }

  @Get('test-app/products')
  @ApiOperation({ summary: 'Listar productos del laboratorio test-app' })
  async getTestAppProducts(
    @Query('sessionId') sessionId?: string,
    @Query('candidateId') candidateId?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: 'price-asc' | 'price-desc' | 'name',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.labsService.getProductsForTestApp(sessionId, candidateId, {
      search,
      category,
      sortBy,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('test-app/products/:id')
  @ApiOperation({ summary: 'Obtener detalle de producto del laboratorio' })
  async getTestAppProduct(
    @Param('id') id: string,
    @Query('sessionId') sessionId?: string,
    @Query('candidateId') candidateId?: string
  ) {
    return this.labsService.getProductForTestApp(sessionId, candidateId, id);
  }

  @Get('test-app/cart')
  @ApiOperation({ summary: 'Obtener carrito del laboratorio' })
  async getCart(
    @Query('sessionId') sessionId?: string,
    @Query('candidateId') candidateId?: string
  ) {
    return this.labsService.getCartForTestApp(sessionId, candidateId);
  }

  @Post('test-app/cart/items')
  @ApiOperation({ summary: 'Agregar ítem al carrito del laboratorio' })
  async addCartItem(@Body() body: AddCartItemDto) {
    return this.labsService.addCartItem(
      body.sessionId,
      body.candidateId,
      body.productId,
      body.quantity
    );
  }

  @Patch('test-app/cart/items/:productId')
  @ApiOperation({
    summary: 'Actualizar cantidad de ítem del carrito del laboratorio',
  })
  async updateCartItem(
    @Param('productId') productId: string,
    @Body() body: UpdateCartItemDto
  ) {
    return this.labsService.updateCartItem(
      body.sessionId,
      body.candidateId,
      productId,
      body.quantity
    );
  }

  @Delete('test-app/cart/items/:productId')
  @ApiOperation({ summary: 'Eliminar ítem del carrito del laboratorio' })
  async removeCartItem(
    @Param('productId') productId: string,
    @Query('sessionId') sessionId?: string,
    @Query('candidateId') candidateId?: string
  ) {
    return this.labsService.removeCartItem(sessionId, candidateId, productId);
  }

  @Post('test-app/checkout')
  @ApiOperation({ summary: 'Ejecutar checkout del laboratorio' })
  async checkout(@Body() body: CheckoutDto) {
    return this.labsService.checkoutTestApp(body.sessionId, body.candidateId, {
      shippingAddress: body.shippingAddress,
      paymentInfo: body.paymentInfo,
    });
  }

  @Get('test-app/orders')
  @ApiOperation({ summary: 'Obtener órdenes del laboratorio' })
  async getOrders(
    @Query('sessionId') sessionId?: string,
    @Query('candidateId') candidateId?: string
  ) {
    return this.labsService.getOrdersForTestApp(sessionId, candidateId);
  }

  @Post('test-app/tickets')
  @ApiOperation({ summary: 'Crear ticket del laboratorio' })
  async createTicket(@Body() body: CreateTicketDto) {
    return this.labsService.createTicketForTestApp(
      body.sessionId,
      body.candidateId,
      body.subject,
      body.description,
      body.priority
    );
  }

  @Get('test-app/tickets')
  @ApiOperation({ summary: 'Listar tickets del laboratorio' })
  async getTickets(
    @Query('sessionId') sessionId?: string,
    @Query('candidateId') candidateId?: string
  ) {
    return this.labsService.getTicketsForTestApp(sessionId, candidateId);
  }
}
