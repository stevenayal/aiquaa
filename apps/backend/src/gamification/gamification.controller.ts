import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  RankingQueryDto,
  RankingResponseDto,
  UserGamificationProfileDto,
  DailyCheckinResponseDto,
} from './dto/gamification.dto';

@ApiTags('Gamificación')
@Controller('api/v1/gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('ranking')
  @ApiOperation({
    summary: 'Ranking público de la comunidad',
    description:
      'Lista paginada de usuarios ordenada por XP. Solo expone información pública — sin emails ni datos sensibles.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Ranking obtenido exitosamente',
    type: RankingResponseDto,
  })
  async getRanking(
    @Query() query: RankingQueryDto
  ): Promise<RankingResponseDto> {
    return this.gamificationService.getPublicRanking(query.page, query.limit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Perfil de gamificación del usuario autenticado',
    description: 'XP total, nivel, racha, logros recientes e historial de XP.',
  })
  @ApiResponse({ status: 200, type: UserGamificationProfileDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getMyProfile(@Request() req: any): Promise<UserGamificationProfileDto> {
    return this.gamificationService.getUserProfile(req.user.id as number);
  }

  @Post('daily-checkin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check-in diario',
    description:
      'Otorga XP por primer uso del día. Idempotente — múltiples llamadas en el mismo día no duplican XP.',
  })
  @ApiResponse({ status: 200, type: DailyCheckinResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async dailyCheckin(@Request() req: any): Promise<DailyCheckinResponseDto> {
    return this.gamificationService.processDailyCheckin(req.user.id as number);
  }
}
