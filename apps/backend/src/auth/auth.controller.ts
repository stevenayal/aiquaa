import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Request, 
  Res, 
  Query,
  Param,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { 
  LoginDto, 
  RegisterDto, 
  RequestResetDto, 
  ResetPasswordDto 
} from './dto';
import { 
  AuthResponseDto, 
  RefreshResponseDto, 
  MessageResponseDto,
  UserResponseDto 
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../common/decorators';
import { CurrentUser } from '../common/decorators';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    type: MessageResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El email ya está registrado' 
  })
  async register(@Body() registerDto: RegisterDto): Promise<MessageResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email no verificado' 
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);
    
    // Configurar cookie de refresh token
    const cookieName = this.configService.get<string>('REFRESH_COOKIE_NAME', 'aiq_rt');
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie(cookieName, result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TTL', '2592000')) * 1000,
    });

    // No devolver el refresh token en el body por seguridad
    const { refresh_token, ...response } = result;
    return response as AuthResponseDto;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado exitosamente',
    type: RefreshResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de refresh inválido' 
  })
  async refresh(
    @Request() req,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshResponseDto> {
    const refreshToken = req.cookies[this.configService.get<string>('REFRESH_COOKIE_NAME', 'aiq_rt')];
    const result = await this.authService.refresh(refreshToken);
    
    // Actualizar cookie de refresh token
    const cookieName = this.configService.get<string>('REFRESH_COOKIE_NAME', 'aiq_rt');
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie(cookieName, result.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TTL', '2592000')) * 1000,
    });

    // No devolver el refresh token en el body por seguridad
    const { refresh_token, ...response } = result;
    return response as RefreshResponseDto;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout exitoso',
    type: MessageResponseDto
  })
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<MessageResponseDto> {
    const result = await this.authService.logout(user.id);
    
    // Limpiar cookie de refresh token
    const cookieName = this.configService.get<string>('REFRESH_COOKIE_NAME', 'aiq_rt');
    res.clearCookie(cookieName, { path: '/' });
    
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil obtenido exitosamente',
    type: UserResponseDto
  })
  async getProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.authService.getProfile(user.id);
  }

  @Get('google')
  @ApiOperation({ summary: 'Iniciar OAuth con Google' })
  @ApiResponse({ 
    status: 200, 
    description: 'Redirección a Google OAuth' 
  })
  async googleAuth() {
    // Este endpoint será manejado por Passport
    return { message: 'Redirigiendo a Google OAuth' };
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Callback de OAuth con Google' })
  @ApiResponse({ 
    status: 200, 
    description: 'OAuth exitoso, redirigiendo al frontend' 
  })
  async googleAuthCallback(
    @Request() req,
    @Res() res: Response
  ) {
    const user = req.user;
    
    if (!user) {
      throw new BadRequestException('Error en la autenticación con Google');
    }

    // Generar tokens para el usuario
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);
    
    // Configurar cookie de refresh token
    const cookieName = this.configService.get<string>('REFRESH_COOKIE_NAME', 'aiq_rt');
    const isProduction = process.env.NODE_ENV === 'production';
    const frontOrigin = this.configService.get<string>('FRONT_ORIGIN', 'http://localhost:3001');
    
    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TTL', '2592000')) * 1000,
    });

    // Redirigir al frontend con el access token
    const redirectUrl = `${frontOrigin}/oauth-callback?access_token=${accessToken}`;
    res.redirect(redirectUrl);
  }

  @Get('github')
  @ApiOperation({ summary: 'Iniciar OAuth con GitHub' })
  @ApiResponse({ 
    status: 200, 
    description: 'Redirección a GitHub OAuth' 
  })
  async githubAuth() {
    // Este endpoint será manejado por Passport
    return { message: 'Redirigiendo a GitHub OAuth' };
  }

  @Get('github/callback')
  @ApiOperation({ summary: 'Callback de OAuth con GitHub' })
  @ApiResponse({ 
    status: 200, 
    description: 'OAuth exitoso, redirigiendo al frontend' 
  })
  async githubAuthCallback(
    @Request() req,
    @Res() res: Response
  ) {
    const user = req.user;
    
    if (!user) {
      throw new BadRequestException('Error en la autenticación con GitHub');
    }

    // Generar tokens para el usuario
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);
    
    // Configurar cookie de refresh token
    const cookieName = this.configService.get<string>('REFRESH_COOKIE_NAME', 'aiq_rt');
    const isProduction = process.env.NODE_ENV === 'production';
    const frontOrigin = this.configService.get<string>('FRONT_ORIGIN', 'http://localhost:3001');
    
    res.cookie(cookieName, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TTL', '2592000')) * 1000,
    });

    // Redirigir al frontend con el access token
    const redirectUrl = `${frontOrigin}/oauth-callback?access_token=${accessToken}`;
    res.redirect(redirectUrl);
  }

  @Post('request-reset')
  @ApiOperation({ summary: 'Solicitar reset de contraseña' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email de reset enviado (si el usuario existe)',
    type: MessageResponseDto
  })
  async requestReset(@Body() requestResetDto: RequestResetDto): Promise<MessageResponseDto> {
    return this.authService.requestReset(requestResetDto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Resetear contraseña' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña reseteada exitosamente',
    type: MessageResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token inválido o expirado' 
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verificar email' })
  @ApiQuery({ name: 'token', description: 'Token de verificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verificado exitosamente',
    type: MessageResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token inválido o expirado' 
  })
  async verifyEmail(@Query('token') token: string): Promise<MessageResponseDto> {
    if (!token) {
      throw new BadRequestException('Token de verificación requerido');
    }
    return this.authService.verifyEmail(token);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña cambiada exitosamente',
    type: MessageResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Contraseña actual incorrecta' 
  })
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string }
  ): Promise<MessageResponseDto> {
    return this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener sesiones activas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesiones obtenidas exitosamente' 
  })
  async getActiveSessions(@CurrentUser() user: any) {
    return this.authService.getActiveSessions(user.id);
  }

  @Post('logout-device/:tokenId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión en un dispositivo específico' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dispositivo desconectado exitosamente',
    type: MessageResponseDto
  })
  async logoutFromDevice(
    @CurrentUser() user: any,
    @Param('tokenId') tokenId: string
  ): Promise<MessageResponseDto> {
    return this.authService.logoutFromDevice(user.id, parseInt(tokenId));
  }

  // Endpoints de administración (solo para ADMIN)
  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuarios (solo ADMIN)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado' 
  })
  async listUsers() {
    // TODO: Implementar listado de usuarios para admin
    return { message: 'Lista de usuarios (implementación pendiente)' };
  }
}
